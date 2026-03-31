import React, { useState } from 'react';
import { 
    FileText, Search, Download, Calendar, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { dataService } from '../../../services/dataService';
import { Icon3D, StatusBadge } from './ReportShared';

const SaleReport = () => {
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [salesData, setSalesData] = useState(null);

    const handleFetchSales = async () => {
        setLoading(true);
        const user = dataService.getCurrentUser();
        if (user) {
            try {
                const res = await dataService.fetchSales(user.id, selectedDate);
                const data = res?.success ? (res.transactions || []) : (Array.isArray(res) ? res : []);
                setSalesData(data);
            } catch (e) { setSalesData([]); }
        }
        setLoading(false);
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20 font-['Inter',sans-serif]">
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-[#4a148c]/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="flex items-center gap-6 relative z-10">
                    <Icon3D icon={FileText} color="#4a148c" size={28} />
                    <div>
                        <p className="text-[10px] font-black text-[#4a148c] uppercase tracking-[5px] mb-1.5 opacity-60">Operations Intelligence</p>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Executive Sales</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Daily revenue performance</p>
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

            <div className="space-y-8">
                {/* ── Sale Date Picker ── */}
                <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="space-y-2 flex-1 md:flex-none">
                            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Daily Performance Date</label>
                            <div className="relative group w-full md:w-80">
                                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-emerald-500 transition-colors" size={20} />
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full h-16 pl-14 pr-6 bg-slate-50 border-2 border-slate-50 rounded-2xl text-[14px] font-black text-slate-700 outline-none focus:bg-white focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/5 transition-all"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleFetchSales}
                            disabled={loading}
                            className="h-16 px-12 bg-emerald-600 text-white rounded-2xl text-[12px] font-black uppercase tracking-[3px] shadow-xl shadow-emerald-500/10 hover:bg-emerald-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 mt-auto md:mt-0"
                        >
                            {loading ? 'Analyzing...' : 'Generate Report'}
                        </button>
                    </div>
                </div>

                {/* ── Results ── */}
                <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm min-h-[400px] flex items-center justify-center relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-[11px] font-black uppercase tracking-[4px] text-slate-400">Syncing sales cloud...</p>
                            </motion.div>
                        ) : salesData === null ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
                                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto">
                                    <Search size={40} className="text-slate-200" />
                                </div>
                                <p className="text-[11px] font-black text-slate-300 uppercase tracking-[4px]">Query a date to see volume details</p>
                            </motion.div>
                        ) : salesData.length === 0 ? (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-8">
                                <span className="text-9xl filter grayscale opacity-60">😔</span>
                                <div className="text-center space-y-3">
                                    <h3 className="text-3xl font-black text-slate-800 tracking-tight">Zero Sales Found</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[3px] leading-relaxed"> No transactions recorded for {new Date(selectedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-slate-50">
                                                {['ID', 'Timestamp', 'Particulars', 'Amount (INR)', 'Status'].map(h => (
                                                    <th key={h} className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[3px]">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {salesData.map((t) => (
                                                <tr key={t.id} className="hover:bg-emerald-50/20 transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-all">#{t.id}</span>
                                                    </td>
                                                    <td className="px-8 py-6 whitespace-nowrap">
                                                        <span className="text-[11px] font-bold text-slate-600">{new Date(t.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{t.type}</span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="text-[15px] font-black text-slate-800 tracking-tighter">
                                                            ₹{parseFloat(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <StatusBadge status={t.status} />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-slate-900 text-white font-black uppercase text-[11px] tracking-[3px]">
                                                <td colSpan="3" className="px-8 py-8 text-right opacity-60">Daily Volume Summation</td>
                                                <td colSpan="2" className="px-8 py-8 text-left text-2xl font-black text-emerald-400 tracking-tighter">
                                                    ₹{salesData.reduce((acc, curr) => acc + parseFloat(curr.amount), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default SaleReport;
