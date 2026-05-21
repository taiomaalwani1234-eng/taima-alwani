import React from 'react';
import { Hand } from 'lucide-react';

interface TutorialOverlayProps {
  message: string;
  onDismiss: () => void;
  position?: 'center' | 'bottom' | 'top';
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ message, onDismiss, position = 'bottom' }) => {
  return (
    <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden h-full flex flex-col justify-end p-8">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto" onClick={onDismiss} />
      
      <div className={`relative z-50 text-right pointer-events-auto flex items-center justify-end gap-4 animate-in slide-in-from-bottom-8 duration-500 fade-in ${position === 'center' ? 'm-auto' : 'mb-8 mx-auto w-full max-w-4xl'}`}>
        <div className="bg-surface border-2 border-primary/50 shadow-2xl rounded-2xl p-6 max-w-lg">
          <h3 className="font-bold text-primary mb-2 text-lg">💡 إرشادات اللعب</h3>
          <p className="text-on-surface leading-relaxed">{message}</p>
          <button 
            onClick={onDismiss}
            className="mt-4 px-6 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary hover:text-white transition-colors"
          >
            حسناً، فهمت
          </button>
        </div>
        
        <div className="animate-bounce">
          <Hand className="w-16 h-16 text-primary rotate-[-45deg] drop-shadow-lg filter" fill="currentColor" opacity={0.8} />
        </div>
      </div>
    </div>
  );
};
