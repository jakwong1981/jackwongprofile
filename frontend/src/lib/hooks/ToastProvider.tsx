// frontend/src/lib/hooks/ToastProvider.tsx
'use client';

import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils/cn';

/** Visual tone of a toast. */
export type ToastTone = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
}

type ToastAction =
  | { type: 'push'; toast: Toast }
  | { type: 'dismiss'; id: number };

function reducer(state: Toast[], action: ToastAction): Toast[] {
  switch (action.type) {
    case 'push':
      // Cap the stack so a runaway loop cannot bury the interface.
      return [...state, action.toast].slice(-4);
    case 'dismiss':
      return state.filter((toast) => toast.id !== action.id);
    default:
      return state;
  }
}

interface ToastContextValue {
  notify: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 3200;

/**
 * Lightweight toast host built on `useReducer` — no external state library, as required
 * by the project constraints.
 */
export function ToastProvider({ children }: { children: ReactNode }): JSX.Element {
  const [toasts, dispatch] = useReducer(reducer, []);

  const notify = useCallback((message: string, tone: ToastTone = 'info'): void => {
    dispatch({ type: 'push', toast: { id: Date.now() + Math.random(), tone, message } });
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:items-end sm:px-6"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => dispatch({ type: 'dismiss', id: toast.id })} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }): JSX.Element {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  const Icon = toast.tone === 'success' ? CheckCircle2 : toast.tone === 'error' ? TriangleAlert : Info;

  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto flex w-full max-w-sm animate-fade-in-up items-start gap-3 rounded-2xl border px-4 py-3 shadow-panel backdrop-blur-glass',
        toast.tone === 'success' && 'border-emerald-200/70 bg-emerald-50/90 text-emerald-900',
        toast.tone === 'error' && 'border-red-200/70 bg-red-50/90 text-red-900',
        toast.tone === 'info' && 'border-ink-200/70 bg-white/90 text-ink-800',
      )}
    >
      <Icon aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="flex-1 text-sm leading-relaxed">{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded-md p-0.5 text-current/60 transition hover:text-current"
        aria-label="Close notification"
      >
        <X aria-hidden className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * @returns the `notify` function for raising toasts
 * @throws Error when used outside {@link ToastProvider}
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (context === null) {
    throw new Error('useToast must be used inside a ToastProvider');
  }
  return context;
}
