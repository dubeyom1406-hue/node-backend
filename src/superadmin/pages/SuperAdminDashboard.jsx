import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, ChevronRight, Send, Plus, ArrowUpRight, ArrowDownRight,
    Wallet, TrendingUp, Users, Activity, CheckCircle2, AlertCircle,
    CreditCard, Target, MoreHorizontal, RefreshCcw, MapPin, Building2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sharedDataService } from '../../services/sharedDataService';
import { dataService } from '../../services/dataService';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
const financeData = [
    { date: '1 Feb', credit: 220, debit: 580 },
    { date: '2 Feb', credit: 450, debit: 340 },
    { date: '3 Feb', credit: 280, debit: 620 },
    { date: '4 Feb', credit: 780, debit: 178 },
    { date: '5 Feb', credit: 390, debit: 450 },
    { date: '6 Feb', credit: 860, debit: 300 },
    { date: '7 Feb', credit: 540, debit: 680 },
    { date: '8 Feb', credit: 920, debit: 240 },
];

const recentTxns = [
    { name: 'AEPS Withdrawal', type: 'AEPS', date: 'Feb 20, 2025', amount: '+₹4.00', up: true, color: '#6366f1' },
    { name: 'DMT Transfer', type: 'DMT', date: 'Feb 19, 2025', amount: '-₹12.50', up: false, color: '#10b981' },
    { name: 'BBPS Bill Pay', type: 'BBPS', date: 'Feb 18, 2025', amount: '+₹2.50', up: true, color: '#f59e0b' },
    { name: 'Wallet Top-up', type: 'Credit', date: 'Feb 17, 2025', amount: '+₹5000', up: true, color: '#3b82f6' },
    { name: 'CMS Collection', type: 'CMS', date: 'Feb 16, 2025', amount: '+₹7.00', up: true, color: '#a855f7' },
];

const quickContacts = [
    { name: 'Arun\nSharma', initials: 'AS', color: 'from-indigo-400 to-indigo-600' },
    { name: 'Priya\nSingh', initials: 'PS', color: 'from-rose-400 to-rose-600' },
    { name: 'Mohit\nVerma', initials: 'MV', color: 'from-emerald-400 to-emerald-600' },
    { name: 'Sunita\nPatel', initials: 'SP', color: 'from-amber-400 to-amber-600' },
];

const goals = [
    { label: 'Monthly Target', sub: '₹5,00,000 goal', pct: 68, color: '#6366f1' },
    { label: 'Active Retailers', sub: '20 retailer goal', pct: 45, color: '#10b981' },
    { label: 'Commission Goal', sub: '₹20,000 goal', pct: 82, color: '#f59e0b' },
];
const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#1e293b] text-white rounded-xl px-4 py-3 shadow-2xl text-[10px] space-y-1 border border-white/10">
            <p className="font-black text-white/60 uppercase tracking-widest">{label}</p>
            {payload.map((p, i) => (
                <p key={i} className="font-black flex items-center gap-1.5" style={{ color: p.color }}>
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
                    {p.name === 'credit' ? 'Credit' : 'Debit'}: ₹{p.value.toLocaleString('en-IN')}
                </p>
            ))}
        </div>
    );
};
const AnimNum = ({ n, prefix = '' }) => {
    const [v, setV] = useState(0);
    useEffect(() => {
        const target = typeof n === 'number' ? n : 0;
        const step = Math.max(1, Math.floor(target / 20));
        let cur = 0;
        const t = setInterval(() => {
            cur = Math.min(cur + step, target);
            setV(cur);
            if (cur >= target) clearInterval(t);
        }, 50);
        return () => clearInterval(t);
    }, [n]);
    return <>{prefix}{v.toLocaleString('en-IN')}</>;
};

const SuperAdminDashboard = () => {
    const navigate = useNavigate();
    const [dist, setDist] = useState(null);
    const [retailers, setRetailers] = useState([]);
    const [transferAmt, setTransferAmt] = useState('');
    const [selectedContact, setSelectedContact] = useState(null);
    const [cardIdx, setCardIdx] = useState(0);

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    const load = async () => {
        setLoading(true);
        const s = sharedDataService.getCurrentSuperAdmin();
        if (!s) return;
        const userBal = await dataService.getWalletBalance(s.id);
        setDist({ ...s, wallet: { balance: userBal } });

        const allUsers = await dataService.getAllUsers();
        setRetailers(allUsers);

        const allTxns = await dataService.getAllTransactions();
        setTransactions(allTxns);
        setLoading(false);
    };

    useEffect(() => {
        load();
        window.addEventListener('superadminDataUpdated', load);
        return () => window.removeEventListener('superadminDataUpdated', load);
    }, []);

    const activeUsers = retailers.filter(r => r.status === 'Approved');
    const walletBal = dist?.wallet?.balance || '0.00';
    const distName = dist?.name || 'SUPERADMIN MASTER';
    const distId = dist?.id || 'SA-2024-0001';

    const netWallet = retailers.reduce((acc, curr) => acc + (parseFloat(curr.balance) || 0), 0);

    const stats = [
        { label: 'Network Wallet', val: netWallet.toFixed(2), prefix: '₹', icon: Wallet, iconColor: '#6366f1', bg: '#eef2ff' },
        { label: 'Active Retailers', val: String(activeUsers.length), prefix: '', icon: CheckCircle2, iconColor: '#10b981', bg: '#ecfdf5' },
        { label: 'System Users', val: String(retailers.length), prefix: '', icon: Users, iconColor: '#3b82f6', bg: '#eff6ff' },
        { label: 'Recent Volume', val: String(transactions.length), prefix: '', icon: Activity, iconColor: '#f59e0b', bg: '#fffbeb' },
    ];

    /* wallet cards (demo) */
    const cards = [
        {
            num: '5995  7474  1103  7513  0014',
            exp: '11/27',
            holder: distName,
            bg: 'from-slate-700 to-slate-900',
        },
        {
            num: '4231  8821  4455  9900  0023',
            exp: '08/26',
            holder: distName,
            bg: 'from-indigo-600 to-purple-800',
        },
    ];

    return (
        /* outer wrapper — light gray page bg */
        <div className="h-full overflow-y-auto bg-[#f8f9fb] font-['Inter',sans-serif]">
            <div className="max-w-[1400px] mx-auto p-6 md:p-8">

                {/* ── Page header ───────────────────────────────── */}
                <div className="flex items-center justify-between mb-7">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</h1>
                    <div className="flex items-center gap-3">
                        <button className="relative p-2 text-slate-500 hover:text-slate-800 transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>
                        <button className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-[11px] font-black shadow-md shadow-amber-400/30">
                            {distName.charAt(0)}
                        </button>
                    </div>
                </div>

                {/* ── Two‑column grid ───────────────────────────── */}
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
                    <div className="space-y-6 min-w-0">

                        {/* Stat row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {stats.map((s, i) => (
                                <motion.div key={i}
                                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.07 }}
                                    whileHover={{ y: -2 }}
                                    className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 cursor-default"
                                >
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
                                        <s.icon size={17} style={{ color: s.iconColor }} />
                                    </div>
                                    <p className="text-xl font-black text-slate-900 leading-none">
                                        {s.prefix}{i === 0 ? walletBal : <AnimNum n={parseInt(s.val.replace(/,/g, ''))} />}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest">{s.label}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Finances chart */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
                        >
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-base font-black text-slate-900">Finances</h2>
                                <div className="flex items-center gap-4 text-[10px] font-black">
                                    <span className="flex items-center gap-1.5 text-slate-500">
                                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
                                        Credit
                                    </span>
                                    <span className="flex items-center gap-1.5 text-slate-500">
                                        <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
                                        Debit
                                    </span>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={financeData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }}
                                        axisLine={false} tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }}
                                        axisLine={false} tickLine={false}
                                        tickFormatter={v => `₹${v}`}
                                    />
                                    <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }} />
                                    <Line
                                        type="monotone" dataKey="credit" stroke="#6366f1"
                                        strokeWidth={2.5} dot={false}
                                        activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 0 }}
                                    />
                                    <Line
                                        type="monotone" dataKey="debit" stroke="#f87171"
                                        strokeWidth={2.5} dot={false} strokeDasharray="0"
                                        activeDot={{ r: 5, fill: '#f87171', strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </motion.div>

                        {/* Transaction History */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
                                <h2 className="text-base font-black text-slate-900">Transaction History</h2>
                                <button
                                    onClick={() => navigate('/superadmin/transactions/superadmin-receipt')}
                                    className="text-[10px] font-black text-indigo-500 hover:text-indigo-700 uppercase tracking-widest flex items-center gap-1"
                                >
                                    View All <ChevronRight size={12} />
                                </button>
                            </div>

                            {/* Table header */}
                            <div className="grid grid-cols-[2fr_1fr_1.2fr_auto] gap-4 px-6 py-2.5 bg-slate-50 border-b border-slate-100">
                                {['Name', 'Type', 'Date', 'Amount'].map(h => (
                                    <p key={h} className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</p>
                                ))}
                            </div>

                            {transactions.length > 0 ? transactions.slice(0, 8).map((t, i) => (
                                <motion.div key={i}
                                    whileHover={{ backgroundColor: '#f8faff' }}
                                    className="grid grid-cols-[2fr_1fr_1.2fr_auto] gap-4 items-center px-6 py-3.5 border-b border-slate-50 last:border-0 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[9px] font-black shrink-0 shadow-sm bg-indigo-500">
                                            {t.service_type?.charAt(0) || 'T'}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-800 truncate">{t.service_type}</p>
                                            <p className="text-[9px] font-bold text-slate-400 truncate">{t.user_name || t.username || 'System'}</p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{t.status}</p>
                                    <p className="text-[10px] font-bold text-slate-400">{new Date(t.created_at).toLocaleDateString()}</p>
                                    <p className={`text-xs font-black text-right ${t.status === 'SUCCESS' ? 'text-emerald-600' : 'text-red-500'}`}>
                                        ₹{t.amount}
                                    </p>
                                </motion.div>
                            )) : (
                                <div className="py-10 text-center text-slate-300 text-[10px] font-black uppercase tracking-[0.25em]">No recent activity</div>
                            )}
                        </motion.div>
                    </div>

                    <div className="space-y-5">

                        {/* My Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 }}
                            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base font-black text-slate-900">My Card</h2>
                                <button onClick={() => navigate('/superadmin/transactions/add-money')}
                                    className="bg-slate-900 hover:bg-slate-700 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5">
                                    <Plus size={11} /> Add Card
                                </button>
                            </div>

                            {/* Card carousel */}
                            <div className="relative overflow-hidden">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={cardIdx}
                                        initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -30 }}
                                        transition={{ duration: 0.25 }}
                                        className={`bg-gradient-to-br ${cards[cardIdx].bg} rounded-2xl p-5 text-white shadow-xl relative overflow-hidden`}
                                        style={{ minHeight: 150 }}
                                    >
                                        {/* Decorative circles */}
                                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full" />
                                        <div className="absolute -right-2 top-10 w-20 h-20 bg-white/5 rounded-full" />

                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                                <Wallet size={14} />
                                            </div>
                                            <CreditCard size={18} className="text-white/50" />
                                        </div>
                                        <p className="text-[10px] font-black text-white/60 tracking-widest mb-1">WALLET BALANCE</p>
                                        <p className="text-xl font-black text-white mb-4">₹ {walletBal}</p>
                                        <div className="flex justify-between items-end">
                                            <p className="text-[9px] font-black text-white/50 tracking-widest uppercase">{distId}</p>
                                            <p className="text-[10px] font-black text-white/70">{cards[cardIdx].exp}</p>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>

                                {/* Carousel dot indicators */}
                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex gap-1.5">
                                        {cards.map((_, i) => (
                                            <button key={i} onClick={() => setCardIdx(i)}
                                                className={`h-1.5 rounded-full transition-all ${i === cardIdx ? 'w-4 bg-slate-800' : 'w-1.5 bg-slate-200'}`} />
                                        ))}
                                    </div>
                                    <button onClick={() => setCardIdx(i => (i + 1) % cards.length)}
                                        className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all">
                                        <ChevronRight size={14} className="text-slate-600" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Managed Retailers */}
                        <motion.div
                            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
                        >
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                                    <Activity size={18} className="text-emerald-500" />
                                    Live Retailers
                                </h2>
                                <button
                                    onClick={() => navigate('/superadmin/retailers/details')}
                                    className="text-[10px] font-black text-indigo-500 hover:text-indigo-700 uppercase tracking-widest flex items-center gap-1"
                                >
                                    ALL <ChevronRight size={12} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {retailers.length > 0 ? (
                                    retailers.slice(0, 4).map((r, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-indigo-50 border border-slate-100 flex items-center justify-center text-indigo-600 text-xs font-black shadow-sm">
                                                        {r.name?.charAt(0) || 'R'}
                                                    </div>
                                                    <span className="absolute -right-0.5 -bottom-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-800">{r.name || r.username}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-tight pt-0.5">
                                                        <MapPin size={10} className="text-slate-300" /> {r.city || 'Location N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-[8px] font-black px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 uppercase tracking-tighter italic">
                                                        Active Today
                                                    </span>
                                                    <p className="text-[8px] font-bold text-slate-300">Logged in 2m ago</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-10 text-center space-y-3">
                                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                                            <Users size={20} className="text-slate-300" />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">No retailers found under your ID</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* My Goals */}
                        <motion.div
                            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.25 }}
                            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base font-black text-slate-900">My Goals</h2>
                                <button onClick={() => navigate('/superadmin/plans')}
                                    className="bg-slate-900 hover:bg-slate-700 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5">
                                    <Plus size={11} /> Add
                                </button>
                            </div>

                            <div className="space-y-4">
                                {goals.map((g, i) => (
                                    <motion.div key={i}
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 + i * 0.08 }}
                                        className="flex items-center gap-3"
                                    >
                                        {/* Icon */}
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${g.color}18` }}>
                                            <Target size={15} style={{ color: g.color }} />
                                        </div>

                                        {/* Progress */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1.5">
                                                <p className="text-[11px] font-black text-slate-800 truncate">{g.label}</p>
                                                <p className="text-[10px] font-black ml-2 shrink-0" style={{ color: g.color }}>{g.pct}%</p>
                                            </div>
                                            <div className="bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${g.pct}%` }}
                                                    transition={{ delay: 0.4 + i * 0.1, duration: 0.9, ease: 'easeOut' }}
                                                    className="h-1.5 rounded-full"
                                                    style={{ background: g.color }}
                                                />
                                            </div>
                                            <p className="text-[9px] font-bold text-slate-400 mt-1">{g.sub}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Mini action buttons */}
                        <motion.div
                            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="grid grid-cols-3 gap-3"
                        >
                            {[
                                { label: 'Add Money', icon: Plus, path: '/superadmin/transactions/add-money', color: '#6366f1' },
                                { label: 'Reports', icon: TrendingUp, path: '/superadmin/reports/commission', color: '#10b981' },
                                { label: 'Retailers', icon: Users, path: '/superadmin/retailers/details', color: '#f59e0b' },
                            ].map((a, i) => (
                                <motion.button key={i} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate(a.path)}
                                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col items-center gap-2.5 hover:shadow-md transition-all group">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: `${a.color}18` }}>
                                        <a.icon size={16} style={{ color: a.color }} />
                                    </div>
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-tight text-center">{a.label}</span>
                                </motion.button>
                            ))}
                        </motion.div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
