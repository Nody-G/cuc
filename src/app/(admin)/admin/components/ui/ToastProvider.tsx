'use client';

import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { cx } from './primitives';

/**
 * Système de notifications unifié du Cockpit.
 *
 * Remplace les appels dispersés à `showToast(msg)` par une API typée
 * (`toast.success`, `toast.error`, `toast.info`, `toast.warning`) tout en
 * conservant la compatibilité avec la signature historique `(msg: string)`.
 */

export type ToastTone = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    message: string;
    tone: ToastTone;
    /** Durée d'affichage en ms (0 = persistant). */
    duration: number;
}

interface ToastContextValue {
    toasts: Toast[];
    push: (message: string, tone?: ToastTone, duration?: number) => string;
    dismiss: (id: string) => void;
    clear: () => void;
    /** Compatibilité avec l'ancienne API `showToast(msg)`. */
    showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_STYLES: Record<ToastTone, { border: string; icon: React.ReactNode }> = {
    success: {
        border: 'border-emerald-500/40',
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    },
    error: {
        border: 'border-red-500/40',
        icon: <XCircle className="w-4 h-4 text-red-400 shrink-0" />,
    },
    warning: {
        border: 'border-amber-500/40',
        icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
    },
    info: {
        border: 'border-[#FFE500]/40',
        icon: <Info className="w-4 h-4 text-[#FFE500] shrink-0" />,
    },
};

export interface ToastProviderProps {
    children: React.ReactNode;
    /** Nombre maximum de notifications empilées. */
    max?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
    children,
    max = 4,
}) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    const dismiss = useCallback((id: string) => {
        const timer = timers.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timers.current.delete(id);
        }
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const push = useCallback(
        (message: string, tone: ToastTone = 'info', duration = 4000): string => {
            const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
            setToasts((prev) => {
                const next = [...prev, { id, message, tone, duration }];
                // Évince les plus anciennes au-delà de la limite.
                return next.length > max ? next.slice(next.length - max) : next;
            });
            if (duration > 0) {
                const timer = setTimeout(() => dismiss(id), duration);
                timers.current.set(id, timer);
            }
            return id;
        },
        [dismiss, max],
    );

    const clear = useCallback(() => {
        timers.current.forEach((t) => clearTimeout(t));
        timers.current.clear();
        setToasts([]);
    }, []);

    const showToast = useCallback(
        (message: string) => {
            // Détection heuristique du ton à partir du message historique.
            const lower = message.toLowerCase();
            const tone: ToastTone =
                lower.includes('échec') ||
                    lower.includes('erreur') ||
                    lower.includes('impossible')
                    ? 'error'
                    : lower.includes('attention') || lower.includes('avertissement')
                        ? 'warning'
                        : 'success';
            push(message, tone);
        },
        [push],
    );

    const value = useMemo<ToastContextValue>(
        () => ({ toasts, push, dismiss, clear, showToast }),
        [toasts, push, dismiss, clear, showToast],
    );

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div
                className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 w-[min(92vw,22rem)] pointer-events-none"
                role="region"
                aria-label="Notifications"
                aria-live="polite"
            >
                <AnimatePresence initial={false}>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            layout
                            initial={{ opacity: 0, y: 16, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 24, scale: 0.97 }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                            className={cx(
                                'pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl',
                                'bg-[#0D0D12]/95 backdrop-blur-md border shadow-2xl shadow-black/50',
                                TONE_STYLES[toast.tone].border,
                            )}
                        >
                            {TONE_STYLES[toast.tone].icon}
                            <p className="flex-1 text-xs text-gray-200 leading-relaxed">
                                {toast.message}
                            </p>
                            <button
                                type="button"
                                onClick={() => dismiss(toast.id)}
                                aria-label="Fermer la notification"
                                className="text-gray-500 hover:text-white transition-colors shrink-0"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

/**
 * Accès au système de notifications.
 * Doit être utilisé sous un `<ToastProvider>`.
 */
export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error('useToast doit être utilisé à l\'intérieur d\'un <ToastProvider>.');
    }
    return ctx;
}
