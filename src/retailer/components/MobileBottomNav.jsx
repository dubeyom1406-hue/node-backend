import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, Zap, Smartphone, FileText, Landmark } from 'lucide-react';
import { motion } from 'framer-motion';

const TABS = [
    { id: 'dashboard', label: 'Home', icon: LayoutGrid, path: '/dashboard' },
    { id: 'aeps_services', label: 'Banking', icon: Landmark, path: '/aeps' },
    { id: 'utility', label: 'Utility', icon: Zap, path: '/utility' },
    { id: 'all_services', label: 'Services', icon: Smartphone, path: '/all-services' },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/reports' },
];

export default function MobileBottomNav() {
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) => {
        if (path === '/dashboard') return location.pathname === '/dashboard';
        return location.pathname.startsWith(path);
    };

    return (
        <div
            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-100 shadow-[0_-4px_24px_rgba(0,0,0,0.04)]"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
            <div className="flex items-center justify-around px-2 pt-3 pb-3">
                {TABS.map(tab => {
                    const active = isActive(tab.path);
                    const Icon = tab.icon;
                    return (
                        <motion.button
                            key={tab.id}
                            onClick={() => navigate(tab.path)}
                            whileTap={{ scale: 0.9 }}
                            className="flex flex-col items-center justify-center gap-1.5 flex-1 relative"
                        >
                            <div
                                className={`flex items-center justify-center w-12 h-8 rounded-2xl transition-all duration-300
                                ${active ? 'bg-blue-50 shadow-sm border border-blue-100' : 'bg-transparent'}`}
                            >
                                <Icon
                                    size={20}
                                    strokeWidth={active ? 2.5 : 2}
                                    className={`${active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                                />
                            </div>
                            <span
                                className={`text-[9px] font-black uppercase tracking-widest transition-colors
                                ${active ? 'text-slate-800' : 'text-slate-400'}`}
                            >
                                {tab.label}
                            </span>
                            {active && (
                                <motion.div
                                    layoutId="bottomNavIndicator"
                                    className="absolute -top-3 w-8 h-1 rounded-full bg-blue-500 shadow-lg shadow-blue-500/20"
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
