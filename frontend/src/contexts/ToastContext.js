import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const toast = {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
    info: (message, duration) => addToast(message, 'info', duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function Toast({ toast, onRemove }) {
  const { id, message, type } = toast;

  const typeStyles = {
    success: {
      bg: 'bg-green-500/90 dark:bg-green-600/90',
      icon: '✓',
      border: 'border-green-600 dark:border-green-500',
    },
    error: {
      bg: 'bg-red-500/90 dark:bg-red-600/90',
      icon: '✕',
      border: 'border-red-600 dark:border-red-500',
    },
    warning: {
      bg: 'bg-yellow-500/90 dark:bg-yellow-600/90',
      icon: '⚠',
      border: 'border-yellow-600 dark:border-yellow-500',
    },
    info: {
      bg: 'bg-blue-500/90 dark:bg-blue-600/90',
      icon: 'ℹ',
      border: 'border-blue-600 dark:border-blue-500',
    },
  };

  const style = typeStyles[type] || typeStyles.info;

  return (
    <div
      className={`
        ${style.bg} ${style.border}
        backdrop-blur-sm
        text-white
        px-4 py-3
        rounded-xl
        shadow-lg
        border-2
        flex items-start gap-3
        animate-in slide-in-from-right duration-300
        min-w-[320px]
      `}
    >
      {/* Icon */}
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
        {style.icon}
      </div>

      {/* Message */}
      <p className="flex-1 text-sm font-medium leading-relaxed">
        {message}
      </p>

      {/* Close Button */}
      <button
        onClick={() => onRemove(id)}
        className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
