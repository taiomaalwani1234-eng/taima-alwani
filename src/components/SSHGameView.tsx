import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Terminal,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Trophy,
  Skull,
  Unlock,
} from 'lucide-react';
import {
  generateTargetIP,
  CORRECT_PASSWORD,
  MAX_ATTEMPTS,
  getWelcomeBanner,
  SSH_USAGE,
  LS_OUTPUT,
  SECRET_TXT,
  PASSWORDS_DB,
  BASH_HISTORY,
  getNetworkConfig,
  UNAME_OUTPUT,
  getAuthLog,
  SYSLOG_OUTPUT,
  ACCESS_LOG_OUTPUT,
  LOGS_LS,
  SCORE_MAP,
  MISSION_BRIEFING,
} from '../data/sshGameData';

// ─── Types ──────────────────────────────────────────────────────────────────

type GamePhase = 'briefing' | 'pre-login' | 'password' | 'post-login' | 'banned' | 'victory';

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'success' | 'system' | 'password-prompt';
  content: string;
}

interface SSHGameViewProps {
  onBack: () => void;
  studentName?: string;
  onGameComplete?: (score: number) => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export const SSHGameView: React.FC<SSHGameViewProps> = ({ onBack, studentName, onGameComplete }) => {
  // Game state
  const [phase, setPhase] = useState<GamePhase>('briefing');
  const [targetIP, setTargetIP] = useState(generateTargetIP);
  const [playerIP, setPlayerIP] = useState('');
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [passwordAttempts, setPasswordAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [sshFirstTry, setSshFirstTry] = useState(true);
  const [passwordFirstTry, setPasswordFirstTry] = useState(true);
  const [commandsAfterLogin, setCommandsAfterLogin] = useState(0);
  const [flagFound, setFlagFound] = useState(false);
  const [exploreBonus, setExploreBonus] = useState(false);
  const [currentDir, setCurrentDir] = useState('/root');
  const [unbanInput, setUnbanInput] = useState('');
  const [typingIndex, setTypingIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const historyEndRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const unbanInputRef = useRef<HTMLInputElement>(null);

  // Fetch player IP on mount
  useEffect(() => {
    const fallback = `${Math.floor(Math.random() * 200) + 10}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 1}`;
    fetch('https://api.ipify.org?format=json')
      .then((r) => r.json())
      .then((d) => setPlayerIP(d.ip || fallback))
      .catch(() => setPlayerIP(fallback));
  }, []);

  // Auto-scroll to bottom of terminal
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Focus input when phase changes
  useEffect(() => {
    if (phase === 'pre-login' || phase === 'password' || phase === 'post-login') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (phase === 'banned') {
      setTimeout(() => unbanInputRef.current?.focus(), 100);
    }
  }, [phase]);

  // Typing animation for briefing
  const briefingText = MISSION_BRIEFING.objective;
  useEffect(() => {
    if (phase !== 'briefing') return;
    if (typingIndex < briefingText.length) {
      const timer = setTimeout(() => setTypingIndex((i) => i + 1), 30);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [typingIndex, phase, briefingText]);

  useEffect(() => {
    if (phase === 'briefing') {
      setIsTyping(true);
      setTypingIndex(0);
    }
  }, [phase]);

  // ── Helpers ─────────────────────────────────────────────────────────────

  const addLine = useCallback((line: TerminalLine) => {
    setHistory((prev) => [...prev, line]);
  }, []);

  const addLines = useCallback((lines: TerminalLine[]) => {
    setHistory((prev) => [...prev, ...lines]);
  }, []);

  const getPrompt = useCallback(() => {
    if (phase === 'post-login') {
      return currentDir === '/root'
        ? 'root@target:~#'
        : `root@target:${currentDir}#`;
    }
    return 'hacker@kali:~$';
  }, [phase, currentDir]);

  // ── Command handlers ─────────────────────────────────────────────────

  const handlePreLoginCommand = useCallback(
    (cmd: string) => {
      const trimmed = cmd.trim();
      addLine({ type: 'input', content: `${getPrompt()} ${trimmed}` });

      if (trimmed === 'ssh' || trimmed === 'ssh --help' || trimmed === 'ssh -h') {
        addLine({ type: 'output', content: SSH_USAGE });
        return;
      }

      const sshMatch = trimmed.match(/^ssh\s+(\S+)@(\S+)$/);
      if (sshMatch) {
        const [, user, host] = sshMatch;
        if (user === 'root' && host === targetIP) {
          addLine({ type: 'system', content: `The authenticity of host '${targetIP} (${targetIP})' can't be established.` });
          addLine({ type: 'system', content: `ED25519 key fingerprint is SHA256:${btoa(targetIP).slice(0, 43)}.` });
          addLine({ type: 'system', content: `This key is not known by any other names` });
          addLine({ type: 'output', content: `Are you sure you want to continue connecting (yes/no/[fingerprint])? yes` });
          addLine({ type: 'system', content: `Warning: Permanently added '${targetIP}' (ED25519) to the list of known hosts.` });
          addLine({ type: 'password-prompt', content: `root@${targetIP}'s password:` });
          setPhase('password');
          return;
        }

        if (user !== 'root') {
          addLine({ type: 'error', content: `${user}@${host}: Permission denied (publickey,password).` });
          setSshFirstTry(false);
          return;
        }

        // Wrong IP
        addLine({ type: 'error', content: `ssh: connect to host ${host} port 22: Connection timed out` });
        setSshFirstTry(false);
        return;
      }

      // Other commands
      if (trimmed.startsWith('ssh ')) {
        addLine({ type: 'error', content: `ssh: Could not resolve hostname: Name or service not known` });
        setSshFirstTry(false);
        return;
      }

      if (['ls', 'pwd', 'whoami', 'id', 'uname', 'cat', 'cd', 'hostname'].some((c) => trimmed.startsWith(c))) {
        addLine({ type: 'output', content: `هذا النظام المحلي (Kali). يجب أولاً الاتصال بالخادم الهدف عبر SSH.` });
        return;
      }

      if (trimmed === 'clear') {
        setHistory([]);
        return;
      }

      if (trimmed === 'help') {
        addLine({ type: 'system', content: `💡 تلميح: استخدم الأمر ssh root@${targetIP} للاتصال بالخادم الهدف.` });
        return;
      }

      addLine({ type: 'error', content: `bash: ${trimmed.split(' ')[0]}: command not found` });
    },
    [addLine, getPrompt, targetIP],
  );

  const handlePasswordInput = useCallback(
    (pwd: string) => {
      addLine({ type: 'input', content: `root@${targetIP}'s password: ${'•'.repeat(pwd.length)}` });

      if (pwd === CORRECT_PASSWORD) {
        // Successful login
        let loginScore = 0;
        if (sshFirstTry) loginScore += SCORE_MAP.SSH_FIRST_TRY;
        if (passwordFirstTry) loginScore += SCORE_MAP.PASSWORD_FIRST_TRY;
        setScore((s) => s + loginScore);

        const banner = getWelcomeBanner(targetIP);
        banner.split('\n').forEach((line) => {
          addLine({ type: 'system', content: line });
        });

        setPhase('post-login');
      } else {
        const newAttempts = passwordAttempts + 1;
        setPasswordAttempts(newAttempts);
        setPasswordFirstTry(false);
        setScore((s) => s + SCORE_MAP.PASSWORD_FAIL_PENALTY);

        if (newAttempts >= MAX_ATTEMPTS) {
          addLine({ type: 'error', content: `Permission denied (publickey,password).` });
          addLine({ type: 'error', content: `Connection closed by ${targetIP} port 22` });
          setPhase('banned');
        } else {
          addLine({ type: 'error', content: `Permission denied, please try again.` });
          addLine({ type: 'password-prompt', content: `root@${targetIP}'s password:` });
        }
      }
    },
    [addLine, passwordAttempts, passwordFirstTry, sshFirstTry, targetIP],
  );

  const handlePostLoginCommand = useCallback(
    (cmd: string) => {
      const trimmed = cmd.trim();
      const prompt = getPrompt();
      addLine({ type: 'input', content: `${prompt} ${trimmed}` });

      setCommandsAfterLogin((c) => {
        const next = c + 1;
        if (next >= 3 && !exploreBonus) {
          setExploreBonus(true);
          setScore((s) => s + SCORE_MAP.EXPLORE_BONUS);
        }
        return next;
      });

      // Handle directory navigation
      if (trimmed === 'cd logs' || trimmed === 'cd logs/' || trimmed === 'cd /root/logs') {
        setCurrentDir('/root/logs');
        return;
      }
      if (trimmed === 'cd ..' || trimmed === 'cd ~' || trimmed === 'cd /root' || trimmed === 'cd') {
        setCurrentDir('/root');
        return;
      }
      if (trimmed.startsWith('cd ')) {
        addLine({ type: 'error', content: `bash: cd: ${trimmed.slice(3)}: No such file or directory` });
        return;
      }

      // Combined commands
      if (trimmed === 'cd logs && ls' || trimmed === 'cd logs; ls') {
        setCurrentDir('/root/logs');
        addLine({ type: 'output', content: LOGS_LS });
        return;
      }

      if (trimmed === 'clear') {
        setHistory([]);
        return;
      }

      // Simple commands
      switch (trimmed) {
        case 'ls':
        case 'ls -la':
        case 'ls -l':
        case 'dir':
          if (currentDir === '/root/logs') {
            addLine({ type: 'output', content: LOGS_LS });
          } else {
            addLine({ type: 'output', content: LS_OUTPUT });
          }
          break;

        case 'cat secret.txt':
          if (currentDir !== '/root') {
            addLine({ type: 'error', content: `cat: secret.txt: No such file or directory` });
            break;
          }
          addLine({ type: 'success', content: SECRET_TXT });
          if (!flagFound) {
            setFlagFound(true);
            const finalScore = score + SCORE_MAP.FLAG_FOUND;
            setScore(finalScore);
            onGameComplete?.(finalScore);
            setTimeout(() => setPhase('victory'), 2000);
          }
          break;

        case 'cat passwords.db':
          if (currentDir !== '/root') {
            addLine({ type: 'error', content: `cat: passwords.db: No such file or directory` });
            break;
          }
          addLine({ type: 'output', content: PASSWORDS_DB });
          break;

        case 'cat .bash_history':
          if (currentDir !== '/root') {
            addLine({ type: 'error', content: `cat: .bash_history: No such file or directory` });
            break;
          }
          addLine({ type: 'output', content: BASH_HISTORY });
          break;

        case 'cat network_config':
          if (currentDir !== '/root') {
            addLine({ type: 'error', content: `cat: network_config: No such file or directory` });
            break;
          }
          addLine({ type: 'output', content: getNetworkConfig(targetIP) });
          break;

        case 'cat logs/auth.log':
        case 'cat auth.log':
          if (trimmed === 'cat auth.log' && currentDir !== '/root/logs') {
            addLine({ type: 'error', content: `cat: auth.log: No such file or directory` });
            break;
          }
          addLine({ type: 'output', content: getAuthLog(playerIP || '10.0.0.1') });
          break;

        case 'cat logs/syslog':
        case 'cat syslog':
          if (trimmed === 'cat syslog' && currentDir !== '/root/logs') {
            addLine({ type: 'error', content: `cat: syslog: No such file or directory` });
            break;
          }
          addLine({ type: 'output', content: SYSLOG_OUTPUT });
          break;

        case 'cat logs/access.log':
        case 'cat access.log':
          if (trimmed === 'cat access.log' && currentDir !== '/root/logs') {
            addLine({ type: 'error', content: `cat: access.log: No such file or directory` });
            break;
          }
          addLine({ type: 'output', content: ACCESS_LOG_OUTPUT });
          break;

        case 'ip a':
        case 'ip addr':
        case 'ifconfig':
          addLine({ type: 'output', content: getNetworkConfig(targetIP) });
          break;

        case 'whoami':
          addLine({ type: 'output', content: 'root' });
          break;

        case 'uname -a':
        case 'uname':
          addLine({ type: 'output', content: UNAME_OUTPUT });
          break;

        case 'pwd':
          addLine({ type: 'output', content: currentDir });
          break;

        case 'hostname':
          addLine({ type: 'output', content: 'target-server' });
          break;

        case 'id':
          addLine({ type: 'output', content: 'uid=0(root) gid=0(root) groups=0(root)' });
          break;

        case 'exit':
        case 'logout':
          addLine({ type: 'system', content: 'Connection to ' + targetIP + ' closed.' });
          addLine({ type: 'system', content: 'logout' });
          setPhase('pre-login');
          setCurrentDir('/root');
          break;

        case 'help':
          addLine({
            type: 'system',
            content: `💡 الأوامر المتاحة: ls, cat <file>, whoami, id, pwd, hostname, uname -a, ip a, cd, exit
📁 الملفات: secret.txt, passwords.db, .bash_history, network_config, logs/`,
          });
          break;

        default:
          if (trimmed.startsWith('cat ')) {
            addLine({ type: 'error', content: `cat: ${trimmed.slice(4)}: No such file or directory` });
          } else {
            addLine({ type: 'error', content: `bash: ${trimmed.split(' ')[0]}: command not found` });
          }
      }
    },
    [addLine, currentDir, exploreBonus, flagFound, getPrompt, playerIP, targetIP],
  );

  // ── Main command dispatcher ───────────────────────────────────────────

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const val = inputValue.trim();
      if (!val) return;
      setInputValue('');

      if (phase === 'pre-login') {
        handlePreLoginCommand(val);
      } else if (phase === 'password') {
        handlePasswordInput(val);
      } else if (phase === 'post-login') {
        handlePostLoginCommand(val);
      }
    },
    [inputValue, phase, handlePreLoginCommand, handlePasswordInput, handlePostLoginCommand],
  );

  // ── Unban handler ─────────────────────────────────────────────────────

  const handleUnban = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const expected = `fail2ban-client set sshd unbanip ${playerIP}`;
      if (unbanInput.trim() === expected) {
        setScore((s) => s + SCORE_MAP.UNBAN_SUCCESS);
        setPasswordAttempts(0);
        setPhase('pre-login');
        setHistory([]);
        addLine({ type: 'success', content: `✅ تم رفع الحظر عن ${playerIP} بنجاح. يمكنك الآن إعادة المحاولة.` });
        setUnbanInput('');
      } else {
        addLine({ type: 'error', content: `Error: Invalid command syntax. Try: fail2ban-client set <jail> unbanip <IP>` });
        setUnbanInput('');
      }
    },
    [playerIP, unbanInput, addLine],
  );

  // ── Reset game ────────────────────────────────────────────────────────

  const resetGame = useCallback(() => {
    setPhase('briefing');
    setTargetIP(generateTargetIP());
    setHistory([]);
    setInputValue('');
    setPasswordAttempts(0);
    setScore(0);
    setSshFirstTry(true);
    setPasswordFirstTry(true);
    setCommandsAfterLogin(0);
    setFlagFound(false);
    setExploreBonus(false);
    setCurrentDir('/root');
    setUnbanInput('');
  }, []);

  // ── Start mission ─────────────────────────────────────────────────────

  const startMission = () => {
    setPhase('pre-login');
    addLine({ type: 'system', content: `[*] Initializing Kali Linux terminal...` });
    addLine({ type: 'system', content: `[*] Target: ${targetIP}` });
    addLine({ type: 'system', content: `[*] Protocol: SSH (port 22)` });
    addLine({ type: 'system', content: `[*] User: root` });
    addLine({ type: 'system', content: '' });
    addLine({ type: 'system', content: `💡 اكتب: ssh root@${targetIP}` });
  };

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-[#0a0a0a] text-[#00ff41] relative" style={{ fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace" }}>
      {/* إشارة أن اللعبة تعمل في الوضع الداكن دائماً */}
      <div className="absolute bottom-2 left-2 text-[10px] text-gray-600 select-none z-50 pointer-events-none">
        🖥️ Terminal Mode
      </div>

      {/* ── Custom Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0d1117] border-b border-[#00ff41]/15 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-[#00ff41]/10 transition-colors text-[#00ff41]/70 hover:text-[#00ff41]"
            title="العودة"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#00ff41]/60" />
            <span className="text-sm font-bold text-[#00ff41]/90 font-mono">اختراق الخادم</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#00ff41]/80 bg-[#0a0a0a] px-2 py-1 rounded border border-[#00ff41]/20">
            🏆 {score} pt
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* BRIEFING SCREEN                                           */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {phase === 'briefing' && (
        <div className="flex-1 flex items-center justify-center px-4 overflow-auto">
          <div className="max-w-2xl w-full">
            {/* Scanline overlay */}
            <div className="relative bg-[#0d1117] border border-[#00ff41]/30 rounded-lg p-6 sm:p-8 shadow-[0_0_40px_rgba(0,255,65,0.08)]">
              {/* Top bar decoration */}
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#00ff41]/20">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-[10px] text-[#00ff41]/40 mr-4 font-mono">root@kali:~</span>
              </div>

              {/* Classification badge */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full animate-pulse" />
                  <span className="relative px-6 py-2 bg-red-500/10 border border-red-500/40 text-red-400 text-xs font-mono tracking-[0.3em] uppercase">
                    ■■ سري للغاية ■■
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-center text-2xl sm:text-3xl font-bold text-[#00ff41] mb-1 tracking-wide">
                {MISSION_BRIEFING.title}
              </h1>
              <p className="text-center text-[10px] tracking-[0.4em] text-[#00ff41]/40 uppercase mb-8">
                {MISSION_BRIEFING.subtitle}
              </p>

              {/* Target info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                <div className="bg-[#00ff41]/5 border border-[#00ff41]/15 rounded-lg p-3 text-center">
                  <p className="text-[9px] uppercase tracking-widest text-[#00ff41]/50 mb-1">TARGET IP</p>
                  <p className="text-lg font-bold text-[#00ff41] font-mono">{targetIP}</p>
                </div>
                <div className="bg-[#00ff41]/5 border border-[#00ff41]/15 rounded-lg p-3 text-center">
                  <p className="text-[9px] uppercase tracking-widest text-[#00ff41]/50 mb-1">USER</p>
                  <p className="text-lg font-bold text-[#00ff41] font-mono">root</p>
                </div>
                <div className="bg-[#00ff41]/5 border border-[#00ff41]/15 rounded-lg p-3 text-center">
                  <p className="text-[9px] uppercase tracking-widest text-[#00ff41]/50 mb-1">PROTOCOL</p>
                  <p className="text-lg font-bold text-[#00ff41] font-mono">SSH:22</p>
                </div>
              </div>

              {/* Objective with typewriter */}
              <div className="mb-6 p-4 bg-[#00ff41]/5 border-r-2 border-[#00ff41]/50 rounded-l-lg">
                <p className="text-[10px] uppercase tracking-widest text-[#00ff41]/50 mb-2">OBJECTIVE</p>
                <p className="text-sm text-[#00ff41]/90 leading-relaxed" dir="rtl">
                  {briefingText.slice(0, typingIndex)}
                  {isTyping && <span className="animate-pulse">█</span>}
                </p>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-6">
                {MISSION_BRIEFING.details.map((d, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-[#00ff41]/70" dir="rtl">
                    <span className="text-[#00ff41]/40 mt-0.5">▸</span>
                    <span>{d}</span>
                  </div>
                ))}
              </div>

              {/* Warning */}
              <div className="flex items-center gap-3 bg-red-500/5 border border-red-500/20 rounded-lg p-3 mb-8" dir="rtl">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-xs text-red-400/80">{MISSION_BRIEFING.warning}</p>
              </div>

              {/* Start button */}
              <button
                onClick={startMission}
                className="w-full py-4 bg-[#00ff41]/10 hover:bg-[#00ff41]/20 border border-[#00ff41]/30 hover:border-[#00ff41]/60 rounded-lg text-[#00ff41] font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 group hover:shadow-[0_0_30px_rgba(0,255,65,0.15)]"
              >
                <Terminal className="w-5 h-5 group-hover:animate-pulse" />
                <span>ابدأ المهمة</span>
                <ArrowRight className="w-5 h-5 transform rotate-180 group-hover:-translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* TERMINAL (pre-login, password, post-login)                */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {(phase === 'pre-login' || phase === 'password' || phase === 'post-login') && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Terminal chrome */}
          <div className="flex items-center gap-2 bg-[#1a1a2e] px-4 py-2 border-b border-[#00ff41]/10 shrink-0">
            <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 cursor-pointer transition-colors" onClick={onBack} title="إغلاق" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="text-[11px] text-[#00ff41]/40 mr-3 font-mono">
              {phase === 'post-login' ? `root@target:${currentDir === '/root' ? '~' : currentDir}` : 'hacker@kali:~'}
            </span>
            <div className="flex-1" />
            <span className="text-[10px] text-[#00ff41]/30 font-mono">SSH Simulator v2.1</span>
          </div>

          {/* Terminal body */}
          <div
            ref={terminalRef}
            className="flex-1 overflow-y-auto p-4 custom-scrollbar"
            onClick={() => inputRef.current?.focus()}
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#00ff41 #0a0a0a' }}
          >
            {history.map((line, i) => (
              <div key={i} className="mb-0.5 leading-relaxed text-sm sm:text-base">
                {line.type === 'input' && (
                  <span className="text-[#00ff41]">{line.content}</span>
                )}
                {line.type === 'output' && (
                  <pre className="text-[#b0b0b0] whitespace-pre-wrap break-all font-mono text-[13px]">{line.content}</pre>
                )}
                {line.type === 'error' && (
                  <span className="text-red-400">{line.content}</span>
                )}
                {line.type === 'success' && (
                  <pre className="text-[#00ff41] whitespace-pre-wrap font-mono text-[13px] animate-pulse">{line.content}</pre>
                )}
                {line.type === 'system' && (
                  <span className="text-[#5a9fd4]">{line.content}</span>
                )}
                {line.type === 'password-prompt' && (
                  <span className="text-[#b0b0b0]">{line.content}</span>
                )}
              </div>
            ))}
            <div ref={historyEndRef} />

            {/* Active input line */}
            <form onSubmit={handleSubmit} className="flex items-center mt-1">
              {phase !== 'password' && (
                <span className="text-[#00ff41] shrink-0 text-sm sm:text-base mr-2">{getPrompt()}</span>
              )}
              {phase === 'password' && (
                <span className="text-[#b0b0b0] shrink-0 text-sm sm:text-base mr-2">Password:</span>
              )}
              <input
                ref={inputRef}
                type={phase === 'password' ? 'password' : 'text'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 bg-transparent outline-none text-[#00ff41] caret-[#00ff41] text-sm sm:text-base font-mono"
                style={{ caretColor: '#00ff41' }}
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                dir="ltr"
              />
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* BANNED SCREEN (fail2ban)                                  */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {phase === 'banned' && (
        <div className="flex-1 flex items-center justify-center px-4 overflow-auto">
          <div className="max-w-2xl w-full">
            <div className="bg-[#0d1117] border border-red-500/30 rounded-lg p-6 sm:p-8 shadow-[0_0_40px_rgba(255,0,0,0.08)]">
              {/* Skull icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/30 blur-2xl rounded-full animate-pulse" />
                  <div className="relative w-20 h-20 bg-red-500/10 border-2 border-red-500/40 rounded-full flex items-center justify-center">
                    <Skull className="w-10 h-10 text-red-400" />
                  </div>
                </div>
              </div>

              <h2 className="text-center text-2xl font-bold text-red-400 mb-2">
                ⛔ تم حظر الوصول
              </h2>
              <p className="text-center text-sm text-red-400/60 mb-6 font-mono">
                ACCESS DENIED — IP BANNED BY fail2ban
              </p>

              {/* Ban details table */}
              <div className="bg-[#0a0a0a] border border-red-500/20 rounded-lg p-4 mb-6 font-mono text-xs overflow-x-auto">
                <table className="w-full" dir="ltr">
                  <thead>
                    <tr className="text-red-400/50 border-b border-red-500/10">
                      <th className="text-left py-2 px-2">Jail</th>
                      <th className="text-left py-2 px-2">IP Address</th>
                      <th className="text-left py-2 px-2">Attempts</th>
                      <th className="text-left py-2 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-red-300">
                      <td className="py-2 px-2">sshd</td>
                      <td className="py-2 px-2 text-[#00ff41]">{playerIP}</td>
                      <td className="py-2 px-2">{MAX_ATTEMPTS}/{MAX_ATTEMPTS}</td>
                      <td className="py-2 px-2">
                        <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-[10px]">
                          BANNED
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Instructions */}
              <div className="bg-[#00ff41]/5 border border-[#00ff41]/15 rounded-lg p-4 mb-6" dir="rtl">
                <div className="flex items-center gap-2 mb-2">
                  <Unlock className="w-4 h-4 text-[#00ff41]" />
                  <p className="text-sm font-bold text-[#00ff41]">كيف تفك الحظر؟</p>
                </div>
                <p className="text-xs text-[#00ff41]/70 leading-relaxed mb-2">
                  اكتب الأمر الصحيح لإزالة عنوان IP الخاص بك من قائمة الحظر:
                </p>
                <code className="block bg-[#0a0a0a] border border-[#00ff41]/20 rounded px-3 py-2 text-[#00ff41] text-xs font-mono" dir="ltr">
                  fail2ban-client set sshd unbanip {'<'}IP{'>'}
                </code>
              </div>

              {/* Unban input */}
              <form onSubmit={handleUnban} className="flex gap-2">
                <div className="flex-1 flex items-center bg-[#0a0a0a] border border-[#00ff41]/20 rounded-lg px-3 overflow-hidden">
                  <span className="text-[#00ff41]/40 text-xs font-mono shrink-0 mr-2">$</span>
                  <input
                    ref={unbanInputRef}
                    type="text"
                    value={unbanInput}
                    onChange={(e) => setUnbanInput(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-[#00ff41] py-3 text-sm font-mono"
                    placeholder="fail2ban-client ..."
                    dir="ltr"
                    autoFocus
                    autoComplete="off"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 bg-[#00ff41]/10 hover:bg-[#00ff41]/20 border border-[#00ff41]/30 rounded-lg text-[#00ff41] font-mono text-sm transition-colors"
                >
                  تنفيذ
                </button>
              </form>

              {/* Error messages in terminal */}
              {history.filter((l) => l.type === 'error' && l.content.includes('Invalid')).length > 0 && (
                <div className="mt-4 space-y-1">
                  {history
                    .filter((l) => l.type === 'error' && l.content.includes('Invalid'))
                    .slice(-3)
                    .map((l, i) => (
                      <p key={i} className="text-xs text-red-400 font-mono" dir="ltr">{l.content}</p>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* VICTORY SCREEN                                            */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {phase === 'victory' && (
        <div className="flex-1 flex items-center justify-center px-4 overflow-auto">
          <div className="max-w-xl w-full">
            <div className="bg-[#0d1117] border border-[#00ff41]/30 rounded-lg p-6 sm:p-8 shadow-[0_0_60px_rgba(0,255,65,0.12)] relative overflow-hidden">
              {/* Glow effect */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#00ff41]/10 rounded-full blur-3xl" />

              {/* Trophy */}
              <div className="flex justify-center mb-6 relative">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#00ff41]/20 blur-2xl rounded-full animate-pulse" />
                  <div className="relative w-24 h-24 bg-[#00ff41]/10 border-2 border-[#00ff41]/40 rounded-full flex items-center justify-center">
                    <Trophy className="w-12 h-12 text-[#00ff41]" />
                  </div>
                </div>
              </div>

              <h2 className="text-center text-3xl font-bold text-[#00ff41] mb-2" dir="rtl">
                🎉 المهمة اكتملت!
              </h2>
              <p className="text-center text-sm text-[#00ff41]/60 mb-8 font-mono" dir="ltr">
                MISSION ACCOMPLISHED — FLAG CAPTURED
              </p>

              {/* Score breakdown */}
              <div className="space-y-3 mb-8">
                <div className="flex justify-between items-center text-sm font-mono px-2" dir="ltr">
                  <span className="text-[#b0b0b0]">SSH Connection</span>
                  <span className={sshFirstTry ? 'text-[#00ff41]' : 'text-[#b0b0b0]'}>
                    {sshFirstTry ? `+${SCORE_MAP.SSH_FIRST_TRY}` : '+0'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-mono px-2" dir="ltr">
                  <span className="text-[#b0b0b0]">Password (1st try)</span>
                  <span className={passwordFirstTry ? 'text-[#00ff41]' : 'text-[#b0b0b0]'}>
                    {passwordFirstTry ? `+${SCORE_MAP.PASSWORD_FIRST_TRY}` : '+0'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-mono px-2" dir="ltr">
                  <span className="text-[#b0b0b0]">Flag Captured</span>
                  <span className="text-[#00ff41]">+{SCORE_MAP.FLAG_FOUND}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-mono px-2" dir="ltr">
                  <span className="text-[#b0b0b0]">Explorer Bonus (3+ cmds)</span>
                  <span className={exploreBonus ? 'text-[#00ff41]' : 'text-[#b0b0b0]'}>
                    {exploreBonus ? `+${SCORE_MAP.EXPLORE_BONUS}` : '+0'}
                  </span>
                </div>
                {passwordAttempts > 0 && (
                  <div className="flex justify-between items-center text-sm font-mono px-2" dir="ltr">
                    <span className="text-[#b0b0b0]">Failed Attempts ({passwordAttempts}x)</span>
                    <span className="text-red-400">{passwordAttempts * SCORE_MAP.PASSWORD_FAIL_PENALTY}</span>
                  </div>
                )}
                <div className="border-t border-[#00ff41]/20 pt-3 flex justify-between items-center text-lg font-bold font-mono px-2" dir="ltr">
                  <span className="text-[#00ff41]">Total Score</span>
                  <span className="text-[#00ff41]">{score} pts</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={resetGame}
                  className="flex-1 py-3 bg-[#00ff41]/10 hover:bg-[#00ff41]/20 border border-[#00ff41]/30 rounded-lg text-[#00ff41] font-bold transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  إعادة المهمة
                </button>
                <button
                  onClick={onBack}
                  className="flex-1 py-3 bg-[#1a1a2e] hover:bg-[#252540] border border-[#00ff41]/20 rounded-lg text-[#00ff41]/70 font-bold transition-all"
                >
                  العودة للوحة التحكم
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scanline effect overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]" style={{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.1) 2px, rgba(0,255,65,0.1) 4px)',
      }} />
    </div>
  );
};
