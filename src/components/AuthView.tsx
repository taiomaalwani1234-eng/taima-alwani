import React, { useState } from 'react';
import { User, Shield, Lock } from 'lucide-react';

interface AuthViewProps {
  onLogin: (name: string, level: string) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showSplash, setShowSplash] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName.trim() && lastName.trim()) {
      onLogin(`${firstName.trim()} ${lastName.trim()}`, 'متدرب');
    }
  };

  if (showSplash) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-background text-on-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--sys-on-background) 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="flex flex-col items-center relative z-10 p-8">
          <img 
            src="/logo.png" 
            alt="Secure City Logo" 
            className="w-64 h-64 md:w-80 md:h-80 object-contain drop-shadow-2xl animate-pulse"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              document.getElementById('fallback-icon')?.classList.remove('hidden');
            }}
          />
          <div id="fallback-icon" className="hidden w-64 h-64 md:w-80 md:h-80 bg-surface-variant rounded-full flex flex-col justify-center items-center shadow-xl border-2 border-primary/20 animate-pulse mb-8">
            <Shield className="w-32 h-32 text-primary" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-2 mt-4 tracking-tight drop-shadow-sm font-serif">
            SecureCity
          </h1>
          <p className="text-xl md:text-2xl text-on-surface-variant mb-12 uppercase tracking-widest font-bold">
            مركز القيادة والدفاع السيبراني
          </p>

          <button
            onClick={() => setShowSplash(false)}
            className="bg-primary hover:bg-secondary text-on-primary px-16 py-4 rounded-full text-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(var(--sys-primary),0.5)] flex items-center gap-3"
          >
            ابدأ
            <Lock className="w-6 h-6" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-background text-on-background relative overflow-hidden">
      {/* Decorative patterns */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--sys-on-background) 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>

      {/* Login Form Section */}
      <div className="w-full flex flex-col items-center justify-center p-8 lg:p-16 relative z-10 shrink-0">
        <div className="w-full max-w-sm p-10 bg-surface border border-outline/30 shadow-2xl rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient"></div>
          
          <div className="text-right mb-8">
            <h3 className="text-2xl font-bold text-on-surface mb-2">تسجيل الدخول</h3>
            <p className="text-xs text-on-surface-variant">الرجاء إدخال بيانات الهوية لفتح وحدة التحكم.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-right w-full">
            <div>
              <label className="block text-[11px] font-bold mb-2 text-on-surface">الاسم الأول</label>
              <div className="relative">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-surface-variant/50 border border-outline-variant rounded-xl py-3 pr-10 pl-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-on-surface"
                  placeholder="أدخل اسمك..."
                  required
                />
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              </div>
            </div>
            
            <div>
              <label className="block text-[11px] font-bold mb-2 text-on-surface">الاسم الأخير</label>
              <div className="relative">
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-surface-variant/50 border border-outline-variant rounded-xl py-3 pr-4 pl-4 text-right focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-on-surface"
                  placeholder="أدخل الكنية..."
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-on-primary py-4 rounded-xl text-sm font-bold hover:brightness-110 hover:shadow-lg transition-all mt-4 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              بدء المهمة
              <Lock className="w-4 h-4 ml-2" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
