import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet, Plus, X, Clock, AlertCircle, CheckCircle2,
    Users, Search, ArrowUpRight, ArrowDownRight, Lock, Unlock, FileText
} from 'lucide-react';
import { BACKEND_URL } from '../../services/dataService';

const WalletControl = ({ initialTab = 'credit' }) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [users, setUsers] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({ userId: '', amount: '', remark: '', type: 'CREDIT' });
    const [message, setMessage] = useState(null);

    const loadData = async () => {
        try {
            const token = localStorage.getItem('rupiksha_token');
            // Fetch fund requests
            const reqRes = await fetch(`${BACKEND_URL}/admin/wallet/fund-requests`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const reqData = await reqRes.json();
            if (reqData.success) setRequests(reqData.requests);

            // Fetch user wallets overview
            const walRes = await fetch(`${BACKEND_URL}/admin/wallet/user-wallets`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const walData = await walRes.json();
            if (walData.success) setUsers(walData.wallets);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const handleAction = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            const token = localStorage.getItem('rupiksha_token');
            const endpoint = `/admin/wallet/${activeTab}`; // credit, debit, lock, release-lock
            const res = await fetch(`${BACKEND_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ type: 'success', text: data.message });
                setFormData({ userId: '', amount: '', remark: '', type: 'CREDIT' });
                loadData();
            } else {
                setMessage({ type: 'error', text: data.message || "Action Failed" });
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id, status) => {
        try {
            const token = localStorage.getItem('rupiksha_token');
            const endpoint = status === 'APPROVED' ? '/admin/wallet/approve-request' : '/admin/wallet/reject-request';
            const res = await fetch(`${BACKEND_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ requestId: id, remark: 'Processed by Admin' })
            });
            const data = await res.json();
            if (data.success) {
                loadData();
                alert(data.message);
            }
        } catch (err) { alert(err.message); }
    };

    const tabs = [
        { id: 'credit', label: 'Credit Fund', icon: Plus, color: 'text-emerald-500' },
        { id: 'debit', label: 'Debit Fund', icon: X, color: 'text-rose-500' },
        { id: 'requests', label: 'Requests', icon: Clock, color: 'text-amber-500' },
        { id: 'lock', label: 'Lock Fund', icon: Lock, color: 'text-blue-500' },
        { id: 'release-lock', label: 'Release Lock', icon: Unlock, color: 'text-indigo-500' }
    ];

    const filteredUsers = users.filter(u =>
        (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.mobile || '').includes(searchTerm) ||
        (u.username || '').includes(searchTerm)
    );

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 font-['Montserrat',sans-serif]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase italic flex items-center gap-3">
                        <Wallet className="text-amber-500" size={32} />
                        Treasury Management
                    </h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 ml-1">Direct wallet intervention and fund oversight</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {tabs.map(t => (
                    <button
                        key={t.id}
                        onClick={() => { setActiveTab(t.id); setMessage(null); }}
                        className={`px-6 py-3.5 rounded-3xl text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap transition-all flex items-center gap-3 border
                            ${activeTab === t.id
                                ? 'bg-slate-900 text-white border-transparent shadow-xl scale-105'
                                : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
                    >
                        <t.icon size={16} />
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Main Content Area */}
                <div className="xl:col-span-7 space-y-8">
                    {activeTab === 'requests' ? (
                        <div className="bg-white border border-slate-50 rounded-[3rem] shadow-xl overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Fund Requests</p>
                                <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-3 py-1 rounded-full">{requests.filter(r => r.status === 'PENDING').length} PENDING</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50">
                                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase">User</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase">Amount</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase">Status</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 text-xs">
                                        {requests.length > 0 ? requests.map((r, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4">
                                                    <p className="font-black text-slate-800">{r.name}</p>
                                                    <p className="text-[9px] font-bold text-slate-400">UID: {r.username}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-black text-emerald-600 font-mono tracking-tight">₹{r.amount.toLocaleString('en-IN')}</p>
                                                    <p className="text-[9px] font-bold text-slate-400">{r.method}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase
                                                        ${r.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                                                            r.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                        {r.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 flex gap-2">
                                                    {r.status === 'PENDING' && (
                                                        <>
                                                            <button onClick={() => handleApprove(r.id, 'APPROVED')} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"><CheckCircle2 size={16} /></button>
                                                            <button onClick={() => handleApprove(r.id, 'REJECTED')} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-500 hover:text-white transition-all"><X size={16} /></button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-300 uppercase text-[10px] font-black">No requests found</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white border border-slate-50 rounded-[3rem] shadow-xl p-10 space-y-10">
                            <div className="flex items-center gap-5">
                                <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center text-3xl font-black italic shadow-2xl transition-all
                                    ${activeTab === 'credit' ? 'bg-emerald-500 text-white' :
                                        activeTab === 'debit' ? 'bg-rose-500 text-white' :
                                            activeTab === 'lock' ? 'bg-blue-500 text-white' : 'bg-indigo-500 text-white'}`}>
                                    {activeTab === 'credit' ? <Plus size={32} /> :
                                        activeTab === 'debit' ? <X size={32} /> :
                                            activeTab === 'lock' ? <Lock size={32} /> : <Unlock size={32} />}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">
                                        Direct {activeTab.replace('-', ' ')}
                                    </h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Execute immediate financial movement</p>
                                </div>
                            </div>

                            <form onSubmit={handleAction} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Account SID</label>
                                    <input required type="text" value={formData.userId}
                                        onChange={e => setFormData({ ...formData, userId: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-8 text-sm font-black focus:bg-white focus:border-amber-500 outline-none transition-all shadow-inner"
                                        placeholder="Username or Phone or UID" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount (₹)</label>
                                        <input required type="number" value={formData.amount}
                                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-8 text-sm font-black focus:bg-white focus:border-emerald-500 outline-none transition-all shadow-inner font-mono italic"
                                            placeholder="0.00" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Administrative Remark</label>
                                        <input required type="text" value={formData.remark}
                                            onChange={e => setFormData({ ...formData, remark: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-8 text-sm font-black focus:bg-white focus:border-amber-500 outline-none transition-all shadow-inner"
                                            placeholder="Reason for intervention" />
                                    </div>
                                </div>

                                {message && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        className={`p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border
                                            ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                        {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                        {message.text}
                                    </motion.div>
                                )}

                                <button disabled={loading} type="submit"
                                    className={`w-full text-white font-black py-6 rounded-3xl text-[11px] uppercase tracking-[0.25em] shadow-2xl active:scale-95 transition-all disabled:opacity-50
                                        ${activeTab === 'credit' ? 'bg-emerald-500 shadow-emerald-500/20' :
                                            activeTab === 'debit' ? 'bg-rose-500 shadow-rose-500/20' :
                                                activeTab === 'lock' ? 'bg-blue-600 shadow-blue-500/20' : 'bg-indigo-600 shadow-indigo-500/20'}`}>
                                    {loading ? 'PROCESSING TRANSACTION...' : `EXECUTE ${activeTab.replace('-', ' ')}`}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Account Directory Side Panel */}
                <div className="xl:col-span-5 space-y-8">
                    <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10 space-y-4">
                            <p className="text-[9px] font-black text-amber-500 uppercase tracking-[0.3em]">Treasury Snapshot</p>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-4xl font-black italic tracking-tighter">₹{users.reduce((acc, curr) => acc + curr.balance, 0).toLocaleString('en-IN')}</p>
                                    <p className="text-[8px] font-black text-white/30 uppercase mt-2 tracking-widest">Total Network Float</p>
                                </div>
                                <ArrowUpRight className="text-emerald-500 mb-1" size={24} />
                            </div>
                        </div>
                        {/* Decorative Circles */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    </div>

                    <div className="bg-white border border-slate-50 rounded-[3rem] shadow-xl overflow-hidden flex flex-col h-[650px]">
                        <div className="p-8 border-b border-slate-50 space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Registry</p>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <input
                                    type="text"
                                    placeholder="Quick Find..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-10 pr-4 text-[10px] font-black focus:outline-none focus:border-amber-500 transition-all uppercase" />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar space-y-3">
                            {filteredUsers.length > 0 ? filteredUsers.map((u, i) => (
                                <div key={i} onClick={() => setFormData({ ...formData, userId: u.username })}
                                    className="p-4 bg-white border border-slate-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:border-blue-300 hover:shadow-lg transition-all group">

                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-10 h-10 shrink-0 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-[14px] font-black shadow-lg italic transition-transform group-hover:scale-110">
                                            {u.name?.charAt(0) || 'U'}
                                        </div>
                                        <div className="min-w-0 text-left">
                                            <p className="text-[12px] font-black text-slate-800 tracking-tight truncate">{u.name || u.username}</p>
                                            <p className="text-[9px] font-bold text-slate-400 lowercase truncate">{u.role?.toLowerCase() || 'retailer'}</p>
                                        </div>
                                    </div>

                                    <div className="shrink-0 flex items-center justify-between w-full sm:w-auto sm:justify-end gap-4 overflow-hidden">
                                        <span className="shrink-0 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100 hidden sm:block">
                                            {u.role || 'RETAILER'}
                                        </span>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-black text-emerald-600 tracking-tight font-mono">₹{parseFloat(u.balance || 0).toLocaleString('en-IN')}</p>
                                            {u.lockedAmount > 0 && (
                                                <p className="text-[7px] font-black text-rose-500 uppercase mt-0.5">Locked: ₹{u.lockedAmount}</p>
                                            )}
                                        </div>
                                        <span className="shrink-0 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                                            ACTIVE
                                        </span>
                                    </div>

                                </div>
                            )) : <p className="text-[10px] text-center text-slate-300 uppercase py-10 font-black">Not Found</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletControl;
