import React, { useState } from "react";
import { GlobalHeader } from "./GlobalHeader";
import {
  ShieldAlert,
  Trophy,
  Target,
  FileText,
  Activity,
  Key,
  BookOpen,
  Sun,
  Moon,
  Bell as Notifications,
  Settings,
  User,
  Lock,
  Mail,
  HelpCircle,
  X,
  Shield,
  LogOut,
  Terminal as TerminalLucide,
} from "lucide-react";
import { updateProfile, getCurrentUser, saveUserLocally } from "../services/backendApi";

interface DashboardViewProps {
  studentName: string;
  studentLevel: string;
  avatarSeed?: string;
  onAvatarSelect?: (seed: string) => void;
  onSelectGame: (
    game:
      | "city"
      | "millionaire"
      | "flashcards"
      | "assessment"
      | "crypto"
      | "courses"
      | "admin"
      | "ssh",
    tutorial?: boolean,
  ) => void;
  userId?: number;
  userRole?: string;
  onLogout?: () => void;
}

export const AVATAR_SEEDS = [
  "Aneka",
  "Mia",
  "Sofia",
  "Lily",
  "Lola",
  "Kiki",
  "Zoe",
  "Felix",
  "Jasper",
  "Ryan",
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  studentName,
  studentLevel,
  avatarSeed = "Aneka",
  onAvatarSelect,
  onSelectGame,
  userId,
  userRole,
  onLogout,
}) => {
  const [theme, setTheme] = useState<"light" | "dark">(
    document.documentElement.classList.contains("dark") ? "dark" : "light",
  );
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettingsProfile, setShowSettingsProfile] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState<"name" | "password" | "email" | null>(null);
  const [accountValue, setAccountValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  React.useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const textClass = theme === "dark" ? "text-[#d9e2ff]" : "text-on-background";

  const motivationalQuotes = [
    "حان وقت حماية النظام، هل أنت مستعد للتحدي اليوم؟",
    "المدينة الآمنة بانتظارك، لا تدع المخترقين يفوزون بمحاولاتهم!",
    "تدريبك اليومي يجعلك أقوى، استكمل دوراتك لتصل للاحتراف.",
    "راجع أهدافك في الخطة الدراسية الذكية وانطلق!",
  ];

  return (
    <div className="w-full h-full bg-background text-on-background flex flex-col items-center p-4 sm:p-8 overflow-y-auto transition-colors duration-500 relative">
      <div
        className="absolute inset-0 z-0 opacity-10 pointer-events-none mix-blend-luminosity fixed"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2000&auto=format&fit=crop")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="w-full max-w-6xl z-[60] md:z-20 flex justify-between md:justify-end items-center mb-8 bg-surface/90 md:bg-surface backdrop-blur-lg md:backdrop-blur-none border border-outline-variant/30 rounded-full md:rounded-2xl p-2 md:p-4 shadow-xl md:shadow-sm fixed top-6 left-4 right-4 md:relative md:w-full md:max-w-6xl gap-2 md:gap-4 transition-all duration-300">
        <div className="flex items-center gap-1 md:gap-4 w-full md:w-auto justify-around md:justify-end relative">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="transition-all duration-300 active:scale-95 p-3 md:p-2 rounded-full text-on-surface hover:bg-primary/10 border border-transparent hover:border-primary/20 flex flex-col md:flex-row items-center gap-1"
            title="تبديل الإضاءة"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-primary" />
            ) : (
              <Moon className="w-5 h-5 text-primary" />
            )}
            <span className="text-[9px] font-bold md:hidden uppercase opacity-60">الوضعية</span>
          </button>

          <div className="static">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowSettingsProfile(false);
                setShowHelp(false);
              }}
              className={`text-primary active:scale-95 p-3 md:p-2 rounded-full transition-all border border-transparent flex flex-col md:flex-row items-center gap-1 ${showNotifications ? 'bg-primary/20 border-primary/30' : 'hover:bg-primary/10 hover:border-primary/20'}`}
            >
              <div className="relative">
                <Notifications className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full animate-pulse shadow-[0_0_8px_rgba(255,0,0,0.8)]"></span>
              </div>
              <span className="text-[9px] font-bold md:hidden uppercase opacity-60">التنبيهات</span>
            </button>
          </div>

          <div className="static">
            <button
              onClick={() => {
                setShowSettingsProfile(!showSettingsProfile);
                setShowAvatarPicker(false);
                setShowNotifications(false);
                setShowHelp(false);
              }}
              title="الإعدادات الشخصية"
              className={`flex flex-col md:flex-row items-center gap-1 p-3 md:p-2 rounded-full transition-all border border-transparent active:scale-95 ${showSettingsProfile ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-primary hover:bg-primary/10 hover:border-primary/20'}`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-[9px] font-bold md:hidden uppercase opacity-60">الاعدادات</span>
            </button>
          </div>

          <div className="static">
            <button
              onClick={() => {
                setShowHelp(!showHelp);
                setShowNotifications(false);
                setShowSettingsProfile(false);
              }}
              title="كيفية اللعب"
              className={`flex flex-col md:flex-row items-center gap-1 p-3 md:p-2 rounded-full transition-all border border-transparent active:scale-95 ${showHelp ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-primary hover:bg-primary/10 hover:border-primary/20'}`}
            >
              <HelpCircle className="w-5 h-5" />
              <span className="text-[9px] font-bold md:hidden uppercase opacity-60">كيفية اللعب</span>
            </button>
          </div>
        </div>

        {/* Global Overlays (Backdrop) */}
        {(showNotifications || showSettingsProfile || showHelp) && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[65] md:hidden animate-in fade-in"
            onClick={() => {
              setShowNotifications(false);
              setShowSettingsProfile(false);
              setShowHelp(false);
            }}
          />
        )}

        {showNotifications && (
          <div className="absolute top-full right-4 left-4 md:left-auto md:right-0 mt-3 md:w-80 bg-surface/95 backdrop-blur-md border border-outline-variant/30 rounded-2xl shadow-2xl p-5 z-[70] animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-center mb-4 border-b border-primary/20 pb-2">
              <button onClick={() => setShowNotifications(false)} className="text-primary/50 hover:text-primary transition-colors hover:bg-primary/10 p-1 rounded-full"><X className="w-4 h-4"/></button>
              <h4 className="font-bold text-[14px] text-primary text-right">
                الإشعارات اليومية
              </h4>
            </div>
            <div className="space-y-3 text-right">
              {motivationalQuotes.map((quote, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-primary/5 border border-primary/10 rounded-lg text-xs text-on-surface font-medium leading-relaxed"
                >
                  {quote}
                </div>
              ))}
            </div>
          </div>
        )}

        {showSettingsProfile && (
          <div className="absolute top-full right-4 left-4 md:left-auto md:right-0 mt-3 md:w-80 bg-surface/95 backdrop-blur-md border border-outline-variant/30 rounded-2xl shadow-2xl p-5 z-[70] text-right animate-in fade-in slide-in-from-top-2 max-h-[75vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-4 border-b border-outline-variant/20 pb-2">
              <button onClick={() => setShowSettingsProfile(false)} className="text-primary/50 hover:text-primary transition-colors hover:bg-primary/10 p-1 rounded-full"><X className="w-4 h-4"/></button>
              <h4 className="font-bold text-[14px] text-primary">الإعدادات والملف الشخصي</h4>
            </div>
            
            <div className="flex flex-col items-center mb-6 border-b border-outline-variant/20 pb-4">
              <div
                className="w-20 h-20 rounded-full bg-surface-variant border-2 border-primary/30 overflow-hidden cursor-pointer hover:border-primary/60 transition-all hover:scale-105 mb-3 group relative shadow-md"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                title="تغيير الشخصية"
              >
                <img
                  src={`https://api.dicebear.com/7.x/micah/svg?seed=${avatarSeed}&backgroundColor=transparent`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <User className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg text-primary leading-none mb-1">
                  {studentName}
                </p>
                <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold bg-primary/10 px-2 py-0.5 rounded-full inline-block">
                  المستوى: {studentLevel}
                </p>
              </div>
            </div>

            {showAvatarPicker && onAvatarSelect && (
              <div className="mb-6 p-4 bg-surface-variant/50 rounded-xl border border-outline-variant/30 animate-in zoom-in-95">
                <h5 className="font-bold text-xs text-primary mb-3 text-center">
                  اختر شخصيتك المفضلة
                </h5>
                <div className="grid grid-cols-5 gap-2">
                  {AVATAR_SEEDS.map((seed) => (
                    <button
                      key={seed}
                      onClick={() => onAvatarSelect(seed)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-110 ${avatarSeed === seed ? "border-primary ring-2 ring-primary/30 scale-105" : "border-transparent hover:border-primary/50"}`}
                    >
                      <img
                        src={`https://api.dicebear.com/7.x/micah/svg?seed=${seed}&backgroundColor=b9d8e1`}
                        alt={seed}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <h4 className="font-bold text-xs uppercase tracking-widest text-on-surface/50 border-b border-outline-variant/20 pb-1">
                إعدادات الحساب
              </h4>
              
              {showAccountForm ? (
                <div className="bg-surface-variant/30 p-4 rounded-xl border border-primary/20 animate-in slide-in-from-right-2">
                  <div className="flex justify-between items-center mb-3">
                    <button 
                      onClick={() => setShowAccountForm(null)}
                      className="text-[10px] text-primary hover:underline"
                    >
                      إلغاء
                    </button>
                    <span className="text-xs font-bold text-primary">
                      {showAccountForm === "name" ? "تغيير الاسم" : showAccountForm === "email" ? "البريد الإلكتروني" : "كلمة المرور"}
                    </span>
                  </div>
                  <input 
                    type={showAccountForm === "password" ? "password" : "text"}
                    placeholder={showAccountForm === "name" ? "الاسم الجديد" : showAccountForm === "email" ? "البريد الجديد" : "كلمة المرور الجديدة"}
                    value={accountValue}
                    onChange={(e) => setAccountValue(e.target.value)}
                    className="w-full bg-surface border border-outline-variant/50 rounded-lg p-2.5 text-sm mb-3 focus:outline-none focus:border-primary transition-all"
                    dir={showAccountForm === "email" || showAccountForm === "password" ? "ltr" : "rtl"}
                  />
                  <button 
                    onClick={async () => {
                      const user = getCurrentUser();
                      if (!user || !accountValue.trim()) return;
                      setIsSaving(true);
                      try {
                        const updates: any = {};
                        if (showAccountForm === "name") updates.nickname = accountValue.trim();
                        if (showAccountForm === "email") updates.email = accountValue.trim();
                        if (showAccountForm === "password") updates.password = accountValue.trim();
                        const res = await updateProfile(user.id, updates);
                        if (res.user) {
                          saveUserLocally(res.user);
                          setShowAccountForm(null);
                          setAccountValue('');
                        }
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    disabled={isSaving}
                    className="w-full py-2.5 bg-primary text-white text-xs font-bold rounded-lg hover:brightness-110 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSaving ? 'جاري الحفظ...' : 'تحديث البيانات'}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button 
                    onClick={() => { setShowAccountForm("name"); setAccountValue(''); }}
                    className="w-full flex justify-between items-center bg-surface-variant/30 hover:bg-surface-variant/70 p-3 rounded-xl text-sm border border-outline-variant/30 transition-all hover:translate-x-1"
                  >
                    <User className="w-4 h-4 text-primary" />
                    <span className="text-on-surface font-medium">تعديل الاسم المستعار</span>
                  </button>
                  <button 
                    onClick={() => { setShowAccountForm("email"); setAccountValue(''); }}
                    className="w-full flex justify-between items-center bg-surface-variant/30 hover:bg-surface-variant/70 p-3 rounded-xl text-sm border border-outline-variant/30 transition-all hover:translate-x-1"
                  >
                    <Mail className="w-4 h-4 text-primary" />
                    <span className="text-on-surface font-medium">البريد الإلكتروني</span>
                  </button>
                  <button 
                    onClick={() => { setShowAccountForm("password"); setAccountValue(''); }}
                    className="w-full flex justify-between items-center bg-surface-variant/30 hover:bg-surface-variant/70 p-3 rounded-xl text-sm border border-outline-variant/30 transition-all hover:translate-x-1"
                  >
                    <Lock className="w-4 h-4 text-primary" />
                    <span className="text-on-surface font-medium">تغيير كلمة المرور</span>
                  </button>
                  {userRole === 'admin' && (
                  <button 
                    onClick={() => onSelectGame("admin" as any)}
                    className="w-full flex justify-between items-center bg-primary/10 hover:bg-primary/20 p-3 rounded-xl text-sm border border-primary/30 transition-all hover:translate-x-1"
                  >
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-primary font-bold">لوحة الإدارة</span>
                  </button>
                  )}
                  {onLogout && (
                    <button 
                      onClick={onLogout}
                      className="w-full flex justify-between items-center bg-error/10 hover:bg-error/20 p-3 rounded-xl text-sm border border-error/30 transition-all hover:translate-x-1"
                    >
                      <LogOut className="w-4 h-4 text-error" />
                      <span className="text-error font-bold">تسجيل الخروج</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-xs uppercase tracking-widest text-on-surface/50 border-b border-outline-variant/20 pb-1">
                رصيد الألعاب والإنجازات
              </h4>
              <div className="grid gap-2">
                <div className="flex justify-between items-center bg-surface-variant/50 p-3 rounded-xl text-sm border border-outline-variant/30">
                  <span className="font-bold font-mono text-primary">$ 5,000</span>
                  <span className="flex items-center gap-2 text-xs opacity-80">
                    محاكاة المدينة <Activity className="w-3.5 h-3.5 text-primary" />
                  </span>
                </div>
                <div className="flex justify-between items-center bg-surface-variant/50 p-3 rounded-xl text-sm border border-outline-variant/30">
                  <span className="font-bold font-mono text-secondary">1,250 pt</span>
                  <span className="flex items-center gap-2 text-xs opacity-80">
                    المليونير السيبراني <Trophy className="w-3.5 h-3.5 text-secondary" />
                  </span>
                </div>
                <div className="flex justify-between items-center bg-surface-variant/50 p-3 rounded-xl text-sm border border-outline-variant/30">
                  <span className="font-bold font-mono text-emerald-500">12</span>
                  <span className="flex items-center gap-2 text-xs opacity-80">
                    ألغاز التشفير <Key className="w-3.5 h-3.5 text-emerald-500" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {showHelp && (
          <div className="absolute top-full right-4 left-4 md:left-auto md:right-0 mt-3 md:w-96 max-h-[75vh] overflow-y-auto bg-surface/95 backdrop-blur-md border border-outline-variant/30 rounded-2xl shadow-2xl p-5 z-[70] animate-in fade-in slide-in-from-top-2 custom-scrollbar">
            <div className="flex justify-between items-center mb-4 border-b border-primary/20 pb-2">
              <button onClick={() => setShowHelp(false)} className="text-primary/50 hover:text-primary transition-colors hover:bg-primary/10 p-1 rounded-full"><X className="w-4 h-4"/></button>
              <h4 className="font-bold text-[14px] text-primary text-right">
                دليل الألعاب والدروس
              </h4>
            </div>
            <div className="space-y-3 text-right">
              <button
                onClick={() => onSelectGame("city", true)}
                className="w-full text-right bg-surface-variant/40 hover:bg-primary/5 p-4 rounded-xl border border-outline-variant/30 transition-all group flex flex-row-reverse gap-3 items-center"
              >
                <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-primary text-sm mb-1">محاكاة المدينة الآمنة</h5>
                  <p className="text-[11px] text-on-surface opacity-70 leading-normal">
                    تعلم كيفية حماية البنية التحتية والمباني من الهجمات المباشرة.
                  </p>
                </div>
              </button>
              
              <button
                onClick={() => onSelectGame("millionaire", true)}
                className="w-full text-right bg-surface-variant/40 hover:bg-primary/5 p-4 rounded-xl border border-outline-variant/30 transition-all group flex flex-row-reverse gap-3 items-center"
              >
                <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-primary text-sm mb-1">المليونير السيبراني</h5>
                  <p className="text-[11px] text-on-surface opacity-70 leading-normal">
                    تحديات الأسئلة المتدرجة، اختبر معلوماتك واحصل على المليون الافتراضي.
                  </p>
                </div>
              </button>

              <button
                onClick={() => onSelectGame("crypto", true)}
                className="w-full text-right bg-surface-variant/40 hover:bg-emerald-500/5 p-4 rounded-xl border border-outline-variant/30 transition-all group flex flex-row-reverse gap-3 items-center"
              >
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors shrink-0">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-emerald-500 text-sm mb-1">تشفير وألغاز</h5>
                  <p className="text-[11px] text-on-surface opacity-70 leading-normal">
                    حل شفرات معقدة واكتشف أوامر الأنظمة المخفية.
                  </p>
                </div>
              </button>

              <button
                onClick={() => onSelectGame("courses", true)}
                className="w-full text-right bg-surface-variant/40 hover:bg-blue-500/5 p-4 rounded-xl border border-outline-variant/30 transition-all group flex flex-row-reverse gap-3 items-center"
              >
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-blue-500 text-sm mb-1">الدورات التعليمية</h5>
                  <p className="text-[11px] text-on-surface opacity-70 leading-normal">
                    مسار تعليمي متكامل من المبتدئ إلى المحترف مع AI.
                  </p>
                </div>
              </button>

              <button
                onClick={() => onSelectGame("assessment", true)}
                className="w-full text-right bg-surface-variant/40 hover:bg-orange-500/5 p-4 rounded-xl border border-outline-variant/30 transition-all group flex flex-row-reverse gap-3 items-center"
              >
                <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-orange-500 text-sm mb-1">تحديد المستوى الذكي</h5>
                  <p className="text-[11px] text-on-surface opacity-70 leading-normal">
                    اختبار تقييمي يبني لك خطة دراسية مخصصة بمساعدة AI.
                  </p>
                </div>
              </button>

              <button
                onClick={() => onSelectGame("ssh", true)}
                className="w-full text-right bg-surface-variant/40 hover:bg-emerald-500/5 p-4 rounded-xl border border-outline-variant/30 transition-all group flex flex-row-reverse gap-3 items-center"
              >
                <div className="p-3 rounded-xl bg-emerald-600/10 text-emerald-500 group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                  <TerminalLucide className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-emerald-500 text-sm mb-1">اختراق الخادم (SSH)</h5>
                  <p className="text-[11px] text-on-surface opacity-70 leading-normal">
                    اخترق خادماً عبر SSH وتعلم أوامر Linux الحقيقية ونظام fail2ban.
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-6xl py-2 pt-24 md:pt-2 z-10 relative">
        <header className="mb-12 border-b border-outline/20 pb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-colors duration-500 w-full">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-surface-variant border-2 border-primary/30 overflow-hidden shrink-0 shadow-md">
              <img src={`https://api.dicebear.com/7.x/micah/svg?seed=${avatarSeed}&backgroundColor=transparent`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-serif italic font-light tracking-tighter text-primary uppercase" dir="ltr">
                CYBER ACADEMY
              </h1>
              <p className="text-[10px] uppercase tracking-widest mt-2 opacity-60 font-bold" dir="ltr">
                SELECT TRAINING MODULE
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Courses */}
          <button
            onClick={() => onSelectGame("courses")}
            className={`group text-right bg-surface p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-outline-variant rounded-2xl hover:shadow-[-12px_12px_0px_var(--sys-primary)] transition-all hover:-translate-y-1 flex flex-col items-start h-full`}
          >
            <div
              className={`w-12 h-12 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center rounded-none group-hover:bg-primary transition-colors mb-4 focus:outline-none`}
            >
              <BookOpen className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif italic mb-4">
              الدورات التعليمية
            </h2>
            <p className="text-sm opacity-70 mb-auto leading-relaxed font-sans focus:outline-none">
              شاهد المحاضرات، واقرأ المراجع المكتوبة (PDF)، وتابع مقاطع الفيديو
              التعليمية لتطوير مهاراتك بشكل احترافي.
            </p>
            <div className="flex gap-4 mt-6">
              <span
                className={`text-[9px] uppercase tracking-widest px-2 py-1 bg-surface-variant text-on-surface-variant font-bold`}
              >
                دورات
              </span>
            </div>
          </button>

          {/* Cyber Insights (Flashcards) */}
          <button
            onClick={() => onSelectGame("flashcards")}
            className={`group text-right bg-surface p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-outline-variant rounded-2xl ${theme === "dark" ? "hover:shadow-[-12px_12px_0px_var(--sys-primary)]" : "hover:shadow-[-12px_12px_0px_var(--sys-primary)]"} transition-all hover:-translate-y-1 flex flex-col items-start h-full`}
          >
            <div
              className={`w-12 h-12 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center rounded-none group-hover:bg-primary transition-colors mb-4 focus:outline-none`}
            >
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif italic mb-4">رؤى سيبرانية</h2>
            <p className="text-sm opacity-70 mb-auto leading-relaxed font-sans focus:outline-none">
              راجع تعريفات الأمن السيبراني الهامة وتكتيكات المخترقين عبر بطاقات
              تفاعلية. قراءة أساسية.
            </p>
            <div className="flex gap-4 mt-6">
              <span
                className={`text-[9px] uppercase tracking-widest px-2 py-1 bg-surface-variant text-on-surface-variant font-bold`}
              >
                المعرفة
              </span>
            </div>
          </button>

          {/* Level Assessment & AI Plan */}
          <button
            onClick={() => onSelectGame("assessment")}
            className={`group text-right bg-surface p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-outline-variant rounded-2xl hover:shadow-[-12px_12px_0px_var(--sys-primary)] transition-all hover:-translate-y-1 flex flex-col items-start h-full`}
          >
            <div
              className={`w-12 h-12 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center rounded-none group-hover:bg-primary transition-colors mb-4`}
            >
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif italic mb-4">
              تحديد المستوى وخطة AI
            </h2>
            <p className="text-sm opacity-70 mb-auto leading-relaxed font-sans mt-0">
              اختبار لتحديد مستواك الأمني بدقة. بعد التقييم، سيقوم الذكاء
              الاصطناعي ببناء خطة دراسية متكاملة مخصصة لك.
            </p>
            <div className="flex gap-4 mt-6">
              <span
                className={`text-[9px] uppercase tracking-widest px-2 py-1 bg-surface-variant text-on-surface-variant font-bold`}
              >
                تقييم وإرشاد
              </span>
            </div>
          </button>

          {/* Crypto Puzzles */}
          <button
            onClick={() => onSelectGame("crypto")}
            className={`group text-right bg-surface p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-outline-variant rounded-2xl hover:shadow-[-12px_12px_0px_var(--sys-primary)] transition-all hover:-translate-y-1 flex flex-col items-start h-full`}
          >
            <div
              className={`w-12 h-12 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center rounded-none group-hover:bg-primary transition-colors mb-4`}
            >
              <Key className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif italic mb-4">تشفير وأوامر</h2>
            <p className="text-sm opacity-70 mb-auto leading-relaxed font-sans">
              حل ألغاز تعتمد على الكلمات للتعرف على أشهر الأوامر وخوارزميات
              التشفير المستخدمة في بناء الأنظمة.
            </p>
            <div className="flex gap-4 mt-6">
              <span
                className={`text-[9px] uppercase tracking-widest px-2 py-1 bg-surface-variant text-on-surface-variant font-bold border-r-2 border-primary`}
              >
                لغز الكلمات
              </span>
            </div>
          </button>

          {/* Cyber Millionaire Card */}
          <button
            onClick={() => onSelectGame("millionaire")}
            className={`group text-right bg-surface p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-outline-variant rounded-2xl hover:shadow-[-12px_12px_0px_var(--sys-primary)] transition-all hover:-translate-y-1 flex flex-col items-start h-full`}
          >
            <div
              className={`w-12 h-12 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center rounded-none group-hover:bg-primary transition-colors mb-4`}
            >
              <Trophy className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif italic mb-4">
              المليونير السيبراني
            </h2>
            <p className="text-sm opacity-70 mb-auto leading-relaxed font-sans">
              يغطي الشبكات والتشفير والعمليات الدفاعية. استخدم مساعدة الذكاء
              الاصطناعي بحكمة لتخطي المراحل.
            </p>
            <div className="flex gap-4 mt-6">
              <span
                className={`text-[9px] uppercase tracking-widest px-2 py-1 bg-surface-variant text-on-surface-variant font-bold border-r-2 border-primary`}
              >
                مسابقات
              </span>
            </div>
          </button>

          {/* SecureCity Map Card */}
          <button
            onClick={() => onSelectGame("city")}
            className={`group text-right bg-surface p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-outline-variant rounded-2xl hover:shadow-[-12px_12px_0px_var(--sys-primary)] transition-all hover:-translate-y-1 flex flex-col items-start h-full lg:col-span-2`}
          >
            <div
              className={`w-12 h-12 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center rounded-none group-hover:bg-primary transition-colors mb-4`}
            >
              <Activity className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif italic mb-4">
              محاكاة مدينة آمنة
            </h2>
            <p className="text-sm opacity-70 mb-auto leading-relaxed font-sans max-w-2xl">
              محاكاة تشغيلية. أدر الدفاع عن البنية التحتية لمدينة ذكية ضد
              التهديدات المباشرة. تواصل مباشرة مع نظام الذكاء الاصطناعي Locus
              لتنفيذ الاستراتيجيات و توجيه الهجمات السيبرانية و رصد النتائج.
            </p>
            <div className="flex gap-4 mt-6">
              <span
                className={`text-[9px] uppercase tracking-widest px-2 py-1 bg-surface-variant text-on-surface-variant font-bold`}
              >
                محاكاة عملية
              </span>
            </div>
          </button>

          {/* SSH Hack Card */}
          <button
            onClick={() => onSelectGame("ssh")}
            className={`group text-right bg-surface p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-outline-variant rounded-2xl hover:shadow-[-12px_12px_0px_#22c55e] transition-all hover:-translate-y-1 flex flex-col items-start h-full`}
          >
            <div
              className={`w-12 h-12 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-2xl flex items-center justify-center rounded-none group-hover:bg-emerald-500 group-hover:text-white transition-colors mb-4`}
            >
              <TerminalLucide className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif italic mb-4">
              اختراق الخادم
            </h2>
            <p className="text-sm opacity-70 mb-auto leading-relaxed font-sans">
              حاول اختراق خادم حقيقي عبر SSH — واجه نظام fail2ban إذا فشلت.
              تعلّم أوامر Linux الحقيقية في بيئة آمنة.
            </p>
            <div className="flex gap-4 mt-6">
              <span
                className={`text-[9px] uppercase tracking-widest px-2 py-1 bg-emerald-500/10 text-emerald-500 font-bold border-r-2 border-emerald-500`}
              >
                محاكاة عملية
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
