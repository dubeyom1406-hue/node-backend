import React, { useState, useEffect, useRef } from 'react';
import { Search, Monitor, Plus, Users, Bell, Menu, LogOut, ChevronDown, Wallet, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sharedDataService } from '../../services/sharedDataService';

const DistributorTopBar = ({ onMenuClick }) => {
    const navigate = useNavigate();
    const [dist, setDist] = useState(null);
    const [showProfile, setShowProfile] = useState(false);
    const [showNotif, setShowNotif] = useState(false);
    const profileRef = useRef(null);
    const notifRef = useRef(null);

    const loadDist = () => {
        const session = sharedDataService.getCurrentDistributor();
        if (!session) return;
        const fresh = sharedDataService.getDistributorById(session.id) || session;
        setDist(fresh);
    };

    useEffect(() => {
        loadDist();
        window.addEventListener('distributorDataUpdated', loadDist);
        return () => window.removeEventListener('distributorDataUpdated', loadDist);
    }, []);

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = () => {
        sharedDataService.logout();
        navigate('/');
    };

    const initials = (dist?.name || 'D').charAt(0).toUpperCase();
    const walletBal = dist?.wallet?.balance || '0.00';
    const distName = dist?.name || 'Distributor';

    const notifications = [
        { msg: 'New retailer registration pending approval', time: '2 min ago', dot: 'bg-amber-400' },
        { msg: 'Wallet credited ₹10,000 by admin', time: '1 hr ago', dot: 'bg-emerald-400' },
        { msg: 'Commission report for Jan is ready', time: '3 hr ago', dot: 'bg-blue-400' },
    ];

    return (
        <header className="h-16 bg-white border-b border-slate-100 shadow-sm flex items-center justify-between px-4 md:px-6 shrink-0 z-40">

            {/* Left */}
            <div className="flex items-center gap-3">
                <button onClick={onMenuClick}
                    className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                    <Menu size={20} />
                </button>

            </div>

            {/* Right */}
            <div className="flex items-center gap-2">



                {/* Wallet Chip */}
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <Wallet size={13} className="text-amber-500" />
                    <div className="text-right hidden sm:block">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-tight leading-none">Wallet</p>
                        <p className="text-[11px] font-black text-amber-600 mt-0.5">₹ {walletBal}</p>
                    </div>
                    <button onClick={() => navigate('/distributor/transactions/add-money')}
                        className="bg-amber-500 hover:bg-amber-400 text-white rounded-lg p-1.5 transition-all shadow-sm shadow-amber-500/30">
                        <Plus size={13} />
                    </button>
                </div>

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                    <button onClick={() => setShowNotif(v => !v)}
                        className="relative p-2 rounded-xl text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-all">
                        <Bell size={18} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                    </button>
                    {showNotif && (
                        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                            <div className="px-4 py-3 border-b border-slate-50 flex justify-between items-center">
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Notifications</p>
                                <span className="text-[8px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full">{notifications.length} NEW</span>
                            </div>
                            {notifications.map((n, i) => (
                                <div key={i} className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 flex items-start gap-3 cursor-pointer transition-colors">
                                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.dot}`} />
                                    <div>
                                        <p className="text-xs font-bold text-slate-700 leading-snug">{n.msg}</p>
                                        <p className="text-[9px] text-slate-400 font-bold mt-0.5">{n.time}</p>
                                    </div>
                                </div>
                            ))}
                            <button className="w-full py-3 text-[9px] font-black text-amber-600 uppercase tracking-widest hover:bg-amber-50 transition-colors">
                                View All
                            </button>
                        </div>
                    )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                    <button onClick={() => setShowProfile(v => !v)}
                        className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-[11px] font-black shadow-md shadow-amber-500/30">
                            {initials}
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-[10px] font-black text-slate-800 leading-none uppercase tracking-tight max-w-[100px] truncate">{distName}</p>
                            <p className="text-[8px] font-bold text-emerald-500 mt-0.5 uppercase tracking-widest">● Online</p>
                        </div>
                        <ChevronDown size={12} className={`text-slate-400 transition-transform hidden md:block ${showProfile ? 'rotate-180' : ''}`} />
                    </button>

                    {showProfile && (
                        <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-b border-amber-100">
                                <p className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{distName}</p>
                                <p className="text-[9px] font-bold text-slate-400 mt-0.5">{dist?.id}</p>
                                <p className="text-[9px] font-bold text-amber-600 mt-1">Wallet: ₹ {walletBal}</p>
                            </div>
                            <button onClick={() => { setShowProfile(false); navigate('/distributor'); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black text-slate-600 hover:bg-slate-50 hover:text-amber-600 transition-colors uppercase tracking-wider">
                                <User size={14} /> My Profile
                            </button>
                            <button onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black text-red-500 hover:bg-red-50 transition-colors uppercase tracking-wider border-t border-slate-50">
                                <LogOut size={14} /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default DistributorTopBar;
