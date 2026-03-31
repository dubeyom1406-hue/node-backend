import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
    Shield, Plus, X, Save, CheckCircle2, MapPin, Activity,
    RefreshCcw, Users, TrendingUp, Zap, Globe2, Award,
    ChevronDown, Eye, ToggleLeft, ToggleRight, Search,
    Mail, Phone, Building2, Lock, UserCheck, Star
} from 'lucide-react';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { dataService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
const createIcon = (color) => new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
const icons = {
    NATIONAL_HEADER: createIcon('gold'),
    STATE_HEADER: createIcon('blue'),
    REGIONAL_HEADER: createIcon('green'),
    ADMIN: createIcon('red')
};

const PERMISSIONS_MATRIX = [
    { category: "DASHBOARD", color: '#6366f1', icon: '📊', items: ["View Live Dashboard", "View Revenue Metrics", "Network Map Access"] },
    { category: "APPROVALS", color: '#10b981', icon: '✅', items: ["Approve Retailers", "Approve Distributors"] },
    { category: "USER MANAGEMENT", color: '#f59e0b', icon: '👥', items: ["Manage Retailers", "Manage Distributors", "Manage Super/Master Distributors", "View Security Logs", "Access Trash / Restore"] },
    { category: "EMPLOYEE MANAGEMENT", color: '#8b5cf6', icon: '🏢', items: ["View Header Employees", "Provision Header Employees", "Promote/Demote Roles"] },
    { category: "SETTINGS & SERVICES", color: '#ef4444', icon: '⚙️', items: ["Manage System Services (On/Off)", "Configure Commissions"] },
    { category: "APP CONTENT", color: '#06b6d4', icon: '🎨', items: ["Manage Landing Pages", "Manage Plans & Pricing", "Manage Branding & Carousel"] }
];

const ROLE_CONFIG = {
    NATIONAL_HEADER: { label: 'National Header', color: '#f59e0b', bg: 'from-amber-400 to-amber-600', light: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-400', rank: '🥇' },
    STATE_HEADER: { label: 'State Header', color: '#3b82f6', bg: 'from-blue-400 to-blue-600', light: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-400', rank: '🥈' },
    REGIONAL_HEADER: { label: 'Regional Header', color: '#10b981', bg: 'from-emerald-400 to-emerald-600', light: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400', rank: '🥉' },
};

export default function EmployeeManager({ currentUserForEmployee = null }) {
    const { user: currentUser } = useAuth();
    // If currentUserForEmployee is passed, this is an employee viewing their own profile
    const viewingAsEmployee = !!currentUserForEmployee;
    const isAdmin = !viewingAsEmployee && (sessionStorage.getItem('admin_auth') === 'true' || currentUser?.role === 'ADMIN');
    const [employees, setEmployees] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [activeTab, setActiveTab] = useState('list');
    const [status, setStatus] = useState(null);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('ALL');
    const [expandedPerms, setExpandedPerms] = useState({});
    const [formData, setFormData] = useState({
        username: '', password: '', confirmPassword: '',
        name: '', mobile: '', email: '', address: '',
        role: 'NATIONAL_HEADER', territory: '', profilePhoto: ''
    });
    const [perms, setPerms] = useState({});
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [otpValue, setOtpValue] = useState('');
    const [generatedOTP, setGeneratedOTP] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => { loadEmployees(); }, []);

    const loadEmployees = async () => {
        const allUsers = await dataService.getAllUsers();
        const headers = allUsers.filter(u => ['NATIONAL_HEADER', 'STATE_HEADER', 'REGIONAL_HEADER'].includes(u.role));
        setEmployees(headers);
    };

    const roleLabels = { NATIONAL_HEADER: 'National Header', STATE_HEADER: 'State Header', REGIONAL_HEADER: 'Regional Header' };
    const getAvailableRoles = () => {
        if (isAdmin) return ['NATIONAL_HEADER', 'STATE_HEADER', 'REGIONAL_HEADER'];
        if (currentUser?.role === 'NATIONAL_HEADER') return ['STATE_HEADER'];
        if (currentUser?.role === 'STATE_HEADER') return ['REGIONAL_HEADER'];
        return [];
    };
    const availableRoles = getAvailableRoles();

    const handlePermChange = (cat, item, checked) => setPerms(p => ({ ...p, [`${cat}|${item}`]: checked }));
    const handleCheckAll = (cat, checked) => {
        const catData = PERMISSIONS_MATRIX.find(c => c.category === cat);
        const newP = { ...perms };
        catData.items.forEach(i => { newP[`${cat}|${i}`] = checked; });
        setPerms(newP);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isEditing = employees.some(emp => emp.username === formData.username);
        if (!isEditing || formData.password !== '') {
            if (formData.password !== formData.confirmPassword) { alert("Passwords do not match"); return; }
            if (formData.password.length < 6) { alert("Password must be at least 6 characters"); return; }
        }
        if (!isEditing) {
            setIsVerifying(true);
            const res = await dataService.sendEmployeeVerificationOTP(formData.email, formData.name);
            setIsVerifying(false);
            if (res.success) { setGeneratedOTP(res.otp); setShowOTPModal(true); }
            else alert("Failed to send verification email: " + res.message);
        } else {
            processProvisioning();
        }
    };

    const handleVerifyAndProvision = async () => {
        if (otpValue !== generatedOTP) { alert("Invalid OTP! Access Denied."); return; }
        processProvisioning();
    };

    const processProvisioning = async () => {
        const allowedPerms = Object.entries(perms).filter(([, v]) => v).map(([k]) => {
            const [module, action] = k.split('|');
            return { module, action, allowed: true };
        });
        const newEmployee = { ...formData, permissions: allowedPerms, latitude: 20.5937, longitude: 78.9629, status: 'Approved' };
        const res = await dataService.registerUser(newEmployee, !isAdmin ? currentUser?.username : null);
        if (res.success) {
            await dataService.sendEmployeeCredentials(newEmployee.email, newEmployee.name, newEmployee.username, newEmployee.password, isAdmin ? 'ADMIN' : currentUser?.name || 'System', roleLabels[newEmployee.role]);
            setStatus({ type: 'success', message: 'Employee created & credentials sent via email ✅' });
            setShowForm(false); setShowOTPModal(false); loadEmployees();
            setFormData({ username: '', password: '', confirmPassword: '', name: '', mobile: '', email: '', address: '', role: 'NATIONAL_HEADER', territory: '', profilePhoto: '' });
            setPerms({}); setOtpValue('');
            setTimeout(() => setStatus(null), 4000);
        } else alert(res.message || 'Failed to create employee');
    };

    const handleEdit = (emp) => {
        setFormData({ ...emp, password: '', confirmPassword: '' });
        const newPerms = {};
        if (emp.permissions) emp.permissions.forEach(p => { newPerms[`${p.module}|${p.action}`] = true; });
        setPerms(newPerms);
        setShowForm(true); setActiveTab('list');
    };

    const toggleStatus = async (emp) => {
        const newStatus = emp.status === 'Approved' ? 'Inactive' : 'Approved';
        setEmployees(prev => prev.map(e => e.username === emp.username ? { ...e, status: newStatus } : e));
        setStatus({ type: 'success', message: `${emp.name} marked as ${newStatus}` });
        setTimeout(() => setStatus(null), 3000);
    };

    const filtered = employees.filter(e => {
        // If viewing as employee, show ONLY their own profile
        if (viewingAsEmployee) {
            return e.username === (currentUserForEmployee?.username || currentUserForEmployee?.mobile);
        }
        const matchRole = filterRole === 'ALL' || e.role === filterRole;
        const matchSearch = !search || e.name?.toLowerCase().includes(search.toLowerCase()) || e.territory?.toLowerCase().includes(search.toLowerCase());
        return matchRole && matchSearch;
    });

    const totalPermsGranted = Object.values(perms).filter(Boolean).length;

    if (availableRoles.length === 0 && !isAdmin) {
        return <div className="p-8 text-center text-slate-500">You do not have permission to manage employees.</div>;
    }

    return (
        <div className="space-y-6 font-['Inter',sans-serif]">

            {/* OTP Modal */}
            <AnimatePresence>
                {showOTPModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-8 pt-8 pb-6 text-center">
                                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <Shield size={28} className="text-white" />
                                </div>
                                <h3 className="text-xl font-black text-white">Email Verification</h3>
                                <p className="text-indigo-200 text-xs mt-1">OTP sent to {formData.email}</p>
                            </div>
                            <div className="p-8">
                                <input type="text" maxLength="6" value={otpValue}
                                    onChange={e => setOtpValue(e.target.value)}
                                    className="w-full text-center text-3xl font-black bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 focus:border-indigo-500 transition-all outline-none tracking-[0.6em]"
                                    placeholder="••••••" />
                                <button onClick={handleVerifyAndProvision}
                                    className="w-full mt-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black py-4 rounded-xl text-sm uppercase tracking-widest shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                                    Verify & Provision Account
                                </button>
                                <button onClick={() => setShowOTPModal(false)} className="w-full mt-3 text-slate-400 font-bold text-xs uppercase tracking-widest py-2 hover:text-slate-600 transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success toast */}
            <AnimatePresence>
                {status && (
                    <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                        className="flex items-center gap-3 bg-emerald-500 text-white px-5 py-3 rounded-2xl shadow-lg shadow-emerald-500/30">
                        <CheckCircle2 size={18} />
                        <span className="text-sm font-bold">{status.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── HEADER STATS / MY PROFILE BANNER ── */}
            {viewingAsEmployee ? (
                // Employee view: Show a beautiful profile banner
                <motion.div
                    initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 flex items-center gap-5 shadow-xl border border-white/10"
                >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-2xl font-black shadow-lg flex-shrink-0">
                        {currentUserForEmployee?.name?.charAt(0) || currentUserForEmployee?.username?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-black text-purple-300 uppercase tracking-widest">My Employee Profile</p>
                        <h2 className="text-xl font-black text-white mt-0.5">{currentUserForEmployee?.name || currentUserForEmployee?.username}</h2>
                        <p className="text-[11px] text-slate-400 mt-1 font-semibold">{currentUserForEmployee?.role?.replace(/_/g, ' ')} &bull; {currentUserForEmployee?.territory || 'No Territory'}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">View Only</span>
                    </div>
                </motion.div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Headers', value: employees.length, icon: Users, color: '#6366f1', bg: 'from-indigo-500 to-indigo-700' },
                        { label: 'Active', value: employees.filter(e => e.status === 'Approved').length, icon: Zap, color: '#10b981', bg: 'from-emerald-500 to-emerald-700' },
                        { label: 'Territories', value: new Set(employees.map(e => e.territory)).size, icon: Globe2, color: '#f59e0b', bg: 'from-amber-500 to-amber-700' },
                        { label: 'Total Users Under', value: '12,480', icon: TrendingUp, color: '#8b5cf6', bg: 'from-violet-500 to-violet-700' },
                    ].map((stat, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4 overflow-hidden relative">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.bg} flex items-center justify-center shadow-lg flex-shrink-0`}>
                                <stat.icon size={20} className="text-white" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
                                <div className="text-2xl font-black text-slate-800">{stat.value}</div>
                            </div>
                            <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-5" style={{ background: stat.color }} />
                        </motion.div>
                    ))}
                </div>
            )}

            {/* ── TOP BAR ── */}
            {!viewingAsEmployee && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    {/* Tabs */}
                    <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
                        {[{ id: 'list', label: '📋 Directory' }, { id: 'map', label: '🗺️ Live Map' }].map(t => (
                            <button key={t.id} onClick={() => setActiveTab(t.id)}
                                className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wide transition-all ${activeTab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Search + Filter (list only) */}
                    {!showForm && activeTab === 'list' && (
                        <div className="flex gap-2 w-full sm:w-auto">
                            <div className="relative flex-1 sm:w-48">
                                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 outline-none focus:border-indigo-400 transition-all" />
                            </div>
                            <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 outline-none text-slate-700">
                                <option value="ALL">All Roles</option>
                                <option value="NATIONAL_HEADER">National</option>
                                <option value="STATE_HEADER">State</option>
                                <option value="REGIONAL_HEADER">Regional</option>
                            </select>
                        </div>
                    )}

                    {!showForm ? (
                        <button onClick={() => { setFormData({ username: '', password: '', confirmPassword: '', name: '', mobile: '', email: '', address: '', role: 'NATIONAL_HEADER', territory: '', profilePhoto: '' }); setPerms({}); setShowForm(true); }}
                            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-105 transition-all whitespace-nowrap">
                            <Plus size={16} /> Add Header User
                        </button>
                    ) : (
                        <button onClick={() => setShowForm(false)}
                            className="flex items-center gap-2 bg-slate-100 text-slate-600 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide hover:bg-slate-200 transition-all">
                            <X size={16} /> Cancel
                        </button>
                    )}
                </div>
            )}

            {/* ── FORM ── */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
                        className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">

                        {/* Form header */}
                        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                                <Shield className="text-indigo-400" size={22} />
                            </div>
                            <div>
                                <h2 className="text-base font-black uppercase tracking-widest">Create Header Control Account</h2>
                                <p className="text-xs text-slate-400 mt-0.5">Configure credentials, territory & access permissions</p>
                            </div>
                            <div className="ml-auto flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl">
                                <Lock size={11} className="text-indigo-400" />
                                <span className="text-[10px] text-indigo-300 font-black uppercase tracking-widest">Secure Form</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">

                            {/* Grid: Credentials + Identity */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Credentials */}
                                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                                        <Lock size={12} /> Credentials
                                    </h3>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">Username / Login ID *</label>
                                        <input required type="text" value={formData.username}
                                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                                            disabled={employees.some(emp => emp.username === formData.username)}
                                            className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-indigo-400 outline-none transition-all disabled:opacity-50" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">Password *</label>
                                            <input type="password" value={formData.password}
                                                required={!employees.some(emp => emp.username === formData.username)}
                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                placeholder={employees.some(emp => emp.username === formData.username) ? "Leave blank" : ""}
                                                className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-indigo-400 outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">Confirm *</label>
                                            <input type="password" value={formData.confirmPassword}
                                                required={!employees.some(emp => emp.username === formData.username) && formData.password !== ''}
                                                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                placeholder={employees.some(emp => emp.username === formData.username) ? "Leave blank" : ""}
                                                className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-indigo-400 outline-none transition-all" />
                                        </div>
                                    </div>
                                </div>

                                {/* Identity */}
                                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                                        <UserCheck size={12} /> Personal Identity
                                    </h3>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">Full Name *</label>
                                        <input required type="text" value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-emerald-400 outline-none transition-all" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 flex items-center gap-1"><Phone size={9} /> Mobile *</label>
                                            <input required type="tel" value={formData.mobile}
                                                onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                                                className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-emerald-400 outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 flex items-center gap-1"><Mail size={9} /> Email *</label>
                                            <input required type="email" value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-emerald-400 outline-none transition-all" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 flex items-center gap-1"><Building2 size={9} /> Address</label>
                                        <input type="text" value={formData.address}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-emerald-400 outline-none transition-all" />
                                    </div>
                                </div>
                            </div>

                            {/* Hierarchy */}
                            <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-2xl border border-indigo-100 p-5">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-700 mb-4 flex items-center gap-2">
                                    <MapPin size={12} className="text-indigo-500" /> Hierarchy & Territory Assignment
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">Assigned Role *</label>
                                        <select required value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full bg-white border-2 border-indigo-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 transition-all">
                                            {availableRoles.map(r => <option key={r} value={r}>{roleLabels[r]}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">Territory *</label>
                                        <input required type="text" value={formData.territory}
                                            onChange={e => setFormData({ ...formData, territory: e.target.value })}
                                            placeholder="e.g. Maharashtra, Delhi..."
                                            className="w-full bg-white border-2 border-indigo-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-indigo-500 transition-all" />
                                        <p className="text-[9px] text-indigo-500 mt-1 font-bold">⚠️ Bounds user data visibility</p>
                                    </div>
                                </div>
                            </div>

                            {/* Permissions Matrix */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                                        <Shield size={16} className="text-rose-500" /> Permissions Matrix
                                    </h3>
                                    <span className="bg-indigo-50 text-indigo-600 border border-indigo-200 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wide">
                                        {totalPermsGranted} Granted
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {PERMISSIONS_MATRIX.map((cat, idx) => {
                                        const isExpanded = expandedPerms[cat.category];
                                        const allChecked = cat.items.every(i => perms[`${cat.category}|${i}`]);
                                        const someChecked = cat.items.some(i => perms[`${cat.category}|${i}`]);
                                        return (
                                            <div key={idx} className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden hover:border-slate-200 transition-all">
                                                <div className="flex items-center justify-between px-4 py-3 cursor-pointer"
                                                    onClick={() => setExpandedPerms(p => ({ ...p, [cat.category]: !isExpanded }))}
                                                    style={{ borderLeft: `3px solid ${cat.color}` }}>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-base">{cat.icon}</span>
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-700">{cat.category}</p>
                                                            <p className="text-[9px] text-slate-400">{cat.items.filter(i => perms[`${cat.category}|${i}`]).length}/{cat.items.length} enabled</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${allChecked ? 'bg-emerald-400' : someChecked ? 'bg-amber-400' : 'bg-slate-200'}`} />
                                                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                    </div>
                                                </div>
                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                                            <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-2.5">
                                                                <label className="flex items-center gap-2 cursor-pointer pb-2 border-b border-slate-100">
                                                                    <input type="checkbox" className="w-3.5 h-3.5 rounded accent-indigo-600"
                                                                        checked={allChecked}
                                                                        onChange={e => handleCheckAll(cat.category, e.target.checked)} />
                                                                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Enable All</span>
                                                                </label>
                                                                {cat.items.map((item, ii) => (
                                                                    <label key={ii} className="flex items-center gap-2.5 cursor-pointer group">
                                                                        <input type="checkbox" className="w-3.5 h-3.5 rounded accent-indigo-600"
                                                                            checked={!!perms[`${cat.category}|${item}`]}
                                                                            onChange={e => handlePermChange(cat.category, item, e.target.checked)} />
                                                                        <span className="text-[11px] font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">{item}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="flex justify-end pt-4 border-t border-slate-100">
                                <button disabled={isVerifying} type="submit"
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
                                    {isVerifying ? <><RefreshCcw size={16} className="animate-spin" /> Sending OTP...</> : <><Save size={16} /> Provision Account</>}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── DIRECTORY ── */}
            {!showForm && activeTab === 'list' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {filtered.length === 0 && (
                        <div className="col-span-2 text-center py-16 text-slate-400">
                            <Users size={40} className="mx-auto mb-3 opacity-30" />
                            <p className="font-bold text-sm">No employees found</p>
                        </div>
                    )}
                    {filtered.map((emp, i) => {
                        const rc = ROLE_CONFIG[emp.role] || ROLE_CONFIG.NATIONAL_HEADER;
                        const isActive = emp.status === 'Approved';
                        return (
                            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                                {/* Card top */}
                                <div className="p-5 flex gap-4">
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${rc.bg} flex items-center justify-center text-white shadow-lg flex-shrink-0 relative`}>
                                        <span className="text-2xl font-black">{emp.name?.charAt(0) || '?'}</span>
                                        <span className="absolute -bottom-1.5 -right-1.5 text-base">{rc.rank}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="text-base font-black text-slate-800 truncate">{emp.name}</h3>
                                            <span className={`shrink-0 flex items-center gap-1 px-2.5 py-1 text-[9px] font-black uppercase rounded-full border ${isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                                                {isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-wide ${rc.light}`}>
                                            <Star size={8} /> {rc.label}
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500 font-semibold">
                                            <MapPin size={10} className="text-slate-400 shrink-0" />
                                            <span className="truncate">{emp.territory}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact strip */}
                                <div className="px-5 pb-3 flex flex-wrap gap-x-4 gap-y-1">
                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold">
                                        <Mail size={10} /> <span className="truncate max-w-[140px]">{emp.email}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold">
                                        <Phone size={10} /> {emp.mobile}
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 bg-slate-50/80 border-t border-slate-100 divide-x divide-slate-100">
                                    {[
                                        { label: 'Users', value: '1,240', color: '#6366f1' },
                                        { label: 'Vol/Month', value: '₹4.2Cr', color: '#10b981' },
                                        { label: 'Modules', value: `${emp.permissions?.length || 0}`, color: '#f59e0b' },
                                    ].map((s, si) => (
                                        <div key={si} className="p-3 text-center">
                                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{s.label}</div>
                                            <div className="text-sm font-black" style={{ color: s.color }}>{s.value}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="px-4 py-3 bg-white border-t border-slate-100 flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                                        <Activity size={11} className={isActive ? 'text-emerald-500' : 'text-slate-300'} />
                                        {isActive ? 'Live • Just now' : 'Offline'}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isAdmin && (
                                            <button onClick={() => toggleStatus(emp)}
                                                className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide px-3 py-1.5 rounded-lg border transition-all ${isActive ? 'border-rose-200 text-rose-500 hover:bg-rose-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}>
                                                {isActive ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                                                {isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                        )}
                                        <button onClick={() => { if (isAdmin) handleEdit(emp); }}
                                            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide text-indigo-600 px-3 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-all">
                                            <Eye size={12} /> {isAdmin ? 'Edit' : 'View'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* ── MAP ── */}
            {!showForm && activeTab === 'map' && (
                <div className="bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-xl" style={{ height: 580 }}>
                    <div className="absolute z-[400] top-4 left-4">
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-4 w-56">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-800 mb-3 flex items-center gap-2">
                                <Activity size={12} className="text-emerald-500" /> Header Pulse Map
                            </h3>
                            <div className="space-y-2">
                                {Object.entries(ROLE_CONFIG).map(([key, rc]) => (
                                    <div key={key} className="flex items-center gap-2.5">
                                        <div className={`w-3 h-3 rounded-full ${rc.dot}`} />
                                        <span className="text-[10px] font-bold text-slate-600">{rc.label}</span>
                                        <span className="ml-auto text-[10px] font-black text-slate-800">{employees.filter(e => e.role === key).length}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution="© CartoDB" />
                        {employees.map((emp, i) => emp.latitude && emp.longitude && (
                            <Marker key={i} position={[emp.latitude, emp.longitude]} icon={icons[emp.role] || icons['ADMIN']}>
                                <Popup>
                                    <div className="text-center p-1">
                                        <div className="font-black text-sm text-slate-800">{emp.name}</div>
                                        <div className="text-[9px] font-bold uppercase text-slate-500">{roleLabels[emp.role]}</div>
                                        <div className="inline-block mt-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-black rounded-lg">{emp.territory}</div>
                                        <div className="text-[9px] text-emerald-500 mt-1.5 font-bold flex items-center justify-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" /> Active
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            )}
        </div>
    );
}
