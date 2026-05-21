import React, { useState } from 'react';
import { GlobalHeader } from './GlobalHeader';
import { ShieldAlert, Trophy, Target, FileText, Activity, Key, BookOpen, Sun, Moon, LogOut } from 'lucide-react';
import { getCurrentUser } from '../services/backendApi';

interface DashboardViewProps {
  studentName: string;
  studentLevel: string;
  onSelectGame: (game: 'city' | 'millionaire' | 'flashcards' | 'assessment' | 'crypto' | 'courses' | 'admin') => void;
  userId?: number;
  onLogout?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ studentName, studentLevel, onSelectGame, userId, onLogout }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(document.documentElement.classList.contains('dark') ? 'dark' : 'light');

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  
  const textClass = theme === 'dark' ? 'text-[#d9e2ff]' : 'text-on-background';
  
  
  
  
  return (
    <div className="w-full h-full bg-background text-on-background flex flex-col items-center p-4 sm:p-8 overflow-y-auto transition-colors duration-500 relative">
      
      <div 
        className="absolute inset-0 z-0 opacity-10 pointer-events-none mix-blend-luminosity"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2000&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      <button 
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
        className="absolute top-6 left-6 transition-all duration-300 active:scale-95 p-2 rounded-full text-on-background hover:bg-primary/20 z-10"
        title="تبديل الإضاءة"
      >
         {theme === 'dark' ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
      </button>

      {onLogout && (
        <button 
          onClick={onLogout}
          className="absolute top-6 left-20 transition-all duration-300 active:scale-95 p-2 rounded-full text-on-background hover:bg-error/20 z-10 flex items-center gap-2"
          title="تسجيل الخروج"
        >
          <LogOut className="w-5 h-5"/>
          <span className="text-[10px] uppercase tracking-widest font-bold">خروج</span>
        </button>
      )}

      <div className="w-full max-w-6xl py-8 z-10 relative mx-auto my-auto">
        <header className="mb-12 border-b border-outline/20 pb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 transition-colors duration-500 w-full">
          <div>
            <h1 className="text-4xl sm:text-5xl font-serif italic font-light tracking-tighter text-primary">مركز الأكاديمية</h1>
            <p className="text-[10px] uppercase tracking-widest mt-2 opacity-60 font-bold">اختر وحدة التدريب</p>
          </div>
          <div className="text-right sm:text-left">
            <p className="text-[10px] uppercase tracking-widest opacity-50 mb-1">العميل النشط</p>
            <p className="font-bold text-lg text-secondary">{studentName}</p>
            <p className="text-primary text-[10px] uppercase font-bold tracking-widest">تصريح {studentLevel}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Courses */}
          <button 
            onClick={() => onSelectGame('courses')}
            className={`group text-right bg-surface p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-outline-variant rounded-2xl hover:shadow-[-12px_12px_0px_var(--sys-primary)] transition-all hover:-translate-y-1 flex flex-col items-start h-full`}
          >
            <div className={`w-12 h-12 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center rounded-none group-hover:bg-primary transition-colors mb-4 focus:outline-none`}>
              <BookOpen className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif italic mb-4">الدورات التعليمية</h2>
            <p className="text-sm opacity-70 mb-auto leading-relaxed font-sans focus:outline-none">
              شاهد المحاضرات، واقرأ المراجع المكتوبة (PDF)، وتابع مقاطع الفيديو التعليمية لتطوير مهاراتك بشكل احترافي.
            </p>
            <div className="flex gap-4 mt-6">
              <span className={`text-[9px] uppercase tracking-widest px-2 py-1 bg-surface-variant text-on-surface-variant font-bold`}>دورات</span>
            </div>
          </button>

          {/* Cyber Insights (Flashcards) */}
          <button 
            onClick={() => onSelectGame('flashcards')}
            className={`group text-right bg-surface p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-outline-variant rounded-2xl ${theme === 'dark' ? 'hover:shadow-[-12px_12px_0px_var(--sys-primary)]' : 'hover:shadow-[-12px_12px_0px_var(--sys-primary)]'} transition-all hover:-translate-y-1 flex flex-col items-start h-full`}
          >
            <div className={`w-12 h-12 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center rounded-none group-hover:bg-primary transition-colors mb-4 focus:outline-none`}>
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif italic mb-4">رؤى سيبرانية</h2>
            <p className="text-sm opacity-70 mb-auto leading-relaxed font-sans focus:outline-none">
              راجع تعريفات الأمن السيبراني الهامة وتكتيكات المخترقين عبر بطاقات تفاعلية. قراءة أساسية.
            </p>
            <div className="flex gap-4 mt-6">
              <span className={`text-[9px] uppercase tracking-widest px-2 py-1 bg-surface-variant text-on-surface-variant font-bold`}>المعرفة</span>
            </div>
          </button>

          {/* Level Assessment & AI Plan */}
          <button 
            onClick={() => onSelectGame('assessment')}
            className={`group text-right bg-surface p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-outline-variant rounded-2xl hover:shadow-[-12px_12px_0px_var(--sys-primary)] transition-all hover:-translate-y-1 flex flex-col items-start h-full`}
            style={{
              color: '#83aade',
              borderStyle: 'groove',
              borderWidth: '0px',
              paddingLeft: '24px',
              fontStyle: 'normal',
              textDecorationLine: 'none',
              fontWeight: 'normal',
              fontFamily: 'Georgia',
              fontSize: '24px',
              lineHeight: '24px'
            }}
          >
            <div className={`w-12 h-12 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center rounded-none group-hover:bg-primary transition-colors mb-4`}>
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif italic mb-4">تحديد المستوى وخطة AI</h2>
            <p className="text-sm opacity-70 mb-auto leading-relaxed font-sans mt-0">
              اختبار لتحديد مستواك الأمني بدقة. بعد التقييم، سيقوم الذكاء الاصطناعي ببناء خطة دراسية متكاملة مخصصة لك.
            </p>
            <div className="flex gap-4 mt-6">
              <span className={`text-[9px] uppercase tracking-widest px-2 py-1 bg-surface-variant text-on-surface-variant font-bold`}>تقييم وإرشاد</span>
            </div>
          </button>

          {/* Crypto Puzzles */}
          <button 
            onClick={() => onSelectGame('crypto')}
            className={`group text-right bg-surface p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-outline-variant rounded-2xl hover:shadow-[-12px_12px_0px_var(--sys-primary)] transition-all hover:-translate-y-1 flex flex-col items-start h-full`}
          >
            <div className={`w-12 h-12 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center rounded-none group-hover:bg-primary transition-colors mb-4`}>
              <Key className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif italic mb-4">تشفير وأوامر</h2>
            <p className="text-sm opacity-70 mb-auto leading-relaxed font-sans">
              حل ألغاز تعتمد على الكلمات للتعرف على أشهر الأوامر وخوارزميات التشفير المستخدمة في بناء الأنظمة.
            </p>
            <div className="flex gap-4 mt-6">
              <span className={`text-[9px] uppercase tracking-widest px-2 py-1 bg-surface-variant text-on-surface-variant font-bold border-r-2 border-primary`}>لغز الكلمات</span>
            </div>
          </button>

          {/* Cyber Millionaire Card */}
          <button 
            onClick={() => onSelectGame('millionaire')}
            className={`group text-right bg-surface p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-outline-variant rounded-2xl hover:shadow-[-12px_12px_0px_var(--sys-primary)] transition-all hover:-translate-y-1 flex flex-col items-start h-full`}
          >
            <div className={`w-12 h-12 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center rounded-none group-hover:bg-primary transition-colors mb-4`}>
              <Trophy className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif italic mb-4">المليونير السيبراني</h2>
            <p className="text-sm opacity-70 mb-auto leading-relaxed font-sans">
              يغطي الشبكات والتشفير والعمليات الدفاعية. استخدم مساعدة الذكاء الاصطناعي بحكمة لتخطي المراحل.
            </p>
            <div className="flex gap-4 mt-6">
              <span className={`text-[9px] uppercase tracking-widest px-2 py-1 bg-surface-variant text-on-surface-variant font-bold border-r-2 border-primary`}>مسابقات</span>
            </div>
          </button>

          {/* Admin Panel - Only for admin user */}
          {studentName === 'المدير' && (
          <button 
            onClick={() => onSelectGame('admin')}
            className={`group text-right bg-surface p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-error/30 rounded-2xl hover:shadow-[-12px_12px_0px_var(--sys-error)] transition-all hover:-translate-y-1 flex flex-col items-start h-full col-span-1 md:col-span-2 lg:col-span-3`}
          >
            <div className={`w-12 h-12 bg-error/10 text-error border border-error/20 rounded-2xl flex items-center justify-center rounded-none group-hover:bg-error transition-colors mb-4`}>
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif italic mb-4">لوحة الإدارة</h2>
            <p className="text-sm opacity-70 mb-auto leading-relaxed font-sans">
              إدارة المستخدمين، عرض السجلات، التحكم بالبيانات والصلاحيات.
            </p>
            <div className="flex gap-4 mt-6">
              <span className={`text-[9px] uppercase tracking-widest px-2 py-1 bg-error/10 text-error font-bold border-r-2 border-error`}>إدارة</span>
            </div>
          </button>
          )}

          {/* SecureCity Map Card */}
          <button 
            onClick={() => onSelectGame('city')}
            className={`group text-right bg-surface p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-outline-variant rounded-2xl hover:shadow-[-12px_12px_0px_var(--sys-primary)] transition-all hover:-translate-y-1 flex flex-col items-start h-full lg:col-span-2`}
          >
            <div className={`w-12 h-12 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center rounded-none group-hover:bg-primary transition-colors mb-4`}>
              <Activity className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif italic mb-4">محاكاة مدينة آمنة</h2>
            <p className="text-sm opacity-70 mb-auto leading-relaxed font-sans max-w-2xl">
              محاكاة تشغيلية. أدر الدفاع عن البنية التحتية لمدينة ذكية ضد التهديدات المباشرة. تواصل مباشرة مع نظام الذكاء الاصطناعي Locus لتنفيذ الاستراتيجيات و توجيه الهجمات السيبرانية و رصد النتائج.
            </p>
            <div className="flex gap-4 mt-6">
              <span className={`text-[9px] uppercase tracking-widest px-2 py-1 bg-surface-variant text-on-surface-variant font-bold`}>محاكاة عملية</span>
            </div>
          </button>

        </div>
      </div>
    </div>
  );
  };
