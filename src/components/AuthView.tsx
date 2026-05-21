import React, { useState, useEffect } from 'react';
import { User, Shield, Lock, UserPlus, LogIn } from 'lucide-react';
import { loginUser, getCurrentUser, saveUserLocally } from '../services/backendApi';

interface AuthViewProps {
  onLogin: (name: string, level: string, userId: number) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Auto-login if user exists
    const existing = getCurrentUser();
    if (existing) {
      onLogin(existing.nickname || existing.username, existing.level || 'متدرب', existing.id);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    if (mode === 'register' && !nickname.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await loginUser(
        username.trim(),
        mode === 'register' ? nickname.trim() : ''
      );

      if (result.user) {
        onLogin(
          result.user.nickname || result.user.username,
          result.user.level || 'متدرب',
          result.user.id
        );
      } else {
        setError(result.error || 'حدث خطأ أثناء تسجيل الدخول');
      }
    } catch (err) {
      setError('فشل الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-background text-on-background">
      <div className="w-full max-w-md p-10 bg-white border border-on-background/20 shadow-[12px_12px_0px_#1A1A1A] relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
        
        <div className="text-center mb-8">
          <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-serif italic tracking-tighter">SecureCity</h1>
          <p className="text-[10px] uppercase tracking-widest mt-2 opacity-60 font-bold">بوابة أكاديمية الأمن السيبراني</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex mb-8 border-b border-on-background/10">
          <button 
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 pb-3 text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-colors ${mode === 'login' ? 'text-primary border-b-2 border-primary' : 'text-on-background/40 hover:text-on-background/70'}`}
          >
            <LogIn className="w-4 h-4" /> تسجيل دخول
          </button>
          <button 
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 pb-3 text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-colors ${mode === 'register' ? 'text-primary border-b-2 border-primary' : 'text-on-background/40 hover:text-on-background/70'}`}
          >
            <UserPlus className="w-4 h-4" /> إنشاء حساب
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">اسم المستخدم</label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-background border border-on-background/20 py-3 pr-10 pl-4 focus:outline-none focus:border-primary transition-colors"
                placeholder="username"
                required
                dir="ltr"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">الكنية (الاسم المعروض)</label>
              <div className="relative">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full bg-background border border-on-background/20 py-3 px-4 focus:outline-none focus:border-primary transition-colors"
                  placeholder="الاسم الأول + اللقب..."
                  required
                />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-on-background text-background py-4 uppercase text-[11px] tracking-[0.2em] font-bold hover:bg-primary transition-colors mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="animate-pulse">جاري الاتصال...</span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء الحساب'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
