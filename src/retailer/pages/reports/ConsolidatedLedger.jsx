import React, { useState } from 'react';
import { 
    FileText, Search, Download, Calendar, AlertCircle
} from 'lucide-react';
import { dataService } from '../../../services/dataService';

const ConsolidatedLedger = () => {
    const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
    const [ledgerData, setLedgerData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async () => {
        setLoading(true);
        setHasSearched(true);
        const user = dataService.getCurrentUser();
        if (user) {
            try {
                const res = await dataService.fetchSales(user.id, fromDate); 
                const txns = res?.success ? (res.transactions || []) : (Array.isArray(res) ? res : []);
                setLedgerData(txns);
            } catch (e) { setLedgerData([]); }
        }
        setLoading(false);
    };

    const filtered = (Array.isArray(ledgerData) ? ledgerData : []).filter(row => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (row.description || '').toLowerCase().includes(s) || 
               String(row.id || '').includes(s) ||
               (row.type || '').toLowerCase().includes(s);
    });

    const totalDr = filtered.reduce((acc, row) => acc + (row.type?.toLowerCase().includes('debit') ? parseFloat(row.amount || 0) : 0), 0);
    const totalCr = filtered.reduce((acc, row) => acc + (row.type?.toLowerCase().includes('credit') ? parseFloat(row.amount || 0) : 0), 0);
    const finalBalance = filtered.length > 0 ? filtered[filtered.length - 1].balance_after : 0;

    return (
        <div className="p-4 md:p-8 space-y-6 bg-slate-50 min-h-[80vh] font-['Inter',sans-serif]">
            <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
                <div className="bg-[#1e3a8a] px-8 py-5 flex items-center gap-3">
                    <FileText className="text-white/60" size={20} />
                    <h2 className="text-sm font-black text-white uppercase tracking-[3px]">Consolidated Ledger</h2>
                </div>
                
                <div className="p-8 space-y-6">
                    <div className="flex flex-wrap items-end gap-6 justify-between">
                        <div className="flex flex-wrap items-center gap-8">
                            {[{ label: 'From', val: fromDate, set: setFromDate }, { label: 'To', val: toDate, set: setToDate }].map((d, i) => (
                                <div key={i} className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">{d.label} Date</label>
                                    <div className="flex border-2 border-slate-50 rounded-2xl overflow-hidden bg-slate-50 focus-within:bg-white focus-within:border-blue-500/20 transition-all">
                                        <div className="px-4 py-3.5 border-r border-slate-200 flex items-center justify-center text-slate-400">
                                            <Calendar size={18} />
                                        </div>
                                        <input type="date" value={d.val} onChange={e => d.set(e.target.value)} className="px-5 py-3.5 text-xs font-black outline-none bg-transparent text-slate-700" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={handleSearch} 
                            disabled={loading}
                            className="bg-[#1e3a8a] text-white px-12 h-14 rounded-2xl text-[11px] font-black uppercase tracking-[2px] hover:bg-blue-900 transition-all shadow-xl shadow-blue-900/10 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'Compiling...' : 'Search Ledger'}
                        </button>
                    </div>
                    <p className="text-[10px] text-amber-600 font-bold italic flex items-center gap-1.5">
                        <AlertCircle size={12} />
                        Note: Date range must be within 30 days for optimal performance.
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 px-2">
                <div className="flex items-center gap-3">
                    {['Xlsx', 'PDF'].map(t => (
                        <button key={t} className="bg-slate-900 text-white h-11 px-5 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95">
                            {t} <Download size={14} />
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" placeholder="Filter current view..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-bold focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder:text-slate-300" />
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-50">
                                {['V. date', 'Particulars', 'Dr.', 'Cr.', 'Balance'].map((h, i) => (
                                    <th key={i} className={`px-8 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-[2px] ${i > 1 ? 'text-right' : ''}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {!hasSearched ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center">
                                                <Calendar className="text-slate-300" size={32} />
                                            </div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Select dates to view ledger activity</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-6">
                                            <span className="text-8xl grayscale opacity-50">😔</span>
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-black text-slate-800 tracking-tight">No Transactions Found</h3>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No activity recorded for this period</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                <>
                                    <tr className="bg-blue-50/20 group hover:bg-blue-50/40 transition-colors">
                                        <td className="px-8 py-5 text-[11px] font-bold text-slate-400">{new Date(fromDate).toLocaleDateString('en-GB').replace(/\//g, '-')}</td>
                                        <td className="px-8 py-5 text-[11px] font-black text-slate-800 uppercase tracking-tight">Opening Balance Brought Forward</td>
                                        <td className="px-8 py-5 text-right text-[11px] font-bold text-slate-400">0.00</td>
                                        <td className="px-8 py-5 text-right text-[11px] font-bold text-slate-400">0.00</td>
                                        <td className="px-8 py-5 text-right text-[11px] font-black text-slate-800 tracking-tight">0.00 Cr.</td>
                                    </tr>
                                    {filtered.map((row, i) => (
                                        <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-8 py-5 text-[11px] font-bold text-slate-500 whitespace-nowrap">{new Date(row.created_at || Date.now()).toLocaleDateString('en-GB').replace(/\//g, '-')}</td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{row.description || 'Service Transaction'}</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">REF: #{row.id}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right text-[11px] font-black text-rose-600 tracking-tight">{row.type?.toLowerCase().includes('debit') ? parseFloat(row.amount || 0).toFixed(2) : '0.00'}</td>
                                            <td className="px-8 py-5 text-right text-[11px] font-black text-emerald-600 tracking-tight">{row.type?.toLowerCase().includes('credit') ? parseFloat(row.amount || 0).toFixed(2) : '0.00'}</td>
                                            <td className="px-8 py-5 text-right text-[11px] font-black text-slate-800 tracking-tight">
                                                {parseFloat(row.balance_after || 0).toFixed(2)} {(row.balance_after || 0) >= 0 ? 'Cr.' : 'Dr.'}
                                            </td>
                                        </tr>
                                    ))}
                                </>
                            )}
                        </tbody>
                        {filtered.length > 0 && (
                            <tfoot className="border-t-2 border-slate-50">
                                <tr className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest">
                                    <td className="px-8 py-6" colSpan={2}>Grand Total Statistics</td>
                                    <td className="px-8 py-6 text-right text-rose-400 font-extrabold text-sm">₹ {totalDr.toFixed(2)}</td>
                                    <td className="px-8 py-6 text-right text-emerald-400 font-extrabold text-sm">₹ {totalCr.toFixed(2)}</td>
                                    <td className="px-8 py-6 text-right text-white font-extrabold text-sm">₹ {parseFloat(finalBalance).toFixed(2)} {finalBalance >= 0 ? 'Cr.' : 'Dr.'}</td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ConsolidatedLedger;
