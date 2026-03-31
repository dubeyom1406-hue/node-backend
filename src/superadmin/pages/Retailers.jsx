import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Search, Download, UserPlus,
    CheckCircle2, AlertCircle, Clock, X,
    Eye, Wallet, Smartphone, Mail, MapPin,
    Trash2, Map, Store, ShieldCheck, ShieldAlert,
    ShieldOff, Building2, Navigation
} from 'lucide-react';
import { dataService, BACKEND_URL } from '../../services/dataService';
import { sharedDataService } from '../../services/sharedDataService';

const KYCBadge = ({ done, label }) => (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${done
        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
        : 'bg-red-50 text-red-500 border-red-100'
        }`}>
        {done ? <ShieldCheck size={10} /> : <ShieldOff size={10} />}
        {label}: {done ? 'Done' : 'Pending'}
    </div>
);

const Retailers = () => {
    const [retailers, setRetailers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedRetailer, setSelectedRetailer] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [formData, setFormData] = useState({
        name: '', businessName: '', mobile: '', email: '',
        password: '123456', state: 'Bihar', city: '', pin: '', address: ''
    });
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showSuccessView, setShowSuccessView] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const allUsers = await dataService.getAllUsers();
            setRetailers(allUsers);
        } catch (err) {
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        const handleUpdate = () => loadData();
        window.addEventListener('dataUpdated', handleUpdate);
        window.addEventListener('SuperAdminDataUpdated', handleUpdate);
        return () => {
            window.removeEventListener('dataUpdated', handleUpdate);
            window.removeEventListener('SuperAdminDataUpdated', handleUpdate);
        };
    }, []);

    const handleOpenMap = (retailer) => {
        const address = retailer.address || retailer.shopAddress || `${retailer.city || ''}, ${retailer.state || ''}`;
        if (retailer.latitude && retailer.longitude) {
            window.open(`https://www.google.com/maps?q=${retailer.latitude},${retailer.longitude}`, '_blank');
        } else if (address.trim() && address.trim() !== ',') {
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
        } else {
            alert('Is retailer ka address available nahi hai.');
        }
    };

    const handleDelete = async (retailer) => {
        setDeleting(true);
        try {
            const token = localStorage.getItem('rupiksha_token');
            const res = await fetch(`${BACKEND_URL}/admin/users/${retailer.id || retailer.username}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success || res.ok) {
                setDeleteConfirm(null);
                setSelectedRetailer(null);
                loadData();
            } else {
                alert(data.error || 'Delete failed');
            }
        } catch (err) {
            alert('Delete Error: ' + err.message);
        } finally {
            setDeleting(false);
        }
    };

    const handleDirectAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const sa = sharedDataService.getCurrentSuperAdmin() || { id: 'ADMIN', name: 'Super Admin' };
            const token = localStorage.getItem('rupiksha_token');
            const res = await fetch(`${BACKEND_URL}/admin/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    username: formData.mobile,
                    password: formData.password,
                    fullName: formData.name,
                    phone: formData.mobile,
                    email: formData.email,
                    address: formData.address || formData.city + ', ' + formData.state,
                    shopName: formData.businessName,
                    role: 'MEMBER',
                    territory: formData.state,
                    pin: formData.pin
                })
            });
            const data = await res.json();
            if (data.success || data.userId) {
                const creds = {
                    to: formData.email,
                    name: formData.name,
                    loginId: formData.mobile,
                    password: formData.password,
                    pin: formData.pin,
                    addedBy: sa.name || 'Super Admin',
                    portalType: 'Retailer'
                };
                try {
                    await fetch(`${BACKEND_URL}/send-credentials`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            to: creds.to, name: creds.name, login_id: creds.loginId,
                            password: creds.password, pin: creds.pin,
                            added_by: creds.addedBy, portal_type: creds.portalType
                        })
                    });
                } catch (emailErr) {}
                setCreatedCredentials(creds);
                setShowSuccessView(true);
                setShowAddModal(false);
                setFormData({ name: '', businessName: '', mobile: '', email: '', password: '123456', state: 'Bihar', city: '', pin: '', address: '' });
                loadData();
            } else {
                alert(data.error || "Failed to add retailer");
            }
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const filtered = retailers.filter(r => {
        const matchesSearch =
            String(r.name || r.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(r.mobile || '').includes(searchTerm) ||
            String(r.businessName || r.shopName || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const active = retailers.filter(r => r.status === 'Approved' || r.status === 'ACTIVE');

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 font-['Montserrat',sans-serif]">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic underline decoration-amber-500/50">
                        Retailer Management
                    </h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        Sabhi retailers ki poori jaankari — KYC, Address, Contacts
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center gap-2">
                        <Download size={14} /> Export Data
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="group relative bg-[#1e40af] hover:bg-[#1d4ed8] text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-3 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <UserPlus size={16} className="text-blue-200" />
                        <span>Add New Retailer</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Total Retailers', val: retailers.length, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                    { label: 'Active / Verified', val: active.length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Pending KYC', val: retailers.filter(r => r.status === 'Pending' || r.status === 'PENDING').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                            <p className="text-3xl font-black text-slate-800 mt-1">{stat.val}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner`}>
                            <stat.icon size={26} strokeWidth={1.5} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Naam, Mobile ya Shop ke naam se search karein..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 focus:bg-white text-sm transition-all font-semibold"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                    {['All', 'Approved', 'Pending', 'Rejected'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border
                                ${statusFilter === status
                                    ? (status === 'All' ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20' :
                                       status === 'Approved' ? 'bg-amber-400 border-amber-400 text-black shadow-md shadow-amber-400/20' :
                                       'bg-red-500 border-red-500 text-white shadow-md shadow-red-500/20')
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cards Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                    <Users size={64} strokeWidth={1} />
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] mt-4">Koi Retailer Nahi Mila</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    <AnimatePresence>
                        {filtered.map((r, i) => {
                            const profileKyc = !!(r.kycDone || r.kyc_done || r.kyc_status === 'Approved' || r.profileKyc);

                            const shopName = r.businessName || r.shopName || r.business_name || null;
                            const shopAddress = r.address || r.shopAddress || r.shop_address || (r.city ? `${r.city}, ${r.state}` : null);

                            return (
                                <motion.div
                                    key={r.id || r.username || i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: i * 0.04 }}
                                    className="bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-lg transition-all overflow-hidden group"
                                >
                                    {/* Card Header */}
                                    <div className="bg-gradient-to-br from-[#0d1b2e] to-[#1e3a5f] p-5 relative overflow-hidden">
                                        <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-500/10 rounded-full" />
                                        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-blue-500/10 rounded-full" />
                                        <div className="flex items-center gap-4 relative z-10">
                                            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl font-black shadow-xl">
                                                {(r.name || r.username || 'R').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white font-black text-sm truncate">{r.name || r.username}</p>
                                                <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest truncate">
                                                    ID: {r.username}
                                                </p>
                                            </div>
                                            <span className={`shrink-0 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider border
                                                ${r.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                                                    r.status === 'Pending' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                                                        'bg-red-500/20 text-red-300 border-red-500/30'}`}>
                                                {r.status === 'Approved' ? '✓ Active' : r.status === 'Pending' ? '⏳ Pending' : '✗ Rejected'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-5 space-y-4">

                                        {/* Contact Info */}
                                        <div className="space-y-2.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                                                    <Smartphone size={13} className="text-blue-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Mobile No.</p>
                                                    <p className="text-xs font-black text-slate-700">{r.mobile || r.phone || '—'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                                                    <Mail size={13} className="text-purple-500" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Email</p>
                                                    <p className="text-xs font-black text-slate-700 truncate">{r.email || '—'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Shop Info */}
                                        <div className="bg-slate-50 rounded-2xl p-3 space-y-2">
                                            <div className="flex items-start gap-2.5">
                                                <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                                    <Store size={13} className="text-amber-500" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Shop Name</p>
                                                    <p className="text-xs font-black text-slate-700">{shopName || '—'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2.5">
                                                <div className="w-7 h-7 bg-rose-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                                    <MapPin size={13} className="text-rose-500" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Shop Address</p>
                                                    <p className="text-xs font-semibold text-slate-600 leading-relaxed">{shopAddress || '—'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* KYC Status */}
                                        <div>
                                            <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-2">KYC Status</p>
                                            <div className="flex flex-wrap gap-2">
                                                <KYCBadge done={profileKyc} label="Profile KYC" />
                                            </div>
                                        </div>

                                        {/* Wallet */}
                                        <div className="flex items-center justify-between py-2 border-t border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <Wallet size={14} className="text-emerald-500" />
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Wallet</p>
                                            </div>
                                            <p className="text-sm font-black text-slate-800 font-mono">
                                                ₹ {parseFloat(r.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="grid grid-cols-3 gap-2 pt-1">
                                            <button
                                                onClick={() => setSelectedRetailer(r)}
                                                className="flex flex-col items-center gap-1 py-2.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-500 rounded-2xl transition-all border border-slate-100"
                                                title="Details Dekho"
                                            >
                                                <Eye size={16} />
                                                <span className="text-[8px] font-black uppercase tracking-wider">View</span>
                                            </button>
                                            <button
                                                onClick={() => handleOpenMap(r)}
                                                className="flex flex-col items-center gap-1 py-2.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 text-slate-500 rounded-2xl transition-all border border-slate-100"
                                                title="Google Maps par dekho"
                                            >
                                                <Navigation size={16} />
                                                <span className="text-[8px] font-black uppercase tracking-wider">Map</span>
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(r)}
                                                className="flex flex-col items-center gap-1 py-2.5 bg-slate-50 hover:bg-red-50 hover:text-red-600 text-slate-500 rounded-2xl transition-all border border-slate-100"
                                                title="User Delete Karo"
                                            >
                                                <Trash2 size={16} />
                                                <span className="text-[8px] font-black uppercase tracking-wider">Delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* FAB */}
            <button
                onClick={() => setShowAddModal(true)}
                className="fixed bottom-8 right-8 z-[60] bg-[#1e40af] text-white p-5 rounded-full shadow-[0_15px_40px_rgba(30,64,175,0.4)] hover:scale-110 active:scale-95 transition-all group lg:hidden"
                title="Add New Retailer"
            >
                <UserPlus size={28} />
            </button>

            {/* ============ DELETE CONFIRM MODAL ============ */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl w-full max-w-sm text-center"
                        >
                            <div className="bg-red-50 p-8 border-b border-red-100">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Trash2 size={28} className="text-red-500" />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 uppercase italic">User Delete?</h3>
                                <p className="text-xs text-slate-500 mt-2 font-semibold">
                                    Kya aap <span className="text-red-500 font-black">{deleteConfirm.name || deleteConfirm.username}</span> ko permanently delete karna chahte ho?
                                </p>
                                <p className="text-[9px] text-red-400 uppercase tracking-widest font-black mt-1">Yeh action undo nahi hogi!</p>
                            </div>
                            <div className="p-6 flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 bg-slate-100 text-slate-600 font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    disabled={deleting}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
                                >
                                    {deleting ? 'Deleting...' : 'Haan, Delete Karo'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ============ DETAILS MODAL ============ */}
            <AnimatePresence>
                {selectedRetailer && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            {/* Modal Header */}
                            <div className="bg-gradient-to-br from-[#0d1b2e] to-[#1e3a5f] px-8 py-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl font-black shadow-xl">
                                        {(selectedRetailer.name || selectedRetailer.username).charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white uppercase italic">{selectedRetailer.name || selectedRetailer.username}</h3>
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase mt-1
                                            ${selectedRetailer.status === 'Approved' ? 'bg-emerald-500/30 text-emerald-300' :
                                                selectedRetailer.status === 'Pending' ? 'bg-amber-500/30 text-amber-300' : 'bg-red-500/30 text-red-300'}`}>
                                            {selectedRetailer.status}
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedRetailer(null)} className="p-2.5 text-white/50 hover:text-white hover:bg-white/10 rounded-2xl transition-all">
                                    <X size={22} />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                {/* Contact Details */}
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-blue-500 pl-3 mb-4">Contact Details</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-blue-50 rounded-2xl p-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Smartphone size={12} className="text-blue-500" />
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Mobile No.</p>
                                            </div>
                                            <p className="text-sm font-black text-slate-800">{selectedRetailer.mobile || selectedRetailer.phone || '—'}</p>
                                        </div>
                                        <div className="bg-purple-50 rounded-2xl p-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Mail size={12} className="text-purple-500" />
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Email</p>
                                            </div>
                                            <p className="text-xs font-black text-slate-800 break-all">{selectedRetailer.email || '—'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Shop Details */}
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-amber-500 pl-3 mb-4">Shop Details</p>
                                    <div className="space-y-3">
                                        <div className="bg-amber-50 rounded-2xl p-4 flex items-start gap-3">
                                            <Store size={16} className="text-amber-500 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Shop Name</p>
                                                <p className="text-sm font-black text-slate-800 mt-0.5">
                                                    {selectedRetailer.businessName || selectedRetailer.shopName || selectedRetailer.business_name || '—'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-rose-50 rounded-2xl p-4 flex items-start gap-3">
                                            <MapPin size={16} className="text-rose-500 mt-0.5 shrink-0" />
                                            <div className="flex-1">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Shop Address</p>
                                                <p className="text-sm font-semibold text-slate-700 mt-0.5 leading-relaxed">
                                                    {selectedRetailer.address || selectedRetailer.shopAddress ||
                                                        (selectedRetailer.city ? `${selectedRetailer.city}, ${selectedRetailer.state}` : '—')}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleOpenMap(selectedRetailer)}
                                                className="shrink-0 w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow border border-rose-100 hover:bg-rose-500 hover:text-white text-rose-400 transition-all"
                                                title="Google Maps par Dekho"
                                            >
                                                <Navigation size={15} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* KYC Status */}
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-emerald-500 pl-3 mb-4">KYC Verification</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            {
                                                label: 'Profile KYC',
                                                done: !!(selectedRetailer.kycDone || selectedRetailer.kyc_done || selectedRetailer.kyc_status === 'Approved' || selectedRetailer.profileKyc),
                                                icon: ShieldCheck
                                            },

                                        ].map(({ label, done, icon: Icon }) => (
                                            <div key={label} className={`rounded-2xl p-4 border-2 ${done ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-100'}`}>
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${done ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                                    {done
                                                        ? <ShieldCheck size={20} className="text-emerald-600" />
                                                        : <ShieldOff size={20} className="text-red-400" />}
                                                </div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">{label}</p>
                                                <p className={`text-sm font-black mt-0.5 ${done ? 'text-emerald-600' : 'text-red-500'}`}>
                                                    {done ? '✓ Completed' : '✗ Pending'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Wallet */}
                                <div className="bg-[#0d1b2e] rounded-2xl p-5 text-white flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Wallet Balance</p>
                                        <p className="text-2xl font-black italic mt-1">
                                            ₹ {parseFloat(selectedRetailer.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <Wallet size={32} className="text-white/20" />
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        onClick={() => handleOpenMap(selectedRetailer)}
                                        className="flex flex-col items-center gap-1.5 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-2xl font-black text-[9px] uppercase tracking-wider transition-all border border-emerald-100"
                                    >
                                        <Navigation size={18} />
                                        Map
                                    </button>
                                    <button className="flex flex-col items-center gap-1.5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-[9px] uppercase tracking-wider transition-all">
                                        <AlertCircle size={18} />
                                        Suspend
                                    </button>
                                    <button
                                        onClick={() => { setSelectedRetailer(null); setDeleteConfirm(selectedRetailer); }}
                                        className="flex flex-col items-center gap-1.5 py-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-2xl font-black text-[9px] uppercase tracking-wider transition-all border border-red-100"
                                    >
                                        <Trash2 size={18} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ============ ADD RETAILER MODAL ============ */}
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
                                    <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tight">Naya Retailer Jodo</h3>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">SuperAdmin direct allocation</p>
                                </div>
                                <button onClick={() => setShowAddModal(false)} className="p-3 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-2xl transition-all">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleDirectAdd} className="p-8 space-y-5 max-h-[75vh] overflow-y-auto">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Pura Naam</label>
                                        <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:border-amber-500 focus:bg-white transition-all outline-none" placeholder="Full Name" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Shop Ka Naam</label>
                                        <input type="text" value={formData.businessName} onChange={e => setFormData({ ...formData, businessName: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:border-amber-500 focus:bg-white transition-all outline-none" placeholder="Shop Name" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mobile No.</label>
                                        <input required type="tel" maxLength="10" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:border-amber-500 focus:bg-white transition-all outline-none" placeholder="10 Digit Number" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email</label>
                                        <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:border-amber-500 focus:bg-white transition-all outline-none" placeholder="email@example.com" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Shop Address</label>
                                    <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:border-amber-500 focus:bg-white transition-all outline-none" placeholder="Pura Address Likho" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">State</label>
                                        <select value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:border-amber-500 focus:bg-white transition-all outline-none uppercase">
                                            {['Bihar', 'UP', 'MP', 'Delhi', 'West Bengal', 'Mumbai', 'Rajasthan', 'Gujarat'].map(s => <option key={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">City</label>
                                        <input required type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:border-amber-500 focus:bg-white transition-all outline-none" placeholder="City Name" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Password</label>
                                        <input required type="text" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value.replace(/\D/g, '') })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:border-amber-500 focus:bg-white transition-all outline-none" placeholder="Numeric Password" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Security PIN</label>
                                        <input required type="text" maxLength="4" value={formData.pin} onChange={e => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:border-emerald-500 focus:bg-white transition-all outline-none" placeholder="4-Digit PIN" />
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <button disabled={loading} type="submit" className="w-full bg-[#0d1b2e] text-white font-black py-4 rounded-2xl text-[11px] uppercase tracking-[0.25em] shadow-2xl active:scale-95 transition-all disabled:opacity-50">
                                        {loading ? 'Jod Raha Hai...' : 'Retailer Jodo'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ============ SUCCESS MODAL ============ */}
            <AnimatePresence>
                {showSuccessView && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-white w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl text-center p-10 relative"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-emerald-400 to-blue-400"></div>
                            <div className="flex justify-center mb-6">
                                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-10 h-10">
                                        <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-2">Badhai Ho!</p>
                            <h2 className="text-2xl font-black text-slate-800 italic mb-2">Retailer Jod Diya!</h2>
                            <div className="bg-slate-50 border-2 border-slate-100 rounded-3xl p-5 mb-6 text-left space-y-3 mt-6">
                                <div className="flex justify-between text-xs font-black uppercase tracking-wider">
                                    <span className="text-slate-400">Login ID:</span>
                                    <span className="text-slate-800">{createdCredentials?.loginId}</span>
                                </div>
                                <div className="flex justify-between text-xs font-black uppercase tracking-wider">
                                    <span className="text-slate-400">Password:</span>
                                    <span className="text-amber-600 font-mono">{createdCredentials?.password}</span>
                                </div>
                            </div>
                            <button onClick={() => setShowSuccessView(false)} className="w-full bg-[#0d1b2e] text-white font-black py-4 rounded-2xl text-[11px] uppercase tracking-[0.25em] shadow-xl active:scale-95 transition-all">
                                Dashboard Par Jaao
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Retailers;
