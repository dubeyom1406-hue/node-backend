import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Search, Download, UserPlus,
    CheckCircle2, AlertCircle, Clock, X,
    Eye, Wallet, Smartphone, Mail, MapPin, ShieldCheck, ChevronDown, Filter,
    Trash2, UserCog, RefreshCw, ArrowUpCircle, Globe, Calendar, Activity
} from 'lucide-react';
import { dataService, BACKEND_URL } from '../../services/dataService';
import { sharedDataService } from '../../services/sharedDataService';

const AllMembers = () => {
    const [members, setMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [roleFilter, setRoleFilter] = useState('All');
    const [selectedMember, setSelectedMember] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '', businessName: '', mobile: '', email: '',
        password: '123456', state: 'Bihar', city: '',
        role: 'RETAILER', pin: ''
    });
    const [loading, setLoading] = useState(false);
    const [showSuccessView, setShowSuccessView] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({
        userId: '', name: '', businessName: '', mobile: '', email: '', pincode: '', address1: ''
    });
    const [actionLoading, setActionLoading] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const allUsers = await dataService.getAllUsers();
            // Show all members for Super Admin
            setMembers(allUsers.filter(u => u.role !== 'ADMIN'));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDeleteMember = async (username) => {
        if (!window.confirm(`Are you sure you want to delete user ${username}?`)) return;
        setActionLoading(true);
        try {
            const res = await dataService.deleteUser(username);
            if (res.success) {
                alert("User deleted successfully!");
                setSelectedMember(null);
                loadData();
            } else {
                alert(res.message || "Failed to delete user.");
            }
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpgradeMember = async (username, newRole) => {
        setActionLoading(true);
        try {
            const res = await dataService.updateUserRole(username, newRole);
            if (res.success) {
                alert(`User upgraded to ${newRole} successfully!`);
                setShowUpgradeModal(false);
                setSelectedMember(null);
                loadData();
            } else {
                alert("Failed to upgrade user.");
            }
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setActionLoading(false);
        }
    };
    
    const handleEditMemberSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await dataService.adminUpdateUser(editFormData.userId, {
                name: editFormData.name,
                businessName: editFormData.businessName,
                mobile: editFormData.mobile,
                email: editFormData.email,
                pincode: editFormData.pincode,
                address1: editFormData.address1
            });
            if (res.success) {
                alert("User details updated successfully!");
                setShowEditModal(false);
                loadData();
            } else {
                alert(res.error || "Update failed");
            }
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendCredentials = async (member) => {
        setActionLoading(true);
        try {
            const res = await dataService.resendCredentials(member);
            if (res.success) {
                alert("Credentials resent successfully!");
            } else {
                alert("Failed to resend credentials.");
            }
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
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
                    address: formData.city + ', ' + formData.state,
                    role: formData.role,
                    territory: formData.state,
                    shopName: formData.businessName,
                    city: formData.city,
                    pin: formData.pin
                })
            });
            const data = await res.json();

            if (data.success) {
                setCreatedCredentials({
                    loginId: formData.mobile,
                    password: formData.password,
                    pin: formData.pin,
                    portalType: formData.role.replace('_', ' ')
                });
                setShowSuccessView(true);
                setShowAddModal(false);
                loadData();
            } else {
                alert(data.error || "Failed to add member");
            }
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { id: 'RETAILER', label: 'Retailer', color: 'bg-emerald-500' },
        { id: 'DISTRIBUTOR', label: 'Distributor', color: 'bg-blue-500' },
        { id: 'SUPER_DISTRIBUTOR', label: 'Super Dist', color: 'bg-purple-500' }
    ];

    const filtered = members.filter(m => {
        const matchesSearch = (m.full_name || m.name || m.username || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (m.mobile || m.phone || '').includes(searchTerm) || 
                             (m.businessName || m.shopName || m.business_name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || m.status === statusFilter || (statusFilter === 'ACTIVE' && (m.status === 'Approved' || m.status === 'ACTIVE'));
        const matchesRole = roleFilter === 'All' || m.role === roleFilter;
        return matchesSearch && matchesStatus && matchesRole;
    });

    return (
        <div className="p-4 md:p-8 w-full max-w-[100%] space-y-8 font-['Montserrat',sans-serif]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase italic flex items-center gap-3">
                        <Users className="text-amber-500" size={32} />
                        Network Registry
                    </h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 ml-1">Unified command center for all partners</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="hidden md:flex bg-white border border-slate-200 text-slate-600 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                        <Download size={16} /> Export Master List
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center gap-3"
                    >
                        <UserPlus size={18} />
                        Add New Member
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, ID or mobile..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 text-sm transition-all font-black shadow-sm"
                    />
                </div>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <select
                            value={roleFilter}
                            onChange={e => setRoleFilter(e.target.value)}
                            className="w-full px-5 py-4 bg-white border border-slate-100 rounded-3xl text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer shadow-sm"
                        >
                            <option value="All">All Roles</option>
                            {roles.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="w-full px-5 py-4 bg-white border border-slate-100 rounded-3xl text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer shadow-sm"
                        >
                            <option value="All">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="PENDING">Pending</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                        <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                    </div>
                </div>
            </div>

            {/* Registry Cards */}
            <div className="space-y-6">
                {filtered.length > 0 ? filtered.map((m, i) => {
                    const roleInfo = roles.find(r => r.id === m.role) || { label: m.role, color: 'bg-slate-400' };
                    return (
                        <div key={i} className="bg-white border border-slate-100 rounded-[2.5rem] p-6 lg:p-8 shadow-sm hover:shadow-xl transition-all space-y-6 relative overflow-hidden group">
                            {/* Header */}
                            <div className="flex flex-col md:flex-row md:items-start lg:items-center justify-between gap-6">
                                <div className="flex items-center gap-5">
                                    <div className={`w-16 h-16 shrink-0 rounded-[1.5rem] ${roleInfo.color} text-white flex items-center justify-center text-2xl font-black shadow-lg italic transition-transform group-hover:scale-110`}>
                                        {(m.full_name || m.username || 'M').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">
                                            {m.full_name || m.username}
                                        </h3>
                                        <div className="flex items-center flex-wrap gap-2 mt-1">
                                            <span className="text-[10px] font-bold text-slate-400 lowercase truncate tracking-widest">{m.username}</span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-200 hidden sm:block"></span>
                                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-white shadow-sm ${roleInfo.color}`}>{roleInfo.label}</span>
                                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border
                                                ${m.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    m.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                        'bg-red-50 text-red-600 border-red-100'}`}>
                                                {m.status || 'OFFLINE'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="md:border-l border-slate-100 md:pl-6 text-left md:text-right">
                                    <p className="text-2xl font-black text-slate-800 font-mono tracking-tight leading-none">₹{parseFloat(m.balance || 0).toLocaleString('en-IN')}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Wallet Balance</p>
                                </div>
                            </div>

                            <div className="h-px w-full bg-slate-50" />
                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 flex items-center gap-1.5 mb-1.5"><Smartphone size={12} className="text-amber-500" /> Mobile SID</p>
                                        <p className="text-xs font-black text-slate-700">{m.phone || m.mobile || m.username}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 flex items-center gap-1.5 mb-1.5"><Mail size={12} className="text-blue-500" /> System Email</p>
                                        <p className="text-xs font-black text-slate-700 truncate max-w-[200px]">{m.email || '—'}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 flex items-center gap-1.5 mb-1.5"><Activity size={12} className="text-emerald-500" /> Shop Name</p>
                                        <p className="text-xs font-black text-slate-800 uppercase italic underline decoration-emerald-500/30">{m.business_name || m.businessName || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 flex items-center gap-1.5 mb-1.5"><MapPin size={12} className="text-red-500" /> Registered Hub</p>
                                        <p className="text-[10px] font-bold text-slate-500 leading-tight">{m.address || m.address1 || m.territory || 'Global Node'}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 p-4 bg-slate-50 rounded-3xl border border-slate-100">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Compliance Status</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-500">Profile KYC</span>
                                        <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${m.profile_kyc_status === 'DONE' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                            {m.profile_kyc_status === 'DONE' ? 'Verified' : 'Pending'}
                                        </span>
                                    </div>

                                </div>

                                <div className="flex flex-col justify-between">
                                    <div className="flex items-center gap-4">
                                        <a 
                                            href={m.shop_latitude && m.shop_longitude 
                                                ? `https://www.google.com/maps/search/?api=1&query=${m.shop_latitude},${m.shop_longitude}`
                                                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${m.business_name || ''} ${m.address || m.address1 || m.territory || ''}`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 bg-white border-2 border-slate-100 hover:border-amber-500 p-4 rounded-3xl flex flex-col items-center gap-2 group/map transition-all shadow-sm"
                                        >
                                            <Globe size={20} className="text-amber-500 group-hover/map:scale-110 transition-transform" />
                                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover/map:text-amber-500">Track on Maps</span>
                                        </a>
                                        <div className="flex-1 p-4 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-1">
                                            <p className="text-[8px] font-black text-slate-400 uppercase">Joined</p>
                                            <p className="text-[10px] font-black text-slate-800">{m.created_at ? new Date(m.created_at).toLocaleDateString() : 'System'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions Footer */}
                            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-50">
                                <button
                                    disabled={actionLoading}
                                    onClick={() => handleResendCredentials(m)}
                                    className="px-5 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-black rounded-xl text-[9px] uppercase tracking-widest transition-all flex items-center gap-2 border border-slate-100"
                                >
                                    <RefreshCw size={12} className={actionLoading ? 'animate-spin' : ''} /> Resend Access
                                </button>
                                <button
                                    onClick={() => { setSelectedMember(m); setShowUpgradeModal(true); }}
                                    className="px-5 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-black rounded-xl text-[9px] uppercase tracking-widest transition-all flex items-center gap-2 border border-indigo-100"
                                >
                                    <ArrowUpCircle size={12} /> Upgrade Tier
                                </button>
                                <button
                                    onClick={() => {
                                        setEditFormData({
                                            userId: m.id,
                                            name: m.full_name || m.name || '',
                                            businessName: m.business_name || m.businessName || '',
                                            mobile: m.mobile || m.phone || '',
                                            email: m.email || '',
                                            pincode: m.pincode || '',
                                            address1: m.address || m.address1 || ''
                                        });
                                        setShowEditModal(true);
                                    }}
                                    className="px-5 py-3 bg-amber-50 hover:bg-amber-100 text-amber-600 font-black rounded-xl text-[9px] uppercase tracking-widest transition-all flex items-center gap-2 border border-amber-100"
                                >
                                    <UserCog size={12} /> Edit Details
                                </button>
                                {m.role === 'RETAILER' && (
                                    <a
                                        href={`/admin/retailer/${m.username}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-5 py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 font-black rounded-xl text-[9px] uppercase tracking-widest transition-all flex items-center gap-2 border border-blue-100"
                                    >
                                        <Eye size={12} /> View Full Detail
                                    </a>
                                )}
                                <div className="flex-1 hidden md:block" />
                                <button
                                    disabled={actionLoading}
                                    onClick={() => handleDeleteMember(m.username)}
                                    className="px-5 py-3 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white font-black rounded-xl text-[9px] uppercase tracking-widest transition-all flex items-center gap-2 border border-red-100 w-full md:w-auto justify-center"
                                >
                                    <Trash2 size={12} /> Delete Member
                                </button>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="bg-white border border-slate-100 rounded-[3rem] p-20 text-center shadow-sm">
                        <div className="flex flex-col items-center gap-5">
                            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200">
                                <Users size={48} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">Registry Is Empty</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">No matching partners found</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Registry Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Network', val: members.length, color: 'text-indigo-600', icon: Users },
                    { label: 'Retailer Base', val: members.filter(m => m.role === 'RETAILER').length, color: 'text-emerald-600', icon: Smartphone },
                    { label: 'Distributors', val: members.filter(m => m.role === 'DISTRIBUTOR').length, color: 'text-blue-600', icon: ShieldCheck },
                    { label: 'Super Dists', val: members.filter(m => m.role === 'SUPER_DISTRIBUTOR').length, color: 'text-purple-600', icon: ShieldCheck },
                ].map((s, i) => (
                    <div key={i} className="bg-white p-7 rounded-[2.5rem] border border-slate-50 shadow-sm flex items-center justify-between group hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{s.label}</p>
                            <p className={`text-3xl font-black mt-2 ${s.color} tracking-tighter`}>{s.val}</p>
                        </div>
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:scale-110 transition-transform">
                            <s.icon size={28} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Member Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 40 }}
                            className="bg-white w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl my-8"
                        >
                            <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter flex items-center gap-2">
                                        <Plus className="text-emerald-500" /> Register Partner
                                    </h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Direct account provisioning</p>
                                </div>
                                <button onClick={() => setShowAddModal(false)} className="p-3 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-2xl transition-all">
                                    <X size={28} />
                                </button>
                            </div>

                            <form onSubmit={handleAddMember} className="p-10 space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Tier</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {roles.map(r => (
                                            <button
                                                key={r.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, role: r.id })}
                                                className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-wider transition-all border-2
                                                    ${formData.role === r.id
                                                        ? `${r.color} text-white border-transparent shadow-lg scale-105`
                                                        : 'bg-white text-slate-400 border-slate-50'}`}
                                            >
                                                {r.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                        <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-black focus:bg-white focus:border-amber-500 outline-none transition-all shadow-inner" placeholder="E.g. Akash Gupta" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile UID</label>
                                        <input required type="tel" maxLength="10" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-black focus:bg-white focus:border-amber-500 outline-none transition-all shadow-inner" placeholder="10 Digit Mobile" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                        <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-black focus:bg-white focus:border-amber-500 outline-none transition-all shadow-inner" placeholder="credentials@sent.here" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Name</label>
                                        <input required type="text" value={formData.businessName} onChange={e => setFormData({ ...formData, businessName: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-black focus:bg-white focus:border-amber-500 outline-none transition-all shadow-inner" placeholder="Shop/Entity Name" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                                        <input required type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-black focus:bg-white focus:border-amber-500 outline-none transition-all shadow-inner" placeholder="City" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">State</label>
                                        <select value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-black focus:bg-white focus:border-amber-500 outline-none transition-all shadow-inner">
                                            {['Bihar', 'UP', 'Delhi', 'Haryana', 'MP', 'Punjab'].map(s => <option key={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">System Password (Numeric)</label>
                                        <input required type="text" pattern="\d*" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value.replace(/\D/g, '') })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-black focus:bg-white focus:border-amber-500 outline-none transition-all shadow-inner" placeholder="Numeric Password" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security PIN (4 Digits)</label>
                                        <input required type="text" maxLength="4" pattern="\d{4}" value={formData.pin} onChange={e => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-black focus:bg-white focus:border-emerald-500 outline-none transition-all shadow-inner" placeholder="4-Digit PIN" />
                                    </div>
                                </div>

                                <button disabled={loading} type="submit" className="w-full bg-slate-900 text-white font-black py-6 rounded-3xl text-[11px] uppercase tracking-[0.25em] shadow-2xl active:scale-95 transition-all disabled:opacity-50">
                                    {loading ? 'INITIATING REGISTRY...' : 'CONFIRM PROVISIONING'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>



            {/* Upgrade Modal */}
            <AnimatePresence>
                {showUpgradeModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-sm rounded-[3rem] p-10 overflow-hidden shadow-2xl relative"
                        >
                            <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter mb-2">Upgrade Account</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Elevate partner privileges</p>

                            <div className="space-y-3">
                                {roles.map(r => (
                                    <button
                                        key={r.id}
                                        disabled={actionLoading || r.id === selectedMember?.role}
                                        onClick={() => handleUpgradeMember(selectedMember.username, r.id)}
                                        className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border-2 flex items-center justify-between px-6
                                            ${selectedMember?.role === r.id
                                                ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                                                : 'bg-white text-slate-600 border-slate-100 hover:border-indigo-500 hover:text-indigo-600'}`}
                                    >
                                        {r.label}
                                        {selectedMember?.role === r.id ? <CheckCircle2 size={16} /> : <ArrowUpCircle size={16} />}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setShowUpgradeModal(false)}
                                className="w-full mt-8 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-800 transition-colors"
                            >
                                Cancel Operation
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400"></div>

                            <div className="flex justify-center mb-6">
                                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 shadow-inner">
                                    <CheckCircle2 size={48} />
                                </div>
                            </div>

                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-2">NETWORK UPDATED</p>
                            <h2 className="text-3xl font-black text-slate-800 italic mb-2 tracking-tighter">Member Provisioned!</h2>
                            <p className="text-xs font-bold text-slate-400 mb-8 uppercase tracking-widest leading-relaxed">
                                Credentials automatically sent to {formData.email}
                            </p>

                            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 mb-8 text-left space-y-3">
                                <div className="flex justify-between items-center text-xs font-black">
                                    <span className="text-slate-400 uppercase tracking-widest">ID:</span>
                                    <span className="text-slate-800">{createdCredentials?.loginId}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-black border-t border-slate-100 pt-3">
                                    <span className="text-slate-400 uppercase tracking-widest">Security PIN:</span>
                                    <span className="text-emerald-600 font-mono tracking-widest">{createdCredentials?.pin}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-black">
                                    <span className="text-slate-400 uppercase tracking-widest">Type:</span>
                                    <span className="text-blue-600 uppercase tracking-widest font-black italic">{createdCredentials?.portalType}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowSuccessView(false)}
                                className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl text-[11px] uppercase tracking-[0.25em] shadow-xl hover:scale-105 active:scale-95 transition-all"
                            >
                                CONTINUE
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Details Modal */}
            <AnimatePresence>
                {showEditModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl my-8"
                        >
                            <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tight">Edit Partner Details</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Modify account identity & contact</p>
                                </div>
                                <button onClick={() => setShowEditModal(false)} className="p-3 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-2xl transition-all">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleEditMemberSubmit} className="p-10 space-y-6">
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                                        <input required type="text" value={editFormData.name} onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black focus:border-amber-500 focus:bg-white transition-all outline-none" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Business Name</label>
                                        <input required type="text" value={editFormData.businessName} onChange={e => setEditFormData({ ...editFormData, businessName: e.target.value })} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black focus:border-amber-500 focus:bg-white transition-all outline-none" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mobile No</label>
                                        <input required type="tel" maxLength="10" value={editFormData.mobile} onChange={e => setEditFormData({ ...editFormData, mobile: e.target.value })} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black focus:border-amber-500 focus:bg-white transition-all outline-none" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email</label>
                                        <input required type="email" value={editFormData.email} onChange={e => setEditFormData({ ...editFormData, email: e.target.value })} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black focus:border-amber-500 focus:bg-white transition-all outline-none" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Pincode</label>
                                        <input type="text" value={editFormData.pincode} onChange={e => setEditFormData({ ...editFormData, pincode: e.target.value })} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black focus:border-amber-500 focus:bg-white transition-all outline-none" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Address</label>
                                        <input type="text" value={editFormData.address1} onChange={e => setEditFormData({ ...editFormData, address1: e.target.value })} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black focus:border-amber-500 focus:bg-white transition-all outline-none" />
                                    </div>
                                </div>

                                <button disabled={loading} type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl text-[11px] uppercase tracking-[0.25em] shadow-xl active:scale-95 transition-all disabled:opacity-50">
                                    {loading ? 'SAVING CHANGES...' : 'SAVE UPDATES'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AllMembers;
