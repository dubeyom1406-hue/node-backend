import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Search, Filter, MoreHorizontal,
    Plus, Download, UserPlus, Shield,
    CheckCircle2, AlertCircle, Clock, X,
    Eye, Edit2, Wallet, Smartphone, Mail, MapPin
} from 'lucide-react';
import { sharedDataService } from '../../services/sharedDataService';
import { dataService } from '../../services/dataService';

const Distributors = () => {
    const [distributors, setDistributors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedDistributor, setSelectedDistributor] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addForm, setAddForm] = useState({
        name: '',
        businessName: '',
        mobile: '',
        email: '',
        state: '',
        city: '',
        pincode: '',
        password: '123456',
        pin: ''
    });

    const loadData = () => {
        const sa = sharedDataService.getCurrentSuperAdmin();
        if (!sa) return;
        const all = sharedDataService.getAllDistributors() || [];
        // Filter: only show distributors added by this Super Admin
        const myDists = all.filter(d => d.ownerId === sa.id);
        setDistributors(myDists);
    };

    const [showOTPView, setShowOTPView] = useState(false);
    const [otp, setOtp] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [showSuccessView, setShowSuccessView] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState(null);

    const handleInvite = async (e) => {
        e.preventDefault();
        setLoading(true);
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(code);

        const emailModule = await import('../../services/emailService');
        const res = await emailModule.sendOTPEmail(addForm.email, code, addForm.name);

        setLoading(false);
        if (res.success) {
            setShowOTPView(true);
        } else {
            alert("Failed to send OTP. Please check email address.");
        }
    };

    const handleVerifyAndAdd = async () => {
        if (otp !== generatedOtp) {
            alert("Invalid OTP! Access Denied.");
            return;
        }

        setVerifying(true);
        try {
            const sa = sharedDataService.getCurrentSuperAdmin();
            const newDist = await sharedDataService.registerDistributor({
                ...addForm,
                status: 'Pending'
            }, sa ? sa.id : null);

            if (newDist) {
                // Send Credentials Email
                try {
                    await dataService.resendCredentials({
                        email: addForm.email,
                        name: addForm.name,
                        mobile: addForm.mobile,
                        password: addForm.password,
                        pin: addForm.pin,
                        role: 'DISTRIBUTOR'
                    });
                } catch (emailErr) {
                    console.error("Credentials email failed:", emailErr);
                }

                setShowSuccessView(true);
                loadData();
                setIsAddModalOpen(false);
                setShowOTPView(false);
                setAddForm({
                    name: '', businessName: '', mobile: '', email: '',
                    state: '', city: '', pincode: '', password: '123456', pin: ''
                });
            }
        } catch (err) {
            alert("Error adding distributor");
        } finally {
            setVerifying(false);
        }
    };

    useEffect(() => {
        loadData();
        window.addEventListener('distributorDataUpdated', loadData);
        window.addEventListener('superadminDataUpdated', loadData);
        return () => {
            window.removeEventListener('distributorDataUpdated', loadData);
            window.removeEventListener('superadminDataUpdated', loadData);
        };
    }, []);

    const filtered = distributors.filter(d => {
        const matchesSearch = String(d.name || d.username || d.businessName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(d.mobile || '').includes(searchTerm);
        const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const active = distributors.filter(d => d.status === 'Approved');

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-900">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic">Distributor Control</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Manage and track all registered distributors</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center gap-2">
                        <Download size={14} /> Export
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-amber-500 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/30 hover:bg-amber-600 transition-colors flex items-center gap-2"
                    >
                        <UserPlus size={14} /> Add Distributor
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, business or mobile..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 focus:bg-white text-sm transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                    {['All', 'Approved', 'Pending'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border
                                ${statusFilter === status
                                    ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/20'
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Distributor</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Business</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Wallet</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.length > 0 ? filtered.map((d, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-700 font-black italic shadow-inner">
                                                {(d.name || 'D').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-800">{d.name}</p>
                                                <p className="text-[9px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded inline-block">ID: {d.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5"><Smartphone size={12} className="text-amber-500" /> {d.mobile}</p>
                                            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 truncate max-w-[140px]"><Mail size={12} className="shrink-0" /> {d.email || '—'}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-[11px] font-black text-slate-600 uppercase italic opacity-80">{d.businessName || '—'}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 tracking-tighter">{d.city}, {d.state}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Wallet size={14} className="text-emerald-500" />
                                            <p className="text-xs font-black text-emerald-700 italic">₹ {d.wallet?.balance || '0.00'}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border
                                            ${d.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                d.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                    'bg-red-50 text-red-600 border-red-100'}`}>
                                            {d.status === 'Approved' ? <CheckCircle2 size={10} /> :
                                                d.status === 'Pending' ? <Clock size={10} /> : <AlertCircle size={10} />}
                                            {d.status || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            {d.status === 'Pending' && (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            sharedDataService.updateDistributorStatus(d.id, 'Approved');
                                                            loadData();
                                                        }}
                                                        className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            sharedDataService.updateDistributorStatus(d.id, 'Rejected');
                                                            loadData();
                                                        }}
                                                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                                                        title="Reject"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => setSelectedDistributor(d)}
                                                className="p-2 bg-slate-50 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                                                <Edit2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="bg-slate-50 p-6 rounded-full border border-slate-100">
                                                <Users size={48} className="text-slate-200" />
                                            </div>
                                            <p className="text-slate-400 font-bold text-base uppercase tracking-widest italic">No distributors found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { label: 'Network Reach', val: active.length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', sub: 'Active Distributors' },
                    { label: 'Pending Apps', val: distributors.filter(d => d.status === 'Pending').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', sub: 'Applications' },
                    { label: 'Retailer Base', val: filtered.reduce((acc, curr) => acc + (curr.assignedRetailers?.length || 0), 0), icon: Users, color: 'text-blue-500', bg: 'bg-blue-50', sub: 'Linked Retailers' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex items-center justify-between group hover:border-amber-500 transition-all">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                            <p className="text-3xl font-black text-slate-800 mt-1">{stat.val}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5 tracking-tighter">{stat.sub}</p>
                        </div>
                        <div className={`w-14 h-14 rounded-3xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <stat.icon size={28} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Details Modal */}
            <AnimatePresence>
                {selectedDistributor && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            className="bg-white w-full max-w-3xl rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)]"
                        >
                            <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-[#f8fafc]">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center text-2xl font-black italic shadow-2xl shadow-amber-500/40 border-4 border-white">
                                        {(selectedDistributor.name || 'D').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tight">{selectedDistributor.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[9px] font-black bg-blue-600 text-white px-3 py-0.5 rounded-full uppercase tracking-[0.1em]">Distributor Account</span>
                                            <span className={`text-[9px] font-black px-3 py-0.5 rounded-full uppercase tracking-[0.1em]
                                                ${selectedDistributor.status === 'Approved' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                                                {selectedDistributor.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedDistributor(null)} className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-2xl transition-all">
                                    <X size={28} />
                                </button>
                            </div>

                            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-8">
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 italic"><Users size={12} className="text-amber-500" /> General Info</p>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Username</p>
                                                <p className="text-xs font-black text-slate-700">{selectedDistributor.username}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Registered on</p>
                                                <p className="text-xs font-black text-slate-700">{new Date(selectedDistributor.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Business Enterprise</p>
                                                <p className="text-xs font-black text-amber-600 uppercase italic">{selectedDistributor.businessName || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 px-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic"><MapPin size={12} className="text-amber-500" /> Location Details</p>
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${selectedDistributor.city}+${selectedDistributor.state}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-[9px] font-black text-amber-600 hover:underline uppercase"
                                            >
                                                Open Google Maps
                                            </a>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">State / Territory</p>
                                                <p className="text-xs font-black text-slate-700">{selectedDistributor.state}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">City & Pincode</p>
                                                <p className="text-xs font-black text-slate-700">{selectedDistributor.city} - {selectedDistributor.pincode}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8 h-full flex flex-col">
                                    <div className="bg-gradient-to-br from-[#0d1b2e] to-[#162543] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[140px]">
                                        <div className="relative z-10">
                                            <p className="text-[9px] font-black text-amber-400 uppercase tracking-[0.2em] mb-1">Corporate Wallet</p>
                                            <h2 className="text-3xl font-black italic">₹ {selectedDistributor.wallet?.balance || '0.00'}</h2>
                                        </div>
                                        <div className="flex justify-between items-end relative z-10">
                                            <div>
                                                <p className="text-[8px] font-black text-white/40 uppercase">Earnings</p>
                                                <p className="text-[10px] font-black text-emerald-400 italic">₹ {selectedDistributor.commissionEarned || '0.00'}</p>
                                            </div>
                                            <Shield size={24} className="text-amber-500 opacity-30" />
                                        </div>
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                    </div>

                                    <div className="flex-1 min-h-0 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] p-6 flex flex-col gap-4">
                                        <div className="flex items-center justify-between px-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Linked Retailers</p>
                                            <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-2 py-0.5 rounded-full">{(selectedDistributor.assignedRetailers || []).length} Units</span>
                                        </div>

                                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                                            {(selectedDistributor.assignedRetailers || []).length > 0 ? (
                                                selectedDistributor.assignedRetailers.map((username, idx) => (
                                                    <div key={idx} className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between group/row">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black italic text-slate-500 group-hover/row:bg-amber-500 group-hover/row:text-white transition-all">
                                                                {idx + 1}
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{username}</p>
                                                                <p className="text-[8px] font-bold text-slate-400 uppercase">Registered Partner</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] font-black text-blue-600 italic">₹ 0.00</p>
                                                            <p className="text-[8px] font-black text-slate-300 uppercase">Float</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                                                    <Users size={32} className="text-slate-200 mb-2" />
                                                    <p className="text-[10px] font-black text-slate-400 uppercase">No Retailers Linked</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-4 pt-2">
                                            <button
                                                onClick={() => {
                                                    sharedDataService.setCurrentDistributor(selectedDistributor);
                                                    window.open('/distributor', '_blank');
                                                }}
                                                className="flex-1 bg-slate-900 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                            >
                                                <Eye size={14} /> Full Access
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Add Distributor Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)]"
                        >
                            <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-[#f8fafc]">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tight">
                                        {showOTPView ? 'Verify Distributor' : 'Add Partner Distributor'}
                                    </h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                        {showOTPView ? `Enter 6-digit code sent to ${addForm.email}` : 'Onboard a new distributor directly'}
                                    </p>
                                </div>
                                <button onClick={() => { setIsAddModalOpen(false); setShowOTPView(false); }} className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-2xl transition-all">
                                    <X size={24} />
                                </button>
                            </div>

                            {!showOTPView ? (
                                <form onSubmit={handleInvite} className="p-10 space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                            <input required type="text" value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-5 text-sm font-bold text-slate-900 focus:outline-none focus:border-amber-500 transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Name</label>
                                            <input required type="text" value={addForm.businessName} onChange={e => setAddForm({ ...addForm, businessName: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-5 text-sm font-bold text-slate-900 focus:outline-none focus:border-amber-500 transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
                                            <input required type="text" value={addForm.mobile} onChange={e => setAddForm({ ...addForm, mobile: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-5 text-sm font-bold text-slate-900 focus:outline-none focus:border-amber-500 transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">System Password (Numeric)</label>
                                            <input required type="text" value={addForm.password} onChange={e => setAddForm({ ...addForm, password: e.target.value.replace(/\D/g, '') })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-5 text-sm font-bold text-slate-900 focus:outline-none focus:border-amber-500 transition-all" />
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security PIN (4 Digits)</label>
                                            <input required type="text" maxLength="4" value={addForm.pin} onChange={e => setAddForm({ ...addForm, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-5 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500 transition-all" placeholder="4-Digit PIN" />
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email ID</label>
                                            <input required type="email" value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-5 text-sm font-bold text-slate-900 focus:outline-none focus:border-amber-500 transition-all" />
                                        </div>
                                    </div>
                                    <div className="flex gap-4 pt-4">
                                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                                        <button disabled={loading} type="submit" className="flex-1 bg-amber-500 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                            {loading ? 'Sending OTP...' : 'Send OTP & Verify'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="p-10 space-y-10 text-center">
                                    <div className="flex justify-center gap-3">
                                        {[...Array(6)].map((_, i) => (
                                            <input
                                                key={i}
                                                id={`otp-${i}`}
                                                type="text"
                                                maxLength="1"
                                                value={otp[i] || ''}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    if (!/^\d*$/.test(val)) return;

                                                    const newOtp = otp.split('');
                                                    newOtp[i] = val.slice(-1);
                                                    setOtp(newOtp.join(''));

                                                    if (val && i < 5) {
                                                        const nextInput = document.getElementById(`otp-${i + 1}`);
                                                        if (nextInput) nextInput.focus();
                                                    }
                                                }}
                                                onKeyDown={e => {
                                                    if (e.key === 'Backspace') {
                                                        if (!otp[i] && i > 0) {
                                                            const prevInput = document.getElementById(`otp-${i - 1}`);
                                                            if (prevInput) {
                                                                prevInput.focus();
                                                                const newOtp = otp.split('');
                                                                newOtp[i - 1] = '';
                                                                setOtp(newOtp.join(''));
                                                            }
                                                        } else {
                                                            const newOtp = otp.split('');
                                                            newOtp[i] = '';
                                                            setOtp(newOtp.join(''));
                                                        }
                                                    }
                                                }}
                                                className="w-12 h-16 text-center text-2xl font-black bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-amber-500 outline-none"
                                            />
                                        ))}
                                    </div>

                                    <div className="space-y-4">
                                        <button
                                            onClick={handleVerifyAndAdd}
                                            disabled={verifying || otp.length < 6}
                                            className="w-full bg-emerald-500 text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            {verifying ? 'Verifying...' : 'Complete Registration'}
                                        </button>
                                        <button
                                            onClick={() => setShowOTPView(false)}
                                            className="text-slate-400 font-black text-[9px] uppercase tracking-widest hover:text-slate-600 transition-colors"
                                        >
                                            Go Back
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccessView && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/confetti.png')]"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-white w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl text-center p-10 relative"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-emerald-400 to-blue-400"></div>

                            <div className="flex justify-center mb-6">
                                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center relative">
                                    <div className="absolute inset-0 bg-emerald-200 rounded-full animate-ping opacity-20"></div>
                                    <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl relative z-10">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-10 h-10">
                                            <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-2">CONGRATULATIONS</p>
                            <h2 className="text-3xl font-black text-slate-800 italic mb-2 tracking-tight">Distributor Added!</h2>
                            <p className="text-xs font-bold text-slate-400 mb-8 uppercase tracking-widest leading-relaxed">
                                Request processed successfully via RUPIKSHA Fintech Gateway
                            </p>

                            <div className="bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 mb-8 text-left space-y-3">
                                <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider">
                                    <span className="text-slate-400">Login ID:</span>
                                    <span className="text-slate-800">{createdCredentials?.loginId}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider">
                                    <span className="text-slate-400">Password:</span>
                                    <span className="text-amber-600 font-mono text-sm">{createdCredentials?.password}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider pt-2 border-t border-slate-200">
                                    <span className="text-slate-400">Portal:</span>
                                    <span className="text-blue-600">{createdCredentials?.portalType}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowSuccessView(false)}
                                className="w-full bg-[#0d1b2e] text-white font-black py-5 rounded-2xl text-[11px] uppercase tracking-[0.25em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                CONTINUE TO DASHBOARD
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Distributors;
