import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import SuperAdminSidebar from './SuperAdminSidebar';
import SuperAdminTopBar from './SuperAdminTopBar';
import { sharedDataService } from '../../services/sharedDataService';
import { useAuth } from '../../context/AuthContext';
import { Lock, Shield } from 'lucide-react';

const SuperAdminLayout = () => {
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const navigate = useNavigate();
    const { lockTimeLeft, logoutTimeLeft } = useAuth();

    const formatTime = (ms) => {
        const totalSecs = Math.floor(ms / 1000);
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        // Guard: if no active session, send to login
        const session = sharedDataService.getCurrentSuperAdmin();
        if (!session) {
            navigate('/', { replace: true });
            return;
        }
        // Ensure we always read the freshest data from localStorage
        const fresh = sharedDataService.getSuperAdminById(session.id);
        if (fresh) {
            sharedDataService.setCurrentSuperAdmin(fresh);
        }
    }, [navigate]);

    return (
        <div className="flex h-screen bg-[#f0f4ff] overflow-hidden font-['Inter',sans-serif]">
            <SuperAdminSidebar
                showMobile={showMobileSidebar}
                onClose={() => setShowMobileSidebar(false)}
            />

            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                <SuperAdminTopBar onMenuClick={() => setShowMobileSidebar(v => !v)} />

                {/* Security Session Monitor */}
                <div className="bg-[#0f172a] text-white h-9 flex items-center px-6 shrink-0 border-b border-white/5">
                    <div className="flex items-center gap-6 w-full max-w-7xl mx-auto">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.3)]"></div>
                            <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Master Auth Lock</span>
                            <span className="text-[11px] font-black text-white font-mono bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/5">{formatTime(lockTimeLeft)}</span>
                        </div>
                        <div className="h-4 w-px bg-white/10"></div>
                        <div className="flex items-center gap-2">
                            <Lock size={12} className="text-slate-400" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Portal Expiry</span>
                            <span className="text-[11px] font-black text-slate-300 font-mono italic">{formatTime(logoutTimeLeft)}</span>
                        </div>
                        <div className="flex-1 flex justify-end items-center gap-4">
                            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full px-3 py-0.5 text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                <Shield size={10} /> Root Proxy Secure
                            </span>
                            <span className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] hidden sm:block">SuperAdmin Node v1.0</span>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white border-b border-slate-100 px-4 flex items-center gap-1 shrink-0 overflow-x-auto shadow-sm">
                    {[
                        { to: '/superadmin', label: 'Dashboard', end: true },
                        { to: '/superadmin/distributors', label: 'Distributors' },
                        { to: '/superadmin/retailers', label: 'Retailers' },
                        { to: '/superadmin/transactions', label: 'Transactions' },
                        { to: '/superadmin/reports', label: 'Reports' },
                        { to: '/superadmin/accounts', label: 'Accounts' },
                    ].map(({ to, label, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) =>
                                `px-4 py-3 text-[10px] font-black uppercase tracking-wider whitespace-nowrap border-b-2 transition-all
                                ${isActive
                                    ? 'border-amber-500 text-amber-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`
                            }
                        >
                            {label}
                        </NavLink>
                    ))}
                </div>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default SuperAdminLayout;
