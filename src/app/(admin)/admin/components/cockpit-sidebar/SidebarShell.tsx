import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cx } from '../ui';

export interface SidebarShellProps {
    isRail: boolean;
    isMobileOpen: boolean;
    onCloseMobile: () => void;
    children: React.ReactNode;
}

export const SidebarShell: React.FC<SidebarShellProps> = ({
    isRail,
    isMobileOpen,
    onCloseMobile,
    children,
}) => (
    <>
        {/* Sidebar desktop (repliable en rail via Ctrl/Cmd+B) */}
        <aside
            className={cx(
                'hidden md:flex bg-[#0D0D12] border-r border-white/10 flex-col shrink-0 transition-[width] duration-200 overflow-hidden',
                isRail ? 'w-0 border-r-0' : 'w-64',
            )}
            aria-hidden={isRail}
        >
            {children}
        </aside>

        {/* Tiroir mobile */}
        <AnimatePresence>
            {isMobileOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={onCloseMobile}
                        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
                        aria-hidden="true"
                    />
                    <motion.aside
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#0D0D12] border-r border-white/10 flex flex-col md:hidden"
                        role="dialog"
                        aria-label="Menu du Cockpit"
                    >
                        {children}
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    </>
);
