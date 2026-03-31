import React, { useState, useEffect } from 'react';
import { 
    BarChart3, TrendingUp, Users, MapPin, Calendar, 
    ArrowUpRight, Trophy, Star, Filter, RefreshCcw, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { dataService, BACKEND_URL } from '../../services/dataService';

const ReportsAnalyst = () => {
    const [merchants, setMerchants] = useState([]);
    const [timeframe, setTimeframe] = useState('month'); // day, week, month, year
    const [selectedState, setSelectedState] = useState('All States');
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    const indianStates = [
        "All States", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
        "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
        "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
        "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Chandigarh"
    ];

    const fetchTopMerchants = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('rupiksha_token');
            const res = await fetch(`${BACKEND_URL}/admin/reports/top-merchants?timeframe=${timeframe}&state=${selectedState}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setMerchants(data.merchants);
            }
        } catch (e) {
            console.error("Failed to fetch reports", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTopMerchants();
    }, [timeframe, selectedState]);

    const filteredMerchants = merchants.filter(m => 
        m.name?.toLowerCase().includes(search.toLowerCase()) || 
        m.business_name?.toLowerCase().includes(search.toLowerCase()) ||
        m.mobile?.includes(search)
    );

    const getTimeframeLabel = () => {
        switch(timeframe) {
            case 'day': return 'Today';
            case 'week': return 'This Week';
            case 'month': return 'This Month';
            case 'year': return 'This Year';
            default: return 'Custom';
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Simple Inline Controls */}
            <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-4 flex flex-wrap items-center gap-4 shadow-sm">
                <div className="flex-1 min-w-[200px] flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-100">
                        {['day', 'week', 'month', 'year'].map(tf => (
                            <button
                                key={tf}
                                onClick={() => setTimeframe(tf)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                                    timeframe === tf 
                                    ? 'bg-[#0f172a] text-white shadow-md' 
                                    : 'text-slate-400 hover:bg-white hover:shadow-sm'
                                }`}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>
                    <div className="h-8 w-px bg-slate-100 hidden md:block"></div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:block">
                        Leaderboard: <span className="text-blue-600">{getTimeframeLabel()}</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchTopMerchants}
                        className="bg-slate-50 border border-slate-200 text-slate-400 p-3 rounded-2xl hover:bg-white hover:text-blue-600 transition-all shadow-sm"
                    >
                        <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
                    <input 
                        type="text"
                        placeholder="Search merchant or mobile..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-[1.5rem] text-sm font-bold placeholder:text-slate-300 outline-none focus:border-indigo-500 transition-all shadow-sm"
                    />
                </div>

                <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
                    <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-[1.5rem] text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all shadow-sm appearance-none cursor-pointer"
                    >
                        {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className="flex bg-white rounded-[1.5rem] border-2 border-slate-100 p-1 shadow-sm">
                    <div className="flex-1 flex items-center justify-center gap-3 border-r border-slate-100 px-4">
                        <TrendingUp className="text-emerald-500" size={18} />
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Top Volume</p>
                            <p className="text-sm font-black text-slate-800 truncate">
                                ₹ {merchants[0] ? parseFloat(merchants[0].totalVolume).toLocaleString() : '0'}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={fetchTopMerchants}
                        className="p-4 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                        <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Leaderboard Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Analysing Data...</p>
                        </div>
                    </div>
                )}

                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Merchant Leaderboard</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Top performing partners in {selectedState} for {getTimeframeLabel()}
                        </p>
                    </div>
                    <Trophy className="text-amber-400" size={32} />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/80">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Partner Details</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">State</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Transactions</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total Business</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 font-semibold">
                            {filteredMerchants.map((merchant, index) => (
                                <tr key={merchant.id} className="hover:bg-indigo-50/30 transition-all group">
                                    <td className="px-8 py-5">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black
                                            ${index === 0 ? 'bg-amber-100 text-amber-700' : 
                                              index === 1 ? 'bg-slate-200 text-slate-700' :
                                              index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-500'}
                                        `}>
                                            #{index + 1}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-[1rem] bg-indigo-50 flex items-center justify-center text-indigo-600 font-black uppercase text-xs">
                                                {merchant.name?.charAt(0) || 'M'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors uppercase">
                                                    {merchant.name}
                                                </p>
                                                <p className="text-[10px] text-slate-400 mt-1 uppercase">
                                                    {merchant.business_name} • {merchant.mobile}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={12} className="text-slate-300" />
                                            <span className="text-[11px] text-slate-600 uppercase font-black">{merchant.state || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border
                                            ${merchant.role === 'RETAILER' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}
                                        `}>
                                            {merchant.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right font-black text-slate-600 text-xs">
                                        {merchant.txnCount} Txns
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="text-base font-black text-slate-900">
                                            ₹ {parseFloat(merchant.totalVolume).toLocaleString()}
                                        </div>
                                        <div className="flex items-center justify-end gap-1 text-[9px] text-emerald-500 font-bold uppercase mt-1">
                                            <ArrowUpRight size={10} />
                                            Active Partner
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredMerchants.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <Search size={48} className="text-slate-400" />
                                            <p className="text-xs font-black uppercase tracking-widest">No matching performance data found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-8 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Total Analytics: {filteredMerchants.length} Active Partners
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-slate-400 uppercase">Live Tracking</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsAnalyst;
