import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Bell as Notifications, Settings, LayoutDashboard as Dashboard, Globe as Public } from 'lucide-react';
import { Toast, useToast } from './Toast';

interface GlobalHeaderProps {
  onBack?: () => void;
  studentName?: string;
  studentLevel?: string;
  budget?: number;
  showDashboardButton?: boolean;
  theme?: 'light' | 'dark';
  onThemeChange?: (theme: 'light' | 'dark') => void;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  onBack,
  studentName,
  studentLevel,
  budget,
  showDashboardButton = true,
  theme: themeProp,
  onThemeChange,
}) => {
  const [internalTheme, setInternalTheme] = useState<'light' | 'dark'>(
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );
  const theme = themeProp ?? internalTheme;
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettingsProfile, setShowSettingsProfile] = useState(false);
  const { toast, show: showToast, hide: hideToast } = useToast();

  const notificationsRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettingsProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    if (!themeProp) setInternalTheme(next);
    onThemeChange?.(next);
  };

  const handleShare = (app: 'whatsapp' | 'messenger' | 'telegram' | 'native') => {
    const url = window.location.href;
    const text = 'العب معي في لعبة المدينة الآمنة للأمن السيبراني!';

    if (app === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`);
    } else if (app === 'messenger') {
      window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=123456789&redirect_uri=${encodeURIComponent(url)}`);
    } else if (app === 'telegram') {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
    } else if (app === 'native') {
      if (navigator.share) {
        navigator.share({ title: 'لعبة المدينة الآمنة', text, url });
      } else {
        navigator.clipboard.writeText(url);
        showToast('تم نسخ الرابط!', 'success');
      }
    }
  };

  return (
    <header className="flex justify-between items-center px-4 sm:px-6 h-16 w-full fixed top-0 z-[60] bg-surface/80 backdrop-blur-md border-b border-outline-variant/20 shadow-md shadow-primary/10 transition-colors duration-500 text-on-surface" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <div className="flex items-center gap-6">
        <span className="font-h2-header text-[24px] text-primary tracking-tighter uppercase font-bold text-outline-0">CYBER_CORE</span>
        {showDashboardButton && onBack && (
          <div className="hidden md:flex gap-4 items-center">
            <button onClick={onBack} className="text-primary font-bold hover:text-secondary transition-colors duration-200 uppercase text-xs tracking-wider border border-primary/20 px-3 py-1 rounded-md bg-primary/10">
              لوحة القيادة
            </button>
            <span className="text-on-surface-variant/50">/</span>
            <span className="text-on-surface-variant uppercase text-xs tracking-wider">
              {studentName ? studentName : 'OPERATIVE_042'}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="transition-all duration-300 active:scale-95 p-2 rounded-full text-on-surface hover:bg-primary/20"
          title="تبديل الإضاءة"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-primary"/> : <Moon className="w-5 h-5 text-primary"/>}
        </button>

        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-primary active:scale-95 hover:bg-primary/20 p-2 rounded-full transition-all relative"
          >
            <Notifications className="w-5 h-5"/>
            <span className="absolute top-1 right-2 w-2 h-2 bg-error rounded-full animate-bounce"></span>
          </button>
          
          {showNotifications && (
            <div className="absolute top-full right-0 sm:left-0 mt-2 w-[calc(100vw-2rem)] sm:w-64 max-w-[280px] bg-surface border border-outline-variant/20 rounded-xl shadow-lg p-4 z-50">
              <h4 className="font-bold text-sm mb-2 text-primary text-right">الإشعارات</h4>
              <div className="space-y-2 text-right">
                <div className="p-2 bg-surface-variant rounded text-xs text-on-surface">مرحباً بك في المحاكاة الأمنية!</div>
                <div className="p-2 bg-error/10 text-error rounded text-xs">تأكد من مراجعة حالة الشبكة باستمرار.</div>
                <div className="p-2 bg-surface-variant rounded text-xs text-on-surface">تحديث جديد: تمت إضافة مستويات جديدة للمحاكاة الأمنية! استعد للتحدي.</div>
                <div className="p-2 bg-primary/10 text-primary rounded text-xs">إعلان: شارك نتيجتك مع أصدقائك وتنافسوا على لقب أفضل محلل أمني.</div>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={settingsRef}>
          <button
            onClick={() => setShowSettingsProfile(!showSettingsProfile)}
            title="الإعدادات الشخصية" 
            className="text-primary active:scale-95 hover:bg-primary/20 p-2 rounded-full transition-all"
          >
            <Settings className="w-5 h-5"/>
          </button>
          
          {showSettingsProfile && (
            <div className="absolute top-full right-0 sm:left-0 mt-2 w-[calc(100vw-2rem)] sm:w-72 max-w-[300px] bg-surface border border-outline-variant/20 rounded-xl shadow-lg p-4 z-50 text-right">
              <h4 className="font-bold text-sm mb-4 text-primary">الملف الشخصي والتدريب</h4>
              <div className="space-y-4">
                {budget !== undefined && (
                  <div className="flex justify-between items-center bg-surface-variant p-2 rounded text-sm">
                    <span className="font-bold text-primary">${budget.toLocaleString()}</span>
                    <span>الرصيد المتاح:</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center bg-surface-variant p-2 rounded text-sm">
                  <span className="font-bold">{studentLevel || 'غير محدد'}</span>
                  <span>مستوى التقييم:</span>
                </div>
                
                {/* Share Options */}
                <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/30">
                  <h5 className="font-bold text-xs text-primary mb-3">شارك اللعبة مع أصدقائك</h5>
                  <div className="space-y-2">
                    <button onClick={() => handleShare('whatsapp')} className="w-full flex justify-end items-center gap-2 px-3 py-2 bg-[#25D366]/10 text-[#25D366] rounded hover:bg-[#25D366]/20 transition-all font-bold text-xs">
                      عبر واتساب
                    </button>
                    <button onClick={() => handleShare('messenger')} className="w-full flex justify-end items-center gap-2 px-3 py-2 bg-[#0084FF]/10 text-[#0084FF] rounded hover:bg-[#0084FF]/20 transition-all font-bold text-xs">
                      عبر ماسنجر
                    </button>
                    <button onClick={() => handleShare('telegram')} className="w-full flex justify-end items-center gap-2 px-3 py-2 bg-[#0088cc]/10 text-[#0088cc] rounded hover:bg-[#0088cc]/20 transition-all font-bold text-xs">
                      عبر تيليجرام
                    </button>
                    <button onClick={() => handleShare('native')} className="w-full flex justify-end items-center gap-2 px-3 py-2 bg-secondary/10 text-secondary border border-secondary/30 rounded text-xs font-bold hover:bg-secondary/20 transition-all">
                      نسخ الرابط <Public className="w-4 h-4"/>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
