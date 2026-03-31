import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Search, MoreHorizontal,
    Plus, Download, UserPlus, Shield,
    CheckCircle2, AlertCircle, Clock, X,
    Eye, Wallet, Smartphone, Mail, MapPin
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { sharedDataService } from '../../services/sharedDataService';

const Retailers = () => {
    const [retailers, setRetailers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedRetailer, setSelectedRetailer] = useState(null);
    const [dist, setDist] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', businessName: '', mobile: '', email: '', password: '123456', state: 'Bihar', city: '', pin: '' });
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const generatePassword = () => {
        return 'RT@' + Math.floor(1000 + Math.random() * 9000);
    };

    const handleOpenAddModal = () => {
        setFormData({ ...formData, password: '123456', pin: '' });
        setShowAddModal(true);
    };

    const loadData = () => {
        const session = sharedDataService.getCurrentDistributor();
        if (!session) return;
        const freshDist = sharedDataService.getDistributorById(session.id) || session;
        setDist(freshDist);

        const all = dataService.getData().users || [];
        // Show retailers that were either assigned to them manually or created by them (ownerId)
        const assigned = all.filter(r => (freshDist.assignedRetailers || []).includes(r.username) || r.ownerId === freshDist.id);
        setRetailers(assigned);
    };

    useEffect(() => {
        loadData();
        const handleUpdate = () => loadData();
        window.addEventListener('distributorDataUpdated', handleUpdate);
        window.addEventListener('dataUpdated', handleUpdate);
        return () => {
            window.removeEventListener('distributorDataUpdated', handleUpdate);
            window.removeEventListener('dataUpdated', handleUpdate);
        };
    }, []);

    const [showOTPView, setShowOTPView] = useState(false);
    const [otp, setOtp] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [verifying, setVerifying] = useState(false);

    const handleInvite = async (e) => {
        e.preventDefault();
        setLoading(true);
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(code);

        const emailModule = await import('../../services/emailService');
        const res = await emailModule.sendOTPEmail(formData.email, code, formData.name);

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
            const newUser = await dataService.registerUser(formData, dist.id);
            sharedDataService.assignRetailerToDistributor(dist.id, newUser.username);

            // Credentials email will now only be sent once Admin approves.
            // Removing immediate sendCredentialsEmail from here.

            setShowAddModal(false);
            setShowOTPView(false);
            setFormData({ name: '', businessName: '', mobile: '', email: '', password: '123456', state: 'Bihar', city: '', pin: '' });
            setShowSuccess(true);
        } catch (err) {
            alert("Error adding retailer");
        } finally {
            setVerifying(false);
        }
    };

    useEffect(() => {
        if (showSuccess) {
            import('canvas-confetti').then(module => {
                const confetti = module.default;

                // Explosive burst helper
                const fire = (particleRatio, opts) => {
                    confetti({
                        ...opts,
                        particleCount: Math.floor(250 * particleRatio),
                        colors: ['#F59E0B', '#FBBF24', '#FCD34D', '#F97316', '#FFFBEB'],
                        gravity: 1.2,
                        scalar: 1.2,
                        ticks: 200
                    });
                };

                // Trigger multiple bursts for that "fut ke" (explosive) effect
                setTimeout(() => {
                    // Center Burst
                    fire(0.25, { spread: 26, startVelocity: 55, origin: { y: 0.6 } });
                    fire(0.2, { spread: 60, origin: { y: 0.6 } });
                    fire(0.35, { spread: 100, decay: 0.91, origin: { y: 0.6 } });

                    // Side Cannon Bursts
                    confetti({
                        particleCount: 150,
                        angle: 60,
                        spread: 70,
                        origin: { x: 0, y: 0.8 },
                        colors: ['#F59E0B', '#FBBF24', '#FFFFFF']
                    });
                    confetti({
                        particleCount: 150,
                        angle: 120,
                        spread: 70,
                        origin: { x: 1, y: 0.8 },
                        colors: ['#F59E0B', '#FBBF24', '#FFFFFF']
                    });
                }, 400);
            });
        }
    }, [showSuccess]);

    const filtered = retailers.filter(r => {
        const matchesSearch = (r.name || r.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.mobile || '').includes(searchTerm);
        const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const active = retailers.filter(r => r.status === 'Approved');

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 lg:space-y-8 font-['Montserrat',sans-serif]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Retailer Network</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Manage and track your assigned retail partners</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center gap-2">
                        <Download size={14} /> Export List
                    </button>
                    <button
                        onClick={handleOpenAddModal}
                        style={{ background: 'var(--brand-color)', color: 'black' }}
                        className="px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/10 transition-colors flex items-center gap-2"
                    >
                        <UserPlus size={14} /> Add New Retailer
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 hover:border-[var(--brand-color)] transition-all"
                style={{ backgroundColor: `rgba(var(--brand-color-rgb), 0.03)` }}
            >
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, username or mobile..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--brand-color)] focus:bg-white text-sm transition-all font-bold"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                    {['All', 'Approved', 'Pending', 'Rejected'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border
                                ${statusFilter === status
                                    ? 'bg-[var(--brand-color)] border-[var(--brand-color)] text-black shadow-md shadow-black/10'
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden border-separate hover:border-[var(--brand-color)] transition-all"
                style={{ backgroundColor: `rgba(var(--brand-color-rgb), 0.01)` }}
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Retailer Information</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Details</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Wallet Balance</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.length > 0 ? filtered.map((r, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 text-xs font-black">
                                                {(r.name || r.username || 'R').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800">{r.name || r.username}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">ID: {r.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-slate-600 flex items-center gap-1.5"><Smartphone size={12} className="text-slate-400" /> {r.mobile}</p>
                                            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5"><Mail size={12} className="shrink-0 text-slate-300" /> {r.email || '—'}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{r.city || '—'}, {r.state}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Wallet size={14} className="text-amber-500" />
                                            <p className="text-sm font-black text-slate-800 font-mono">₹ {r.wallet?.balance || '0.00'}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border
                                            ${r.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                r.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                    'bg-red-50 text-red-600 border-red-100'}`}>
                                            {r.status === 'Approved' ? <CheckCircle2 size={10} /> :
                                                r.status === 'Pending' ? <Clock size={10} /> : <AlertCircle size={10} />}
                                            {r.status || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => setSelectedRetailer(r)}
                                            className="p-2.5 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-xl transition-all border border-transparent hover:border-amber-100"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Users size={48} className="text-slate-200" />
                                            <p className="text-slate-400 font-black text-[11px] uppercase tracking-[0.2em]">No retailers found in your network</p>
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
                    { label: 'Network Size', val: retailers.length, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                    { label: 'Active Partners', val: active.length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Pending Apps', val: retailers.filter(r => r.status === 'Pending').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-center justify-between hover:border-[var(--brand-color)] transition-all"
                        style={{ backgroundColor: `rgba(var(--brand-color-rgb), 0.05)` }}
                    >
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-800 mt-1">{stat.val}</p>
                        </div>
                        <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner`}>
                            <stat.icon size={28} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Retailer Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 40 }}
                            className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative"
                        >
                            <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                                        {showOTPView ? 'Confirm Verification' : 'Register Partner'}
                                    </h3>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                        {showOTPView ? `Enter 6-digit code sent to ${formData.email}` : 'Onboard a new retailer to your network'}
                                    </p>
                                </div>
                                <button onClick={() => { setShowAddModal(false); setShowOTPView(false); }} className="p-3 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-2xl transition-all">
                                    <X size={24} />
                                </button>
                            </div>

                            {!showOTPView ? (
                                <form onSubmit={handleInvite} className="p-10 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                                            <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:ring-2 focus:ring-[var(--brand-color)] focus:bg-white transition-all outline-none" placeholder="Enter name" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Shop Name</label>
                                            <input required type="text" value={formData.businessName} onChange={e => setFormData({ ...formData, businessName: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:border-amber-500 focus:bg-white transition-all outline-none" placeholder="Enter business" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mobile No</label>
                                            <input required type="tel" maxLength="10" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:border-amber-500 focus:bg-white transition-all outline-none" placeholder="10 Digit No" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email ID</label>
                                            <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:border-amber-500 focus:bg-white transition-all outline-none" placeholder="partner@email.com" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">State</label>
                                            <select value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:border-amber-500 focus:bg-white transition-all outline-none appearance-none">
                                                {['Bihar', 'UP', 'MP', 'Delhi', 'West Bengal', 'Haryana'].map(s => <option key={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">City</label>
                                            <input required type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:border-amber-500 focus:bg-white transition-all outline-none" placeholder="City name" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">System Password (Numeric)</label>
                                            <div className="relative">
                                                <input required type="text" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value.replace(/\D/g, '') })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:border-amber-500 focus:bg-white transition-all outline-none" />
                                                <Shield size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Security PIN (4 Digits)</label>
                                            <div className="relative">
                                                <input required type="text" maxLength="4" value={formData.pin} onChange={e => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:border-emerald-500 focus:bg-white transition-all outline-none" placeholder="4-Digit PIN" />
                                                <Shield size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 sticky bottom-0 bg-white">
                                        <button disabled={loading} type="submit" style={{ background: 'var(--brand-color)', color: 'black' }} className="w-full font-black py-5 rounded-2xl text-[11px] uppercase tracking-[0.25em] shadow-2xl shadow-black/10 active:scale-95 transition-all disabled:opacity-50">
                                            {loading ? 'Sending OTP...' : 'Send Verification OTP'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="p-10 space-y-8">
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
                                                    if (!/^\d*$/.test(val)) return; // Only allow digits

                                                    const newOtp = otp.split('');
                                                    newOtp[i] = val.slice(-1); // Take last char if pasted
                                                    setOtp(newOtp.join(''));

                                                    // Move forward
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
                                                className="w-12 h-16 text-center text-2xl font-black bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:bg-white transition-all outline-none"
                                            />
                                        ))}
                                    </div>

                                    <div className="space-y-4">
                                        <button
                                            onClick={handleVerifyAndAdd}
                                            disabled={verifying || otp.length < 6}
                                            className="w-full bg-emerald-500 text-white font-black py-5 rounded-2xl text-[11px] uppercase tracking-[0.25em] shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            {verifying ? 'Verifying...' : 'Verify & Approve Partner'}
                                        </button>
                                        <button
                                            onClick={() => setShowOTPView(false)}
                                            className="w-full text-slate-400 font-black text-[9px] uppercase tracking-widest hover:text-slate-600 transition-colors"
                                        >
                                            Back to details
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success Celebration Modal */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[150] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white px-10 py-12 rounded-[3rem] shadow-2xl max-w-sm w-full text-center relative overflow-hidden"
                        >
                            {/* Confetti Animation Particles */}
                            <div className="absolute inset-0 pointer-events-none">
                                {[
                                    { x: 10, y: 20, s: 8, dur: 3, delay: 0 },
                                    { x: 85, y: 15, s: 12, dur: 4, delay: 0.5 },
                                    { x: 25, y: 70, s: 10, dur: 3.5, delay: 1 },
                                    { x: 75, y: 80, s: 6, dur: 4.5, delay: 0.2 },
                                    { x: 50, y: 10, s: 14, dur: 5, delay: 1.5 },
                                    { x: 15, y: 45, s: 7, dur: 3.2, delay: 0.8 },
                                    { x: 90, y: 55, s: 9, dur: 3.8, delay: 0.3 },
                                ].map((d, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute rounded-full bg-amber-400/20"
                                        style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.s, height: d.s }}
                                        animate={{
                                            y: [-20, 20, -20],
                                            opacity: [0.2, 0.5, 0.2],
                                            scale: [1, 1.2, 1]
                                        }}
                                        transition={{
                                            duration: d.dur,
                                            repeat: Infinity,
                                            delay: d.delay,
                                            ease: "easeInOut"
                                        }}
                                    />
                                ))}
                            </div>

                            <div className="relative z-10 space-y-6">
                                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-8 ring-emerald-50">
                                    <div className="text-4xl">🏆</div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Congratulations!</p>
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Retailer Registered!</h2>
                                    <p className="text-[11px] font-bold text-slate-400 px-4">Retailer verification completed successfully via email OTP.</p>
                                </div>

                                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-2">
                                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center justify-center gap-2">
                                        <Clock size={12} /> Status: Pending
                                    </p>
                                    <p className="text-xs font-black text-amber-800">WAIT FOR ADMIN APPROVAL</p>
                                    <p className="text-[9px] font-bold text-amber-600/70 uppercase">Credentials will be sent after approval</p>
                                </div>

                                <button
                                    onClick={() => setShowSuccess(false)}
                                    className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl text-[11px] uppercase tracking-[0.25em] shadow-2xl shadow-slate-900/20 active:scale-95 transition-all mt-4"
                                >
                                    BACK TO LIST
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Details Modal */}
            <AnimatePresence>
                {selectedRetailer && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl"
                        >
                            <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-black text-xl font-black shadow-xl shadow-black/10" style={{ background: 'var(--brand-color)' }}>
                                        {(selectedRetailer.name || selectedRetailer.username).charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800 tracking-tight">{selectedRetailer.name || selectedRetailer.username}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[9px] font-black bg-slate-200 text-slate-600 px-3 py-1 rounded-full uppercase tracking-widest">Retailer</span>
                                            <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest
                                                ${selectedRetailer.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {selectedRetailer.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedRetailer(null)} className="p-3 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-2xl transition-all">
                                    <X size={28} />
                                </button>
                            </div>

                            <div className="p-10 grid grid-cols-1 md:grid-cols-5 gap-10">
                                <div className="md:col-span-3 space-y-8">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Smartphone size={12} className="text-amber-500" /> Contact Info</p>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Mobile</p>
                                                <p className="text-sm font-black text-slate-700">{selectedRetailer.mobile}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Email</p>
                                                <p className="text-sm font-black text-slate-700 truncate">{selectedRetailer.email || '—'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><MapPin size={12} className="text-amber-500" /> Address Details</p>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">State</p>
                                                <p className="text-sm font-black text-slate-700">{selectedRetailer.state}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">City</p>
                                                <p className="text-sm font-black text-slate-700">{selectedRetailer.city || '—'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-6">
                                    <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 space-y-5 shadow-inner">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Wallet size={12} className="text-amber-500" /> Wallet Hub</p>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Main Balance</p>
                                            <p className="text-2xl font-black text-slate-800 font-mono tracking-tight">₹ {selectedRetailer.wallet?.balance || '0.00'}</p>
                                        </div>
                                        <div className="h-px bg-slate-200/50" />
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Comm. Earned</p>
                                                <p className="text-[11px] font-black text-emerald-600 font-mono">₹ 48.00</p>
                                            </div>
                                            <button className="w-full bg-white border border-slate-200 text-slate-800 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-sm hover:shadow-md transition-all">
                                                Transfer fund
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <button className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">
                                            Enter Panel
                                        </button>
                                        <button className="w-full border border-slate-200 text-slate-600 font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
                                            Modify Profile
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Retailers;
