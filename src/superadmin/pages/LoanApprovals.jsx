import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Landmark, CheckCircle2, X, Clock, RefreshCcw, 
    Search, Filter, ArrowRight, Wallet, User, Phone,
    AlertCircle, SearchCode, ShieldCheck, ChevronRight
} from 'lucide-react';
import { dataService } from '../../services/dataService';

const LoanApprovals = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    const fetchLoans = async () => {
        setLoading(true);
        try {
            const data = await dataService.getLoans();
            setLoans(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Error fetching loans:', e);
            setStatus({ type: 'error', message: 'Failed to fetch loan applications' });
        }
        setLoading(false);
    };

    const updateStatus = async (trackingId, newStatus) => {
        if (!trackingId) return;
        try {
            const data = await dataService.updateLoanStatus(trackingId, newStatus);
            if (data.success) {
                setStatus({ type: 'success', message: `Loan ${newStatus} successfully!` });
                fetchLoans(); // Refresh
            } else {
                setStatus({ type: 'error', message: data.message || 'Update failed' });
            }
        } catch (e) {
            setStatus({ type: 'error', message: 'Network error or Java backend down' });
        }
        setTimeout(() => setStatus(null), 3000);
    };

    useEffect(() => {
        fetchLoans();
    }, []);

    const filteredLoans = loans.filter(l => {
        const matchesSearch = 
            (l.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (l.phone?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (l.tracking_id?.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesFilter = filterStatus === 'ALL' || l.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const getStatusStyle = (status) => {
        switch (status?.toUpperCase()) {
            case 'APPROVED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'REJECTED': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'INITIATED': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'PROCESSING': return 'bg-amber-50 text-amber-600 border-amber-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-8 font-['Inter',sans-serif]">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase flex items-center gap-3">
                        <Landmark className="text-indigo-600" size={32} />
                        Loan Journey Management
                    </h1>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Review and manage ONDC loan applications</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchLoans}
                        disabled={loading}
                        className="p-3 bg-white border border-slate-200 text-indigo-600 rounded-2xl hover:bg-indigo-50 hover:border-indigo-200 transition-all active:scale-95 shadow-sm disabled:opacity-50"
                    >
                        <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    {status && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} 
                            className={`px-4 py-3 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest shadow-lg ${status.type === 'error' ? 'bg-red-500 shadow-red-500/20' : 'bg-emerald-500 shadow-emerald-500/20'}`}>
                            {status.message}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Filter / Search Bar */}
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[300px] relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by name, phone or tracking ID..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {['ALL', 'INITIATED', 'PROCESSING', 'APPROVED', 'REJECTED'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loans Table */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                            <tr>
                                <th className="px-8 py-5">Applicant Details</th>
                                <th className="px-8 py-5">Loan Info</th>
                                <th className="px-8 py-5">Offer / Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredLoans.map((loan, idx) => (
                                <motion.tr 
                                    key={loan.app_id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="hover:bg-slate-50/50 transition-colors group"
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                                                {loan.name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800 text-base">{loan.name || 'Anonymous User'}</p>
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-0.5">
                                                    <Phone size={12} className="text-slate-300" />
                                                    {loan.phone || 'N/A'}
                                                </div>
                                                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-1.5 bg-indigo-50 inline-block px-2 py-0.5 rounded-full">ID: {loan.tracking_id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Requested:</p>
                                                <p className="text-sm font-black text-slate-700">₹{parseFloat(loan.requested_amount || 0).toLocaleString('en-IN')}</p>
                                            </div>
                                            {loan.lender_name && (
                                                <div className="flex items-center gap-2">
                                                    <ShieldCheck size={12} className="text-emerald-500" />
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{loan.lender_name}</p>
                                                </div>
                                            )}
                                            <p className="text-[9px] font-bold text-slate-400">Created: {new Date(loan.updated_at).toLocaleString()}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-3">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(loan.status)}`}>
                                                {loan.status}
                                            </span>
                                            {loan.offer_amount > 0 && (
                                                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2 max-w-[140px]">
                                                    <p className="text-[8px] font-black text-emerald-600/60 uppercase tracking-widest mb-0.5">Final Offer</p>
                                                    <p className="text-xs font-black text-emerald-700">₹{parseFloat(loan.offer_amount).toLocaleString('en-IN')} @ {loan.interest_rate}</p>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            {loan.status === 'INITIATED' || loan.status === 'PROCESSING' || !loan.status ? (
                                                <>
                                                    <button 
                                                        onClick={() => updateStatus(loan.tracking_id, 'approved')}
                                                        className="h-10 px-4 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button 
                                                        onClick={() => updateStatus(loan.tracking_id, 'rejected')}
                                                        className="h-10 px-4 bg-white border border-rose-200 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:scale-105 active:scale-95 transition-all"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-2 text-slate-300">
                                                    <span className="text-[10px] font-black uppercase tracking-tighter">Processed</span>
                                                    <CheckCircle2 size={16} />
                                                </div>
                                            )}
                                            <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                                                <ChevronRight size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                            
                            {filteredLoans.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                                                <SearchCode size={32} className="text-slate-200" />
                                            </div>
                                            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">No matching loan applications found</p>
                                            <button 
                                                onClick={() => { setSearchTerm(''); setFilterStatus('ALL'); }}
                                                className="text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline"
                                            >
                                                Clear all filters
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {loading && (
                    <div className="py-12 flex justify-center bg-white/50 backdrop-blur-sm">
                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                <div className="px-8 py-5 bg-slate-50 border-t flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <p>Total {filteredLoans.length} Applications</p>
                    <div className="flex items-center gap-4">
                        <p className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Approved</p>
                        <p className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Initiated</p>
                        <p className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Rejected</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoanApprovals;
