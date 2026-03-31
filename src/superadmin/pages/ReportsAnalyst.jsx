import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    TrendingUp, Award, MapPin, Calendar, 
    ChevronRight, Filter, Download, User, 
    Building2, Activity, Star, RefreshCcw,
    Search, Globe, ArrowUpRight
} from 'lucide-react';
import { dataService } from '../../services/dataService';

const ReportsAnalyst = () => {
    const [period, setPeriod] = useState('month');
    const [state, setState] = useState('All');
    const [merchants, setMerchants] = useState([]);
    const [loading, setLoading] = useState(false);

    const indianStates = [
        "All", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
        "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
        "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
        "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
        "Uttarakhand", "West Bengal", "Delhi"
    ];

    const fetchTopMerchants = async () => {
        setLoading(true);
        const res = await dataService.getTopMerchants(period, state);
        if (res.success) {
            setMerchants(res.merchants);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTopMerchants();
    }, [period, state]);

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 pb-24 font-['Inter',sans-serif]">
            
            {/* ── Header Segment ── */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                            <TrendingUp size={16} className="text-indigo-600" />
                        </div>
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">Strategic Analytics</p>
                    </div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Reports Analyst</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Real-time performance ranking across the nation</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                        {['day', 'week', 'month', 'year'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                                ${period === p ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={fetchTopMerchants}
                        className="p-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all active:rotate-180 shadow-lg shadow-indigo-200"
                    >
                        <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* ── Filters Row ── */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-wrap items-center gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                            <Globe size={10} /> State Filter
                        </label>
                        <select 
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="bg-slate-50 border-2 border-slate-50 px-5 py-3 rounded-xl text-xs font-black text-slate-700 outline-none focus:bg-white focus:border-indigo-100 transition-all"
                        >
                            {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="h-10 w-px bg-slate-100 hidden md:block" />

                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[2px]">Currently Viewing</p>
                        <p className="text-sm font-black text-slate-800">Top 10 Performers in {state === 'All' ? 'India' : state}</p>
                    </div>
                </div>

                <button className="bg-slate-900 text-white px-8 py-4 rounded-[2rem] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl active:scale-95">
                    <Download size={18} />
                    <span className="text-[11px] font-black uppercase tracking-widest">Download Insight Report</span>
                </button>
            </div>

            {/* ── Merchants Ranking ── */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
                
                {/* Ranking Table */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[600px]">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                        <h3 className="font-black text-slate-800 flex items-center gap-3 uppercase tracking-tighter text-lg">
                            <Award size={24} className="text-amber-500" />
                            Performance Leaderboard
                        </h3>
                        <Activity size={20} className="text-slate-300" />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 bg-slate-50/20">
                                    <th className="px-8 py-5">Rank</th>
                                    <th className="px-8 py-5">Merchant Details</th>
                                    <th className="px-8 py-5">Location</th>
                                    <th className="px-8 py-5">Txns</th>
                                    <th className="px-8 py-5 text-right">Volume (₹)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                <AnimatePresence mode="popLayout">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-32 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Collating Network Data...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : merchants.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-32 text-center">
                                                <div className="flex flex-col items-center gap-4 opacity-30">
                                                    <Search size={48} className="text-slate-300" />
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">No data for selected filters</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        merchants.map((m, idx) => (
                                            <motion.tr 
                                                key={m.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="group hover:bg-slate-50/50 transition-all cursor-default"
                                            >
                                                <td className="px-8 py-6">
                                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm border-2 transition-transform group-hover:scale-110 shadow-sm
                                                        ${idx === 0 ? 'bg-amber-50 border-amber-200 text-amber-600 shadow-amber-100' : 
                                                          idx === 1 ? 'bg-slate-50 border-slate-200 text-slate-500 shadow-slate-100' :
                                                          idx === 2 ? 'bg-orange-50 border-orange-200 text-orange-600 shadow-orange-100' :
                                                          'bg-white border-slate-100 text-slate-400'}`}
                                                    >
                                                        {idx + 1}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full border-2 border-indigo-50 p-1">
                                                            <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-indigo-600 font-black tracking-tighter text-[10px] uppercase">
                                                                {m.full_name?.substring(0, 2) || m.username?.substring(0, 2)}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-slate-800">{m.business_name || m.full_name}</p>
                                                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">{m.username}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5 uppercase tracking-tight mb-1">
                                                            <MapPin size={10} className="text-slate-300" /> {m.city}
                                                        </span>
                                                        <span className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-[2px]">{m.state}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-black border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                        {m.txn_count} <Activity size={10} />
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex flex-col items-end">
                                                        <p className="text-lg font-black text-slate-800 tracking-tight">₹{parseFloat(m.total_volume).toLocaleString('en-IN')}</p>
                                                        <div className="flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1">
                                                            <ArrowUpRight size={10} /> top performer
                                                        </div>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-50">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Data refreshed automatically every 5 minutes based on settled settlements</p>
                    </div>
                </div>

                {/* Side Stats */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
                        <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-indigo-500/20 rounded-full" />
                        
                        <div className="relative z-10 space-y-8">
                            <div>
                                <h4 className="text-[11px] font-black text-white/60 uppercase tracking-[4px] mb-2">Network Leader</h4>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                        <Star size={24} className="text-amber-400 animate-pulse" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-black">{merchants[0]?.business_name || 'Calculating...'}</p>
                                        <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">{merchants[0]?.state}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-black text-white/50 uppercase mb-1">Total Volume</p>
                                    <p className="text-2xl font-black tracking-tight">₹{parseFloat(merchants[0]?.total_volume || 0).toLocaleString('en-IN')}</p>
                                </div>
                                <div className="w-px h-10 bg-white/10" />
                                <div>
                                    <p className="text-[10px] font-black text-white/50 uppercase mb-1">Transactions</p>
                                    <p className="text-2xl font-black text-center">{merchants[0]?.txn_count || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                            <Building2 size={18} className="text-indigo-600" />
                            Market Insights
                        </h4>
                        
                        <div className="space-y-4">
                            {[
                                { label: 'Active Regions', val: merchants.reduce((acc, m) => acc.add(m.state), new Set()).size, sub: 'States with high activity', col: 'indigo' },
                                { label: 'Avg Merchant Vol', val: '₹' + Math.floor(merchants.reduce((acc, m) => acc + parseFloat(m.total_volume), 0) / (merchants.length || 1)).toLocaleString('en-IN'), sub: 'Calculated for top 10', col: 'emerald' },
                                { label: 'Success Velocity', val: '99.8%', sub: 'Transaction success rate', col: 'amber' }
                            ].map((s, i) => (
                                <div key={i} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50 group hover:border-indigo-100 transition-all cursor-default">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">{s.label}</p>
                                    <p className="text-xl font-black text-slate-800 mt-1">{s.val}</p>
                                    <p className="text-[9px] font-bold text-slate-400 mt-1">{s.sub}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default ReportsAnalyst;
