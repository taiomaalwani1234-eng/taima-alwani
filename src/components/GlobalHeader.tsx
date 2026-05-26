import React, { useState } from 'react';
import { Sun, Moon, Bell as Notifications, Settings, LayoutDashboard as Dashboard, Globe as Public, User, Menu, X } from 'lucide-react';

interface GlobalHeaderProps {
  onBack?: () => void;
  studentName?: string;
  studentLevel?: string;
  budget?: number;
  showDashboardButton?: boolean;
  avatarSeed?: string;
  onAvatarSelect?: (seed: string) => void;
  onToggleSidebar?: () => void;
}

export const AVATAR_SEEDS = [
  'Aneka',
  'Mia',
  'Sofia',
  'Lily',
  'Lola',
  'Kiki',
  'Zoe',
  'Felix',
  'Jasper',
  'Ryan',
];

import { getDailyNotifications } from '../data/notifications';

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({ 
  onBack, 
  studentName, 
  studentLevel, 
  budget,
  showDashboardButton = true,
  avatarSeed = 'Aneka',
  onAvatarSelect,
  onToggleSidebar
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettingsProfile, setShowSettingsProfile] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const [notificationsRead, setNotificationsRead] = useState(() => {
    const lastRead = localStorage.getItem('taima_notifications_read');
    const today = new Date().toDateString();
    return lastRead === today;
  });

  const dailyNotifications = getDailyNotifications();

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleOpenNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!notificationsRead) {
      setNotificationsRead(true);
      localStorage.setItem('taima_notifications_read', new Date().toDateString());
    }
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
        alert('تم نسخ الرابط!');
      }
    }
  };

  return (
    <header className="flex justify-between items-center px-6 h-16 w-full fixed top-0 z-[60] bg-surface/80 backdrop-blur-md border-b border-outline-variant/20 shadow-md shadow-primary/10 transition-colors duration-500 text-on-surface">
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
        {budget !== undefined && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 select-none">
            <span className="text-[11px] text-on-surface-variant font-bold">الميزانية:</span>
            <span className={`font-mono font-bold text-xs ${budget < 20000 ? 'text-error animate-pulse' : 'text-primary'}`}>
              ${budget.toLocaleString()}
            </span>
          </div>
        )}
        {onToggleSidebar && (
          <button 
            onClick={onToggleSidebar}
            className="lg:hidden transition-all duration-300 active:scale-95 p-2 rounded-full text-on-surface hover:bg-primary/20"
            title="توجيه العمليات"
          >
            <Menu className="w-5 h-5 text-primary"/>
          </button>
        )}

        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
          className="transition-all duration-300 active:scale-95 p-2 rounded-full text-on-surface hover:bg-primary/20"
          title="تبديل الإضاءة"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-primary"/> : <Moon className="w-5 h-5 text-primary"/>}
        </button>

        <div className="relative">
          <button 
            onClick={handleOpenNotifications}
            className="text-primary active:scale-95 hover:bg-primary/20 p-2 rounded-full transition-all relative"
          >
            <Notifications className="w-5 h-5"/>
            {!notificationsRead && (
              <span className="absolute top-1 right-2 w-2 h-2 bg-error rounded-full animate-bounce"></span>
            )}
          </button>
        </div>

        <div className="relative">
          <button 
            onClick={() => {
              setShowSettingsProfile(!showSettingsProfile);
              setShowAvatarPicker(false);
            }} 
            title="الإعدادات الشخصية" 
            className="text-primary active:scale-95 hover:bg-primary/20 p-2 rounded-full transition-all"
          >
            <Settings className="w-5 h-5"/>
          </button>
        </div>

        {showNotifications && (
          <div className="absolute top-full right-0 mt-2 w-64 md:w-80 bg-surface border border-outline-variant/20 rounded-xl shadow-lg p-4 z-50 animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-center mb-2 border-b border-outline-variant/20 pb-2">
              <button onClick={() => setShowNotifications(false)} className="text-primary/50 hover:text-primary"><X className="w-4 h-4"/></button>
              <h4 className="font-bold text-sm text-primary text-right">الإشعارات اليومية 📅</h4>
            </div>
            <div className="space-y-2 text-right">
              {dailyNotifications.map((notif) => (
                <div 
                  key={notif.id}
                  className="flex items-start gap-2 p-2.5 rounded-xl bg-surface-variant/50 border border-outline-variant/10 hover:border-primary/30 transition-all"
                >
                  <span className="text-lg">{notif.icon}</span>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-primary">{notif.title}</p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">{notif.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showSettingsProfile && (
          <div className="absolute top-full right-0 mt-2 w-72 md:w-80 bg-surface border border-outline-variant/20 rounded-xl shadow-lg p-4 z-50 text-right max-h-[80vh] overflow-y-auto animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-center mb-4 border-b border-outline-variant/20 pb-3">
              <button onClick={() => setShowSettingsProfile(false)} className="text-primary/50 hover:text-primary"><X className="w-4 h-4"/></button>
              <h4 className="font-bold text-sm text-primary">الملف الشخصي والتدريب</h4>
            </div>
            
            <div className="flex flex-col items-center mb-6">
              <div 
                className="w-24 h-24 rounded-full bg-surface-variant border-4 border-primary/20 overflow-hidden cursor-pointer hover:border-primary/50 transition-all hover:scale-105"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                title="تغيير الشخصية"
              >
                <img src={`https://api.dicebear.com/7.x/micah/svg?seed=${avatarSeed}&backgroundColor=transparent`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <p className="text-xs text-on-surface-variant mt-2">انقر لتغيير الشخصية</p>
            </div>

            {showAvatarPicker && onAvatarSelect && (
              <div className="mb-6 p-3 bg-surface-variant/50 rounded-xl border border-outline-variant/30">
                <h5 className="font-bold text-xs text-primary mb-3 text-center">اختر شخصيتك</h5>
                <div className="grid grid-cols-3 gap-2">
                  {AVATAR_SEEDS.map((seed) => (
                    <button
                      key={seed}
                      onClick={() => onAvatarSelect(seed)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${avatarSeed === seed ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-primary/50'}`}
                    >
                      <img src={`https://api.dicebear.com/7.x/micah/svg?seed=${seed}&backgroundColor=b9d8e1`} alt={seed} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

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
    </header>
  );
};
