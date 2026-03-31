import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/rupiksha_logo.png';
import { dataService } from '../../services/dataService';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet, Filter, Send, Settings, ShieldCheck, 
    TrendingUp, Activity, Smartphone, CreditCard, 
    ArrowUpRight, Landmark, Zap, LayoutGrid, X
} from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip
} from 'recharts';

/* ─── Premium Components ─────────────────────────────────────────── */

const Badge = ({ children, color = 'emerald' }) => {
    const map = {
        amber: 'bg-amber-100 text-amber-600 border-amber-200',
        emerald: 'bg-emerald-100 text-emerald-600 border-emerald-200',
        blue: 'bg-blue-100 text-blue-600 border-blue-200',
        rose: 'bg-rose-100 text-rose-600 border-rose-200',
    };
    return (
        <span className={`inline-flex items-center gap-1.5 text-[9px] font-black px-2.5 py-1 rounded-full border uppercase tracking-widest ${map[color]}`}>
            <span className={`w-1 h-1 rounded-full animate-pulse ${color === 'amber' ? 'bg-amber-500' : color === 'emerald' ? 'bg-emerald-500' : color === 'blue' ? 'bg-blue-500' : 'bg-rose-500'}`} />
            {children}
        </span>
    );
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-2xl backdrop-blur-xl">
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-2">{label}</p>
                {payload.map((p, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                        <span className="text-slate-800 font-black text-sm tracking-tighter">₹{p.value?.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const ServiceItem = ({ label, emoji, color, onClick }) => (
    <motion.div 
        whileHover={{ y: -5, scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="group flex flex-col items-center gap-3 cursor-pointer"
    >
        <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center text-3xl shadow-xl transition-all duration-300 bg-gradient-to-br ${color} group-hover:shadow-blue-500/20`}>
            <span className="drop-shadow-sm">{emoji}</span>
        </div>
        <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-800 text-center uppercase tracking-tight leading-tight transition-colors">
            {label}
        </span>
    </motion.div>
);

const NewsCarousel = ({ banners = [], showDots = true }) => {
    const defaultBanners = [logo];
    const displayBanners = banners.length > 0 ? banners.map(b => b.image || b) : defaultBanners;
    const [idx, setIdx] = useState(0);

    useEffect(() => {
        if (displayBanners.length <= 1) return;
        const id = setInterval(() => {
            setIdx(p => (p + 1) % displayBanners.length);
        }, 6000);
        return () => clearInterval(id);
    }, [displayBanners.length]);

    return (
        <div className="relative w-full h-[180px] md:h-[260px] lg:h-[300px] overflow-hidden rounded-[48px] shadow-sm border border-slate-100 bg-gradient-to-br from-white to-blue-50 group">
            <AnimatePresence mode="wait">
                <motion.div 
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="w-full h-full flex items-center justify-center p-12"
                >
                    <img 
                        src={displayBanners[idx]}
                        className="max-w-full max-h-full object-contain drop-shadow-2xl transition-transform duration-[2000ms] group-hover:scale-105"
                        alt="Rupiksha Poster"
                    />
                    <div className="absolute inset-0 shadow-[inner_0_2px_15px_rgba(0,0,0,0.02)] pointer-events-none" />
                </motion.div>
            </AnimatePresence>
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            
            {/* Dots */}
            {showDots && displayBanners.length > 1 && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                    {displayBanners.map((_, i) => (
                        <div 
                            key={i} 
                            onClick={() => setIdx(i)}
                            className={`h-1.5 rounded-full transition-all duration-700 cursor-pointer ${i === idx ? 'w-10 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'}`} 
                        />
                    ))}
                </div>
            )}
            <div className="absolute top-8 left-10">
                <Badge color="amber">News Blast</Badge>
            </div>
        </div>
    );
};

/* ─── Main Dashboard ────────────────────────────────────────────── */

const RetailerDashboard = () => {
    const navigate = useNavigate();
    const [appData, setAppData] = useState(dataService.getData());
    const [activeWallet, setActiveWallet] = useState(null);
    const [balance, setBalance] = useState("0.00");
    const [transactions, setTransactions] = useState([]);
    const [isServicesExpanded, setIsServicesExpanded] = useState(false);
    const currentUser = appData.currentUser;

    useEffect(() => {
        if (!currentUser) navigate('/');
        
        const fetchData = async () => {
            if (currentUser) {
                const bal = await dataService.getWalletBalance(currentUser.id);
                setBalance(bal);
                const txs = await dataService.getUserTransactions(currentUser.id);
                setTransactions(txs || []);
            }
        };
        fetchData();
    }, [currentUser, navigate]);

    const [selectedPeriod, setSelectedPeriod] = useState('Weekly');
    const [stats, setStats] = useState({
        totalCount: 0,
        totalVolume: 0,
        aepsVolume: 0,
        breakdown: []
    });

    useEffect(() => {
        if (transactions.length > 0) {
            const now = new Date();
            const filtered = transactions.filter(tx => {
                const txDate = new Date(tx.created_at);
                if (selectedPeriod === 'Daily') {
                    return txDate.toDateString() === now.toDateString();
                } else if (selectedPeriod === 'Weekly') {
                    const weekAgo = new Date();
                    weekAgo.setDate(now.getDate() - 7);
                    return txDate >= weekAgo;
                } else if (selectedPeriod === 'Monthly') {
                    return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
                }
                return true;
            });

            const totalCount = filtered.length;
            const totalVolume = filtered.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
            const aepsTxs = filtered.filter(tx => tx.service?.includes('AEPS'));
            const aepsVolume = aepsTxs.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

            const groups = filtered.reduce((acc, tx) => {
                let category = 'Others';
                const s = tx.service?.toUpperCase() || '';
                if (s.includes('AEPS')) category = 'AEPS Hub';
                else if (s.includes('UPI')) category = 'UPI Pay';
                else if (s.includes('DMT') || s.includes('MATM') || s.includes('PAYOUT')) category = 'Transfers';
                else if (s.includes('RECHARGE') || s.includes('BILL')) category = 'Utility';
                
                acc[category] = (acc[category] || 0) + parseFloat(tx.amount || 0);
                return acc;
            }, {});

            const breakdown = Object.entries(groups)
                .map(([name, val]) => ({
                    method: name,
                    value: totalVolume > 0 ? Math.round((val / totalVolume) * 100) : 0,
                    amount: val,
                    color: name === 'AEPS Hub' ? 'bg-blue-600' : 
                          name === 'UPI Pay' ? 'bg-emerald-500' : 
                          name === 'Transfers' ? 'bg-indigo-500' : 'bg-slate-300'
                }))
                .sort((a, b) => b.amount - a.amount);

            // Ensure AEPS is at top
            const aepsIdx = breakdown.findIndex(b => b.method === 'AEPS Hub');
            if (aepsIdx > 0) {
                const aeps = breakdown.splice(aepsIdx, 1)[0];
                breakdown.unshift(aeps);
            } else if (aepsIdx === -1 && totalCount > 0) {
                // If no AEPS but there are txs, still ensure consistency or handle empty
            }

            setStats({ totalCount, totalVolume, aepsVolume, breakdown });
        } else {
            setStats({ totalCount: 0, totalVolume: 0, aepsVolume: 0, breakdown: [] });
        }
    }, [transactions, selectedPeriod]);

    /* ── live chart data ── */
    const mkPoint = () => ({
        t: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        revenue: Math.floor(15000 + Math.random() * 25000)
    });
    const [liveData, setLiveData] = useState(Array.from({ length: 12 }, mkPoint));

    useEffect(() => {
        const id = setInterval(() => {
            setLiveData(prev => [...prev.slice(1), mkPoint()]);
        }, 5000);
        return () => clearInterval(id);
    }, []);

    const services = [
        { id: 'aeps', label: 'AEPS Hub', emoji: '🏦', color: 'from-blue-50 to-blue-100 border border-blue-200', path: '/aeps' },
        { id: 'dmt', label: 'Money Transfer', emoji: '💸', color: 'from-emerald-50 to-emerald-100 border border-emerald-200', path: '/dmt' },
        { id: 'matm', label: 'Micro ATM', emoji: '💳', color: 'from-orange-50 to-orange-100 border border-orange-200', path: '/matm' },
        { id: 'utility', label: 'Recharge', emoji: '📱', color: 'from-purple-50 to-purple-100 border border-purple-200', path: '/utility' },
        { id: 'bill', label: 'Bill Pay', emoji: '🧾', color: 'from-rose-50 to-rose-100 border border-rose-200', path: '/utility' },
        { id: 'payout', label: 'Payout', emoji: '🚀', color: 'from-sky-50 to-sky-100 border border-sky-200', path: '/payout' },
    ];

    return (
        <div className="min-h-screen bg-[#f7f9fc] p-2 md:p-6 lg:px-10 pb-20 overflow-x-hidden">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');`}</style>
            
            <div className="max-w-[1440px] mx-auto space-y-6">
                
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mt-4"
                >
                        {/* LEFT GREETING */}
                        <div className="space-y-0.5">
                        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 leading-tight">
                            Hi {currentUser?.name?.split(' ')[0] || currentUser?.businessName?.split(' ')[0] || 'User'}, <span className="text-slate-400">Have a great day!</span>
                        </h1>
                    </div>

                    {/* RIGHT WALLET CLUSTER - MOVED TO TOP HEADER */}
                    <div className="flex-1"></div>
                </motion.div>

                {/* News Bar: Admin Editable */}
                {appData?.news && (
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white border-y border-slate-100 py-3 flex items-center gap-4 px-10"
                    >
                        <div className="text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap" style={{ backgroundColor: 'var(--primary-color)' }}>
                            Bulletin
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <motion.p 
                                animate={{ x: [1000, -1000] }}
                                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                className="text-sm font-bold text-slate-600 whitespace-nowrap"
                            >
                                {appData.news}
                            </motion.p>
                        </div>
                    </motion.div>
                )}

                {/* News Carousel: Integrated between Header and Services */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className=""
                >
                    <NewsCarousel banners={appData?.promotions?.banners} />
                </motion.div>

                {/* Core Services: Now expands downwards rather than opening a modal */}
                <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white border border-slate-100 p-8 lg:p-12 rounded-[48px] shadow-sm relative z-10 overflow-hidden"
                >
                    <div className="flex justify-between items-center mb-6">
                        <div className="space-y-1 -mt-4 -ml-2">
                            <h3 className="text-xl font-black tracking-tight text-slate-800">Core Services</h3>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Integrated Financial Infrastructure</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest hidden sm:block">
                                {isServicesExpanded ? '12 Active Hubs' : '7 Active Hubs'}
                            </span>
                            <div className="h-4 w-[1px] bg-slate-100 hidden sm:block" />
                            <button 
                                onClick={() => setIsServicesExpanded(!isServicesExpanded)}
                                className="text-[9px] font-black uppercase tracking-widest hover:underline"
                                style={{ color: 'var(--primary-color)' }}
                            >
                                {isServicesExpanded ? 'Collapse View' : 'Full Catalog'}
                            </button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-4 md:grid-cols-7 lg:grid-cols-7 gap-6 md:gap-6">
                        {services.map((service, idx) => (
                            <ServiceItem 
                                key={idx} 
                                label={service.label} 
                                emoji={service.emoji} 
                                color={service.color} 
                                onClick={() => navigate(service.path)}
                            />
                        ))}
                        
                        {/* TOGGLE BUTTON: Now positioned relative to first row */}
                        <motion.div 
                            whileHover={{ y: -5, scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsServicesExpanded(!isServicesExpanded)}
                            className="group flex flex-col items-center gap-3 cursor-pointer"
                        >
                            <div className="w-16 h-16 rounded-[24px] flex items-center justify-center shadow-xl bg-white border border-slate-100 text-slate-800 transition-all duration-300" style={{ backgroundColor: isServicesExpanded ? 'var(--primary-color)' : undefined, color: isServicesExpanded ? '#fff' : undefined }}>
                                <motion.div animate={{ rotate: isServicesExpanded ? 180 : 0 }} className="grid grid-cols-3 gap-1">
                                    {[...Array(9)].map((_, i) => (
                                        <div key={i} className="w-1 h-1 rounded-full bg-current" />
                                    ))}
                                </motion.div>
                            </div>
                            <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-800 text-center uppercase tracking-tight leading-tight transition-colors">
                                {isServicesExpanded ? 'See Less' : 'All Services'}
                            </span>
                        </motion.div>
                    </div>

                    {/* SMOOTH EXPANSION AREA */}
                    <AnimatePresence transition={{ duration: 0.5 }}>
                        {isServicesExpanded && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
                                className="overflow-hidden"
                            >
                                <div className="grid grid-cols-4 md:grid-cols-7 lg:grid-cols-7 gap-6 md:gap-6 pt-8 border-t border-slate-50 mt-8">
                                    {[
                                        { id: 'cms', label: 'CMS Hub', emoji: '🏢', color: 'from-cyan-50 to-cyan-100 border border-cyan-200', path: '/cms' },
                                        { id: 'travel', label: 'Travel Hub', emoji: '✈️', color: 'from-amber-50 to-amber-100 border border-amber-200', path: '/travel' },
                                        { id: 'loans', label: 'Loan Segment', emoji: '💰', color: 'from-indigo-50 to-indigo-100 border border-indigo-200', path: '/loans' },
                                        { id: 'plans', label: 'My Plans', emoji: '🏷️', color: 'from-pink-50 to-pink-100 border border-pink-200', path: '/plans' },
                                        { id: 'reports', label: 'Sale Reports', emoji: '📊', color: 'from-slate-50 to-slate-100 border border-slate-200', path: '/reports/sale-report' },
                                        { id: 'add-money', label: 'Add Money', emoji: '📥', color: 'from-emerald-50 to-emerald-100 border border-emerald-200', path: '/add-money' },
                                        { id: 'ledger', label: 'Ledger', emoji: '📓', color: 'from-slate-50 to-slate-100 border border-slate-200', path: '/reports/consolidated-ledger' },
                                        { id: 'audit', label: 'Audit Log', emoji: '📝', color: 'from-slate-50 to-slate-100 border border-slate-200', path: '/reports/audit-report' },
                                        { id: 'profile', label: 'My Account', emoji: '👤', color: 'from-slate-50 to-slate-100 border border-slate-200', path: '/profile' },
                                        { id: 'wallet-h', label: 'Wallet Feed', emoji: '👛', color: 'from-blue-50 to-blue-100 border border-blue-200', path: '/reports' },
                                        { id: 'matm-p', label: 'MATM Mini', emoji: '📠', color: 'from-orange-50 to-orange-100 border border-orange-200', path: '/matm' },
                                        { id: 'support', label: 'Support', emoji: '🎧', color: 'from-rose-50 to-rose-100 border border-rose-200', path: '/profile' },
                                        { id: 'kyc', label: 'KYC Center', emoji: '🆔', color: 'from-emerald-50 to-emerald-100 border border-emerald-200', path: '/kyc-verification' },
                                    ].map((service, idx) => (
                                        <ServiceItem 
                                            key={`expanded-${idx}`} 
                                            label={service.label} 
                                            emoji={service.emoji} 
                                            color={service.color} 
                                            onClick={() => navigate(service.path)}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Main Content Grid: Restored full-width alignment */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* LEFT PANEL: Trends & Recent Activity */}
                    <div className="lg:col-span-8 space-y-10">

                        {/* Transaction Trend Chart */}
                        <div className="bg-white border border-slate-100 p-8 rounded-[48px] shadow-sm">
                            <div className="flex justify-between items-center mb-8">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black tracking-tight text-slate-800">Volume Trend</h3>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">{selectedPeriod} Performance Analysis</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Revenue</span>
                                </div>
                            </div>
                            <div className="h-[220px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart 
                                        data={transactions.length > 0 ? transactions.slice(0, 15).reverse().map(t => ({
                                            t: new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                            v: parseFloat(t.amount || 0)
                                        })) : liveData}
                                    >
                                        <defs>
                                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="t" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800, fill: '#94a3b8' }} />
                                        <YAxis hide />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Recent Transactions List */}
                        <div className="bg-white border border-slate-100 p-8 rounded-[48px] shadow-sm">
                            <div className="flex justify-between items-center mb-8">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black tracking-tight text-slate-800">Recent Transactions</h3>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Live Feed from Web Terminal</p>
                                </div>
                                <Badge color="blue">Live Feed</Badge>
                            </div>

                            <div className="space-y-4">
                                {transactions.length > 0 ? transactions.slice(0, 8).map((tx, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-3xl transition-colors border border-transparent hover:border-slate-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-lg">
                                                {tx.service?.includes('AEPS') ? '🏦' : tx.service?.includes('RECHARGE') ? '📱' : '💸'}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-800 uppercase tracking-tight">
                                                    {tx.service?.replace(/_/g, ' ')} 
                                                    <span className="ml-2 text-blue-600 opacity-60">#{tx.number || tx.operator || tx.id?.toString().slice(-4)}</span>
                                                </p>
                                                <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">{new Date(tx.created_at).toLocaleDateString()} • {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black tracking-tighter text-slate-800">₹{parseFloat(tx.amount || 0).toLocaleString('en-IN')}</p>
                                            <span className={`text-[8px] font-black uppercase tracking-widest ${tx.status === 'SUCCESS' ? 'text-emerald-500' : 'text-rose-500'}`}>{tx.status}</span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                                        <Activity size={32} className="mb-4 opacity-20" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">No Recent Activity</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: Transactions & Payments */}
                    <div className="lg:col-span-4 space-y-10">
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white border border-slate-100 p-8 rounded-[48px] shadow-xl shadow-slate-200/50 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-50 rounded-full blur-[80px] opacity-50 transition-transform group-hover:scale-125 duration-700" />
                            
                            <div className="relative z-10">
                                <div className="flex flex-col gap-6 mb-8">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black tracking-tight text-slate-800">Transactions</h3>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Financial Overview</p>
                                    </div>
                                    <div className="flex gap-1 p-1 bg-slate-50 rounded-xl border border-slate-100 self-start">
                                        {['Daily', 'Weekly', 'Monthly'].map((period) => (
                                            <button 
                                                key={period} 
                                                onClick={() => setSelectedPeriod(period)}
                                                className={`px-3 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all ${selectedPeriod === period ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                {period}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* AEPS HIGHLIGHT - TOP AS REQUESTED */}
                                <div className="mb-8 p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] text-white shadow-lg shadow-blue-200/50">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">Primary Service (AEPS)</span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-md">🏦</div>
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest opacity-70">AEPS Volume ({selectedPeriod})</h4>
                                            <p className="text-2xl font-black tracking-tighter">₹{stats.aepsVolume.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 mb-8">
                                    {/* Stat 1: Count */}
                                    <div className="p-5 bg-slate-50/50 rounded-[28px] border border-slate-100 border-dashed">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Total {selectedPeriod} Count</p>
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-2xl font-black tracking-tighter text-slate-800">{stats.totalCount.toLocaleString()}</h4>
                                            <div className="flex flex-col items-end text-[9px] font-black text-blue-600 uppercase">
                                                <span>₹{stats.totalVolume.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                                <span className="opacity-50">Volume</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Service Breakdown</h4>
                                    <div className="space-y-5">
                                        {stats.breakdown.length > 0 ? stats.breakdown.map((item) => (
                                            <div key={item.method} className="space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{item.method}</span>
                                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">₹{item.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                                    </div>
                                                    <span className="text-xs font-black text-slate-800">{item.value}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${item.value}%` }}
                                                        className={`h-full ${item.color} rounded-full`}
                                                    />
                                                </div>
                                            </div>
                                        )) : (
                                            <p className="text-[9px] font-black text-slate-300 uppercase text-center py-4 tracking-widest">No data for this period</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RetailerDashboard;
