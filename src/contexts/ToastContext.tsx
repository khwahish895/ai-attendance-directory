import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (title: string, description?: string, type?: ToastType) => void;
  success: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((title: string, description?: string, type: ToastType = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastMessage = { id, title, description, type };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const success = useCallback((title: string, description?: string) => showToast(title, description, 'success'), [showToast]);
  const warning = useCallback((title: string, description?: string) => showToast(title, description, 'warning'), [showToast]);
  const error = useCallback((title: string, description?: string) => showToast(title, description, 'error'), [showToast]);
  const info = useCallback((title: string, description?: string) => showToast(title, description, 'info'), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, warning, error, info }}>
      {children}
      {/* Toast Overlay Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4">
        {toasts.map(toast => {
          let borderClass = 'border-purple-500/30';
          let icon = <Info className="w-5 h-5 text-indigo-400 shrink-0" />;
          let bgGlow = 'rgba(110, 99, 255, 0.15)';

          if (toast.type === 'success') {
            borderClass = 'border-emerald-500/40 bg-emerald-950/80';
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
            bgGlow = 'rgba(16, 185, 129, 0.2)';
          } else if (toast.type === 'warning') {
            borderClass = 'border-amber-500/40 bg-amber-950/80';
            icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
            bgGlow = 'rgba(245, 158, 11, 0.2)';
          } else if (toast.type === 'error') {
            borderClass = 'border-rose-500/40 bg-rose-950/80';
            icon = <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
            bgGlow = 'rgba(244, 63, 94, 0.2)';
          } else {
            borderClass = 'border-indigo-500/40 bg-[#0B1035]/90';
          }

          return (
            <div
              key={toast.id}
              style={{ boxShadow: `0 8px 30px ${bgGlow}` }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl transition-all duration-300 transform translate-y-0 text-white ${borderClass}`}
            >
              {icon}
              <div className="flex-1 text-sm">
                <div className="font-semibold tracking-tight">{toast.title}</div>
                {toast.description && (
                  <div className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.description}</div>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
