import React, { useEffect, useState, useCallback } from 'react';

type ToastType = 'info' | 'success' | 'error' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showTimer = requestAnimationFrame(() => setVisible(true));
    const hideTimer = setTimeout(() => setVisible(false), 2700);
    const closeTimer = setTimeout(onClose, 3000);
    return () => {
      cancelAnimationFrame(showTimer);
      clearTimeout(hideTimer);
      clearTimeout(closeTimer);
    };
  }, [onClose]);

  const colorMap: Record<ToastType, string> = {
    info: 'bg-surface-container border-outline-variant/40 text-on-surface',
    success: 'bg-primary/10 border-primary/50 text-primary',
    error: 'bg-error/10 border-error/50 text-error',
    warning: 'bg-secondary/10 border-secondary/50 text-secondary',
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed top-20 left-1/2 z-[9999] px-5 py-3 rounded-xl border shadow-lg font-mono text-sm backdrop-blur-md transition-all duration-300 pointer-events-none ${colorMap[type]} ${visible ? 'opacity-100 -translate-x-1/2' : 'opacity-0 -translate-x-1/2 -translate-y-2'}`}
    >
      {message}
    </div>
  );
};

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const show = useCallback((message: string, type: ToastType = 'info') => setToast({ message, type }), []);
  const hide = useCallback(() => setToast(null), []);
  return { toast, show, hide };
}
