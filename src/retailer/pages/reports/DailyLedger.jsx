import React, { useState } from 'react';
import { 
    Calendar, Search, Printer
} from 'lucide-react';
import { dataService } from '../../../services/dataService';
import { Icon3D } from './ReportShared';

const DailyLedger = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async () => {
        setLoading(true);
        setHasSearched(true);
        const user = dataService.getCurrentUser();
        if (user) {
            try {
                const res = await dataService.fetchSales(user.id, date);
                const txns = res?.success ? (res.transactions || []) : (Array.isArray(res) ? res : []);
                setData(txns);
            } catch (e) { setData([]); }
        }
        setLoading(false);
    };

    const filtered = (Array.isArray(data) ? data : []).filter(r => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (r.description || '').toLowerCase().includes(s) || 
               String(r.id || '').includes(s) ||
               (r.type || '').toLowerCase().includes(s);
    });

    return (
        <div className="p-4 md:p-8 space-y-6 bg-[#f1f5f9] min-h-[80vh] font-['Inter',sans-serif]">
            <div className="bg-slate-900 rounded-[2rem] px-8 py-6 flex items-center justify-between shadow-2xl overflow-hidden relative">
                <div className="absolute left-0 top-0 w-64 h-full bg-blue-600/10 blur-3xl -ml-20"></div>
                <div className="relative z-10">
                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                        <span className="text-blue-400 italic font-medium uppercase tracking-[4px] text-xs self-center">Live</span>
                        Daily Ledger
                    </h2>
                </div>
                <Icon3D icon={Search} color="#2563eb" size={24} />
            </div>

            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex flex-wrap items-end gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Select Statement Date</label>
                        <div className="relative group w-full md:w-64">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors" size={18} />
                            <input 
                                type="date" 
                                value={date} 
                                onChange={e => setDate(e.target.value)} 
                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-[13px] font-black text-slate-700 outline-none focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all" 
                            />
                        </div>
                    </div>
                    <button 
                        onClick={handleSearch} 
                        disabled={loading} 
                        className="bg-slate-900 hover:bg-blue-600 text-white h-[60px] px-12 rounded-2xl text-[11px] font-black uppercase tracking-[2px] shadow-xl transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Fetching...' : 'View Records'}
                    </button>
                    <div className="flex-1"></div>
                    <div className="flex items-center gap-3">
                        {['Xlsx', 'PDF'].map(t => (
                            <button key={t} className="bg-white border border-slate-200 text-slate-600 h-14 px-6 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:border-slate-400 hover:text-slate-900 transition-all shadow-sm active:scale-95">
                                {t} <Printer size={16} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="px-4 py-2 bg-blue-50 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-wider inline-block">
                        Total {filtered.length} Records Found
                    </div>
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search records by ID..." className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-[11px] font-bold focus:bg-white focus:border-blue-500/10 outline-none transition-all placeholder:text-slate-300" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                {['Transaction Date', 'Ref. TXN ID', 'Service Particulars', 'Debit (Dr.)', 'Credit (Cr.)', 'Running Balance'].map((h, i) => (
                                    <th key={i} className={`px-8 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-[2.5px] ${i > 2 ? 'text-right' : ''}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {!hasSearched ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-50">
                                            <Calendar size={48} className="text-slate-300" />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Choose a date to load audit logs</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-6">
                                            <span className="text-8xl grayscale-0">😔</span>
                                            <div className="space-y-2">
                                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Statement Empty</h3>
                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[3px] mt-1">No transaction history found for selected date</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                <>
                                    <tr className="bg-emerald-50/20">
                                        <td colSpan={2}></td>
                                        <td className="px-8 py-4 text-[11px] font-black text-emerald-600 uppercase tracking-tight">Brought Forward (Opening)</td>
                                        <td className="px-8 py-4 text-[11px] text-slate-300 text-right">-</td>
                                        <td className="px-8 py-4 text-[11px] text-slate-300 text-right">-</td>
                                        <td className="px-8 py-4 text-[13px] font-black text-slate-800 text-right tracking-tight">
                                           ₹ {parseFloat((filtered[0]?.balance_after || 0) - (filtered[0]?.amount || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                    {filtered.map((row, i) => (
                                        <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6 text-[11px] font-bold text-slate-500 italic">{new Date(row.created_at || Date.now()).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: 'short' })}</td>
                                            <td className="px-8 py-6">
                                                <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all">#{row.id}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight leading-tight">{row.description || 'System Utility'}</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[2px] mt-1">{row.type}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right font-black text-[13px] text-rose-600 tracking-tight">{row.type?.toLowerCase().includes('credit') ? '-' : `₹ ${parseFloat(row.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}</td>
                                            <td className="px-8 py-6 text-right font-black text-[13px] text-emerald-600 tracking-tight">{row.type?.toLowerCase().includes('credit') ? `₹ ${parseFloat(row.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}</td>
                                            <td className="px-8 py-6 text-sm font-black text-slate-800 text-right tracking-tight">₹ {parseFloat(row.balance_after || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-blue-50/30 border-t border-blue-100">
                                        <td colSpan={2}></td>
                                        <td className="px-8 py-5 text-[11px] font-black text-blue-600 uppercase tracking-[2px]">Carried Forward (Closing)</td>
                                        <td className="px-8 py-5 text-[11px] text-slate-300 text-right">-</td>
                                        <td className="px-8 py-5 text-[11px] text-slate-300 text-right">-</td>
                                        <td className="px-8 py-5 text-lg font-black text-blue-700 text-right tracking-tighter">
                                           ₹ {parseFloat(filtered[filtered.length - 1]?.balance_after || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DailyLedger;
