import React, { useState, useEffect } from 'react';
import {
    CheckCircle2, XCircle, Clock, Search, RefreshCcw,
    IndianRupee, Building2, User, Phone, Calendar,
    ChevronRight, ExternalLink, ShieldCheck, AlertCircle,
    Download, Filter, MoreVertical, Eye, ArrowUpRight, ArrowDownRight,
    SearchX, LayoutGrid, List, FileText, MapPin, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { dataService } from '../../services/dataService';

const LoanApprovalManager = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [simulatingId, setSimulatingId] = useState(null);
    const [selectedLoan, setSelectedLoan] = useState(null);

    const refreshLoans = async () => {
        setLoading(true);
        try {
            const data = await dataService.getLoans();
            setLoans(data);
        } catch (error) {
            console.error("Failed to fetch loans:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleResetData = () => {
        if (window.confirm("Are you sure you want to reset all data to default mock values? This will clear local changes.")) {
            dataService.resetData();
            window.location.reload();
        }
    };

    useEffect(() => {
        refreshLoans();
    }, []);

    const handleSimulate = async (trackingId, status) => {
        setSimulatingId(trackingId);
        try {
            const res = await dataService.simulateLoanStatus(trackingId, status);
            if (res.success) {
                // Keep the simulation status long enough to show animation
                setTimeout(() => {
                    refreshLoans();
                    setSimulatingId(null);
                    if (selectedLoan?.tracking_id === trackingId) {
                        setSelectedLoan(prev => ({ ...prev, status: status }));
                    }
                }, 1000);
            } else {
                alert("Action failed: " + res.message);
                setSimulatingId(null);
            }
        } catch (error) {
            alert("Connection error: " + error.message);
            setSimulatingId(null);
        }
    };

    const filteredLoans = loans.filter(loan => {
        const matchesSearch = (
            loan.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loan.phone?.includes(searchTerm) ||
            loan.tracking_id?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const matchesStatus = filterStatus === 'all' || loan.status?.toLowerCase() === filterStatus.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    const getStatusConfig = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return {
                    bg: 'bg-emerald-50',
                    text: 'text-emerald-700',
                    border: 'border-emerald-100',
                    dot: 'bg-emerald-500',
                    icon: <CheckCircle2 size={12} />
                };
            case 'rejected':
                return {
                    bg: 'bg-rose-50',
                    text: 'text-rose-700',
                    border: 'border-rose-100',
                    dot: 'bg-rose-500',
                    icon: <XCircle size={12} />
                };
            case 'initiated':
                return {
                    bg: 'bg-blue-50',
                    text: 'text-blue-700',
                    border: 'border-blue-100',
                    dot: 'bg-blue-500',
                    icon: <RefreshCcw size={12} />
                };
            case 'pending':
                return {
                    bg: 'bg-amber-50',
                    text: 'text-amber-700',
                    border: 'border-amber-100',
                    dot: 'bg-amber-500',
                    icon: <Clock size={12} />
                };
            default:
                return {
                    bg: 'bg-slate-50',
                    text: 'text-slate-700',
                    border: 'border-slate-100',
                    dot: 'bg-slate-500',
                    icon: <AlertCircle size={12} />
                };
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Calculate stats
    const stats = {
        total: loans.length,
        approved: loans.filter(l => l.status?.toLowerCase() === 'approved').length,
        pending: loans.filter(l => ['pending', 'initiated'].includes(l.status?.toLowerCase())).length,
        rejected: loans.filter(l => l.status?.toLowerCase() === 'rejected').length
    };

    return (
        <div className="space-y-8 pb-20 p-2">
            {/* --- Header Section --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Loan Approval Center</h2>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Manage ONDC Loan Lead Approvals & Status</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleResetData}
                        className="flex items-center gap-2 px-6 py-3 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm border border-rose-100 hover:bg-rose-600 hover:text-white transition-all active:scale-95"
                    >
                        <RefreshCcw size={16} />
                        Reset Mock Data
                    </button>
                    <button
                        onClick={refreshLoans}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm border border-indigo-50 hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
                    >
                        <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
                        Refresh Data
                    </button>
                </div>
            </div>

            {/* --- Advanced Stats Strip --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Requests', value: stats.total, color: 'indigo', icon: <User /> },
                    { label: 'Approved Leads', value: stats.approved, color: 'emerald', icon: <CheckCircle2 /> },
                    { label: 'In Progress', value: stats.pending, color: 'amber', icon: <Clock /> },
                    { label: 'Rejected', value: stats.rejected, color: 'rose', icon: <XCircle /> },
                ].map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className={`bg-white rounded-[2rem] p-6 border-b-4 border-${stat.color}-500 shadow-xl shadow-slate-200/50 flex items-center gap-5`}
                    >
                        <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 shadow-inner`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-black text-slate-800 leading-none">{stat.value}</h3>
                                <span className={`text-[10px] font-bold text-${stat.color}-500`}>
                                    {stat.total > 0 ? `${Math.round((stat.value / (stats.total || 1)) * 100)}%` : '0%'}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* --- Filter & Controls --- */}
            <div className="bg-white/60 backdrop-blur-xl p-4 rounded-[2rem] border border-white shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between sticky top-4 z-10 mx-1">
                <div className="relative w-full md:w-96 flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, phone or tracking ID..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-50 outline-none transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    {['all', 'initiated', 'pending', 'approved', 'rejected'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border ${
                                filterStatus === status
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-100'
                                    : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- Main Content Table/List --- */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] border-b border-slate-100">
                                <th className="px-10 py-8">Customer & Contact</th>
                                <th className="px-8 py-8">Tracking Info</th>
                                <th className="px-8 py-8">Approval Status</th>
                                <th className="px-8 py-8">Loan Offer</th>
                                <th className="px-8 py-8">Control Deck</th>
                                <th className="px-10 py-8 text-right">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-10 py-12">
                                            <div className="h-4 bg-slate-100 rounded-full w-full mb-2"></div>
                                            <div className="h-2 bg-slate-50 rounded-full w-1/2"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredLoans.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-10 py-24 text-center">
                                        <div className="flex flex-col items-center gap-6 opacity-30">
                                            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center">
                                                <SearchX size={48} className="text-slate-400" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xl font-black text-slate-800 uppercase tracking-tight">No Leads Found</p>
                                                <p className="text-sm font-medium text-slate-400">Try adjusting your filters or search term</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredLoans.map((loan, idx) => {
                                const status = getStatusConfig(loan.status);
                                return (
                                    <motion.tr
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={loan.app_id}
                                        className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                                        onClick={() => setSelectedLoan(loan)}
                                    >
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 font-black text-base shadow-sm group-hover:scale-105 transition-transform">
                                                        {loan.name?.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${status.dot} shadow-sm`} />
                                                </div>
                                                <div>
                                                    <p className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{loan.name}</p>
                                                    <div className="flex flex-col gap-1 mt-0.5">
                                                        <div className="flex items-center gap-2 text-slate-500">
                                                            <Phone size={10} strokeWidth={3} />
                                                            <span className="text-[11px] font-bold tracking-tight">{loan.phone}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-200">
                                                                {loan.loan_type || 'Loan Lead'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8">
                                            <div className="space-y-1">
                                                <span className="font-mono text-[11px] font-bold text-indigo-600 bg-indigo-50/50 px-3 py-1.5 rounded-lg border border-indigo-100">
                                                    {loan.tracking_id}
                                                </span>
                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest pl-1 mt-1">Ref ID: {loan.app_id}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8">
                                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl ${status.bg} ${status.border} ${status.text} border shadow-sm`}>
                                                <span className="bg-white/50 p-1 rounded-lg">{status.icon}</span>
                                                <span className="text-[11px] font-black uppercase tracking-wider">{loan.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8">
                                            {loan.offer_amount ? (
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1.5">
                                                        <IndianRupee size={12} className="text-emerald-500" />
                                                        <span className="text-lg font-black text-slate-900">{parseFloat(loan.offer_amount).toLocaleString('en-IN')}</span>
                                                    </div>
                                                    <span className="text-[10px] text-indigo-500 font-black uppercase tracking-tighter mt-1 bg-indigo-50 px-2 py-0.5 rounded-md inline-block w-fit">
                                                        {loan.lender_name} • {loan.interest_rate}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-slate-300">
                                                    <Clock size={14} />
                                                    <span className="text-[10px] italic font-black uppercase tracking-widest italic">Awaiting Quote</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-8">
                                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    disabled={simulatingId === loan.tracking_id}
                                                    onClick={() => handleSimulate(loan.tracking_id, 'approved')}
                                                    className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex items-center justify-center group/btn disabled:opacity-50"
                                                    title="Approve Simulation"
                                                >
                                                    <CheckCircle2 size={20} className="group-hover/btn:scale-110 transition-transform" />
                                                </button>
                                                <button
                                                    disabled={simulatingId === loan.tracking_id}
                                                    onClick={() => handleSimulate(loan.tracking_id, 'rejected')}
                                                    className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm flex items-center justify-center group/btn disabled:opacity-50"
                                                    title="Reject Simulation"
                                                >
                                                    <XCircle size={20} className="group-hover/btn:scale-110 transition-transform" />
                                                </button>
                                                <button
                                                    className="w-10 h-10 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center justify-center"
                                                    title="View Full Identity"
                                                    onClick={() => setSelectedLoan(loan)}
                                                >
                                                    <Eye size={20} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <p className="text-[12px] font-black text-slate-800">{formatDate(loan.updated_at).split(',')[0]}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{formatDate(loan.updated_at).split(',')[1]}</p>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- Loan Detail Sidebar/Modal --- */}
            <AnimatePresence>
                {selectedLoan && (
                    <div className="fixed inset-0 z-50 flex items-center justify-end p-4 md:p-8 overflow-hidden pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedLoan(null)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md pointer-events-auto"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-2xl h-full bg-white rounded-[3rem] shadow-2xl pointer-events-auto flex flex-col overflow-hidden border-l border-white"
                        >
                            {/* Modal Header */}
                            <div className="p-8 pt-10 flex items-center justify-between bg-slate-50/50 border-b border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-3xl bg-indigo-600 text-white flex items-center justify-center text-xl font-black shadow-xl shadow-indigo-100">
                                        {selectedLoan.name?.substring(0, 1).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 leading-tight">{selectedLoan.name}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusConfig(selectedLoan.status).bg} ${getStatusConfig(selectedLoan.status).text} ${getStatusConfig(selectedLoan.status).border}`}>
                                                {selectedLoan.status}
                                            </span>
                                            <span className="text-[11px] text-slate-400 font-bold font-mono">#{selectedLoan.tracking_id}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedLoan(null)}
                                    className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all hover:rotate-90"
                                >
                                    <XCircle size={24} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto p-10 space-y-12">
                                {/* Offer Highligh Card */}
                                <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden shadow-2xl">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full -mr-32 -mt-32 blur-3xl" />
                                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                                        <div>
                                            <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-3">Verified Offer Data</p>
                                            <h4 className="text-5xl font-black text-white tracking-tight">
                                                ₹{selectedLoan.offer_amount ? parseFloat(selectedLoan.offer_amount).toLocaleString('en-IN') : '0.00'}
                                            </h4>
                                            <p className="text-slate-400 text-sm font-bold mt-2">Maximum Approved Limit • ONDC FS</p>
                                        </div>
                                        <div className="flex flex-col gap-2 w-full md:w-auto">
                                            <div className="px-5 py-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-between gap-6">
                                                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Lender</span>
                                                <span className="text-white font-black text-sm">{selectedLoan.lender_name || 'N/A'}</span>
                                            </div>
                                            <div className="px-5 py-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-between gap-6">
                                                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">ROI</span>
                                                <span className="text-emerald-400 font-black text-sm">{selectedLoan.interest_rate || '10.5% p.a.'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <User size={12} className="text-indigo-400" /> Full Name
                                            </label>
                                            <p className="text-lg font-black text-slate-800">{selectedLoan.name}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <Phone size={12} className="text-emerald-400" /> Phone Number
                                            </label>
                                            <p className="text-lg font-black text-slate-800 font-mono tracking-tighter">{selectedLoan.phone}</p>
                                        </div>
                                    </div>
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    <LayoutGrid size={12} className="text-indigo-400" /> Applied Loan Type
                                                </label>
                                                <p className="text-lg font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100 w-fit">
                                                    {selectedLoan.loan_type || 'General Loan'}
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Calendar size={12} className="text-amber-400" /> Date of Birth
                                                </label>
                                                <p className="text-lg font-black text-slate-800">{selectedLoan.dob || <span className="text-slate-300 italic">Not Provided</span>}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    <ShieldCheck size={12} className="text-indigo-400" /> Tracking ID
                                                </label>
                                                <p className="text-lg font-black text-slate-800 font-mono text-indigo-600">{selectedLoan.tracking_id}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    <FileText size={12} className="text-rose-400" /> PAN Number
                                                </label>
                                                <p className="text-lg font-black text-slate-800 font-mono tracking-widest uppercase">{selectedLoan.pan || <span className="text-slate-300 italic">Not Provided</span>}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    <MapPin size={12} className="text-emerald-400" /> Pincode
                                                </label>
                                                <p className="text-lg font-black text-slate-800">{selectedLoan.pincode || <span className="text-slate-300 italic">Not Provided</span>}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Application Form Details Section */}
                                    <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 space-y-8">
                                        <h5 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                            Financial & Employment Proof
                                        </h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Requested Loan Amount</label>
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600"><IndianRupee size={16} strokeWidth={3} /></div>
                                                    <p className="text-xl font-black text-slate-900">₹{selectedLoan.requested_amount ? parseFloat(selectedLoan.requested_amount).toLocaleString('en-IN') : '0.00'}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Monthly Net Income</label>
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600"><TrendingUp size={16} strokeWidth={3} /></div>
                                                    <p className="text-xl font-black text-slate-900">₹{selectedLoan.income ? parseFloat(selectedLoan.income).toLocaleString('en-IN') : '0.00'}</p>
                                                </div>
                                            </div>
                                            <div className="md:col-span-2 space-y-1.5">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Employment Type / Occupation</label>
                                                <div className="flex items-center gap-3">
                                                    <div className="px-5 py-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 w-full shadow-sm">
                                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                                                            {selectedLoan.employment_type === 'salaried' ? <Building2 size={16} /> : <User size={16} />}
                                                        </div>
                                                        <span className="text-sm font-black text-slate-700 capitalize">{selectedLoan.employment_type || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                {/* Simulation Timeline */}
                                <div className="space-y-6">
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Lifecycle Actions</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button
                                            disabled={simulatingId === selectedLoan.tracking_id || selectedLoan.status?.toLowerCase() === 'approved'}
                                            onClick={() => handleSimulate(selectedLoan.tracking_id, 'approved')}
                                            className="group relative flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-emerald-100 bg-emerald-50/30 hover:bg-emerald-600 transition-all overflow-hidden disabled:opacity-50"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-lg mb-4">
                                                <CheckCircle2 size={32} />
                                            </div>
                                            <span className="text-sm font-black text-emerald-700 group-hover:text-white uppercase tracking-widest">Approve Application</span>
                                            <span className="text-[10px] text-emerald-500 group-hover:text-emerald-100 font-bold mt-1 uppercase">Simulate Webhook Success</span>
                                        </button>
                                        <button
                                            disabled={simulatingId === selectedLoan.tracking_id || selectedLoan.status?.toLowerCase() === 'rejected'}
                                            onClick={() => handleSimulate(selectedLoan.tracking_id, 'rejected')}
                                            className="group relative flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-rose-100 bg-rose-50/30 hover:bg-rose-600 transition-all overflow-hidden disabled:opacity-50"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-rose-600 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-lg mb-4">
                                                <XCircle size={32} />
                                            </div>
                                            <span className="text-sm font-black text-rose-700 group-hover:text-white uppercase tracking-widest">Reject Application</span>
                                            <span className="text-[10px] text-rose-500 group-hover:text-rose-100 font-bold mt-1 uppercase">Simulate Webhook Failure</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                                <button
                                    onClick={() => setSelectedLoan(null)}
                                    className="px-8 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                                >
                                    Dismiss Detail View
                                </button>
                                <button
                                    onClick={() => window.print()}
                                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center gap-2"
                                >
                                    <Download size={14} /> Export dossier
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LoanApprovalManager;
