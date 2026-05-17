import React, { useState } from 'react';
import { User, Shield, Lock } from 'lucide-react';

interface AuthViewProps {
  onLogin: (name: string, level: string) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName.trim() && lastName.trim()) {
      onLogin(`${firstName.trim()} ${lastName.trim()}`, 'متدرب');
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">الاسم الأول</label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-background border border-on-background/20 py-3 pr-10 pl-4 focus:outline-none focus:border-primary transition-colors"
                  placeholder="الاسم الأول..."
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">الاسم الأخير</label>
              <div className="relative">
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-background border border-on-background/20 py-3 px-4 focus:outline-none focus:border-primary transition-colors"
                  placeholder="الاسم الأخير..."
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-on-background text-background py-4 uppercase text-[11px] tracking-[0.2em] font-bold hover:bg-primary transition-colors mt-4 flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            بدء الجلسة
          </button>
        </form>
      </div>
    </div>
  );
};
