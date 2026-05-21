// ============================================================================
// sshGameData.ts — بيانات محاكاة لعبة اختراق SSH
// ============================================================================

/** Generate a random private IPv4 address for the target server */
export function generateTargetIP(): string {
  const octet3 = Math.floor(Math.random() * 256);
  const octet4 = Math.floor(Math.random() * 254) + 1; // avoid .0 and .255
  return `192.168.${octet3}.${octet4}`;
}

/** The correct SSH password */
export const CORRECT_PASSWORD = 'root';

/** Maximum failed password attempts before fail2ban kicks in */
export const MAX_ATTEMPTS = 3;

// ---------------------------------------------------------------------------
// Welcome banner shown after successful login
// ---------------------------------------------------------------------------
export function getWelcomeBanner(targetIP: string): string {
  const now = new Date();
  const lastLogin = new Date(now.getTime() - 3600000 * 6);
  const fmt = (d: Date) =>
    d.toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    });

  return [
    `Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-91-generic x86_64)`,
    ``,
    ` * Documentation:  https://help.ubuntu.com`,
    ` * Management:     https://landscape.canonical.com`,
    ` * Support:        https://ubuntu.com/advantage`,
    ``,
    `  System information as of ${fmt(now)}`,
    ``,
    `  System load:  0.42              Processes:             187`,
    `  Usage of /:   34.2% of 49.05GB  Users logged in:       0`,
    `  Memory usage: 62%               IPv4 address for eth0: ${targetIP}`,
    `  Swap usage:   3%`,
    ``,
    `Last login: ${fmt(lastLogin)} from 10.0.0.${Math.floor(Math.random() * 254) + 1}`,
  ].join('\n');
}

// ---------------------------------------------------------------------------
// SSH usage help (shown when user types `ssh` without args)
// ---------------------------------------------------------------------------
export const SSH_USAGE = `usage: ssh [-46AaCfGgKkMNnqsTtVvXxYy] [-B bind_interface]
           [-b bind_address] [-c cipher_spec] [-D [bind_address:]port]
           [-E log_file] [-e escape_char] [-F configfile] [-I pkcs11]
           [-i identity_file] [-J [user@]host[:port]] [-L address]
           [-l login_name] [-m mac_spec] [-O ctl_cmd] [-o option]
           [-p port] [-Q query_option] [-R address] [-S ctl_path]
           [-W host:port] [-w local_tun[:remote_tun]] destination
           [command [argument ...]]`;

// ---------------------------------------------------------------------------
// Post-login command outputs
// ---------------------------------------------------------------------------

/** Simulated file listing */
export const LS_OUTPUT = `secret.txt  passwords.db  .bash_history  network_config  logs/`;

/** Simulated secret.txt content */
export const SECRET_TXT = `╔══════════════════════════════════════════════╗
║                                              ║
║   FLAG{congratulations_you_hacked_the_server} ║
║                                              ║
║   🎉 Mission Complete — Flag Captured!       ║
║                                              ║
╚══════════════════════════════════════════════╝`;

/** Simulated passwords.db content */
export const PASSWORDS_DB = `+----------+----------------------------------+--------+
| username | password_hash                    | role   |
+----------+----------------------------------+--------+
| admin    | 5f4dcc3b5aa765d61d8327deb882cf99 | root   |
| john     | e99a18c428cb38d5f260853678922e03 | user   |
| sarah    | d8578edf8458ce06fbc5bb76a58c5ca4 | user   |
| backup   | 098f6bcd4621d373cade4e832627b4f6 | backup |
| deploy   | 25d55ad283aa400af464c76d713c07ad | deploy |
+----------+----------------------------------+--------+
5 rows in set (0.00 sec)`;

/** Simulated .bash_history */
export const BASH_HISTORY = `wget https://raw.githubusercontent.com/rapid7/metasploit-framework/master/exploits/linux/local/dirty_cow.c
gcc -o exploit dirty_cow.c -lpthread
chmod +x exploit
nmap -sV -sC 10.0.0.0/24
ssh-keygen -t rsa -b 4096
cat /etc/shadow
iptables -L -n
curl -s ifconfig.me
python3 -m http.server 8080
nc -lvnp 4444`;

/** Simulated network config */
export function getNetworkConfig(targetIP: string): string {
  const mac = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0'),
  ).join(':');

  return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether ${mac} brd ff:ff:ff:ff:ff:ff
    inet ${targetIP}/24 brd ${targetIP.replace(/\.\d+$/, '.255')} scope global dynamic eth0
       valid_lft 85412sec preferred_lft 85412sec`;
}

/** Simulated uname -a */
export const UNAME_OUTPUT = `Linux target 5.15.0-91-generic #101-Ubuntu SMP Tue Nov 14 13:30:08 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux`;

/** Simulated auth log entries */
export function getAuthLog(playerIP: string): string {
  const now = new Date();
  const lines: string[] = [];
  for (let i = 3; i >= 1; i--) {
    const t = new Date(now.getTime() - i * 30000);
    const ts = t.toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    lines.push(`${ts} target sshd[${2840 + i}]: Failed password for root from ${playerIP} port ${50000 + Math.floor(Math.random() * 10000)} ssh2`);
  }
  const successTS = now.toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  lines.push(`${successTS} target sshd[2844]: Accepted password for root from ${playerIP} port 52341 ssh2`);
  return lines.join('\n');
}

/** Simulated syslog */
export const SYSLOG_OUTPUT = `May 21 14:22:01 target CRON[1842]: (root) CMD (/usr/lib/php/sessionclean)
May 21 14:30:00 target systemd[1]: Starting Daily apt download activities...
May 21 14:30:00 target systemd[1]: Started Daily apt download activities.
May 21 14:35:12 target kernel: [42156.789012] eth0: link up, 1000 Mbps
May 21 14:40:33 target sshd[2840]: Server listening on 0.0.0.0 port 22.`;

/** Simulated access log */
export const ACCESS_LOG_OUTPUT = `10.0.0.15 - - [21/May/2026:14:22:01 +0000] "GET /admin HTTP/1.1" 403 287
10.0.0.15 - - [21/May/2026:14:22:05 +0000] "POST /login HTTP/1.1" 200 534
10.0.0.22 - - [21/May/2026:14:25:11 +0000] "GET /api/users HTTP/1.1" 401 189
10.0.0.22 - - [21/May/2026:14:25:14 +0000] "GET /api/config HTTP/1.1" 403 287`;

// ---------------------------------------------------------------------------
// Logs directory listing
// ---------------------------------------------------------------------------
export const LOGS_LS = `auth.log  syslog  access.log`;

// ---------------------------------------------------------------------------
// Scoring system
// ---------------------------------------------------------------------------
export const SCORE_MAP = {
  SSH_FIRST_TRY: 300,
  PASSWORD_FIRST_TRY: 200,
  FLAG_FOUND: 500,
  EXPLORE_BONUS: 100,       // 3+ commands after login
  UNBAN_SUCCESS: 150,
  PASSWORD_FAIL_PENALTY: -50,
} as const;

// ---------------------------------------------------------------------------
// Mission briefing text
// ---------------------------------------------------------------------------
export const MISSION_BRIEFING = {
  title: 'إحاطة عملياتية سرية',
  subtitle: 'CLASSIFIED OPERATIONAL BRIEFING',
  objective: 'اخترق الخادم المستهدف عبر بروتوكول SSH واستخرج العلم (FLAG) من ملفاته السرية.',
  details: [
    'المهمة تتطلب الاتصال بالخادم عبر SSH باستخدام بيانات الدخول الصحيحة.',
    'بعد تسجيل الدخول، استكشف نظام الملفات وابحث عن العلم المخفي.',
    'احذر: نظام fail2ban يراقب محاولاتك — 3 محاولات فاشلة = حظر فوري.',
  ],
  warning: 'تنبيه: جميع أنشطتك مُسجَّلة في ملفات auth.log',
};
