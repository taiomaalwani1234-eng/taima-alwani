import React, { useState } from 'react';
import { User, Shield, Lock, Mail, UserPlus, LogIn } from 'lucide-react';
import { loginWithEmail, registerUser, getCurrentUser, saveUserLocally } from '../services/backendApi';

interface AuthViewProps {
  onLogin: (name: string, level: string, id: number) => void;
}

type AuthMode = 'splash' | 'login' | 'register';

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('splash');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Check for existing session on mount
  React.useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      onLogin(user.nickname || user.username, user.level || 'متدرب', user.id);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError('الرجاء إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }
    setIsLoading(true);
    try {
      const data = await loginWithEmail(loginEmail.trim(), loginPassword);
      if (data.error) {
        setError(data.error);
      } else if (data.user) {
        onLogin(data.user.nickname || data.user.username, data.user.level || 'متدرب', data.user.id);
      }
    } catch {
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!regFirstName.trim() || !regLastName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError('الرجاء ملء جميع الحقول');
      return;
    }
    if (regPassword.length < 4) {
      setError('كلمة المرور يجب أن تكون 4 أحرف على الأقل');
      return;
    }
    setIsLoading(true);
    try {
      const username = `${regFirstName.trim()}_${regLastName.trim()}`.toLowerCase().replace(/\s/g, '_');
      const nickname = `${regFirstName.trim()} ${regLastName.trim()}`;
      const data = await registerUser(username, regEmail.trim(), regPassword, nickname);
      if (data.error) {
        setError(data.error);
      } else if (data.user) {
        onLogin(data.user.nickname || data.user.username, data.user.level || 'متدرب', data.user.id);
      }
    } catch {
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  if (mode === 'splash') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-background text-on-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--sys-on-background) 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="flex flex-col items-center relative z-10 p-8">
          <div className="w-48 h-48 md:w-64 md:h-64 bg-surface-variant rounded-full flex flex-col justify-center items-center shadow-xl border-2 border-primary/20 mb-8">
            <Shield className="w-24 h-24 md:w-32 md:h-32 text-primary" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-2 mt-4 tracking-tight drop-shadow-sm font-serif">
            SecureCity
          </h1>
          <p className="text-xl md:text-2xl text-on-surface-variant mb-12 uppercase tracking-widest font-bold">
            مركز القيادة والدفاع السيبراني
          </p>

          <div className="flex flex-col gap-4 w-full max-w-xs">
            <button
              onClick={() => setMode('login')}
              className="bg-primary hover:bg-primary/90 text-on-primary px-12 py-4 rounded-full text-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
            >
              <LogIn className="w-5 h-5" />
              تسجيل الدخول
            </button>
            <button
              onClick={() => setMode('register')}
              className="bg-surface border-2 border-primary text-primary hover:bg-primary/10 px-12 py-4 rounded-full text-xl font-bold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
            >
              <UserPlus className="w-5 h-5" />
              إنشاء حساب
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'register') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-background text-on-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--sys-on-background) 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>

        <div className="w-full max-w-sm p-8 bg-surface border border-outline/30 shadow-2xl rounded-3xl relative z-10">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto]"></div>
          
          <div className="text-right mb-6">
            <h3 className="text-2xl font-bold text-on-surface mb-2">إنشاء حساب جديد</h3>
            <p className="text-xs text-on-surface-variant">أنشئ حسابك للانضمام لأكاديمية الأمن السيبراني</p>
          </div>

          {error && (
            <div className="bg-error/10 border border-error/30 text-error text-sm p-3 rounded-xl mb-4 text-right">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4 text-right w-full">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold mb-1.5 text-on-surface">الاسم الأول</label>
                <input
                  type="text"
                  value={regFirstName}
                  onChange={(e) => setRegFirstName(e.target.value)}
                  className="w-full bg-surface-variant/50 border border-outline-variant rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-on-surface text-sm"
                  placeholder="أحمد"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold mb-1.5 text-on-surface">الاسم الأخير</label>
                <input
                  type="text"
                  value={regLastName}
                  onChange={(e) => setRegLastName(e.target.value)}
                  className="w-full bg-surface-variant/50 border border-outline-variant rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-on-surface text-sm"
                  placeholder="محمد"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold mb-1.5 text-on-surface">البريد الإلكتروني</label>
              <div className="relative">
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-surface-variant/50 border border-outline-variant rounded-xl py-2.5 pr-10 pl-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-on-surface text-sm"
                  placeholder="example@email.com"
                  dir="ltr"
                  required
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold mb-1.5 text-on-surface">كلمة المرور</label>
              <div className="relative">
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-surface-variant/50 border border-outline-variant rounded-xl py-2.5 pr-10 pl-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-on-surface text-sm"
                  placeholder="••••••"
                  dir="ltr"
                  required
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-on-primary py-3 rounded-xl text-sm font-bold hover:brightness-110 hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
              <UserPlus className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-4 text-center">
            <button onClick={() => { setMode('login'); setError(''); }} className="text-primary text-sm hover:underline">
              لديك حساب؟ سجل دخولك
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Login mode
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-background text-on-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--sys-on-background) 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>

      <div className="w-full max-w-sm p-8 bg-surface border border-outline/30 shadow-2xl rounded-3xl relative z-10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto]"></div>
        
        <div className="text-right mb-6">
          <h3 className="text-2xl font-bold text-on-surface mb-2">تسجيل الدخول</h3>
          <p className="text-xs text-on-surface-variant">أدخل بيانات حسابك للمتابعة</p>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/30 text-error text-sm p-3 rounded-xl mb-4 text-right">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-right w-full">
          <div>
            <label className="block text-[11px] font-bold mb-1.5 text-on-surface">البريد الإلكتروني</label>
            <div className="relative">
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-surface-variant/50 border border-outline-variant rounded-xl py-2.5 pr-10 pl-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-on-surface text-sm"
                placeholder="example@email.com"
                dir="ltr"
                required
              />
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold mb-1.5 text-on-surface">كلمة المرور</label>
            <div className="relative">
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-surface-variant/50 border border-outline-variant rounded-xl py-2.5 pr-10 pl-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-on-surface text-sm"
                placeholder="••••••"
                dir="ltr"
                required
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-on-primary py-3 rounded-xl text-sm font-bold hover:brightness-110 hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? 'جاري تسجيل الدخول...' : 'دخول'}
            <LogIn className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-4 text-center">
          <button onClick={() => { setMode('register'); setError(''); }} className="text-primary text-sm hover:underline">
            ليس لديك حساب؟ أنشئ حساب جديد
          </button>
        </div>
      </div>
    </div>
  );
};
