import React, { useState, useEffect, useRef } from "react";
import { CityMap } from "./Map";
import { Sector } from "../data/cityData";
import { GlobalHeader } from "./GlobalHeader";
import {
  LogOut,
  ShieldAlert,
  ShieldCheck,
  Trophy,
  Terminal as TerminalIcon,
  Settings,
  Bell as Notifications,
  Globe as Public,
  Clock as Schedule,
  Cpu as Memory,
  Users as Groups,
  Activity as LeakAdd,
  LayoutDashboard as Dashboard,
  Microscope as Biotech,
  CheckCircle as Verified,
  X,
  HelpCircle,
  Sun,
  Moon,
  ArrowRight,
  Lock,
  Bug,
  Eye,
  Ban,
  Plus,
} from "lucide-react";
import {
  LEVEL_1_SECTORS,
  LEVEL_2_SECTORS,
  LEVEL_3_SECTORS,
  ATTACKS_LEVEL_1,
  ATTACKS_LEVEL_2,
  ATTACKS_LEVEL_3,
} from "../data/cityData";

import { TutorialOverlay } from "./TutorialOverlay";
import { GameProgress } from "../data/gameProgression";

interface SecureCityViewProps {
  onBack: () => void;
  studentName?: string;
  studentLevel?: string;
  isTutorial?: boolean;
  avatarSeed?: string;
  onAvatarSelect?: (seed: string) => void;
  onGameComplete?: (gameType: string, data: any) => void;
  gameProgress?: GameProgress;
  userRole?: string;
}

interface TerminalLog {
  text: string;
  type: "info" | "warning" | "error" | "success" | "input" | "system";
}

interface HoneypotLog {
  ip: string;
  hackerName: string;
  timestamp: Date;
  action: string;
  isBlocked: boolean;
}

interface HoneypotNode {
  id: string;
  name: string;
  sectorId: string;
  type: 'web_server' | 'database' | 'email';
  position: { x: number; y: number };
  createdAt: Date;
  isTriggered: boolean;
  accessLogs: HoneypotLog[];
}

const HONEYPOT_TYPES = [
  { id: 'web_server', name: 'خادم ويب وهمي', icon: '🌐', desc: 'يحاكي خادم ويب Apache/Nginx لجذب فحص المنافذ' },
  { id: 'database', name: 'قاعدة بيانات وهمية', icon: '🗄️', desc: 'يحاكي MySQL/PostgreSQL مع بيانات مزيفة' },
  { id: 'email', name: 'خادم بريد وهمي', icon: '📧', desc: 'يحاكي SMTP server لرصد محاولات التصيد' },
] as const;

const HONEYPOT_COST = 3000;
const MAX_HONEYPOTS = 3;

const CRYPTO_PUZZLES = [
  {
    question: 'نوع: التشفير بالجمع | فك تشفير النص "bcde" (مفتاح=1)',
    answer: "abcd",
    hint: "كل حرف تم إزاحته بمقدار +1 للأمـام. قم بإرجاعه خطوة واحدة للخلف (bcde -> abcd).",
  },
  {
    question: 'نوع: الإزاحة (قيصر) | فك تشفير النص "khoor" (مفتاح=3)',
    answer: "hello",
    hint: "قم بإزاحة كل حرف 3 خطوات للخلف في الأبجدية الإنجليزية (k -> h, h -> e).",
  },
  {
    question: 'نوع: الاستبدال | إذا كان A=Z و B=Y، فما هو فك تشفير "ZYY"؟',
    answer: "abb",
    hint: "استبدل كل حرف بقرينه العكسي في الأبجدية (Z هو A، وY هو B).",
  },
  {
    question:
      "نوع: التشفير بالضرب | المفتاح=3 (الأبجدية 26). تشفير الحرف B(1) هو D(3). ما هو تشفير C(2)؟",
    answer: "g",
    hint: "حاصل ضرب الموقع (2) في المفتاح (3) هو 6، وهو يوافق حرف g في الترتيب (a=0, b=1, c=2, ...).",
  },
  {
    question:
      'نوع: وحيد الحرف | فك تشفير "xsx" أداة استغلال، إذا كان x=s و s=x',
    answer: "sxs",
    hint: "قم بتبديل كل حرف x بحرف s، وكل حرف s بحرف x في الكلمة 'xsx'.",
  },
];

const DEFENDER_PUZZLES = [
  {
    question: "أدخل أمر إيقاف الخدمة الخبيثة malware.service (بدون sudo):",
    answer: "systemctl stop malware.service",
    hint: "استخدم الأداة systemctl مع الإجراء stop تليها اسم الخدمة malware.service",
  },
  {
    question: "أدخل أمر حذف الملف /tmp/virus بالقوة:",
    answer: "rm -f /tmp/virus",
    hint: "الأمر هو rm مع خيار القوة -f والمسار الكامل للملف /tmp/virus",
  },
  {
    question: "أدخل أمر جدار الحماية لمنع المنفذ 4444 (ufw):",
    answer: "ufw deny 4444",
    hint: "استخدم ufw متبوعاً بـ deny ثم رقم المنفذ 4444",
  },
];

const COMMAND_MAPPING: Record<string, string> = {
  "هجوم حرمان من الخدمة (DDoS)": "enable scrubbing",
  "حقن أوامر (Command Injection)": "sanitize inputs",
  "تشفير الفدية (Ransomware)": "isolate network restore backup",
  "هجوم عبر هجمات الوسيط (MitM)": "enforce mtls",
  "هجوم التصيد الاحتيالي (Phishing)": "enforce mfa revoke sessions",
  "هجوم هجمات يوم الصفر (Zero-Day)": "air-gap critical systems",
  "هجوم هندسة عكسية (Reverse Engineering)": "enable zero-trust",
};

const playErrorSound = () => {
  try {
    const audioCtx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // صوت إنذار (صفارة إنذار)
    oscillator.type = "square";

    // تذبذب التردد بين عالي ومنخفض (تأثير صفارة الإنذار)
    const now = audioCtx.currentTime;
    oscillator.frequency.setValueAtTime(800, now);
    oscillator.frequency.linearRampToValueAtTime(400, now + 0.25);
    oscillator.frequency.linearRampToValueAtTime(800, now + 0.5);
    oscillator.frequency.linearRampToValueAtTime(400, now + 0.75);
    oscillator.frequency.linearRampToValueAtTime(800, now + 1.0);

    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.0);

    oscillator.start(now);
    oscillator.stop(now + 1.0);
  } catch (e) {
    console.warn("Audio not supported");
  }
};

export const SecureCityView: React.FC<SecureCityViewProps> = ({
  onBack,
  studentName,
  studentLevel,
  isTutorial = false,
  avatarSeed,
  onAvatarSelect,
  onGameComplete,
  gameProgress = {
    assessment: false,
    crypto: false,
    millionaire: false,
    city_level1: false,
    city_level2: false,
    city_level3: false,
    ssh: false,
  },
  userRole = "user",
}) => {
  const [showTutorial, setShowTutorial] = useState(isTutorial);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(
    document.documentElement.classList.contains("dark") ? "dark" : "light",
  );

  // Listen to class changes on document
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const isDark = document.documentElement.classList.contains("dark");
          setTheme(isDark ? "dark" : "light");
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const [gameState, setGameState] = useState<
    "mode_selection" | "menu" | "playing"
  >("menu");
  const [showTerminal, setShowTerminal] = useState(false);
  const [showThreatIntel, setShowThreatIntel] = useState(false);
  const [playMode, setPlayMode] = useState<"person" | "computer" | null>(null);
  const [level, setLevel] = useState(1);
  const [budget, setBudget] = useState(50000);
  const [sectors, setSectors] = useState<Sector[]>(LEVEL_1_SECTORS);
  const [activeSectorId, setActiveSectorId] = useState<string>("central_hub");
  const [showPuzzleHint, setShowPuzzleHint] = useState(false);

  const [provinceState, setProvinceState] = useState<{
    isOpen: boolean;
    sectorId: string | null;
    role: "attacker" | "defender" | null;
    isAuthenticated: boolean;
    operativeInfo?: { name: string; ip: string };
    activePuzzleTarget?: string | null;
    puzzleType?: "crypto" | "linux";
    puzzle?: { question: string; answer: string; hint: string };
  }>({
    isOpen: false,
    sectorId: null,
    role: null,
    isAuthenticated: false,
  });

  const [targetStatuses, setTargetStatuses] = useState<
    Record<string, Record<string, "safe" | "warning" | "critical">>
  >({});
  // helper to get target status
  const getTargetStatus = (sectorId: string, targetId: string) => {
    return targetStatuses[sectorId]?.[targetId] || "safe";
  };

  const setTargetStatus = (
    sectorId: string,
    targetId: string,
    status: "safe" | "warning" | "critical",
  ) => {
    setTargetStatuses((prev) => ({
      ...prev,
      [sectorId]: {
        ...(prev[sectorId] || {}),
        [targetId]: status,
      },
    }));
    // Also update sector status if any target is critical, else warning, else safe
    setTimeout(() => {
      setSectors((prevSectors) =>
        prevSectors.map((s) => {
          if (s.id === sectorId) {
            const allTargets = {
              ...(targetStatuses[sectorId] || {}),
              [targetId]: status,
            };
            const vals = Object.values(allTargets);
            if (vals.includes("critical")) return { ...s, status: "critical" };
            if (vals.includes("warning")) return { ...s, status: "warning" };
            return { ...s, status: "safe" };
          }
          return s;
        }),
      );
    }, 0);
  };

  const [attacksResolved, setAttacksResolved] = useState(0);
  const [currentAttack, setCurrentAttack] = useState<any>(null);
  const [gameOver, setGameOver] = useState(false);
  const [levelWon, setLevelWon] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const isLevel2Unlocked = gameProgress.city_level1 || userRole === 'admin';
  const isLevel3Unlocked = gameProgress.city_level2 || userRole === 'admin';

  // Terminal State
  const [terminalHistory, setTerminalHistory] = useState<TerminalLog[]>([]);

  const [terminalInput, setTerminalInput] = useState("");
  const [isTerminalBusy, setIsTerminalBusy] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [overrideTerminalOutput, setOverrideTerminalOutput] = useState<
    string[]
  >([]);

  // ===== Honeypot System State =====
  const [honeypots, setHoneypots] = useState<HoneypotNode[]>([]);
  const [blockedIPs, setBlockedIPs] = useState<string[]>([]);
  const [showHoneypotPanel, setShowHoneypotPanel] = useState(false);
  const [selectedHoneypot, setSelectedHoneypot] = useState<string | null>(null);
  const [showCreateHoneypot, setShowCreateHoneypot] = useState(false);

  // Generate random attacker IP
  const generateRandomIP = () => {
    const ranges = ['10.', '172.16.', '192.168.', '203.0.', '45.33.', '185.220.', '91.134.', '77.247.'];
    const base = ranges[Math.floor(Math.random() * ranges.length)];
    const octets = base.split('.').length;
    const remaining = 4 - octets;
    const parts = [base.replace(/\.$/, '')];
    for (let i = 0; i < remaining; i++) {
      parts.push(String(Math.floor(Math.random() * 254) + 1));
    }
    return parts.join('.');
  };

  // Create a new honeypot
  const createHoneypot = (name: string, sectorId: string, type: 'web_server' | 'database' | 'email') => {
    if (honeypots.length >= MAX_HONEYPOTS) {
      addLog(`[ERROR] الحد الأقصى ${MAX_HONEYPOTS} فخاخ Honeypot. لا يمكن إنشاء المزيد.`, "error");
      return false;
    }
    if (budget < HONEYPOT_COST) {
      addLog(`[ERROR] رصيد غير كافٍ. مطلوب: $${HONEYPOT_COST}، المتاح: $${budget}`, "error");
      return false;
    }

    const sector = sectors.find(s => s.id === sectorId);
    if (!sector) return false;

    // Generate position near the sector but offset
    const offsetX = (Math.random() - 0.5) * 60;
    const offsetY = (Math.random() - 0.5) * 60;
    const hpId = `honeypot_${Date.now()}`;

    const newHoneypot: HoneypotNode = {
      id: hpId,
      name,
      sectorId,
      type,
      position: { x: Math.max(10, Math.min(990, sector.x + offsetX)), y: Math.max(10, Math.min(990, sector.y + offsetY)) },
      createdAt: new Date(),
      isTriggered: false,
      accessLogs: [],
    };

    setHoneypots(prev => [...prev, newHoneypot]);
    setBudget(prev => prev - HONEYPOT_COST);

    // Add honeypot as a new sector on the map
    const hpSector: Sector = {
      id: hpId,
      name: `🍯 ${name}`,
      x: newHoneypot.position.x,
      y: newHoneypot.position.y,
      status: 'safe',
      description: `فخ Honeypot - ${HONEYPOT_TYPES.find(t => t.id === type)?.name || type}`,
      isHoneypot: true,
      honeypotTriggered: false,
    };
    setSectors(prev => [...prev, hpSector]);

    addLog(`[HONEYPOT] ✅ تم نشر فخ "${name}" في القطاع [${sectorId.toUpperCase()}] - التكلفة: $${HONEYPOT_COST}`, "success");
    return true;
  };

  // Trigger honeypot when attacker enters
  const triggerHoneypot = (honeypotId: string, hackerName: string, hackerIP: string) => {
    if (blockedIPs.includes(hackerIP)) return; // IP already blocked

    setHoneypots(prev => prev.map(hp => {
      if (hp.id === honeypotId) {
        const newLog: HoneypotLog = {
          ip: hackerIP,
          hackerName,
          timestamp: new Date(),
          action: ['فحص منفذ', 'محاولة SSH', 'طلب HTTP مشبوه', 'محاولة SQL Injection', 'فحص ثغرات'][Math.floor(Math.random() * 5)],
          isBlocked: false,
        };
        return { ...hp, isTriggered: true, accessLogs: [...hp.accessLogs, newLog] };
      }
      return hp;
    }));

    // Update map sector to show triggered state
    setSectors(prev => prev.map(s => {
      if (s.id === honeypotId) {
        return { ...s, honeypotTriggered: true };
      }
      return s;
    }));

    addLog(`[🍯 HONEYPOT] ⚠️ تم رصد مهاجم! IP: ${hackerIP} | الاسم: ${hackerName} | الفخ: ${honeypotId}`, "warning");
  };

  // Block IP addresses
  const blockIP = (ip: string) => {
    if (blockedIPs.includes(ip)) return;
    setBlockedIPs(prev => [...prev, ip]);
    // Update all honeypot logs to mark this IP as blocked
    setHoneypots(prev => prev.map(hp => ({
      ...hp,
      accessLogs: hp.accessLogs.map(log => log.ip === ip ? { ...log, isBlocked: true } : log),
    })));
    addLog(`[🚫 BLOCKED] تم حظر العنوان ${ip} - لن يستطيع تنفيذ هجمات إضافية.`, "success");
  };

  const blockAllIPs = () => {
    const allIPs = new Set<string>();
    honeypots.forEach(hp => hp.accessLogs.forEach(log => {
      if (!log.isBlocked) allIPs.add(log.ip);
    }));
    const newIPs = Array.from(allIPs);
    if (newIPs.length === 0) {
      addLog(`[INFO] لا توجد عناوين IP جديدة لحظرها.`, "info");
      return;
    }
    setBlockedIPs(prev => [...new Set([...prev, ...newIPs])]);
    setHoneypots(prev => prev.map(hp => ({
      ...hp,
      accessLogs: hp.accessLogs.map(log => ({ ...log, isBlocked: true })),
    })));
    addLog(`[🚫 BLOCKED] تم حظر ${newIPs.length} عنوان IP جديد. إجمالي المحظورين: ${blockedIPs.length + newIPs.length}`, "success");
  };

  const targetRequired = level === 1 ? 3 : level === 2 ? 5 : 7;

  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [terminalHistory]);

  useEffect(() => {
    if (
      !isTerminalBusy &&
      currentAttack &&
      !gameOver &&
      !levelWon &&
      !gameWon
    ) {
      inputRef.current?.focus();
    }
  }, [isTerminalBusy, currentAttack, gameOver, levelWon, gameWon]);

  const addLog = (text: string, type: TerminalLog["type"] = "info") => {
    setTerminalHistory((prev) => [...prev, { text, type }]);
  };

  const loadLevel = (newLevel: number) => {
    setLevel(newLevel);
    setSectors(
      newLevel === 1
        ? LEVEL_1_SECTORS
        : newLevel === 2
          ? LEVEL_2_SECTORS
          : LEVEL_3_SECTORS,
    );
    setAttacksResolved(0);
    setCurrentAttack(null);
    setGameOver(false);
    setLevelWon(false);
    setGameWon(false);
    setTerminalHistory([
      {
        text: `[SYSTEM] SYS_CORE v${newLevel}.0.4 Initialized.`,
        type: "system",
      },
      {
        text: `[SYSTEM] Establishing secure connection to map nodes... OK`,
        type: "system",
      },
    ]);

    if (newLevel === 1) setBudget(50000);
    if (newLevel === 2) setBudget(75000);
    if (newLevel === 3) setBudget(100000);

    // Reset honeypot state
    setHoneypots([]);
    setBlockedIPs([]);
    setShowHoneypotPanel(false);
    setSelectedHoneypot(null);
    setShowCreateHoneypot(false);

    setGameState("playing");
  };

  const triggerAttack = () => {
    if (gameOver || levelWon || gameWon) return;
    const attacksList =
      level === 1
        ? ATTACKS_LEVEL_1
        : level === 2
          ? ATTACKS_LEVEL_2
          : ATTACKS_LEVEL_3;
    const attack = attacksList[attacksResolved % attacksList.length];

    setSectors((prev) =>
      prev.map((s) =>
        s.id === attack.sectorId ? { ...s, status: "critical" } : s,
      ),
    );
    setActiveSectorId(attack.sectorId);
    setCurrentAttack(attack);

    setTerminalHistory((prev) => [
      ...prev,
      { text: `-------`, type: "info" },
      {
        text: `[!] ALERT: COMPROMISE DETECTED: [${attack.sectorId.toUpperCase()}]`,
        type: "error",
      },
      { text: `Threat: ${attack.title}`, type: "warning" },
      {
        text: `>> EMERGENCY: Access Sector [${attack.sectorId.toUpperCase()}] map node and authenticate as DEFENDER to mitigate threat.`,
        type: "system",
      },
    ]);

    // Auto-trigger honeypots in the attacked sector (simulate attacker scanning)
    const sectorHoneypots = honeypots.filter(hp => hp.sectorId === attack.sectorId);
    if (sectorHoneypots.length > 0) {
      setTimeout(() => {
        const attackerIP = generateRandomIP();
        const attackerName = ['DarkPhantom', 'Zer0Day', 'CyberGh0st', 'ShadowByte', 'NullPtr'][Math.floor(Math.random() * 5)];
        sectorHoneypots.forEach(hp => {
          if (!blockedIPs.includes(attackerIP)) {
            triggerHoneypot(hp.id, attackerName, attackerIP);
          }
        });
      }, 2000);
    }
  };

  const executeDefense = async (option: any) => {
    setIsTerminalBusy(true);
    addLog(`Executing protocol [${option.id}]...`, "system");

    await new Promise((resolve) => setTimeout(resolve, 800));

    if (budget < option.cost) {
      addLog(
        `[ERROR] INSUFFICIENT FUNDS. Req: $${option.cost}, Avail: $${budget}`,
        "error",
      );
      setIsTerminalBusy(false);
      return;
    }

    setBudget((prev) => prev - option.cost);
    addLog(`[SYSTEM] Deducted $${option.cost}`, "warning");

    await new Promise((resolve) => setTimeout(resolve, 800));

    if (option.isCorrect) {
      addLog(`[SUCCESS] Countermeasure effective. Target secure.`, "success");
      setSectors((prev) =>
        prev.map((s) =>
          s.id === currentAttack?.sectorId ? { ...s, status: "safe" } : s,
        ),
      );
      setCurrentAttack(null);

      const newResolved = attacksResolved + 1;
      setAttacksResolved(newResolved);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (newResolved >= targetRequired) {
        if (level === 3) {
          setGameWon(true);
          onGameComplete?.('city_level3', { completed: true, budget });
        } else {
          setLevelWon(true);
          onGameComplete?.(`city_level${level}`, { completed: true, budget });
        }
      } else {
        triggerAttack();
      }
    } else {
      addLog(`[FAILURE] Protocol ineffective. Threat active.`, "error");

      if (budget - option.cost <= 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        addLog(`[CRITICAL] SYSTEM OFFLINE. CITY COMPROMISED.`, "error");
        setGameOver(true);
      }
    }
    setIsTerminalBusy(false);
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim() || isTerminalBusy) return;

    const input = terminalInput.trim();
    setTerminalInput("");
    addLog(input, "input");

    const cmd = input.trim().toLowerCase();
    const parts = cmd.split(/\s+/);
    const command = parts[0];

    switch (command) {
      case "clear":
        setTerminalHistory([
          { text: `[SYSTEM] Terminal cleared.`, type: "system" },
        ]);
        break;

      case "status": {
        const statusReport = sectors
          .map(
            (s) =>
              `  [${s.status === "safe" ? "✅" : s.status === "warning" ? "⚠️" : "🔴"}] ${s.name}: ${s.status}`,
          )
          .join("\n");
        addLog(`\n📊 حالة قطاعات الشبكة:\n${statusReport}`, "system");
        break;
      }

      case "budget":
        addLog(`💰 الرصيد التشغيلي المتاح: $${budget.toLocaleString()}`, "success");
        break;

      case "attacks":
        addLog(`🎯 الهجمات المحلولة: ${attacksResolved}/${targetRequired}`, "system");
        if (currentAttack) {
          addLog(`⚠️ تهديد أمني نشط: ${currentAttack.title} على القطاع [${currentAttack.sectorId.toUpperCase()}]`, "error");
        } else {
          addLog("✅ لا يوجد هجوم نشط حالياً. الشبكة آمنة.", "success");
        }
        break;

      case "level":
        addLog(`📶 مستوى محاكاة الشبكة: ${level}`, "system");
        break;

      case "scan":
        addLog("🔍 جاري بدء فحص سلامة العقد والشبكات الفرعية...", "system");
        setIsTerminalBusy(true);
        setTimeout(() => {
          const compromised = sectors.filter((s) => s.status === "critical").length;
          const warned = sectors.filter((s) => s.status === "warning").length;
          const safe = sectors.filter((s) => s.status === "safe").length;
          addLog(
            `📡 نتائج الفحص:\n  - قطاعات آمنة: ${safe}\n  - قطاعات مخترقة: ${compromised}\n  - قطاعات مهددة: ${warned}`,
            compromised > 0 ? "error" : warned > 0 ? "warning" : "success",
          );
          setIsTerminalBusy(false);
        }, 1500);
        break;

      case "help":
        addLog(
          `📋 الأوامر المتاحة بنظام التشغيل:\n  help     - عرض قائمة الأوامر والمساعدة\n  status   - عرض تقرير مفصل بحالة قطاعات المدينة\n  budget   - الاستعلام عن الرصيد المالي التشغيلي\n  attacks  - عرض تقرير الهجمات الأمنية المصدودة\n  level    - معرفة مستوى الوصول الحالي بالشبكة\n  scan     - بدء فحص شامل للشبكة الفرعية\n  honeypot - عرض حالة فخاخ Honeypot والعناوين المحظورة\n  clear    - تنظيف شاشة الطرفية`,
          "system",
        );
        break;

      case "honeypot": {
        if (honeypots.length === 0) {
          addLog("🍯 لا توجد فخاخ Honeypot منصوبة حالياً. استخدم لوحة Honeypot في الشريط الجانبي لإنشاء فخ.", "info");
        } else {
          const hpReport = honeypots.map(hp => {
            const status = hp.isTriggered ? "🟢 تم الرصد" : "🔵 نشط";
            return `  [${status}] ${hp.name} | القطاع: ${hp.sectorId} | سجلات: ${hp.accessLogs.length}`;
          }).join("\n");
          addLog(`🍯 تقرير فخاخ Honeypot:\n${hpReport}`, "system");
          if (blockedIPs.length > 0) {
            addLog(`🚫 عناوين IP محظورة (${blockedIPs.length}):\n  ${blockedIPs.join("\n  ")}`, "warning");
          }
        }
        break;
      }

      default:
        addLog(`[ERROR] أمر غير مدعوم: '${command}'. اكتب 'help' لعرض دليل الأوامر المتاحة.`, "error");
        playErrorSound();
    }
  };

  useEffect(() => {
    if (
      gameState === "playing" &&
      attacksResolved === 0 &&
      !currentAttack &&
      terminalHistory.length === 2 &&
      !gameOver &&
      !gameWon &&
      !levelWon
    ) {
      const timer = setTimeout(triggerAttack, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState, level, terminalHistory.length]);

  const activeSector =
    sectors.find((s) => s.id === activeSectorId) || sectors[0];

  const operativeName = studentName || "OPERATIVE_042";

  return (
    <div
      className={`h-screen w-screen relative bg-surface text-on-surface font-body-main selection:bg-primary-container selection:text-on-primary-container overflow-hidden transition-colors duration-500`}
    >
      {showTutorial && (
        <TutorialOverlay
          message="في محاكاة المدينة الآمنة، ستتولى حماية البنية التحتية من الاختراقات. ابدأ باختيار مستوى الشبكة للتدرب على صد الهجمات وإدارة الميزانية المتاحة."
          onDismiss={() => setShowTutorial(false)}
        />
      )}
      {/* CRT Scanning Overlay */}
      <div className="fixed inset-0 z-50 scanning-overlay opacity-20 pointer-events-none hidden sm:block"></div>

      {/* Navigation Shell (TopAppBar) */}
      {/* Navigation Shell moved to GlobalHeader inside App, wait we just drop it here directly */}
      <GlobalHeader
        onBack={onBack}
        studentName={studentName}
        studentLevel={studentLevel}
        budget={budget}
        avatarSeed={avatarSeed}
        onAvatarSelect={onAvatarSelect}
        onToggleSidebar={(gameState === "playing") ? () => setShowMobileSidebar(!showMobileSidebar) : undefined}
      />

      {gameState === "mode_selection" ? (
        <main className="pt-24 pb-12 px-6 h-full flex flex-col justify-center items-center relative z-10 w-full max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-[28px] sm:text-[40px] md:text-[60px] font-h1-display font-bold text-primary mb-4 leading-none tracking-tight shadow-primary/20 drop-shadow-md">
              المدينة الآمنة
            </h1>
            <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">
              الرجاء تحديد وضع التشغيل قبل الولوج إلى خوادم المدينة المركزية
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mx-auto">
            <button
              onClick={() => {
                setPlayMode("computer");
                setGameState("menu");
              }}
              className="glass-panel p-6 md:p-10 rounded-2xl hover:bg-secondary/10 border-2 border-secondary/20 hover:border-secondary transition-all text-center flex flex-col items-center gap-4 md:gap-6 group"
            >
              <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TerminalIcon className="w-8 h-8 md:w-12 md:h-12 text-secondary" />
              </div>
              <div>
                <h3 className="text-xl md:text-3xl font-h3-terminal text-secondary mb-2 md:mb-3 font-bold">
                  لعب ضد الكمبيوتر
                </h3>
                <p className="text-sm md:text-base text-on-surface-variant text-center leading-relaxed">
                  صد الهجمات المبرمجة آلياً
                </p>
              </div>
            </button>

            <button
              onClick={() => setShowTutorial(true)}
              className="glass-panel p-6 md:p-10 rounded-2xl hover:bg-primary/10 border-2 border-primary/20 hover:border-primary transition-all text-center flex flex-col items-center gap-4 md:gap-6 group"
            >
              <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <HelpCircle className="w-8 h-8 md:w-12 md:h-12 text-primary" />
              </div>
              <div>
                <h3 className="text-xl md:text-3xl font-h3-terminal text-primary mb-2 md:mb-3 font-bold">
                  توجيه العمليات
                </h3>
                <p className="text-sm md:text-base text-on-surface-variant text-center leading-relaxed">
                  عرض دليل التشغيل والتعليمات
                </p>
              </div>
            </button>
          </div>
        </main>
      ) : gameState === "menu" ? (
        <main className="pt-24 pb-12 px-6 h-full flex flex-col justify-center items-center relative z-10 w-full max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-[28px] sm:text-[40px] md:text-[60px] font-h1-display font-bold text-primary mb-4 leading-none tracking-tight shadow-primary/20 drop-shadow-md">
              المدينة الآمنة
            </h1>
            <p className="text-on-surface-variant max-w-2xl mx-auto">
              اختر مستوى المحاكاة الفردي. كل مستوى يزيد من مساحة الشبكة وتعقيد
              التهديدات.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {/* Level 1 Card */}
            <button
              onClick={() => loadLevel(1)}
              className="glass-panel bg-surface-container-low/40 p-6 rounded-xl hover:bg-surface-variant/50 transition-all text-right group flex flex-col relative overflow-hidden"
            >
              <div className="absolute -right-6 -top-6 text-[100px] font-h1-display font-bold opacity-5 text-primary group-hover:opacity-10 transition-opacity">
                01
              </div>
              <h3 className="text-2xl font-h3-terminal text-primary mb-2 font-bold relative z-10">
                القطاع الأساسي
              </h3>
              <p className="text-sm text-on-surface-variant mb-8 flex-1 relative z-10">
                محاكاة مبسطة تستهدف الجوهر الرئيسي للشبكة. تدرب على صد الهجمات
                وإدارة الميزانية.
              </p>
              <div className="space-y-2 w-full pt-4 border-t border-outline-variant/20 relative z-10 text-[11px] font-mono">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">عقد الشبكة</span>
                  <span className="text-secondary">06</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">الميزانية</span>
                  <span className="text-primary">$50,000</span>
                </div>
              </div>
            </button>

            {/* Level 2 Card */}
            <button
              onClick={() => isLevel2Unlocked ? loadLevel(2) : null}
              disabled={!isLevel2Unlocked}
              className={`glass-panel bg-surface-container-low/40 p-6 rounded-xl transition-all text-right group flex flex-col relative overflow-hidden
                ${isLevel2Unlocked 
                  ? 'hover:bg-surface-variant/50 cursor-pointer' 
                  : 'grayscale opacity-50 cursor-not-allowed'
                }`}
            >
              {!isLevel2Unlocked && (
                <div className="absolute top-3 left-3 z-20">
                  <div className="p-1.5 rounded-full bg-error/20 backdrop-blur">
                    <Lock className="w-4 h-4 text-error" />
                  </div>
                </div>
              )}
              <div className="absolute -right-6 -top-6 text-[100px] font-h1-display font-bold opacity-5 text-secondary group-hover:opacity-10 transition-opacity">
                02
              </div>
              <h3 className="text-2xl font-h3-terminal text-secondary mb-2 font-bold relative z-10">
                البنية التحتية
              </h3>
              <p className="text-sm text-on-surface-variant mb-8 flex-1 relative z-10">
                اقتحامات أكثر تعقيداً تشمل الطيران وحركة المرور. كن مستعداً
                لاستنزاف الموارد.
              </p>
              <div className="space-y-2 w-full pt-4 border-t border-outline-variant/20 relative z-10 text-[11px] font-mono">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">عقد الشبكة</span>
                  <span className="text-secondary">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">الميزانية</span>
                  <span className="text-primary">$75,000</span>
                </div>
              </div>
            </button>

            {/* Level 3 Card */}
            <button
              onClick={() => isLevel3Unlocked ? loadLevel(3) : null}
              disabled={!isLevel3Unlocked}
              className={`glass-panel p-6 rounded-xl transition-all text-right group flex flex-col relative overflow-hidden
                ${isLevel3Unlocked 
                  ? 'bg-error/10 border-error/30 hover:bg-error/20 cursor-pointer' 
                  : 'bg-surface-container-low/20 border-outline/10 grayscale opacity-50 cursor-not-allowed'
                }`}
            >
              {!isLevel3Unlocked && (
                <div className="absolute top-3 left-3 z-20">
                  <div className="p-1.5 rounded-full bg-error/20 backdrop-blur">
                    <Lock className="w-4 h-4 text-error" />
                  </div>
                </div>
              )}
              <div className="absolute -right-6 -top-6 text-[100px] font-h1-display font-bold opacity-5 text-error group-hover:opacity-10 transition-opacity">
                03
              </div>
              <h3 className="text-2xl font-h3-terminal text-error mb-2 font-bold relative z-10">
                الحالة الحرجة
              </h3>
              <p className="text-sm text-on-surface-variant mb-8 flex-1 relative z-10">
                هجمات شاملة تستهدف القطاعات العسكرية والنووية. أخطاء التخطيط
                تكلفك المدينة بالكامل.
              </p>
              <div className="space-y-2 w-full pt-4 border-t border-error/20 relative z-10 text-[11px] font-mono">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">عقد الشبكة</span>
                  <span className="text-error">25</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">الميزانية</span>
                  <span className="text-primary">$100,000</span>
                </div>
              </div>
            </button>
          </div>
        </main>
      ) : (
        <div className="flex flex-col lg:flex-row h-full w-full pt-16 relative">
          {/* Mobile Overlay */}
          {showMobileSidebar && (
            <div 
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[65] transition-opacity"
              onClick={() => setShowMobileSidebar(false)}
            />
          )}

          <aside className={`
            ${showMobileSidebar ? "flex" : "hidden lg:flex"} 
            fixed lg:static inset-0 z-[70] mt-16 lg:mt-0 
            order-2 lg:order-1 w-full lg:w-96 flex-col 
            h-[calc(100dvh-64px)] lg:h-full 
            bg-surface-container-low border-t lg:border-t-0 lg:border-l border-outline-variant/20 
            overflow-y-auto overscroll-contain
            [-webkit-overflow-scrolling:touch]
          `}>
            {/* Close button for mobile inside sidebar */}
            <div className="lg:hidden absolute top-4 left-4 z-50">
              <button 
                onClick={() => setShowMobileSidebar(false)}
                className="p-2 border border-primary/30 rounded-full text-primary hover:bg-primary/20 backdrop-blur-md"
              >
                <X className="w-5 h-5"/>
              </button>
            </div>
            
            <div className="px-6 py-6 mb-2 mt-4 lg:mt-0">
              <div className="text-primary font-h3-terminal text-[20px] font-medium mb-2 uppercase tracking-widest">
                توجيه العمليات
              </div>
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-[14px] text-primary font-bold">
                  تأمين الشبكة - مستوى {level}
                </p>
                <div className="h-1 bg-surface-variant mt-2 w-full rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${(attacksResolved / targetRequired) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
            <nav className="flex-1 px-4 space-y-2">
              <button className="w-full flex items-center justify-end gap-3 px-4 py-3 bg-primary/10 text-primary border-r-2 border-primary transition-all duration-300">
                <span className="font-body-main font-bold">
                  لوحة التحكم التكتيكية
                </span>
                <Dashboard className="w-5 h-5" />
              </button>

              <div className="flex flex-col gap-4 mt-2 mb-4 px-2">
                {/* Vitals */}
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-label-caps text-[12px] font-bold text-on-surface-variant tracking-[0.15em]">
                      VITAL_STATS
                    </span>
                    <Memory className="text-primary w-4 h-4" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-on-surface-variant">
                          الرصيد التشغيلي
                        </span>
                        <span
                          className={`font-bold ${budget < 20000 ? "text-error" : "text-primary"}`}
                        >
                          ${budget.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1 bg-surface-variant rounded-full overflow-hidden">
                        <div
                          className={`h-full ${budget < 20000 ? "bg-error" : "bg-primary"}`}
                          style={{
                            width: `${Math.min(100, (budget / 100000) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-on-surface-variant">
                          سلامة الجدار الناري
                        </span>
                        <span className="text-secondary">
                          {Math.floor(
                            ((targetRequired - attacksResolved) /
                              targetRequired) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                      <div className="h-1 bg-surface-variant rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary"
                          style={{
                            width: `${((targetRequired - attacksResolved) / targetRequired) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected Sector */}
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20 flex-1">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-label-caps text-[12px] font-bold text-on-surface-variant tracking-[0.15em]">
                      SECTOR_DETAILS
                    </span>
                    <Groups className="text-primary w-4 h-4" />
                  </div>
                  <div className="space-y-4 text-right">
                    <h3 className="font-h3-terminal text-lg text-primary">
                      {activeSector.name}
                    </h3>
                    <p className="text-[12px] text-on-surface-variant leading-relaxed">
                      {activeSector.description}
                    </p>
                    <div className="flex justify-between pt-4 border-t border-outline-variant/20 italic font-mono text-[11px]">
                      <span
                        className={
                          activeSector.status === "critical"
                            ? "text-error animate-pulse"
                            : "text-primary"
                        }
                      >
                        {activeSector.status === "safe"
                          ? "[SECURE]"
                          : "[CRITICAL_FAILURE]"}
                      </span>
                      <span className="text-on-surface-variant">
                        {activeSector.id}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowThreatIntel(!showThreatIntel)}
                className={`w-full flex items-center justify-end gap-3 px-4 py-3 transition-all duration-300 ${showThreatIntel ? "bg-error/10 text-error border-r-2 border-error" : "bg-surface hover:bg-surface-variant text-on-surface"}`}
              >
                <span className="font-body-main font-bold">
                  حالة الشبكة (Threat Intel)
                </span>
                <ShieldAlert className="w-5 h-5" />
              </button>
              {showThreatIntel && (
                <div className="bg-surface-container-lowest p-4 rounded-xl shrink-0 border border-outline-variant/20">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-label-caps text-[12px] font-bold text-on-surface-variant tracking-[0.15em]">
                      THREAT_INTEL
                    </span>
                    <span
                      className={`flex items-center gap-1 text-[10px] font-bold ${currentAttack ? "text-error animate-pulse" : "text-primary"}`}
                    >
                      <ShieldAlert className="w-3 h-3" />{" "}
                      {currentAttack ? "هجوم نشط" : "نظام مستقر"}
                    </span>
                  </div>
                  <h3 className="font-h3-terminal text-[20px] text-primary mb-2">
                    حالة الشبكة
                  </h3>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 w-full ${i < level * 2 ? (currentAttack ? "bg-error animate-pulse" : "bg-primary") : "bg-surface-variant"}`}
                      ></div>
                    ))}
                  </div>
                  <p className="text-[14px] text-on-surface-variant">
                    {currentAttack
                      ? `تم رصد خرق أمني في القطاع [${currentAttack.sectorId.toUpperCase()}]. التكتيك المتبع خطير.`
                      : "جميع قنوات الاتصال والشبكات الفرعية تعمل بكفاءة تامة."}
                  </p>
                </div>
              )}

              <button
                onClick={() => setShowTerminal(!showTerminal)}
                className={`w-full flex items-center justify-end gap-3 px-4 py-3 transition-all duration-300 ${showTerminal ? "bg-secondary/10 text-secondary border-r-2 border-secondary" : "bg-surface hover:bg-surface-variant text-on-surface"}`}
              >
                <span className="font-body-main font-bold">
                  التيرمينال (Terminal)
                </span>
                <TerminalIcon className="w-5 h-5" />
              </button>
              {showTerminal && (
                <div className="bg-surface-container-lowest rounded-xl flex flex-col overflow-hidden min-h-[200px] sm:min-h-[300px] max-h-[40vh] lg:max-h-none border border-outline-variant/20">
                  <div className="flex justify-between items-center p-4 border-b border-outline-variant/20 shrink-0">
                    <span className="font-label-caps text-[12px] font-bold tracking-[0.15em] text-on-surface-variant">
                      TRAFFIC_FEED & OVERRIDE
                    </span>
                    <LeakAdd className="text-primary w-4 h-4" />
                  </div>
                  <div
                    className="flex-1 overflow-y-auto p-4 custom-scrollbar text-[12px] font-mono leading-relaxed space-y-2 opacity-90"
                    dir="ltr"
                  >
                    {terminalHistory.map((log, idx) => (
                      <div
                        key={idx}
                        className={`break-words ${
                          log.type === "error"
                            ? "text-error"
                            : log.type === "warning"
                              ? "text-secondary"
                              : log.type === "success"
                                ? "text-primary"
                                : log.type === "system"
                                  ? "text-on-surface-variant"
                                  : log.type === "input"
                                    ? "text-on-surface font-bold"
                                    : "text-on-surface-variant"
                        }`}
                      >
                        {log.type === "input" ? (
                          <span className="text-secondary mr-2">
                            {operativeName}@SYS:~#
                          </span>
                        ) : null}
                        <span dir="auto">{log.text}</span>
                      </div>
                    ))}
                    <div ref={terminalEndRef} className="h-4" />
                  </div>

                  {!gameOver && !levelWon && !gameWon ? (
                    <form
                      onSubmit={handleTerminalSubmit}
                      className="flex items-center gap-2 p-3 bg-surface-container border-t border-outline-variant/20 shrink-0"
                      dir="ltr"
                    >
                      <span className="text-primary font-bold text-[12px]">
                        {operativeName}@SYS:~#
                      </span>
                      <input
                        ref={inputRef}
                        type="text"
                        value={terminalInput}
                        onChange={(e) => setTerminalInput(e.target.value)}
                        disabled={isTerminalBusy}
                        placeholder="ID"
                        className="flex-1 bg-transparent border-none outline-none text-on-surface disabled:opacity-50 min-w-0 text-[12px] font-mono"
                        autoComplete="off"
                        spellCheck="false"
                      />
                    </form>
                  ) : null}
                </div>
              )}

              {/* ===== Honeypot Section ===== */}
              <button
                onClick={() => setShowHoneypotPanel(!showHoneypotPanel)}
                className={`w-full flex items-center justify-end gap-3 px-4 py-3 transition-all duration-300 ${showHoneypotPanel ? "bg-blue-500/10 text-blue-400 border-r-2 border-blue-400" : "bg-surface hover:bg-surface-variant text-on-surface"}`}
              >
                <span className="font-body-main font-bold flex items-center gap-2">
                  🍯 فخاخ Honeypot
                  {honeypots.some(hp => hp.isTriggered) && (
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block"></span>
                  )}
                </span>
                <Bug className="w-5 h-5" />
              </button>
              {showHoneypotPanel && (
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-label-caps text-[12px] font-bold text-on-surface-variant tracking-[0.15em]">
                      HONEYPOT_SYS
                    </span>
                    <span className="text-[10px] font-bold text-blue-400">
                      {honeypots.length}/{MAX_HONEYPOTS}
                    </span>
                  </div>

                  {/* Honeypot list */}
                  {honeypots.length === 0 ? (
                    <p className="text-[12px] text-on-surface-variant text-center py-2 opacity-60">
                      لا توجد فخاخ منصوبة بعد
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {honeypots.map(hp => (
                        <button
                          key={hp.id}
                          onClick={() => setSelectedHoneypot(selectedHoneypot === hp.id ? null : hp.id)}
                          className={`w-full p-3 rounded-lg border text-right text-[12px] font-mono transition-all ${
                            hp.isTriggered 
                              ? "border-green-400/50 bg-green-400/10 text-green-400" 
                              : "border-blue-400/30 bg-blue-400/5 text-blue-400"
                          } ${selectedHoneypot === hp.id ? "ring-1 ring-blue-400/50" : ""}`}
                        >
                          <div className="flex justify-between items-center">
                            <span className={`w-2 h-2 rounded-full ${hp.isTriggered ? "bg-green-400 animate-pulse" : "bg-blue-400"}`}></span>
                            <span className="font-bold">{hp.name}</span>
                          </div>
                          <div className="flex justify-between mt-1 text-[10px] opacity-70">
                            <span>{hp.accessLogs.length} سجل</span>
                            <span>{hp.isTriggered ? "🟢 تم الرصد" : "🔵 نشط"}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Selected Honeypot Logs */}
                  {selectedHoneypot && (() => {
                    const hp = honeypots.find(h => h.id === selectedHoneypot);
                    if (!hp) return null;
                    return (
                      <div className="border border-blue-400/30 rounded-lg overflow-hidden">
                        <div className="bg-blue-400/10 px-3 py-2 flex justify-between items-center">
                          <button
                            onClick={() => {
                              blockAllIPs();
                            }}
                            disabled={hp.accessLogs.length === 0 || hp.accessLogs.every(l => l.isBlocked)}
                            className="text-[10px] font-bold px-2 py-1 rounded bg-error/20 text-error hover:bg-error/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            <Ban className="w-3 h-3" />
                            حظر الكل
                          </button>
                          <span className="font-label-caps text-[10px] font-bold text-blue-400 tracking-widest">
                            ACCESS_LOGS
                          </span>
                        </div>
                        {hp.accessLogs.length === 0 ? (
                          <p className="text-[11px] text-on-surface-variant text-center py-4 opacity-50">
                            لا توجد سجلات وصول بعد
                          </p>
                        ) : (
                          <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                            {hp.accessLogs.map((log, idx) => (
                              <div
                                key={idx}
                                className={`px-3 py-2 border-b border-outline-variant/10 text-[11px] font-mono flex items-center justify-between gap-2 ${
                                  log.isBlocked ? "opacity-40 line-through" : ""
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {!log.isBlocked ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        blockIP(log.ip);
                                      }}
                                      className="text-error hover:bg-error/20 p-1 rounded transition-all"
                                      title="حظر هذا IP"
                                    >
                                      <Ban className="w-3 h-3" />
                                    </button>
                                  ) : (
                                    <span className="text-on-surface-variant p-1">🚫</span>
                                  )}
                                  <span className={log.isBlocked ? "text-on-surface-variant" : "text-error"} dir="ltr">
                                    {log.ip}
                                  </span>
                                </div>
                                <div className="text-right flex-1">
                                  <span className="text-on-surface-variant">{log.hackerName}</span>
                                  <span className="text-on-surface-variant/50 mr-2 text-[9px]">{log.action}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Blocked IPs count */}
                  {blockedIPs.length > 0 && (
                    <div className="flex items-center justify-between p-2 bg-error/10 rounded-lg border border-error/20">
                      <span className="text-[10px] font-bold text-error">
                        {blockedIPs.length} IP محظور
                      </span>
                      <Ban className="w-3 h-3 text-error" />
                    </div>
                  )}

                  {/* Create Honeypot button */}
                  {honeypots.length < MAX_HONEYPOTS && (
                    <button
                      onClick={() => setShowCreateHoneypot(!showCreateHoneypot)}
                      className="w-full py-2 border border-dashed border-blue-400/40 text-blue-400 text-[12px] font-bold rounded-lg hover:bg-blue-400/10 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      إنشاء Honeypot (-${HONEYPOT_COST.toLocaleString()})
                    </button>
                  )}

                  {/* Create Honeypot Form */}
                  {showCreateHoneypot && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const fd = new FormData(e.currentTarget);
                        const name = fd.get("hp_name") as string;
                        const type = fd.get("hp_type") as 'web_server' | 'database' | 'email';
                        const sectorId = activeSectorId;
                        if (createHoneypot(name, sectorId, type)) {
                          setShowCreateHoneypot(false);
                          e.currentTarget.reset();
                        }
                      }}
                      className="space-y-3 p-3 bg-blue-400/5 border border-blue-400/20 rounded-lg"
                    >
                      <div>
                        <label className="block text-[10px] font-mono text-blue-400 mb-1">HONEYPOT_NAME</label>
                        <input
                          name="hp_name"
                          required
                          className="w-full bg-surface-container-lowest border-b-2 border-blue-400/30 focus:border-blue-400 text-on-surface py-1.5 px-2 outline-none font-mono text-[12px]"
                          placeholder="اسم الفخ..."
                          type="text"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-blue-400 mb-1">HONEYPOT_TYPE</label>
                        <div className="space-y-2">
                          {HONEYPOT_TYPES.map((ht) => (
                            <label key={ht.id} className="flex items-center gap-2 p-2 rounded-lg border border-blue-400/10 hover:bg-blue-400/5 cursor-pointer transition-all">
                              <input
                                type="radio"
                                name="hp_type"
                                value={ht.id}
                                defaultChecked={ht.id === 'web_server'}
                                className="accent-blue-400"
                              />
                              <span className="text-xl">{ht.icon}</span>
                              <div className="flex-1 text-right">
                                <span className="block text-[11px] font-bold text-on-surface">{ht.name}</span>
                                <span className="block text-[9px] text-on-surface-variant">{ht.desc}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="text-[10px] text-on-surface-variant p-2 bg-blue-400/5 rounded border border-blue-400/10">
                        📍 سيتم نشر الفخ بالقرب من: <strong className="text-blue-400">{activeSector.name}</strong>
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 bg-blue-500 text-white font-bold text-[12px] rounded-lg hover:bg-blue-600 transition-all"
                      >
                        🍯 نشر الفخ (-${HONEYPOT_COST.toLocaleString()})
                      </button>
                    </form>
                  )}
                </div>
              )}
            </nav>
            <div className="px-4 pb-6 mt-auto">
              <button
                onClick={() => setGameState("menu")}
                className="w-full py-3 bg-surface-variant text-on-surface font-label-caps text-[12px] font-bold clipped-corner hover:brightness-110 active:scale-95 transition-all text-center"
              >
                التراجع وإنهاء المحاكاة
              </button>
            </div>
          </aside>

          {/* Main Workspace */}
          <main className="order-1 lg:order-2 flex-1 flex flex-col relative z-10 w-full min-h-[50vh] lg:min-h-0 pb-16">
            {/* Center Map as Background */}
            <div className="absolute inset-0 z-0 bg-background mix-blend-screen opacity-20 sm:opacity-50 pointer-events-none"></div>
            <div className="absolute inset-0 z-0 text-left" dir="ltr">
              <CityMap
                sectors={sectors}
                activeSectorId={activeSectorId}
                onSectorClick={(id) => {
                  setActiveSectorId(id);
                  
                  // Check if clicked sector is a honeypot
                  const clickedSector = sectors.find(s => s.id === id);
                  if (clickedSector?.isHoneypot) {
                    setShowHoneypotPanel(true);
                    setSelectedHoneypot(id);
                    setShowMobileSidebar(true);
                    return;
                  }
                  
                  const isCritical = currentAttack?.sectorId === id;
                  setProvinceState({
                    isOpen: true,
                    sectorId: id,
                    role: isCritical ? "defender" : null,
                    isAuthenticated: false,
                    activePuzzleTarget: null,
                  });
                }}
                theme={theme}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/30 sm:from-background via-transparent to-background/20 sm:to-background/50 pointer-events-none"></div>
            </div>

            {/* Overlays / Panels */}
            <div className="relative z-10 flex-1 grid grid-cols-12 gap-6 p-6 h-full overflow-hidden pointer-events-none">
              {/* Right Panel: Threat Intel (Left side of code but visually right due to RTL) */}
              <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 pointer-events-none h-full overflow-hidden">
                {/* Threat Level */}

                {/* Network Traffic / Terminal */}
              </div>

              {/* Center Map spacer */}
              <div className="col-span-12 lg:col-span-4 relative pointer-events-none hidden lg:block"></div>

              {/* Left Panel: Vitals & Action removed and relocated under Tactical Control Panel */}
              <div className="col-span-12 lg:col-span-4 relative pointer-events-none hidden lg:block"></div>
            </div>

            {/* End Game Overlays */}
            {(gameOver || levelWon || gameWon) && (
              <div className="absolute inset-0 bg-surface/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-6 text-center pointer-events-auto">
                {gameOver && (
                  <>
                    <ShieldAlert className="w-16 h-16 text-error mb-4 animate-pulse" />
                    <h2 className="font-h2-header text-[32px] font-bold text-error mb-4">
                      النظام منهار
                    </h2>
                    <p className="text-on-surface-variant mb-8 max-w-sm">
                      نفد الرصيد التشغيلي وتمت السيطرة على العقد الحيوية
                      بالمدينة.
                    </p>
                    <button
                      onClick={() => loadLevel(level)}
                      className="mb-4 w-full max-w-xs py-3 bg-error text-on-error font-label-caps text-[12px] font-bold clipped-corner hover:brightness-110 transition-all"
                    >
                      إعادة تهيئة المستوى
                    </button>
                  </>
                )}
                {levelWon && !gameWon && (
                  <>
                    <Verified className="w-16 h-16 text-primary mb-4" />
                    <h2 className="font-h2-header text-[32px] font-bold text-primary mb-4">
                      تم تأمين القطاع
                    </h2>
                    <p className="text-on-surface-variant mb-8 max-w-sm">
                      تم عزل جميع التهديدات بنجاح. المدينة مستقرة مؤقتاً.
                    </p>
                    <button
                      onClick={() => loadLevel(level + 1)}
                      className="mb-4 w-full max-w-xs py-3 bg-primary text-on-primary font-label-caps text-[12px] font-bold clipped-corner hover:brightness-110 transition-all"
                    >
                      ترقية مستوى الوصول
                    </button>
                  </>
                )}
                {gameWon && (
                  <>
                    <Trophy className="w-16 h-16 text-primary-container mb-4" />
                    <h2 className="font-h2-header text-[32px] font-bold text-primary mb-4">
                      الانتصار الشامل
                    </h2>
                    <p className="text-on-surface-variant mb-8 max-w-sm">
                      أثبتت قدراتك الفائقة. لقد نجت المدينة من الأعطال الكارثية
                      بفضلك.
                    </p>
                  </>
                )}
                <button
                  onClick={() => setGameState("menu")}
                  className="w-full max-w-xs py-3 border border-outline-variant text-on-surface-variant font-label-caps text-[12px] font-bold hover:bg-surface-variant transition-all"
                >
                  القائمة الرئيسية
                </button>
                <button
                  onClick={onBack}
                  className="mt-2 w-full max-w-xs py-3 bg-primary text-on-primary font-label-caps text-[12px] font-bold clipped-corner hover:brightness-110 active:scale-95 transition-all text-center"
                >
                  ↩ العودة للوحة القيادة الرئيسية
                </button>
              </div>
            )}

            {/* Province Hack Interface (Attacker / Defender) */}
            {provinceState.isOpen && (
              <div className="absolute inset-0 bg-surface/95 backdrop-blur-xl z-[150] flex flex-col pointer-events-auto text-right overflow-y-auto">
                <div className="p-4 sm:p-6 md:p-12 w-full max-w-[1440px] mx-auto">
                  {/* Close button */}
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={() =>
                        setProvinceState({
                          isOpen: false,
                          sectorId: null,
                          role: null,
                          isAuthenticated: false,
                        })
                      }
                      className="text-on-surface-variant hover:text-error transition-colors text-3xl font-bold"
                    >
                      &times;
                    </button>
                  </div>

                  {/* Province Header */}
                  <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                      <span className="font-label-caps text-label-caps text-primary mb-1 block tracking-widest">
                        REGION_ID:{" "}
                        {sectors
                          .find((s) => s.id === provinceState.sectorId)
                          ?.id.toUpperCase()}
                      </span>
                      <h2 className="font-h1-display text-primary text-3xl md:text-5xl font-bold">
                        واجهة اختراق المحافظة -{" "}
                        {
                          sectors.find((s) => s.id === provinceState.sectorId)
                            ?.name
                        }
                      </h2>
                    </div>
                    <div className="flex items-center gap-4 glass-panel bg-surface-container-low px-4 py-2 rounded-lg border border-primary/20">
                      <div className="text-left" dir="ltr">
                        <p className="text-[10px] font-label-caps text-on-surface-variant opacity-70">
                          NODE STATUS
                        </p>
                        <p className="text-error font-bold animate-pulse">
                          {sectors.find((s) => s.id === provinceState.sectorId)
                            ?.status === "critical"
                            ? "INTRUSION DETECTED"
                            : "MONITORING"}
                        </p>
                      </div>
                      <div className="w-[1px] h-8 bg-primary/20"></div>
                      <div className="text-left" dir="ltr">
                        <p className="text-[10px] font-label-caps text-on-surface-variant opacity-70">
                          THREAT LEVEL
                        </p>
                        <p className="text-primary font-bold">ALPHA-7</p>
                      </div>
                    </div>
                  </div>

                  {/* Role Selection if not selected */}
                  {!provinceState.role && (
                    <div className="glass-panel p-12 text-center max-w-xl mx-auto border border-primary/30 rounded-xl shadow-2xl bg-surface-container/50">
                      <h3 className="text-2xl font-h3-terminal text-primary mb-6">
                        الوصول لعقدة الشبكة
                      </h3>
                      <p className="text-on-surface-variant mb-8">
                        يرجى تحديد بروتوكول الاتصال
                      </p>
                      <div className="flex flex-col gap-4">
                        <button
                          onClick={() =>
                            setProvinceState((prev) => ({
                              ...prev,
                              role: "attacker",
                            }))
                          }
                          className="py-4 bg-error/10 border border-error text-error hover:bg-error hover:text-on-error transition-all font-bold tracking-widest uppercase font-label-caps"
                        >
                          الدخول كمهاجم (HACKER)
                        </button>
                        <button
                          onClick={() => {
                            const sector = sectors.find((s) => s.id === provinceState.sectorId);
                            const isSectorCompromised = sector && (sector.status === "critical" || sector.status === "warning");
                            const secStatuses =
                              targetStatuses[provinceState.sectorId!] || {};
                            const isBeingAttacked =
                              Object.values(secStatuses).some(
                                (s) => s === "warning" || s === "critical",
                              ) ||
                              currentAttack?.sectorId ===
                                provinceState.sectorId ||
                              isSectorCompromised;
                            if (!isBeingAttacked) {
                              alert(
                                "لا يوجد هجوم حالي ولا ثغرات في هذه المحافظة. الدخول مسموح للمدافع فقط أثناء الهجوم أو عند وجود ثغرات.",
                              );
                              return;
                            }
                            setProvinceState((prev) => ({
                              ...prev,
                              role: "defender",
                            }));
                          }}
                          className={`py-4 border transition-all font-bold tracking-widest uppercase font-label-caps ${
                            Object.values(
                              targetStatuses[provinceState.sectorId!] || {},
                            ).some(
                              (s) => s === "warning" || s === "critical",
                            ) ||
                            currentAttack?.sectorId === provinceState.sectorId ||
                            (sectors.find((s) => s.id === provinceState.sectorId)?.status !== "safe")
                              ? "bg-primary/10 border-primary text-primary hover:bg-primary hover:text-on-primary"
                              : "bg-surface-variant/50 border-outline-variant/30 text-on-surface-variant cursor-not-allowed opacity-70"
                          }`}
                        >
                          الدخول كمدافع (ADMIN)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Authorized View */}
                  {provinceState.role && (
                    <>
                      {provinceState.role === "defender" &&
                      provinceState.isAuthenticated &&
                      currentAttack?.sectorId === provinceState.sectorId ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div className="glass-panel p-6 border border-primary/50 bg-surface-container/90 rounded-lg shadow-2xl overflow-hidden h-fit flex flex-col">
                            <div className="flex items-center gap-2 mb-4">
                              <ShieldAlert className="w-8 h-8 text-primary animate-pulse" />
                              <h3 className="font-h3-terminal text-2xl font-bold text-primary">
                                استجابة للحوادث - {currentAttack.title}
                              </h3>
                            </div>
                            <p className="text-on-surface-variant font-mono text-sm leading-relaxed mb-6">
                              {currentAttack.desc}
                            </p>
                            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg text-primary text-sm font-mono mb-4">
                              <p className="font-bold mb-1">[توجيه التكتيك]</p>
                              <p>أدخل أمر النظام المناسب لتحييد التهديد.</p>
                              <p className="mt-2 text-[11px] opacity-80 border-t border-primary/20 pt-2">
                                (إذا لم تكن متأكداً، يمكنك كتابة أمر{" "}
                                <strong>help</strong> أو <strong>hint</strong>{" "}
                                في التيرمينال للحصول على المساعدة).
                              </p>
                            </div>
                          </div>
                          <div className="glass-panel border border-primary/50 bg-surface-container/90 rounded-lg shadow-2xl overflow-hidden flex flex-col min-h-[400px]">
                            <div className="bg-black/40 border-b border-primary/30 px-4 py-2 flex items-center justify-between">
                              <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-error/80"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                              </div>
                              <span className="font-mono text-[10px] text-primary/70">
                                root@securecity:~
                              </span>
                              <div className="w-10"></div>
                            </div>
                            <div className="p-6 bg-surface-container-lowest flex-1 flex flex-col font-mono text-sm max-h-[500px]">
                              <div
                                className="text-primary/70 mb-4 whitespace-pre-wrap overflow-y-auto"
                                dir="ltr"
                              >
                                {`Welcome to SecureCity Incident Response Subsystem\nInitializing protective counter-measures...\nWaiting for manual override command...\n`}
                                {overrideTerminalOutput.join("\n")}
                              </div>
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  const target = e.currentTarget;
                                  const ans = (
                                    new FormData(target).get("answer") as string
                                  )
                                    .toLowerCase()
                                    .trim();
                                  const expected =
                                    COMMAND_MAPPING[currentAttack.title] ||
                                    "mitigate_threat";

                                  if (ans === "clear") {
                                    setOverrideTerminalOutput([]);
                                    target.reset();
                                    return;
                                  }

                                  if (ans === "hint" || ans === "help") {
                                    if (budget < 1000) {
                                      setOverrideTerminalOutput((prev) => [
                                        ...prev,
                                        `[SYSTEM] ERROR: Insufficient budget for hint ($1,000 required).`,
                                      ]);
                                      target.reset();
                                      return;
                                    }
                                    setBudget((prev) => Math.max(0, prev - 1000));
                                    setOverrideTerminalOutput((prev) => [
                                      ...prev,
                                      `[SYSTEM] TIP (Cost $1,000): The recommended command is: ${expected}`,
                                    ]);
                                    target.reset();
                                    return;
                                  }

                                  if (ans === expected.toLowerCase()) {
                                    const correctOpt =
                                      currentAttack.options.find(
                                        (o) => o.isCorrect,
                                      );
                                    executeDefense(
                                      correctOpt || {
                                        isCorrect: true,
                                        cost: 0,
                                        id: "manual",
                                      },
                                    );
                                    setProvinceState((prev) => ({
                                      ...prev,
                                      isOpen: false,
                                      sectorId: null,
                                      role: null,
                                      isAuthenticated: false,
                                    }));
                                  } else {
                                    setIsShaking(true);
                                    playErrorSound();
                                    setTimeout(() => setIsShaking(false), 500);
                                    setOverrideTerminalOutput((prev) => [
                                      ...prev,
                                      `[ERROR] Invalid mitigation command: ${ans}`,
                                    ]);
                                    target.reset();
                                  }
                                }}
                                className={`mt-auto flex items-center text-primary ${isShaking ? "animate-shake" : ""}`}
                              >
                                <span className="mr-3 opacity-70 select-none">
                                  root@sys:~#
                                </span>
                                <input
                                  name="answer"
                                  required
                                  className="bg-transparent outline-none flex-1 text-primary placeholder-primary/30 font-bold min-w-0"
                                  placeholder="type instruction manually..."
                                  dir="ltr"
                                  type="text"
                                  autoFocus
                                  autoComplete="off"
                                  spellCheck="false"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (budget < 1000) {
                                      alert("رصيدك غير كافٍ للحصول على تلميح ($1,000)!");
                                      return;
                                    }
                                    setBudget((prev) => Math.max(0, prev - 1000));
                                    const expected = COMMAND_MAPPING[currentAttack.title] || "mitigate_threat";
                                    setOverrideTerminalOutput((prev) => [
                                      ...prev,
                                      `[SYSTEM] TIP (Cost $1,000): The recommended command is: ${expected}`,
                                    ]);
                                  }}
                                  className="px-2 py-1 mr-2 rounded bg-primary/20 text-primary hover:bg-primary/30 transition-all text-[11px] font-bold border border-primary/30 whitespace-nowrap"
                                  title="عرض تلميح (-$1,000)"
                                >
                                  💡 تلميح (-$1,000)
                                </button>
                                <button type="submit" className="hidden">
                                  Enter
                                </button>
                              </form>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                          {/* Left Column: Auth & Puzzles */}
                          <div className="lg:col-span-4 space-y-8">
                            {!provinceState.isAuthenticated ? (
                              <section className="glass-panel p-6 relative overflow-hidden border border-primary/30 rounded-lg bg-surface-container/50 shadow-lg">
                                <div className="flex justify-between items-center mb-6">
                                  <h3
                                    className={`font-h3-terminal text-2xl font-bold ${provinceState.role === "attacker" ? "text-error" : "text-primary"}`}
                                  >
                                    توثيق العميل
                                  </h3>
                                  <span className="font-label-caps text-[10px] text-on-surface-variant">
                                    AUTH_001
                                  </span>
                                </div>
                                <form
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    const fd = new FormData(e.currentTarget);
                                    const name = fd.get("name") as string;

                                    if (provinceState.role === "defender") {
                                      const rolePw = fd.get(
                                        "password",
                                      ) as string;
                                      if (rolePw !== "admin") {
                                        alert("كلمة المرور غير صحيحة!");
                                        return;
                                      }
                                      setProvinceState((prev) => ({
                                        ...prev,
                                        isAuthenticated: true,
                                        operativeInfo: {
                                          name,
                                          ip: "Localhost",
                                        },
                                      }));
                                    } else {
                                      const ip = fd.get("ip") as string;
                                      
                                      // Check if IP is blocked
                                      if (blockedIPs.includes(ip)) {
                                        alert("⛔ عنوان IP محظور! لا يمكنك تنفيذ هجمات على هذا القطاع.");
                                        addLog(`[🚫 BLOCKED] محاولة دخول مرفوضة من IP محظور: ${ip}`, "error");
                                        return;
                                      }
                                      
                                      // Trigger any honeypots in this sector
                                      const sectorHoneypots = honeypots.filter(hp => hp.sectorId === provinceState.sectorId);
                                      sectorHoneypots.forEach(hp => {
                                        triggerHoneypot(hp.id, name, ip);
                                      });
                                      
                                      // Also check if clicking on a honeypot sector directly
                                      const clickedSector = sectors.find(s => s.id === provinceState.sectorId);
                                      if (clickedSector?.isHoneypot) {
                                        triggerHoneypot(clickedSector.id, name, ip);
                                      }
                                      
                                      setProvinceState((prev) => ({
                                        ...prev,
                                        isAuthenticated: true,
                                        operativeInfo: { name, ip },
                                      }));
                                    }
                                  }}
                                  className="space-y-6"
                                >
                                  <div>
                                    <label
                                      className={`block font-mono text-[11px] mb-1 ${provinceState.role === "attacker" ? "text-error" : "text-primary"}`}
                                    >
                                      {provinceState.role === "attacker"
                                        ? "HACKER_ALIAS"
                                        : "ADMIN_USERNAME"}
                                    </label>
                                    <input
                                      name="name"
                                      required
                                      className="w-full bg-surface-container-lowest border-b-2 border-primary/30 focus:border-primary focus:ring-0 text-on-surface py-2 px-2 transition-all outline-none font-mono"
                                      placeholder={
                                        provinceState.role === "attacker"
                                          ? "أدخل اسم المخترق..."
                                          : "أدخل اسم المدير..."
                                      }
                                      type="text"
                                    />
                                  </div>

                                  {provinceState.role === "attacker" ? (
                                    <div>
                                      <label className="block font-mono text-[11px] text-error mb-1">
                                        SOURCE_IP_ADDRESS
                                      </label>
                                      <input
                                        name="ip"
                                        defaultValue="192.168.1.42"
                                        required
                                        className="w-full bg-surface-container-lowest border-b-2 border-error/30 focus:border-error focus:ring-0 text-on-surface py-2 px-2 outline-none font-mono"
                                        dir="ltr"
                                        type="text"
                                      />
                                    </div>
                                  ) : (
                                    <div>
                                      <label className="block font-mono text-[11px] text-primary mb-1">
                                        SYSTEM_PASSWORD
                                      </label>
                                      <input
                                        name="password"
                                        required
                                        className="w-full bg-surface-container-lowest border-b-2 border-primary/30 focus:border-primary focus:ring-0 text-on-surface py-2 px-2 outline-none font-mono"
                                        dir="ltr"
                                        type="password"
                                      />
                                    </div>
                                  )}

                                  <button
                                    type="submit"
                                    className={`w-full py-4 font-bold tracking-widest transition-all ${provinceState.role === "attacker" ? "bg-error text-on-error hover:brightness-110" : "bg-primary text-on-primary hover:brightness-110"}`}
                                  >
                                    {provinceState.role === "attacker"
                                      ? "بَدء جلسة الاختراق"
                                      : "تسجيل الدخول"}
                                  </button>
                                </form>
                              </section>
                            ) : (
                              <>
                                {provinceState.activePuzzleTarget ? (
                                  <section
                                    className={`glass-panel border bg-surface-container/90 rounded-lg shadow-2xl transition-transform overflow-hidden ${isShaking ? "animate-shake" : ""} ${provinceState.role === "attacker" ? "border-error/50 p-6" : "border-primary/50"}`}
                                  >
                                    {provinceState.role === "defender" ? (
                                      <>
                                        <div className="bg-black/40 border-b border-primary/30 px-4 py-2 flex items-center justify-between">
                                          <div className="flex gap-2">
                                            <div className="w-3 h-3 rounded-full bg-error/80"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                                          </div>
                                          <span className="font-mono text-[10px] text-primary/70">
                                            root@securecity:~
                                          </span>
                                          <div className="w-10"></div>
                                        </div>
                                        <div className="p-6 bg-surface-container-lowest min-h-[300px] flex flex-col font-mono text-sm">
                                          <div
                                            className="text-primary/70 mb-4 whitespace-pre-wrap"
                                            dir="ltr"
                                          >
                                            {`Welcome to SecureCity Terminal v2.4.1\nAuthenticating user... OK\nEstablishing secure connection... OK\n\n[SYSTEM ALERT]: Vulnerability detected in subsystem.\n`}
                                          </div>
                                          <div
                                            className="text-primary mb-2"
                                            dir="rtl"
                                          >
                                            {provinceState.puzzle?.question}
                                          </div>
                                          {/* زر التلميح للمدافع */}
                                          <div className="mb-4">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                if (budget < 2000) {
                                                  alert("رصيدك غير كافٍ للحصول على تلميح ($2,000)!");
                                                  return;
                                                }
                                                setBudget((prev) => Math.max(0, prev - 2000));
                                                setShowPuzzleHint(true);
                                              }}
                                              className="text-xs text-primary/80 hover:text-primary underline flex items-center gap-1"
                                            >
                                              💡 طلب تلميح سيبراني (-$2,000)
                                            </button>
                                            {showPuzzleHint && provinceState.puzzle?.hint && (
                                              <div className="mt-2 p-2 rounded bg-primary/10 border border-primary/30 text-xs text-primary leading-relaxed">
                                                {provinceState.puzzle.hint}
                                              </div>
                                            )}
                                          </div>

                                          <form
                                            onSubmit={(e) => {
                                              e.preventDefault();
                                              const ans = (
                                                new FormData(
                                                  e.currentTarget,
                                                ).get("answer") as string
                                              )
                                                .toLowerCase()
                                                .trim();
                                              const targetId =
                                                provinceState.activePuzzleTarget!;
                                              const sectorId =
                                                provinceState.sectorId!;

                                              if (
                                                ans.includes(
                                                  provinceState.puzzle?.answer.toLowerCase() ||
                                                    "",
                                                )
                                              ) {
                                                setTargetStatus(
                                                  sectorId,
                                                  targetId,
                                                  "safe",
                                                );
                                                setProvinceState((prev) => ({
                                                  ...prev,
                                                  activePuzzleTarget: null,
                                                }));
                                                setTerminalHistory((prev) => [
                                                  ...prev,
                                                  {
                                                    text: `تأمين: تم إصلاح ${targetId} في ${sectorId} بواسطة ${provinceState.operativeInfo?.name}`,
                                                    type: "success",
                                                  },
                                                ]);
                                              } else {
                                                setIsShaking(true);
                                                playErrorSound();
                                                setTimeout(
                                                  () => setIsShaking(false),
                                                  500,
                                                );
                                              }
                                            }}
                                            className="mt-auto flex items-center text-primary"
                                          >
                                            <span className="mr-3 opacity-70 select-none">
                                              root@sys:~#
                                            </span>
                                            <input
                                              name="answer"
                                              required
                                              className="bg-transparent outline-none flex-1 text-primary placeholder-primary/30 font-bold"
                                              placeholder="type command..."
                                              dir="ltr"
                                              type="text"
                                              autoFocus
                                              autoComplete="off"
                                              spellCheck="false"
                                            />
                                            <button
                                              type="submit"
                                              className="hidden"
                                            >
                                              Enter
                                            </button>
                                          </form>
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <div className="flex items-center gap-2 mb-4">
                                          <span
                                            className={`material-symbols-outlined text-error animate-pulse`}
                                          >
                                            bug_report
                                          </span>
                                          <h3
                                            className={`font-h3-terminal text-2xl font-bold text-error`}
                                          >
                                            فك التشفير النشط
                                          </h3>
                                        </div>
                                        <div
                                          className={`p-4 rounded-lg border mb-4 font-mono text-center bg-error/10 border-error/30`}
                                        >
                                          <p
                                            className="text-on-surface-variant text-sm mb-2"
                                            dir="rtl"
                                          >
                                            {provinceState.puzzle?.question}
                                          </p>
                                        </div>
                                        {/* زر التلميح للمهاجم */}
                                        <div className="mb-6 text-center">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (budget < 2000) {
                                                alert("رصيدك غير كافٍ للحصول على تلميح ($2,000)!");
                                                return;
                                              }
                                              setBudget((prev) => Math.max(0, prev - 2000));
                                              setShowPuzzleHint(true);
                                            }}
                                            className="text-xs text-error/80 hover:text-error underline flex items-center gap-1 mx-auto justify-center"
                                          >
                                            💡 طلب فك تشفير تلميح (-$2,000)
                                          </button>
                                          {showPuzzleHint && provinceState.puzzle?.hint && (
                                            <div className="mt-2 p-2 rounded bg-error/10 border border-error/30 text-xs text-error leading-relaxed text-right">
                                              {provinceState.puzzle.hint}
                                            </div>
                                          )}
                                        </div>
                                        <form
                                          onSubmit={(e) => {
                                            e.preventDefault();
                                            const ans = (
                                              new FormData(e.currentTarget).get(
                                                "answer",
                                              ) as string
                                            )
                                              .toLowerCase()
                                              .trim();
                                            const targetId =
                                              provinceState.activePuzzleTarget!;
                                            const sectorId =
                                              provinceState.sectorId!;

                                            if (
                                              ans ===
                                              provinceState.puzzle?.answer
                                                .toLowerCase()
                                                .trim()
                                            ) {
                                              setTargetStatus(
                                                sectorId,
                                                targetId,
                                                "critical",
                                              );
                                              setProvinceState((prev) => ({
                                                ...prev,
                                                activePuzzleTarget: null,
                                              }));
                                              setTerminalHistory((prev) => [
                                                ...prev,
                                                {
                                                  text: `تنبيه: تم اختراق ${targetId} في ${sectorId} بواسطة ${provinceState.operativeInfo?.name}`,
                                                  type: "error",
                                                },
                                              ]);
                                            } else {
                                              setTargetStatus(
                                                sectorId,
                                                targetId,
                                                "warning",
                                              );
                                              setIsShaking(true);
                                              playErrorSound();
                                              setTimeout(
                                                () => setIsShaking(false),
                                                500,
                                              );
                                              setTerminalHistory((prev) => [
                                                ...prev,
                                                {
                                                  text: `تحذير: محاولة اختراق فاشلة لـ ${targetId} في ${sectorId} بواسطة ${provinceState.operativeInfo?.name}`,
                                                  type: "warning",
                                                },
                                              ]);
                                            }
                                          }}
                                          className="space-y-4"
                                        >
                                          <input
                                            name="answer"
                                            required
                                            className="w-full bg-surface-container-lowest border-b-2 py-2 text-center text-xl font-mono outline-none transition-all text-error border-error/50 focus:border-error"
                                            placeholder="أدخل الحل للثغرة..."
                                            dir="ltr"
                                            type="text"
                                            autoFocus
                                            autoComplete="off"
                                          />
                                          <button
                                            type="submit"
                                            className="w-full flex-1 py-3 font-bold transition-all bg-error text-on-error hover:brightness-110"
                                          >
                                            حقن الكود
                                          </button>
                                        </form>
                                      </>
                                    )}
                                  </section>
                                ) : (
                                  <div className="glass-panel p-6 border border-primary/20 bg-surface-container/30 rounded-lg text-center opacity-70">
                                    <p className="text-on-surface-variant font-mono">
                                      الرجاء تحديد هدف من الشبكة لتنفيذ الإجراء
                                    </p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>

                          {/* Right Column: Infrastructure Grid */}
                          <div className="lg:col-span-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                              {/* Targets Data */}
                              {[
                                {
                                  id: "traffic",
                                  name: "إشارات المرور",
                                  desc: "إدارة إشارات المرور المركزية في المدينة",
                                  level: "MEDIUM",
                                  icon: "🚦",
                                },
                                {
                                  id: "hospital",
                                  name: "مشافي المدينة",
                                  desc: "سجلات المرضى والأجهزة الحيوية بالمستشفى",
                                  level: "HIGH",
                                  icon: "🏥",
                                },
                                {
                                  id: "power",
                                  name: "شبكة الكهرباء",
                                  desc: "التحكم في توزيع الطاقة والمحطات",
                                  level: "CRITICAL",
                                  icon: "⚡",
                                },
                                {
                                  id: "water",
                                  name: "محطة المياه",
                                  desc: "إدارة أنظمة الفلترة والتوزيع المائي",
                                  level: "LOW",
                                  icon: "💧",
                                },
                                {
                                  id: "bank",
                                  name: "القطاع المصرفي والبنوك",
                                  desc: "الحسابات المصرفية والتحويلات المالية",
                                  level: "CRITICAL",
                                  icon: "🏦",
                                },
                                {
                                  id: "company",
                                  name: "الشركات التجارية",
                                  desc: "قواعد بيانات الشركات وأسرار العمل",
                                  level: "HIGH",
                                  icon: "🏢",
                                },
                              ].map((target) => {
                                const status = getTargetStatus(
                                  provinceState.sectorId!,
                                  target.id,
                                );
                                let colorClass =
                                  "text-primary border-primary/30";
                                let bgIcon = "bg-primary/10";
                                let progressBar = "bg-primary";

                                if (status === "critical") {
                                  colorClass =
                                    "text-error border-error/50 ring-1 ring-error/30 shadow-[0_0_10px_rgba(255,0,0,0.2)]";
                                  bgIcon = "bg-error/20";
                                  progressBar = "bg-error";
                                } else if (status === "warning") {
                                  colorClass =
                                    "text-yellow-400 border-yellow-400/50";
                                  bgIcon = "bg-yellow-400/20";
                                  progressBar = "bg-yellow-400";
                                }

                                return (
                                  <div
                                    key={target.id}
                                    className={`glass-panel p-6 relative transition-all rounded-xl border bg-surface-container/40 ${colorClass}`}
                                  >
                                    <div className="flex items-start justify-between mb-8">
                                      <div
                                        className={`p-3 rounded-lg text-3xl ${bgIcon}`}
                                      >
                                        {target.icon}
                                      </div>
                                      <div
                                        className="text-left font-mono"
                                        dir="ltr"
                                      >
                                        <span className="block text-[10px] text-on-surface-variant">
                                          SEC_LVL
                                        </span>
                                        <span className="font-bold">
                                          {target.level}
                                        </span>
                                      </div>
                                    </div>
                                    <h4 className="font-h3-terminal text-xl font-bold mb-1">
                                      {target.name}
                                    </h4>
                                    <p className="text-sm text-on-surface-variant mb-6">
                                      {target.desc}
                                    </p>

                                    <div className="space-y-3 font-mono">
                                      <div className="flex justify-between text-[10px]">
                                        <span className="text-on-surface-variant">
                                          STATUS
                                        </span>
                                        <span className="font-bold">
                                          {status.toUpperCase()}
                                        </span>
                                      </div>
                                      <div className="h-2 w-full bg-surface-container-lowest flex gap-1">
                                        <div
                                          className={`h-full w-1/4 ${status !== "safe" ? progressBar : "bg-surface-variant"}`}
                                        ></div>
                                        <div
                                          className={`h-full w-1/4 ${status === "warning" || status === "critical" ? progressBar : "bg-surface-variant"}`}
                                        ></div>
                                        <div
                                          className={`h-full w-1/4 ${status === "critical" ? progressBar : "bg-surface-variant"}`}
                                        ></div>
                                        <div
                                          className={`h-full w-1/4 ${status === "critical" ? progressBar : "bg-surface-variant"}`}
                                        ></div>
                                      </div>

                                      {provinceState.isAuthenticated && (
                                        <button
                                          onClick={() => {
                                            if (
                                              provinceState.role === "attacker"
                                            ) {
                                              if (status === "critical") {
                                                alert(
                                                  "تم اختراق هذا الهدف مسبقاً.",
                                                );
                                                return;
                                              }
                                              const puz =
                                                CRYPTO_PUZZLES[
                                                  Math.floor(
                                                    Math.random() *
                                                      CRYPTO_PUZZLES.length,
                                                  )
                                                ];
                                              setProvinceState((prev) => ({
                                                ...prev,
                                                activePuzzleTarget: target.id,
                                                puzzleType: "crypto",
                                                puzzle: {
                                                  question: puz.question,
                                                  answer: puz.answer,
                                                  hint: puz.hint || "",
                                                },
                                              }));
                                              setShowPuzzleHint(false);
                                            } else {
                                              // defender
                                              if (status === "safe") {
                                                alert(
                                                  "هذا الهدف آمن، لا توجد ثغرة لإصلاحها.",
                                                );
                                                return;
                                              }
                                              const puz =
                                                DEFENDER_PUZZLES[
                                                  Math.floor(
                                                    Math.random() *
                                                      DEFENDER_PUZZLES.length,
                                                  )
                                                ];
                                              setProvinceState((prev) => ({
                                                ...prev,
                                                activePuzzleTarget: target.id,
                                                puzzleType: "linux",
                                                puzzle: {
                                                  question: puz.question,
                                                  answer: puz.answer,
                                                  hint: puz.hint || "",
                                                },
                                              }));
                                              setShowPuzzleHint(false);
                                            }
                                          }}
                                          className={`w-full mt-4 py-2 border font-bold transition-colors ${
                                            provinceState.role === "attacker"
                                              ? "border-error/50 text-error hover:bg-error/10"
                                              : "border-primary/50 text-primary hover:bg-primary/10"
                                          }`}
                                        >
                                          {provinceState.role === "attacker"
                                            ? "نشر الهجوم"
                                            : "إصلاح الثغرة"}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="mt-8 flex justify-end">
                              <button
                                onClick={() =>
                                  setProvinceState({
                                    isOpen: false,
                                    sectorId: null,
                                    role: null,
                                    isAuthenticated: false,
                                  })
                                }
                                className={`px-8 py-3 font-bold tracking-widest text-lg transition-all rounded ${
                                  provinceState.role === "attacker"
                                    ? "bg-error text-on-error hover:brightness-110 shadow-[0_0_15px_rgba(255,0,0,0.4)]"
                                    : "bg-primary text-on-primary hover:brightness-110 shadow-[0_0_15px_rgba(95,251,214,0.4)]"
                                }`}
                              >
                                {provinceState.role === "attacker"
                                  ? "الانتهاء من الاختراق والخروج"
                                  : "إنهاء وإغلاق اللوحة"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {!provinceState.isOpen && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-[55] pointer-events-auto">
                <button
                  onClick={onBack}
                  className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
                >
                  <ArrowRight className="w-5 h-5" />
                  العودة للوحة القيادة
                </button>
              </div>
            )}

            {/* Footer HUD Bar */}
            <footer className="h-10 border-t border-outline-variant/20 bg-surface-container-lowest/80 flex items-center px-6 gap-8 text-[11px] font-mono text-on-surface-variant z-[60] absolute bottom-0 w-full backdrop-blur-md">
              <div className="flex items-center gap-2 border-l border-outline-variant/20 pl-6 h-full">
                <span
                  className={`w-2 h-2 rounded-full ${currentAttack ? "bg-error animate-pulse" : "bg-primary animate-pulse"}`}
                ></span>
                <span>{currentAttack ? "SYS_CRITICAL" : "SYSTEM_OK"}</span>
              </div>
              <div className="flex items-center gap-2 border-l border-outline-variant/20 pl-6 h-full hidden sm:flex">
                <Public className="w-3 h-3" />
                <span>IP: 213.144.128.0/19</span>
              </div>
              <div className="flex items-center gap-2 hidden md:flex">
                <Schedule className="w-3 h-3" />
                <span>UTC+3:00 SYR</span>
              </div>
              <div className="mr-auto font-label-caps text-primary tracking-widest font-bold">
                SECURE_CITY_ALPHA_V.0.9.2
              </div>
            </footer>
          </main>
        </div>
      )}
    </div>
  );
};
