import React, { useState, useEffect } from 'react';
import { 
    FileText, Search, Download, IndianRupee, 
    Filter, RefreshCw, CheckCircle, Clock, 
    AlertCircle, Smartphone, Fingerprint,
    ArrowUpRight, Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { dataService } from '../../../services/dataService';
import { Icon3D, StatusBadge } from './ReportShared';

const AuditReport = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchBaseData = async () => {
            setLoading(true);
            const user = dataService.getCurrentUser();
            if (user) {
                try {
                    const txns = await dataService.getUserTransactions(user.id);
                    setTransactions(txns || []);
                } catch (e) { setTransactions([]); }
            }
            setLoading(false);
        };
        fetchBaseData();
    }, []);

    const filteredTxns = (transactions || []).filter((txn) => {
        const matchesSearch = 
            String(txn.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(txn.service || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === 'all' || txn.status?.toUpperCase() === activeTab.toUpperCase();
        return matchesSearch && matchesTab;
    });

    const tabs = [
        { id: 'all', label: 'All Audits', icon: FileText },
        { id: 'SUCCESS', label: 'Successful', icon: CheckCircle },
        { id: 'PENDING', label: 'Pending', icon: Clock },
        { id: 'FAILED', label: 'Failed', icon: AlertCircle },
    ];

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20 font-['Inter',sans-serif]">
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-[#4a148c]/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="flex items-center gap-6 relative z-10">
                    <Icon3D icon={FileText} color="#4a148c" size={28} />
                    <div>
                        <p className="text-[10px] font-black text-[#4a148c] uppercase tracking-[5px] mb-1.5 opacity-60">Operations Intelligence</p>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Audit Reports</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Comprehensive transaction logs</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                    <button className="flex items-center gap-3 px-8 h-14 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[3px] shadow-2xl hover:bg-black transition-all active:scale-95 group">
                        <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
                        Master Export
                    </button>
                    <button onClick={() => window.location.reload()}
                        className="w-14 h-14 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-center hover:shadow-md transition-all active:rotate-180 hover:border-[#4a148c]">
                        <RefreshCw size={22} className="text-[#4a148c]" />
                    </button>
                </div>
            </div>

            {/* ── Stats Row ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Cumulative Sales', val: transactions.reduce((acc, t) => acc + parseFloat(t.amount || 0), 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' }), icon: IndianRupee, col: '#4a148c' },
                    { label: 'Platform Success', val: '99.2%', icon: CheckCircle, col: '#10b981' },
                    { label: 'Total Records', val: transactions.length, icon: FileText, col: '#0ea5e9' },
                    { label: 'Critical Errors', val: '0', icon: Clock, col: '#f43f5e' },
                ].map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
                    >
                        <div className="absolute right-0 top-0 w-24 h-24 rounded-full blur-3xl opacity-5" style={{ backgroundColor: s.col }}></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all" style={{ background: `${s.col}10` }}>
                                <s.icon size={22} style={{ color: s.col }} />
                            </div>
                            <ArrowUpRight className="text-slate-200 group-hover:text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" size={18} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">{s.label}</p>
                        <p className="text-xl font-black text-slate-800 mt-1 tracking-tighter">{s.val}</p>
                    </motion.div>
                ))}
            </div>

            {/* ── Main Data View ── */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-4 shadow-sm space-y-6">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-4">
                    <div className="flex p-2 bg-slate-50/80 rounded-2xl border border-slate-100 w-full lg:w-auto overflow-x-auto no-scrollbar shadow-inner">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[2.5px] transition-all whitespace-nowrap
                                ${activeTab === tab.id ? 'bg-[#4a148c] text-white shadow-xl shadow-[#4a148c20]' : 'text-slate-400 hover:text-slate-700 hover:bg-white'}`}
                            >
                                <tab.icon size={14} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-80">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                type="text"
                                placeholder="Quick lookup by Transaction ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-[11px] font-black focus:bg-white focus:border-[#4a148c20] outline-none transition-all placeholder:text-slate-300"
                            />
                        </div>
                        <button className="p-4 bg-slate-50 border border-transparent rounded-2xl text-slate-400 hover:bg-white hover:border-[#4a148c40] hover:text-[#4a148c] transition-all shadow-sm active:scale-95">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-50">
                                {['Transaction Profile', 'Chronology', 'Domain/Service', 'Quantum', 'Progress', 'Ops'].map((h, i) => (
                                    <th key={h} className={`px-8 py-5 text-[10px] font-black text-slate-300 uppercase tracking-[3px] ${i === 5 ? 'text-center' : 'text-left'}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            <AnimatePresence mode="popLayout">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-12 h-12 border-4 border-[#4a148c20] border-t-[#4a148c] rounded-full animate-spin"></div>
                                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[5px]">Compiling Audit Logs...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredTxns.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center gap-8">
                                                <span className="text-9xl grayscale opacity-40">😔</span>
                                                <div className="space-y-2">
                                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Search Logic Failed</h3>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">No matching records exist in current scope</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTxns.map((t) => (
                                        <motion.tr
                                            key={t.id}
                                            layout
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            className="hover:bg-[#4a148c03] transition-colors group cursor-default"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest group-hover:text-[#4a148c] transition-colors">#{t.id}</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">CORE-TXN-SYS</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-bold text-slate-600 tracking-tight">{new Date(t.timestamp || t.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{new Date(t.timestamp || t.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-white transition-colors relative">
                                                        {t.service?.toLowerCase().includes('recharge') ? <Smartphone size={16} className="text-blue-500" /> :
                                                            t.service?.toLowerCase().includes('bill') ? <RefreshCw size={16} className="text-orange-500" /> :
                                                                <Fingerprint size={16} className="text-emerald-500" />}
                                                    </div>
                                                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-[2px]">{t.service || 'Utility'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="text-[15px] font-black text-slate-800 tracking-tighter">
                                                    ₹{(t.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <StatusBadge status={t.status} />
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <button className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-[#4a148c] flex items-center justify-center hover:bg-white hover:border-[#4a148c] hover:shadow-lg transition-all active:scale-90">
                                                    <Printer size={16} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {!loading && filteredTxns.length > 0 && (
                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between p-4">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[3px]">
                            Showing <span className="text-slate-800">{filteredTxns.length}</span> results of {transactions.length} entries
                        </p>
                        <div className="flex gap-2">
                            <button className="h-10 px-5 bg-slate-50 rounded-xl text-[10px] font-black uppercase text-slate-300 tracking-widest cursor-not-allowed border border-slate-100">Previous</button>
                            <button className="h-10 px-5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditReport;
