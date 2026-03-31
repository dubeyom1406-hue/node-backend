import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet, ArrowDownCircle, ArrowUpCircle, FileText,
    Lock, Unlock, Search, RefreshCcw, CheckCircle2,
    XCircle, AlertTriangle, IndianRupee, User, Calendar,
    Hash, Building2, ChevronDown, Loader2, X, ShieldCheck, History
} from 'lucide-react';

const API = '/api';

const fetchAPI = async (endpoint, opts = {}) => {
    const res = await fetch(`${API}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        ...opts,
    });
    return res.json();
};

// ─── Shared Form Components ────────────────────────────────────────────────

const UserSelector = ({ users, value, onChange, placeholder }) => {
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const selected = users.find(u => u.username === value || u.userId == value || u.id == value);
    const filtered = users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.username?.toLowerCase().includes(search.toLowerCase()) ||
        u.mobile?.includes(search)
    );
    return (
        <div className="relative">
            <button type="button" onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-indigo-400 transition-all outline-none">
                {selected ? (
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-black">{selected.name?.charAt(0) || 'U'}</div>
                        <span>{selected.name} <span className="text-slate-400 font-normal">({selected.username})</span></span>
                    </div>
                ) : <span className="text-slate-400">{placeholder || 'Select user...'}</span>}
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                        <div className="p-2 border-b border-slate-100">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 rounded-lg border border-slate-200 outline-none focus:border-indigo-400"
                                    placeholder="Search name/mobile/username..." />
                            </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                            {filtered.length === 0 ? (
                                <p className="text-center text-xs text-slate-400 py-6">No users found</p>
                            ) : filtered.map((u, i) => (
                                <button key={i} type="button"
                                    onClick={() => { onChange(u.username); setOpen(false); setSearch(''); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 transition-colors text-left">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-black shrink-0">{u.name?.charAt(0) || 'U'}</div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">{u.name}</p>
                                        <p className="text-[10px] text-slate-400">{u.mobile} · {u.role} · Balance: ₹{(u.balance || u.availableBalance || 0).toLocaleString('en-IN')}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Toast = ({ toast, onClose }) => {
    useEffect(() => { if (toast) { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); } }, [toast]);
    if (!toast) return null;
    return (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border ${toast.type === 'success' ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-rose-500 border-rose-400 text-white'}`}>
            {toast.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
            <span className="text-sm font-bold">{toast.message}</span>
        </motion.div>
    );
};

// ─── TABS ──────────────────────────────────────────────────────────────────

const TABS = [
    { id: 'overview', label: 'Wallet Overview', icon: Wallet, color: '#6366f1' },
    { id: 'credit', label: 'Credit Fund', icon: ArrowDownCircle, color: '#10b981' },
    { id: 'debit', label: 'Debit Fund', icon: ArrowUpCircle, color: '#ef4444' },
    { id: 'requests', label: 'Fund Requests', icon: FileText, color: '#f59e0b' },
    { id: 'lock', label: 'Lock Amount', icon: Lock, color: '#8b5cf6' },
    { id: 'release', label: 'Release Lock', icon: Unlock, color: '#06b6d4' },
    { id: 'commission', label: 'Give Commission', icon: IndianRupee, color: '#ec4899' },
    { id: 'tax', label: 'Tax Wallet', icon: ShieldCheck, color: '#10b981' },
];

// ─── Overview Tab ─────────────────────────────────────────────────────────

const OverviewTab = ({ wallets, loading, onRefresh }) => {
    const [search, setSearch] = useState('');
    const filtered = (wallets || []).filter(w =>
        w.name?.toLowerCase().includes(search.toLowerCase()) ||
        w.username?.toLowerCase().includes(search.toLowerCase()) ||
        w.mobile?.includes(search)
    );
    const totalBalance = (wallets || []).reduce((s, w) => s + (w.balance || 0), 0);
    const totalLocked = (wallets || []).reduce((s, w) => s + (w.lockedAmount || 0), 0);
    const totalAvailable = (wallets || []).reduce((s, w) => s + (w.availableBalance || 0), 0);

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Total Balance', value: `₹${totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: '#6366f1', bg: '#eef2ff', icon: IndianRupee },
                    { label: 'Total Locked', value: `₹${totalLocked.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: '#8b5cf6', bg: '#f5f3ff', icon: Lock },
                    { label: 'Available Balance', value: `₹${totalAvailable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: '#10b981', bg: '#ecfdf5', icon: Wallet },
                ].map((s, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                                <s.icon size={18} style={{ color: s.color }} />
                            </div>
                        </div>
                        <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide">All User Wallets</h3>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input value={search} onChange={e => setSearch(e.target.value)}
                                className="pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 w-48 transition-all"
                                placeholder="Search user..." />
                        </div>
                        <button onClick={onRefresh} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                            <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                {['User', 'Role', 'Total Balance', 'Locked', 'Available'].map(h => (
                                    <th key={h} className="text-left px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((w, i) => (
                                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white text-xs font-black">{w.name?.charAt(0) || 'U'}</div>
                                            <div>
                                                <p className="text-xs font-black text-slate-800">{w.name}</p>
                                                <p className="text-[9px] text-slate-400">{w.mobile || w.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[9px] font-black rounded-full uppercase tracking-wider">{w.role}</span>
                                    </td>
                                    <td className="px-5 py-3.5 text-xs font-black text-slate-800">₹{(w.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    <td className="px-5 py-3.5 text-xs font-black text-purple-600">₹{(w.lockedAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    <td className="px-5 py-3.5 text-xs font-black text-emerald-600">₹{(w.availableBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr><td colSpan={5} className="py-12 text-center text-xs text-slate-400 font-bold">No wallets found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ─── Credit/Debit Tab ──────────────────────────────────────────────────────

const CreditDebitTab = ({ users, type, onToast, onRefresh }) => {
    const [userId, setUserId] = useState('');
    const [amount, setAmount] = useState('');
    const [remark, setRemark] = useState('');
    const [loading, setLoading] = useState(false);

    const isCredit = type === 'credit';
        const color = isCredit ? 'emerald' : 'rose';
        const endpoint = isCredit ? '/wallet/credit' : '/wallet/debit';
    
        const handleSubmit = async (e) => {
            e.preventDefault();
            if (!userId) return onToast({ type: 'error', message: 'Please select a user' });
            if (!amount || parseFloat(amount) <= 0) return onToast({ type: 'error', message: 'Please enter a valid amount' });
    
            // Find numeric ID if userId is username
            const selected = users.find(u => u.username === userId || u.id == userId);
            const targetId = selected ? selected.id : userId;
    
            setLoading(true);
            try {
                const res = await fetchAPI(endpoint, {
                    method: 'POST',
                    body: JSON.stringify({ userId: targetId, amount: parseFloat(amount), remark })
                });
            if (res.success) {
                onToast({ type: 'success', message: res.message });
                setUserId(''); setAmount(''); setRemark('');
                onRefresh();
            } else {
                onToast({ type: 'error', message: res.message || 'Operation failed' });
            }
        } catch {
            onToast({ type: 'error', message: 'Network error. Try again.' });
        } finally {
            setLoading(false);
        }
    };

    const selectedUser = users.find(u => u.username === userId);

    return (
        <div className="max-w-xl mx-auto">
            <div className={`bg-gradient-to-br ${isCredit ? 'from-emerald-500 to-teal-600' : 'from-rose-500 to-red-600'} rounded-3xl p-8 text-white mb-6 shadow-xl`}>
                <div className="flex items-center gap-3 mb-2">
                    {isCredit ? <ArrowDownCircle size={28} /> : <ArrowUpCircle size={28} />}
                    <h2 className="text-2xl font-black uppercase tracking-tight">{isCredit ? 'Credit Fund' : 'Debit Fund'}</h2>
                </div>
                <p className="text-white/70 text-sm font-semibold">
                    {isCredit ? 'Add funds to a user wallet instantly' : 'Deduct funds from a user wallet'}
                </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select User</label>
                        <UserSelector users={users} value={userId} onChange={setUserId} placeholder="Choose a user..." />
                    </div>

                    {selectedUser && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                            className={`p-4 bg-${color}-50 border border-${color}-200 rounded-xl flex items-center gap-4`}>
                            <div className={`w-10 h-10 rounded-xl bg-${color}-100 flex items-center justify-center text-${color}-600 font-black`}>
                                {selectedUser.name?.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-800">{selectedUser.name}</p>
                                <p className="text-[10px] text-slate-500">Balance: <span className="font-black text-emerald-600">₹{(selectedUser.balance || selectedUser.availableBalance || 0).toLocaleString('en-IN')}</span>
                                    {selectedUser.lockedAmount > 0 && <span className="text-purple-600 ml-2">Locked: ₹{selectedUser.lockedAmount.toLocaleString('en-IN')}</span>}
                                </p>
                            </div>
                        </motion.div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount (₹)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">₹</span>
                            <input type="number" min="1" step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
                                placeholder="0.00"
                                className={`w-full pl-8 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-base font-black outline-none focus:border-${color}-500 transition-all`} />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Remark (Optional)</label>
                        <input type="text" value={remark} onChange={e => setRemark(e.target.value)}
                            placeholder={isCredit ? 'e.g. Load from NEFT transfer' : 'e.g. Chargeback deduction'}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-indigo-400 transition-all" />
                    </div>

                    <button type="submit" disabled={loading}
                        className={`w-full py-4 rounded-2xl font-black text-white text-sm uppercase tracking-widest shadow-lg transition-all disabled:opacity-60 active:scale-95 ${isCredit ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/30 hover:shadow-emerald-500/50' : 'bg-gradient-to-r from-rose-500 to-red-600 shadow-rose-500/30 hover:shadow-rose-500/50'}`}>
                        {loading ? <div className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /><span>Processing...</span></div>
                            : isCredit ? '+ Credit Fund' : '- Debit Fund'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ─── Fund Requests Tab ─────────────────────────────────────────────────────

const FundRequestsTab = ({ users, onToast, onRefresh }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [processingId, setProcessingId] = useState(null);
    const [filter, setFilter] = useState('PENDING');
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ userId: '', amount: '', utrNumber: '', method: 'NEFT/IMPS', remark: '' });
    const [submitting, setSubmitting] = useState(false);

    const loadRequests = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchAPI('/admin/wallet/fund-requests');
            if (res.success) setRequests(res.requests || []);
        } catch { } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadRequests(); }, []);

    const handleApprove = async (requestId) => {
        setProcessingId(requestId);
        try {
            const res = await fetchAPI('/admin/wallet/approve-request', { method: 'POST', body: JSON.stringify({ requestId }) });
            if (res.success) { onToast({ type: 'success', message: res.message }); loadRequests(); onRefresh(); }
            else onToast({ type: 'error', message: res.message });
        } catch { onToast({ type: 'error', message: 'Error processing request' }); }
        setProcessingId(null);
    };

    const handleReject = async (requestId) => {
        setProcessingId(requestId);
        try {
            const res = await fetchAPI('/admin/wallet/reject-request', { method: 'POST', body: JSON.stringify({ requestId }) });
            if (res.success) { onToast({ type: 'success', message: res.message }); loadRequests(); }
            else onToast({ type: 'error', message: res.message });
        } catch { onToast({ type: 'error', message: 'Error rejecting request' }); }
        setProcessingId(null);
    };

    const handleCreateRequest = async (e) => {
        e.preventDefault();
        if (!form.userId || !form.amount) return onToast({ type: 'error', message: 'User and amount required' });
        setSubmitting(true);
        try {
            const res = await fetchAPI('/admin/wallet/fund-request', { method: 'POST', body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }) });
            if (res.success) {
                onToast({ type: 'success', message: res.message });
                setForm({ userId: '', amount: '', utrNumber: '', method: 'NEFT/IMPS', remark: '' });
                setShowCreate(false);
                loadRequests();
            } else onToast({ type: 'error', message: res.message });
        } catch { onToast({ type: 'error', message: 'Error submitting request' }); }
        setSubmitting(false);
    };

    const filtered = requests.filter(r => filter === 'ALL' || r.status === filter);
    const pendingCount = requests.filter(r => r.status === 'PENDING').length;

    const statusBadge = (status) => {
        const map = {
            PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
            APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
        };
        return `px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${map[status] || 'bg-slate-50 text-slate-500'}`;
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide">Fund Requests</h3>
                    {pendingCount > 0 && (
                        <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-[10px] font-black animate-pulse">{pendingCount} Pending</span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${filter === f ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:border-indigo-300'}`}>
                            {f}
                        </button>
                    ))}
                    <button onClick={() => setShowCreate(!showCreate)}
                        className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-md">
                        + New Request
                    </button>
                    <button onClick={loadRequests} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                        <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Create Form */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="bg-white rounded-2xl border border-indigo-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
                            <h4 className="font-black text-indigo-800 text-sm uppercase tracking-wide">Submit Fund Request</h4>
                            <button onClick={() => setShowCreate(false)} className="text-indigo-400 hover:text-indigo-600"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleCreateRequest} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">User *</label>
                                <UserSelector users={users} value={form.userId} onChange={v => setForm(p => ({ ...p, userId: v }))} placeholder="Select user..." />
                            </div>
                            {[
                                { field: 'amount', label: 'Amount (₹) *', type: 'number', placeholder: '0.00' },
                                { field: 'utrNumber', label: 'UTR / Reference No.', type: 'text', placeholder: 'e.g. UTR123456789' },
                            ].map(f => (
                                <div key={f.field} className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{f.label}</label>
                                    <input type={f.type} placeholder={f.placeholder} value={form[f.field]}
                                        onChange={e => setForm(p => ({ ...p, [f.field]: e.target.value }))}
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 transition-all font-semibold" />
                                </div>
                            ))}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Payment Method</label>
                                <select value={form.method} onChange={e => setForm(p => ({ ...p, method: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-indigo-400 transition-all appearance-none">
                                    {['NEFT/IMPS', 'RTGS', 'UPI', 'CASH', 'CHEQUE'].map(m => <option key={m}>{m}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Remark</label>
                                <input type="text" placeholder="Optional remark..." value={form.remark}
                                    onChange={e => setForm(p => ({ ...p, remark: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-indigo-400 transition-all" />
                            </div>
                            <div className="md:col-span-2">
                                <button type="submit" disabled={submitting}
                                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-sm uppercase tracking-widest shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-60">
                                    {submitting ? 'Submitting...' : 'Submit Fund Request'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Requests Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                {['User', 'Amount', 'UTR/Ref', 'Method', 'Status', 'Date', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((r, i) => (
                                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <p className="text-xs font-black text-slate-800">{r.name}</p>
                                        <p className="text-[9px] text-slate-400">{r.username}</p>
                                    </td>
                                    <td className="px-5 py-3.5 text-xs font-black text-slate-800">₹{(r.amount || 0).toLocaleString('en-IN')}</td>
                                    <td className="px-5 py-3.5 text-xs font-mono text-indigo-600">{r.utrNumber || '—'}</td>
                                    <td className="px-5 py-3.5 text-xs text-slate-500">{r.method}</td>
                                    <td className="px-5 py-3.5"><span className={statusBadge(r.status)}>{r.status}</span></td>
                                    <td className="px-5 py-3.5 text-[10px] text-slate-400">{new Date(r.created_at).toLocaleDateString('en-IN')}</td>
                                    <td className="px-5 py-3.5">
                                        {r.status === 'PENDING' ? (
                                            <div className="flex gap-2">
                                                <button onClick={() => handleApprove(r.id)} disabled={processingId === r.id}
                                                    className="px-3 py-1.5 bg-emerald-500 text-white text-[9px] font-black rounded-lg hover:bg-emerald-600 transition-all disabled:opacity-50">
                                                    {processingId === r.id ? '...' : 'Approve'}
                                                </button>
                                                <button onClick={() => handleReject(r.id)} disabled={processingId === r.id}
                                                    className="px-3 py-1.5 bg-rose-100 text-rose-600 text-[9px] font-black rounded-lg hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50">
                                                    Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-[9px] text-slate-400 italic">{r.admin_remark || 'Processed'}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr><td colSpan={7} className="py-16 text-center text-xs text-slate-400 font-bold">
                                    {loading ? 'Loading...' : `No ${filter === 'ALL' ? '' : filter.toLowerCase()} requests found`}
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ─── Lock / Release Tab ─────────────────────────────────────────────────────

const LockReleaseTab = ({ users, type, onToast, onRefresh }) => {
    const [userId, setUserId] = useState('');
    const [amount, setAmount] = useState('');
    const [remark, setRemark] = useState('');
    const [loading, setLoading] = useState(false);

    const isLock = type === 'lock';
    const endpoint = isLock ? '/wallet/lock' : '/wallet/release';
    const color = isLock ? 'purple' : 'cyan';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userId) return onToast({ type: 'error', message: 'Please select a user' });
        if (!amount || parseFloat(amount) <= 0) return onToast({ type: 'error', message: 'Please enter a valid amount' });

        // Find numeric ID if userId is username
        const selected = users.find(u => u.username === userId || u.id == userId);
        const targetId = selected ? selected.id : userId;

        setLoading(true);
        try {
            const res = await fetchAPI(endpoint, {
                method: 'POST',
                body: JSON.stringify({ userId: targetId, amount: parseFloat(amount), remark })
            });
            if (res.success) {
                onToast({ type: 'success', message: res.message });
                setUserId(''); setAmount(''); setRemark('');
                onRefresh();
            } else {
                onToast({ type: 'error', message: res.message || 'Operation failed' });
            }
        } catch {
            onToast({ type: 'error', message: 'Network error. Try again.' });
        } finally {
            setLoading(false);
        }
    };

    const selectedUser = users.find(u => u.username === userId);

    return (
        <div className="max-w-xl mx-auto">
            <div className={`bg-gradient-to-br ${isLock ? 'from-purple-500 to-violet-700' : 'from-cyan-500 to-teal-600'} rounded-3xl p-8 text-white mb-6 shadow-xl`}>
                <div className="flex items-center gap-3 mb-2">
                    {isLock ? <Lock size={28} /> : <Unlock size={28} />}
                    <h2 className="text-2xl font-black uppercase tracking-tight">{isLock ? 'Lock Amount' : 'Release Lock'}</h2>
                </div>
                <p className="text-white/70 text-sm font-semibold">
                    {isLock ? 'Freeze funds in a user wallet — cannot be spent while locked' : 'Release previously locked funds back to available balance'}
                </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select User</label>
                        <UserSelector users={users} value={userId} onChange={setUserId} placeholder="Choose a user..." />
                    </div>

                    {selectedUser && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-3 gap-3">
                            {[
                                { label: 'Total Balance', value: `₹${(selectedUser.balance || 0).toLocaleString('en-IN')}`, color: 'text-slate-800' },
                                { label: 'Locked', value: `₹${(selectedUser.lockedAmount || 0).toLocaleString('en-IN')}`, color: 'text-purple-600' },
                                { label: 'Available', value: `₹${(selectedUser.availableBalance || selectedUser.balance || 0).toLocaleString('en-IN')}`, color: 'text-emerald-600' },
                            ].map((s, i) => (
                                <div key={i} className="text-center">
                                    <p className={`text-sm font-black ${s.color}`}>{s.value}</p>
                                    <p className="text-[9px] text-slate-400 uppercase tracking-wide mt-0.5">{s.label}</p>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount to {isLock ? 'Lock' : 'Release'} (₹)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">₹</span>
                            <input type="number" min="1" step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
                                placeholder="0.00"
                                className={`w-full pl-8 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-base font-black outline-none transition-all ${isLock ? 'focus:border-purple-500' : 'focus:border-cyan-500'}`} />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason (Optional)</label>
                        <input type="text" value={remark} onChange={e => setRemark(e.target.value)}
                            placeholder={isLock ? 'e.g. Fraud investigation hold' : 'e.g. Investigation cleared'}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-indigo-400 transition-all" />
                    </div>

                    <button type="submit" disabled={loading}
                        className={`w-full py-4 rounded-2xl font-black text-white text-sm uppercase tracking-widest shadow-lg transition-all disabled:opacity-60 active:scale-95 ${isLock ? 'bg-gradient-to-r from-purple-500 to-violet-700 shadow-purple-500/30' : 'bg-gradient-to-r from-cyan-500 to-teal-600 shadow-cyan-500/30'}`}>
                        {loading
                            ? <div className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /><span>Processing...</span></div>
                            : isLock ? '🔒 Lock Amount' : '🔓 Release Lock'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ─── Give Commission Tab ──────────────────────────────────────────────────
const GiveCommissionTab = ({ users, onToast, onRefresh }) => {
    const [userId, setUserId] = useState('');
    const [amount, setAmount] = useState('');
    const [gstRate, setGstRate] = useState('0');
    const [remark, setRemark] = useState('');
    const [loading, setLoading] = useState(false);

    const selectedUser = users.find(u => u.username === userId || u.id == userId);
    
    useEffect(() => {
        if (selectedUser) {
            setGstRate(selectedUser.gst_rate || '0');
        }
    }, [selectedUser]);

    const gross = parseFloat(amount) || 0;
    const tds = (gross * 2) / 100;
    const gst = (gross * parseFloat(gstRate)) / 100;
    const net = gross - tds - gst;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userId) return onToast({ type: 'error', message: 'Please select a user' });
        if (gross <= 0) return onToast({ type: 'error', message: 'Please enter a valid amount' });

        setLoading(true);
        try {
            // Find numeric ID if userId is username
            const selected = users.find(u => u.username === userId || u.id == userId);
            const targetId = selected ? selected.id : userId;

            const res = await fetchAPI('/wallet/give-commission', {
                method: 'POST',
                body: JSON.stringify({ userId: targetId, amount: gross, gstPercentage: parseFloat(gstRate), remark })
            });
            if (res.success) {
                onToast({ type: 'success', message: res.message });
                setUserId(''); setAmount(''); setRemark('');
                onRefresh();
            } else {
                onToast({ type: 'error', message: res.message || 'Operation failed' });
            }
        } catch {
            onToast({ type: 'error', message: 'Network error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl p-8 text-white mb-6 shadow-xl">
                <div className="flex items-center gap-3 mb-2">
                    <IndianRupee size={28} />
                    <h2 className="text-2xl font-black uppercase tracking-tight">Give Commission</h2>
                </div>
                <p className="text-white/70 text-sm font-semibold">Distribute commissions with automatic TDS (2%) & GST deductions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select User</label>
                            <UserSelector users={users} value={userId} onChange={setUserId} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gross Amount (₹)</label>
                                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-black outline-none focus:border-pink-500 transition-all" placeholder="0.00" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GST Rate (%)</label>
                                <input type="number" value={gstRate} onChange={e => setGstRate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-black outline-none focus:border-pink-500 transition-all" placeholder="0" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Remark</label>
                            <input type="text" value={remark} onChange={e => setRemark(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-pink-500 transition-all" placeholder="Optional remark" />
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all disabled:opacity-50">
                            {loading ? 'Processing...' : 'Authorize Payout'}
                        </button>
                    </form>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                    <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest border-b pb-3">Breakdown Summary</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase">
                            <span>Gross Commission</span>
                            <span className="text-slate-900">₹{gross.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold text-rose-500 uppercase">
                            <span>TDS (2%)</span>
                            <span>- ₹{tds.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold text-rose-500 uppercase">
                            <span>GST ({gstRate}%)</span>
                            <span>- ₹{gst.toFixed(2)}</span>
                        </div>
                        <div className="pt-3 border-t-2 border-dashed border-slate-100 flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase">Net Payable</span>
                            <span className="text-xl font-black text-emerald-600">₹{net.toFixed(2)}</span>
                        </div>
                    </div>
                    {selectedUser && (
                        <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                             <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Impact on Wallet</p>
                             <p className="text-xs font-bold text-indigo-900">₹{(selectedUser.balance || 0).toLocaleString()} → ₹{( (parseFloat(selectedUser.balance) || 0) + net).toLocaleString()}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Tax Wallet Tab ────────────────────────────────────────────────────────
const TaxWalletTab = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadStats = async () => {
        setLoading(true);
        try {
            const res = await fetchAPI('/admin/tax-wallet');
            if (res.success) setStats(res.wallet);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { loadStats(); }, []);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    { label: 'Total TDS Collected', value: stats?.total_tds || 0, color: '#10b981', bg: '#ecfdf5', icon: ShieldCheck },
                    { label: 'Total GST Collected', value: stats?.total_gst || 0, color: '#6366f1', bg: '#eef2ff', icon: FileText }
                ].map((s, i) => (
                    <div key={i} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0" style={{ background: s.bg }}>
                            <s.icon size={32} style={{ color: s.color }} />
                        </div>
                        <div>
                            <p className="text-3xl font-black text-slate-800">₹{parseFloat(s.value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center">
                 <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                     <History size={32} className="text-slate-300" />
                 </div>
                 <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Tax Deduction History</h3>
                 <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-2">Deductions are automatically recorded in the main transaction ledger.</p>
                 <button className="mt-6 px-10 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all">View All Transactions</button>
            </div>
        </div>
    );
};

// ─── Main WalletManager ────────────────────────────────────────────────────

const WalletManager = ({ initialTab }) => {
    const [activeTab, setActiveTab] = useState(initialTab || 'overview');
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const loadWallets = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchAPI('/wallet');
            if (res.success) setWallets(res.wallets || []);
        } catch { } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadWallets(); }, []);
    useEffect(() => { if (initialTab) setActiveTab(initialTab); }, [initialTab]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <AnimatePresence>{toast && <Toast toast={toast} onClose={() => setToast(null)} />}</AnimatePresence>

            {/* Page Header */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-7 text-white shadow-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                        <Wallet size={28} className="text-indigo-300" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tight">Wallet Management</h2>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Credit · Debit · Fund Requests · Lock · Release</p>
                    </div>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-3xl font-black text-indigo-300">₹{wallets.reduce((s, w) => s + (w.balance || 0), 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Total System Balance</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2">
                {TABS.map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wide transition-all ${isActive ? 'text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}
                            style={isActive ? { background: tab.color, boxShadow: `0 4px 14px ${tab.color}44` } : {}}>
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    {activeTab === 'overview' && <OverviewTab wallets={wallets} loading={loading} onRefresh={loadWallets} />}
                    {activeTab === 'credit' && <CreditDebitTab users={wallets} type="credit" onToast={setToast} onRefresh={loadWallets} />}
                    {activeTab === 'debit' && <CreditDebitTab users={wallets} type="debit" onToast={setToast} onRefresh={loadWallets} />}
                    {activeTab === 'requests' && <FundRequestsTab users={wallets} onToast={setToast} onRefresh={loadWallets} />}
                    {activeTab === 'lock' && <LockReleaseTab users={wallets} type="lock" onToast={setToast} onRefresh={loadWallets} />}
                    {activeTab === 'release' && <LockReleaseTab users={wallets} type="release" onToast={setToast} onRefresh={loadWallets} />}
                    {activeTab === 'commission' && <GiveCommissionTab users={wallets} onToast={setToast} onRefresh={loadWallets} />}
                    {activeTab === 'tax' && <TaxWalletTab />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default WalletManager;
