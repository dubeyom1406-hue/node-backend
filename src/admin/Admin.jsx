import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
    Save, RefreshCcw, Home, LayoutDashboard,
    Settings, Package, Video, CreditCard, Users,
    ArrowLeft, CheckCircle2, AlertTriangle, Plus, Trash2, Edit3, FileText,
    BarChart3, Megaphone, Zap, Upload, X, ImageIcon, Play,
    Camera, Eye, IndianRupee, ChevronRight, Wallet, TrendingUp, History, ArrowRight,
    Building2, UserPlus, UserMinus, ShieldCheck, Link2, Copy, Crown, ChevronDown, Mail, MapPin, Search, Smartphone, Clock, LayoutGrid, User, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { dataService, BACKEND_URL } from '../services/dataService';
import { sharedDataService } from '../services/sharedDataService';
import { sendApprovalEmail } from '../services/emailService';
import mainLogo from '../assets/rupiksha_logo.png';
import AdminPlanManager from './AdminPlanManager';
import OurMap from '../superadmin/pages/OurMap';
import LiveDashboard from './components/LiveDashboard';
import EmployeeManager from './components/EmployeeManager';
import LandingCMS from '../superadmin/pages/LandingCMS';
import ReportsAnalyst from './components/ReportsAnalyst';
import WalletManager from './components/WalletManager';
import LoanApprovalManager from './components/LoanApprovalManager';
import Overview from './components/Overview';
import { useAuth } from '../context/AuthContext';

const Admin = () => {
    const navigate = useNavigate();

    const { user: currentUser, loading, setUser, setIsLocked } = useAuth();

    // ── Auth guard: redirect to AdminLogin if not authenticated ──
    useEffect(() => {
        if (loading) return; // Wait until AuthContext has finished initializing
        const isAuth = sessionStorage.getItem('admin_auth');
        // Allow access if admin_auth is set OR if the user has an administrative role
        const hasAdminRole = currentUser && ['ADMIN', 'NATIONAL_HEADER', 'STATE_HEADER', 'REGIONAL_HEADER', 'EMPLOYEE'].includes(currentUser.role);
        
        if (!isAuth && !hasAdminRole) {
            navigate('/admin-login', { replace: true });
        } else if (hasAdminRole && !isAuth) {
            // Sync session storage if we have a valid admin role from AuthContext
            sessionStorage.setItem('admin_auth', 'true');
        }
    }, [navigate, currentUser, loading]);

    const [data, setData] = useState(dataService.getData());
    const [distributors, setDistributors] = useState([]);
    const [superadmins, setSuperadmins] = useState([]);
    const [trashUsers, setTrashUsers] = useState([]);

    // Default to Dashboard for Header users since they might not have Approvals access
    const initialSection = (currentUser && ['NATIONAL_HEADER', 'STATE_HEADER', 'REGIONAL_HEADER'].includes(currentUser.role)) ? 'Dashboard' : 'Approvals';
    const [activeSection, setActiveSection] = useState(initialSection);
    const [expandedSA, setExpandedSA] = useState(null); // ID of expanded SuperAdmin row
    const [expandedNav, setExpandedNav] = useState(null); // which nav group is expanded
    const [status, setStatus] = useState(null);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    // SuperAdmin Addition States
    const [showAddSAModal, setShowAddSAModal] = useState(false);
    const [showSAOTPView, setShowSAOTPView] = useState(false);
    const [saOtp, setSaOtp] = useState('');
    const [generatedSaOtp, setGeneratedSaOtp] = useState('');
    const [saAdding, setSaAdding] = useState(false);
    const [saVerifying, setSaVerifying] = useState(false);
    const [saForm, setSaForm] = useState({
        name: '', businessName: '', mobile: '', email: '',
        password: '', city: '', state: 'Bihar'
    });
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Distributor Addition States
    const [showAddDistModal, setShowAddDistModal] = useState(false);
    const [showDistOTPView, setShowDistOTPView] = useState(false);
    const [distOtp, setDistOtp] = useState('');
    const [generatedDistOtp, setGeneratedDistOtp] = useState('');
    const [distAdding, setDistAdding] = useState(false);
    const [distVerifying, setDistVerifying] = useState(false);
    const [distForm, setDistForm] = useState({
        name: '', businessName: '', mobile: '', email: '',
        password: '', city: '', state: 'Bihar', ownerId: ''
    });

    const [approvingIds, setApprovingIds] = useState(new Set()); // Usernames or IDs currently being approved (email sending)

    const [showSuccessView, setShowSuccessView] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState(null);

    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [isSavingMember, setIsSavingMember] = useState(false);
    const [memberFormData, setMemberFormData] = useState({
        name: '', businessName: '', mobile: '', email: '',
        password: '123456', pin: '1122', state: 'Bihar', city: '',
        role: 'RETAILER'
    });
    const [userForRoleChange, setUserForRoleChange] = useState(null);
    const [targetRole, setTargetRole] = useState('');
    const [geofenceAlert, setGeofenceAlert] = useState(null);

    useEffect(() => {
        const socket = io(BACKEND_URL);
        socket.on("admin_geofence_violation", (data) => {
            setGeofenceAlert(data);
            // Speak alert if possible
            try {
                const utterance = new SpeechSynthesisUtterance(`Warning: Geofence violation by ${data.username}`);
                window.speechSynthesis.speak(utterance);
            } catch (e) {}
        });
        return () => { socket.disconnect(); };
    }, []);

    const handleRoleChangeClick = (user) => {
        setUserForRoleChange(user);
        setTargetRole(user.role);
        setShowRoleModal(true);
    };

    const submitRoleChange = async () => {
        if (!targetRole) return;
        try {
            const res = await dataService.updateUserRole(userForRoleChange.username, targetRole);
            if (res.success) {
                setStatus({ type: 'success', message: `Role updated for ${userForRoleChange.username}` });
                refreshData();
                setShowRoleModal(false);
            } else {
                alert(res.message || 'Failed to update role');
            }
        } catch (e) {
            alert('Error updating role');
        }
    };

    const handleInviteSA = async (e) => {
        e.preventDefault();
        setSaAdding(true);
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedSaOtp(code);

        const emailModule = await import('../services/emailService');
        const res = await emailModule.sendOTPEmail(saForm.email, code, saForm.name);

        setSaAdding(false);
        if (res.success) {
            setShowSAOTPView(true);
        } else {
            alert("Failed to send OTP: " + (res.message || res.error || "Please check email address."));
        }
    };

    const handleVerifyAndAddSA = async () => {
        if (saOtp !== generatedSaOtp) {
            alert("Invalid OTP! Access Denied.");
            return;
        }

        setSaVerifying(true);
        try {
            const newSA = await sharedDataService.registerSuperAdmin({
                ...saForm,
                status: 'Pending'
            });

            if (newSA) {
                // Send Credentials Email
                try {
                    await dataService.resendCredentials({
                        email: saForm.email,
                        name: saForm.name,
                        mobile: saForm.mobile,
                        password: saForm.password,
                        role: 'SUPER_ADMIN'
                    });
                } catch (emailErr) {
                    console.error("Credentials email failed:", emailErr);
                }

                setShowSuccessView(true);
                await refreshData();
                setShowAddSAModal(false);
                setShowSAOTPView(false);
                setSaForm({ name: '', businessName: '', mobile: '', email: '', password: '', city: '', state: 'Bihar' });
            }
        } catch (err) {
            alert("Error adding Super Admin");
        } finally {
            setSaVerifying(false);
        }
    };

    const handleUnifiedAddMember = async (e) => {
        if (e) e.preventDefault();
        setIsSavingMember(true);
        try {
            const token = localStorage.getItem('rupiksha_token');
            const res = await fetch(`${BACKEND_URL}/admin/add-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    username: memberFormData.mobile,
                    password: memberFormData.password,
                    pin: memberFormData.pin,
                    fullName: memberFormData.name,
                    phone: memberFormData.mobile,
                    email: memberFormData.email,
                    address: memberFormData.city + ', ' + memberFormData.state,
                    role: memberFormData.role,
                    territory: memberFormData.state,
                    shopName: memberFormData.businessName
                })
            });
            const resData = await res.json();

            if (resData.success) {
                setCreatedCredentials({
                    loginId: memberFormData.mobile,
                    password: memberFormData.password,
                    portalType: memberFormData.role.replace('_', ' ')
                });
                setShowSuccessView(true);
                setShowAddMemberModal(false);
                refreshData();
            } else {
                alert(resData.error || "Registry Failed. User might already exist.");
            }
        } catch (err) {
            alert("Connection Error: " + err.message);
        } finally {
            setIsSavingMember(false);
        }
    };

    const handleInviteDist = async (e) => {
        e.preventDefault();
        setDistAdding(true);
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedDistOtp(code);

        const emailModule = await import('../services/emailService');
        const res = await emailModule.sendOTPEmail(distForm.email, code, distForm.name);

        setDistAdding(false);
        if (res.success) {
            setShowDistOTPView(true);
        } else {
            alert("Failed to send OTP: " + (res.message || res.error || "Please check email address."));
        }
    };

    const handleVerifyAndAddDist = async () => {
        if (distOtp !== generatedDistOtp) {
            alert("Invalid OTP! Access Denied.");
            return;
        }

        setDistVerifying(true);
        try {
            const newDist = await sharedDataService.registerDistributor({
                ...distForm,
                status: 'Pending'
            }, distForm.ownerId || null);

            if (newDist) {
                // Send Credentials Email
                try {
                    await dataService.resendCredentials({
                        email: distForm.email,
                        name: distForm.name,
                        mobile: distForm.mobile,
                        password: distForm.password,
                        role: 'DISTRIBUTOR'
                    });
                } catch (emailErr) {
                    console.error("Credentials email failed:", emailErr);
                }

                setShowSuccessView(true);
                refreshData();
                setShowAddDistModal(false);
                setShowDistOTPView(false);
                setDistForm({ name: '', businessName: '', mobile: '', email: '', password: '', city: '', state: 'Bihar', ownerId: '' });
            }
        } catch (err) {
            alert("Error adding Distributor");
        } finally {
            setDistVerifying(false);
        }
    };

    const refreshDists = () => {
        const all = sharedDataService.getAllDistributors();
        if (all.length === 0) {
            // Force seed if somehow still empty
            const defaults = sharedDataService.resetToDefaults();
            setDistributors(defaults);
        } else {
            setDistributors(all);
        }
    };

    const refreshData = async () => {
        try {
            const allUsers = await dataService.getAllUsers();

            // Filter users by role and status (Pending/Approved)
            const retailers = allUsers.filter(u => u.role === 'RETAILER');
            const dists = allUsers.filter(u => u.role === 'DISTRIBUTOR');
            const sas = allUsers.filter(u => u.role === 'SUPER_DISTRIBUTOR');

            const currentData = dataService.getData();
            setData({ ...currentData, users: retailers });
            setDistributors(dists);
            setSuperadmins(sas);

            // Sync with sharedDataService for other components
            sharedDataService.saveDistributors(dists, true);
            sharedDataService.saveSuperAdmins(sas, true);

            const trash = await dataService.getTrashUsers();
            setTrashUsers(trash);
        } catch (e) {
            console.error("Failed to refresh live data", e);
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleResendCredentials = async (user) => {
        if (!user.email) {
            alert(`Error: No email address found for user ${user.username}. Please update their profile with an email first.`);
            return;
        }
        const res = await dataService.resendCredentials(user);
        if (res.success) {
            alert(`Credentials resent successfully to ${user.email}`);
        } else {
            alert(`Failed to resend credentials: ${res.message}`);
        }
    };

    const handleRestoreUser = async (username) => {
        const res = await dataService.restoreUser(username);
        if (res.success) {
            setStatus({ type: 'success', message: 'User restored from trash' });
            refreshData();
        } else {
            alert('Failed to restore');
        }
    };

    // Listen for distributor and superadmin data changes
    useEffect(() => {
        refreshData();
        const handler = () => refreshData();
        window.addEventListener('distributorDataUpdated', handler);
        window.addEventListener('superadminDataUpdated', handler);
        return () => {
            window.removeEventListener('distributorDataUpdated', handler);
            window.removeEventListener('superadminDataUpdated', handler);
        };
    }, []);

    const handleSave = () => {
        dataService.saveData(data);
        setStatus({ type: 'success', message: 'All changes saved successfully!' });
        setTimeout(() => setStatus(null), 3000);
    };

    const handleReset = () => {
        if (window.confirm('Reset all data to defaults?')) {
            dataService.resetData();
            setData(dataService.getData());
            sharedDataService.resetToDefaults();
            refreshDists();
            setStatus({ type: 'success', message: 'All data reset to defaults!' });
            setTimeout(() => setStatus(null), 3000);
        }
    };

    const handleLoginAsRetailer = (user) => {
        // Ensure a token exists for the session
        if (!localStorage.getItem('rupiksha_token')) {
            localStorage.setItem('rupiksha_token', 'MOCK_ADMIN_IMPERSONATION_' + Date.now());
        }
        localStorage.setItem('rupiksha_user', JSON.stringify(user));
        localStorage.setItem('user', JSON.stringify(user));

        // Update context state immediately
        setUser(user);
        setIsLocked(false); // Bypass lock screen during impersonation

        navigate('/dashboard');
    };

    const handleLoginAsDistributor = (dist) => {
        if (!localStorage.getItem('rupiksha_token')) {
            localStorage.setItem('rupiksha_token', 'MOCK_ADMIN_IMPERSONATION_' + Date.now());
        }
        localStorage.setItem('rupiksha_user', JSON.stringify(dist));
        localStorage.setItem('user', JSON.stringify(dist));

        setUser(dist);
        setIsLocked(false);

        navigate('/distributor');
    };

    const handleLoginAdminSA = (sa) => {
        if (!localStorage.getItem('rupiksha_token')) {
            localStorage.setItem('rupiksha_token', 'MOCK_ADMIN_IMPERSONATION_' + Date.now());
        }
        localStorage.setItem('rupiksha_user', JSON.stringify(sa));
        localStorage.setItem('user', JSON.stringify(sa));

        setUser(sa);
        setIsLocked(false);

        navigate('/superadmin');
    };

    // Components to render different edit forms
    const ImageUpload = ({ value, onChange, label }) => {
        const handleFile = (file) => {
            if (!file || !file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = (e) => onChange(e.target.result);
            reader.readAsDataURL(file);
        };

        return (
            <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">{label}</span>
                <div
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
                    }}
                    className="relative group border-2 border-dashed border-slate-200 rounded-xl p-4 transition-all hover:border-emerald-400 bg-slate-50/50"
                >
                    {value ? (
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                            <img src={value} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <label className="cursor-pointer bg-white text-slate-900 p-2 rounded-full hover:scale-110 transition-transform">
                                    <Upload size={16} />
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFile(e.target.files[0])} />
                                </label>
                                <button
                                    onClick={() => onChange('')}
                                    className="bg-red-500 text-white p-2 rounded-full hover:scale-110 transition-transform"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center py-4 cursor-pointer">
                            <div className="p-3 bg-white rounded-full shadow-sm text-slate-400 group-hover:text-emerald-500 group-hover:scale-110 transition-all mb-2">
                                <Upload size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase group-hover:text-emerald-600">Click or Drag Image</span>
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFile(e.target.files[0])} />
                        </label>
                    )}
                </div>
            </div>
        );
    };

    const DashboardEditor = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
                <h3 className="font-bold text-slate-700 flex items-center gap-2"><Megaphone size={18} className="text-amber-500" /> News Bar Announcement</h3>
                <textarea
                    className="w-full p-4 bg-slate-50 border rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-200 outline-none"
                    rows="2"
                    value={data.news}
                    onChange={(e) => setData({ ...data, news: e.target.value })}
                />
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2"><BarChart3 size={18} className="text-blue-500" /> Weekly Activity Chart</h3>
                    <input type="text" className="w-64 p-2 bg-slate-50 border rounded-lg text-sm font-bold"
                        value={data.chartTitle}
                        onChange={(e) => setData({ ...data, chartTitle: e.target.value })} />
                </div>
                <div className="grid grid-cols-7 gap-4">
                    {(data.chartData || []).map((item, idx) => (
                        <div key={idx} className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-slate-400 text-center uppercase">{item.name}</span>
                            <input
                                type="number"
                                className="w-full p-2 bg-slate-50 border rounded-lg text-center text-sm font-bold"
                                value={item.value}
                                onChange={(e) => {
                                    const next = [...data.chartData];
                                    next[idx].value = parseInt(e.target.value) || 0;
                                    setData({ ...data, chartData: next });
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-6"><Zap size={18} className="text-emerald-500" /> Quick Action Cards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(data.quickActions || []).map((action, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                            <div className="flex gap-3">
                                <label className="flex-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Title</span>
                                    <input type="text" className="w-full mt-1 p-2 bg-white border rounded text-xs font-bold"
                                        value={action.title}
                                        onChange={(e) => {
                                            const next = [...data.quickActions];
                                            next[idx].title = e.target.value;
                                            setData({ ...data, quickActions: next });
                                        }} />
                                </label>
                                <label className="w-24">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Icon</span>
                                    <input type="text" className="w-full mt-1 p-2 bg-white border rounded text-xs"
                                        value={action.icon}
                                        onChange={(e) => {
                                            const next = [...data.quickActions];
                                            next[idx].icon = e.target.value;
                                            setData({ ...data, quickActions: next });
                                        }} />
                                </label>
                            </div>
                            <label className="block">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Description</span>
                                <input type="text" className="w-full mt-1 p-2 bg-white border rounded text-xs"
                                    value={action.subTitle}
                                    onChange={(e) => {
                                        const next = [...data.quickActions];
                                        next[idx].subTitle = e.target.value;
                                        setData({ ...data, quickActions: next });
                                    }} />
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    // ─── Stats Editor (Premium) ──────────────────────────────────────────
    const StatsEditor = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
                        <BarChart3 size={20} className="text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Main Business Activity</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Global Stats Override</p>
                    </div>
                </div>
                <div className="space-y-4">
                    {['today', 'weekly', 'monthly', 'debit'].map(key => (
                        <div key={key} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3 hover:border-emerald-200 transition-colors group">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{key} Volume</span>
                                <div className="relative">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">₹</span>
                                    <input type="text" className="w-28 pl-6 pr-3 py-1.5 bg-white border-2 border-slate-200 rounded-xl text-xs text-right font-black text-slate-900 outline-none focus:border-emerald-500 transition-all"
                                        value={key === 'debit' ? data.stats.debitSale : data.stats[`${key}Active`]}
                                        onChange={(e) => {
                                            if (key === 'debit') setData({ ...data, stats: { ...data.stats, debitSale: e.target.value } });
                                            else setData({ ...data, stats: { ...data.stats, [`${key}Active`]: e.target.value } });
                                        }} />
                                </div>
                            </div>
                            <input type="text" className="w-full px-3 py-2 bg-white border-2 border-slate-200 rounded-xl text-[10px] uppercase font-black text-emerald-600 tracking-wider outline-none focus:border-emerald-500"
                                value={data.stats.labels[key].title}
                                onChange={(e) => {
                                    const next = { ...data.stats };
                                    next.labels[key].title = e.target.value;
                                    setData({ ...data, stats: next });
                                }} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
                        <CreditCard size={20} className="text-amber-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Wallet & Identity</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Financial Defaults</p>
                    </div>
                </div>
                <div className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">System Wallet Balance</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-300">₹</span>
                            <input type="text" className="w-full pl-8 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-black text-[#005f56] outline-none focus:border-emerald-500 transition-all shadow-sm"
                                value={data.wallet.balance}
                                onChange={(e) => setData({ ...data, wallet: { ...data.wallet, balance: e.target.value } })} />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Public Display Business Name</label>
                        <input type="text" className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all"
                            value={data.wallet.retailerName}
                            onChange={(e) => setData({ ...data, wallet: { ...data.wallet, retailerName: e.target.value } })} />
                    </div>
                </div>
            </div>
        </div>
    );

    const ServicesEditor = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-8 rounded-[2.5rem] text-white flex justify-between items-center shadow-2xl">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Service Catalog</h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Direct control over active platform services</p>
                </div>
                <button
                    onClick={() => setData({ ...data, services: [...data.services, { category: 'New Category', items: [] }] })}
                    className="bg-white/10 hover:bg-white text-white hover:text-indigo-950 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all">
                    + Add Category
                </button>
            </div>

            {(data.services || []).map((cat, catIdx) => (
                <div key={catIdx} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-8 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-indigo-200">
                                {catIdx + 1}
                            </div>
                            <input
                                type="text"
                                className="text-lg font-black text-slate-800 bg-transparent border-b-2 border-transparent focus:border-indigo-500 outline-none px-2 uppercase tracking-tighter"
                                value={cat.category}
                                onChange={(e) => {
                                    const next = [...data.services];
                                    next[catIdx].category = e.target.value;
                                    setData({ ...data, services: next });
                                }}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    const next = [...data.services];
                                    next[catIdx].items.push({ title: 'New Service', icon: 'zap' });
                                    setData({ ...data, services: next });
                                }}
                                className="flex items-center gap-2 text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-wide">
                                <Plus size={12} /> Add Service
                            </button>
                            <button
                                onClick={() => { if (window.confirm('Delete category?')) { const next = data.services.filter((_, i) => i !== catIdx); setData({ ...data, services: next }); } }}
                                className="p-2.5 text-rose-400 hover:text-rose-600 bg-rose-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {cat.items.map((item, itemIdx) => (
                                <div key={itemIdx} className="p-5 bg-slate-50/50 rounded-2xl border-2 border-slate-100 group relative hover:border-indigo-300 transition-all hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-lg">{item.icon}</div>
                                            <input
                                                type="text"
                                                className="flex-1 text-[11px] font-black text-slate-700 bg-transparent outline-none uppercase tracking-wider"
                                                value={item.title}
                                                onChange={(e) => {
                                                    const next = [...data.services];
                                                    next[catIdx].items[itemIdx].title = e.target.value;
                                                    setData({ ...data, services: next });
                                                }}
                                            />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Icon Hook:</span>
                                            <input
                                                type="text"
                                                className="text-[10px] text-indigo-600 font-black bg-white/70 px-2 py-1 rounded-md outline-none flex-1 border border-slate-100 focus:border-indigo-300"
                                                value={item.icon}
                                                onChange={(e) => {
                                                    const next = [...data.services];
                                                    next[catIdx].items[itemIdx].icon = e.target.value;
                                                    setData({ ...data, services: next });
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const next = [...data.services];
                                            next[catIdx].items = next[catIdx].items.filter((_, i) => i !== itemIdx);
                                            setData({ ...data, services: next });
                                        }}
                                        className="absolute -top-2 -right-2 bg-rose-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110 active:scale-95"
                                    >
                                        <X size={10} strokeWidth={4} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const PromotionsEditor = () => (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-slate-200 pb-5">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                            <Video size={24} className="text-indigo-600" /> Promotion Hub
                        </h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Manage all visual assets</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {(data.promotions?.banners || []).map((banner, idx) => (
                        <div key={idx} className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm relative group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all">
                            <ImageUpload
                                label={`Dashboard Banner ${idx + 1}`}
                                value={banner.image}
                                onChange={(val) => {
                                    const next = { ...data.promotions };
                                    next.banners[idx].image = val;
                                    setData({ ...data, promotions: next });
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const LoginsTable = () => (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                        <History size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-none">Access Logs</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Real-time system login history</p>
                    </div>
                </div>
                <span className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-2xl text-[11px] font-black tracking-widest uppercase">{data.loginLogs?.length || 0} Records</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left font-bold text-slate-600">
                    <thead>
                        <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            <th className="px-8 py-5">Identity</th>
                            <th className="px-8 py-5">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {data.loginLogs?.map((log, i) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-8 py-4 font-black">{log.username}</td>
                                <td className="px-8 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${log.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                        {log.status === 'success' ? 'VALID' : 'INVALID'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [approvalForm, setApprovalForm] = useState({ password: '', pin: '', partyCode: '', distributorId: '' });

    const [showSAApprovalModal, setShowSAApprovalModal] = useState(false);
    const [selectedSA, setSelectedSA] = useState(null);
    const [saApprovalForm, setSAApprovalForm] = useState({ password: '', pin: '' });

    const [showCredentialCard, setShowCredentialCard] = useState(false);
    const [credentialData, setCredentialData] = useState(null);

    const handleApproveClick = (user) => {
        setSelectedUser(user);
        const approvedDists = sharedDataService.getAllDistributors().filter(d => d.status === 'Approved');
        setApprovalForm({
            password: 'Ru@' + Math.floor(1000 + Math.random() * 9000),
            pin: Math.floor(1000 + Math.random() * 9000).toString(),
            partyCode: 'RU' + Math.floor(100000 + Math.random() * 900000),
            distributorId: approvedDists[0]?.id || ''
        });
        setShowApprovalModal(true);
    };

    const submitApproval = async () => {
        if (!approvalForm.password || !approvalForm.partyCode) {
            alert('Please provide both Password and Party Code.');
            return;
        }

        const targetUser = selectedUser;
        const targetUsername = targetUser.username;

        // 1. Mark as currently being processed
        setApprovingIds(prev => new Set(prev).add(targetUsername));
        setShowApprovalModal(false);

        const shareData = {
            name: targetUser.name || targetUser.mobile,
            mobile: targetUser.mobile,
            password: approvalForm.password,
            pin: approvalForm.pin,
            idLabel: 'Party Code',
            idValue: approvalForm.partyCode,
            portalType: 'Retailer',
            url: window.location.origin,
            emailStatus: 'sending'
        };

        setCredentialData(shareData);
        setShowCredentialCard(true);

        try {
            // 2. Call the real backend email service FIRST
            const result = await sendApprovalEmail({
                to: targetUser.email,
                name: shareData.name,
                loginId: shareData.mobile,
                password: shareData.password,
                pin: shareData.pin,
                idLabel: shareData.idLabel,
                idValue: shareData.idValue,
                portalType: shareData.portalType
            });

            if (result.success) {
                // 3. Update DB status to Approved with result check
                const dbResult = await dataService.approveUser(targetUsername, approvalForm.password, approvalForm.partyCode, approvalForm.distributorId, approvalForm.pin);
                
                if (dbResult.success) {
                    setCredentialData(prev => ({
                        ...prev,
                        emailStatus: 'sent'
                    }));
                    // Refresh UI to move from Pending to Active
                    refreshData();
                } else {
                    setCredentialData(prev => ({
                        ...prev,
                        emailStatus: 'failed',
                        error: dbResult.message || 'Database update failed'
                    }));
                }
            } else {
                setCredentialData(prev => ({
                    ...prev,
                    emailStatus: 'failed',
                    error: result.message || 'Email delivery failed'
                }));
            }
        } catch (err) {
            setCredentialData(prev => ({
                ...prev,
                emailStatus: 'failed',
                error: 'Network error during email dispatch'
            }));
        } finally {
            // 4. Finished processing
            setApprovingIds(prev => {
                const next = new Set(prev);
                next.delete(targetUsername);
                return next;
            });
        }
    };


    const handleReject = async (username) => {
        if (window.confirm(`Are you sure you want to move user ${username} to trash?`)) {
            await dataService.deleteUser(username);
            refreshData();
            setStatus({ type: 'error', message: `User ${username} moved to trash.` });
            setTimeout(() => setStatus(null), 3000);
        }
    };

    const handleSAApproveClick = (sa) => {
        setSelectedSA(sa);
        setSAApprovalForm({
            password: 'SA@' + Math.floor(1000 + Math.random() * 9000)
        });
        setShowSAApprovalModal(true);
    };

    const submitSAApproval = async () => {
        if (!saApprovalForm.password) {
            alert('Please set a password.');
            return;
        }

        const targetSA = selectedSA;
        const targetId = targetSA.id;

        // 1. Mark as processing
        setApprovingIds(prev => new Set(prev).add(targetId));
        setShowSAApprovalModal(false);

        const shareData = {
            name: targetSA.name,
            mobile: targetSA.mobile,
            password: saApprovalForm.password,
            idLabel: 'SuperAdmin ID',
            idValue: targetId,
            portalType: 'SuperAdmin',
            url: window.location.origin,
            emailStatus: 'sending'
        };
        setCredentialData(shareData);
        setShowCredentialCard(true);

        try {
            // 2. Email First
            const result = await sendApprovalEmail({
                to: targetSA.email,
                name: shareData.name,
                loginId: shareData.mobile,
                password: shareData.password,
                idLabel: shareData.idLabel,
                idValue: shareData.idValue,
                portalType: shareData.portalType
            });

            if (result.success) {
                // 3. Status Change
                sharedDataService.approveSuperAdmin(targetId, saApprovalForm.password);

                setCredentialData(prev => ({
                    ...prev,
                    emailStatus: 'sent'
                }));
                refreshData();
            } else {
                setCredentialData(prev => ({
                    ...prev,
                    emailStatus: 'failed',
                    error: result.message || 'Email delivery failed'
                }));
            }
        } catch (err) {
            setCredentialData(prev => ({
                ...prev,
                emailStatus: 'failed',
                error: 'Connection error'
            }));
        } finally {
            // 4. Cleanup
            setApprovingIds(prev => {
                const next = new Set(prev);
                next.delete(targetId);
                return next;
            });
        }
    };

    const SAApprovalModal = () => (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <ShieldCheck size={20} className="text-indigo-500" /> Approve SuperAdmin
                    </h3>
                    <button onClick={() => setShowSAApprovalModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">User</label>
                        <p className="p-3 bg-slate-50 rounded-lg font-bold text-slate-700 text-sm">{selectedSA?.name || selectedSA?.mobile}</p>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Set Password</label>
                        <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 font-mono" value={saApprovalForm.password} onChange={(e) => setSAApprovalForm({ ...saApprovalForm, password: e.target.value })} />
                    </div>
                    <button onClick={submitSAApproval} className="w-full bg-indigo-500 text-white font-black py-4 rounded-xl shadow-lg uppercase tracking-widest text-xs">Confirm & Send Login</button>
                </div>
            </motion.div>
        </div>
    );

    const ApprovalModal = () => (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-slate-200"
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <CheckCircle2 size={20} className="text-emerald-500" /> Approve Retailer
                    </h3>
                    <button onClick={() => setShowApprovalModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                </div>

                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 mb-5">
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">📧 Auto-email to:</span>
                    <span className="text-xs font-black text-emerald-700 ml-auto">{selectedUser?.email || 'No email on record'}</span>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Retailer Name</label>
                            <p className="p-3 bg-slate-50 rounded-lg font-bold text-slate-700 text-sm">{selectedUser?.name || selectedUser?.mobile}</p>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Login ID (Mobile)</label>
                            <p className="p-3 bg-slate-50 rounded-lg font-mono font-bold text-slate-700 text-sm">{selectedUser?.mobile}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Password <span className="text-emerald-500">(editable)</span></label>
                            <input type="text"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
                                value={approvalForm.password}
                                onChange={(e) => setApprovalForm({ ...approvalForm, password: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Security PIN <span className="text-emerald-500">(editable)</span></label>
                            <input type="text" maxLength="4"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
                                value={approvalForm.pin}
                                onChange={(e) => setApprovalForm({ ...approvalForm, pin: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Party Code <span className="text-emerald-500">(editable)</span></label>
                        <input type="text"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                            value={approvalForm.partyCode}
                            onChange={(e) => setApprovalForm({ ...approvalForm, partyCode: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Assign Distributor</label>
                        <select
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                            value={approvalForm.distributorId}
                            onChange={(e) => setApprovalForm({ ...approvalForm, distributorId: e.target.value })}
                        >
                            <option value="">No Distributor (Direct)</option>
                            {distributors.filter(d => d.status === 'Approved').map(d => (
                                <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={submitApproval}
                        className="w-full bg-emerald-500 text-white font-black py-4 rounded-xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition-all active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 size={16} /> Approve — Email Sends Automatically
                    </button>
                </div>
            </motion.div>
        </div>
    );





    const RetailersTable = () => (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                        <Users size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-none">Registered Retailers</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Global agent network management</p>
                    </div>
                </div>
                <span className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-2xl text-[11px] font-black tracking-widest uppercase">{(data.users || []).length} TOTAL AGENTS</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            <th className="px-8 py-5">Agent Identity</th>
                            <th className="px-8 py-5">Area Details</th>
                            <th className="px-8 py-5">Account Status</th>
                            <th className="px-8 py-5">Parent Distributor</th>
                            <th className="px-8 py-5 text-right">Liquidity</th>
                            <th className="px-8 py-5 text-center">Protocol Code</th>
                            <th className="px-8 py-5 text-center">Manage</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs">
                        {(data.users || []).map((user, idx) => (
                            user && <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-8 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-black uppercase text-xs group-hover:scale-110 transition-all font-mono">
                                            {user.profilePhoto ? <img src={user.profilePhoto} className="w-full h-full object-cover rounded-xl" /> : (user.name?.charAt(0) || 'R')}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-800 tracking-tight leading-none">{user.name}</p>
                                            <p className="text-[9px] font-black text-slate-400 mt-1 uppercase tracking-tight">{user.username}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-4">
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-tight">{(user.city || 'GLOBAL_LOC')}</p>
                                    <p className="text-[9px] font-bold text-slate-400">{user.state || 'N/A'}</p>
                                </td>
                                <td className="px-8 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tight ${user.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Approved' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                        {user.status || 'PENDING'}
                                    </span>
                                </td>
                                <td className="px-8 py-4">
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-tight">{user.distributorName || 'SYSTEM_DIRECT'}</p>
                                </td>
                                <td className="px-8 py-4 text-right">
                                    <p className="text-sm font-black text-slate-800 tabular-nums leading-none">₹{Number(user.wallet?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                    <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1">Real-time Balance</p>
                                </td>
                                <td className="px-8 py-4 text-center">
                                    <span className="font-mono text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{user.partyCode || 'NONE'}</span>
                                </td>
                                <td className="px-8 py-4 text-center">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => handleResendCredentials(user)} className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-900 hover:text-white transition-all shadow-sm" title="Resend Credentials"><Mail size={15} /></button>
                                        <button onClick={() => handleRoleChangeClick(user)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm" title="Edit Role"><TrendingUp size={15} /></button>
                                        <button onClick={() => handleLoginAsRetailer(user)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm" title="Impersonate"><ArrowRight size={15} /></button>
                                        <button onClick={() => handleReject(user.username)} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all shadow-sm" title="Deactivate"><Trash2 size={15} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const ChangeRoleModal = () => (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-md border border-slate-200"
            >
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                            <TrendingUp size={24} className="text-indigo-600" /> Administrative Rank Shift
                        </h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Modifying system hierarchy access</p>
                    </div>
                    <button onClick={() => setShowRoleModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"><X size={24} /></button>
                </div>

                <div className="space-y-8">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Account</p>
                        <p className="text-lg font-black text-slate-800 tracking-tight leading-none">{userForRoleChange?.name || userForRoleChange?.username}</p>
                        <p className="text-[10px] font-bold text-slate-500 mt-2 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Current Rank: {userForRoleChange?.role}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Authority Access</p>
                        <div className="grid grid-cols-1 gap-3">
                            {['RETAILER', 'DISTRIBUTOR', 'SUPER_DISTRIBUTOR'].map(role => (
                                <button
                                    key={role}
                                    onClick={() => setTargetRole(role)}
                                    className={`w-full p-5 rounded-2xl text-left border-2 transition-all flex items-center justify-between group
                                        ${targetRole === role
                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xl shadow-indigo-500/10'
                                            : 'border-slate-100 bg-white text-slate-500 hover:border-indigo-200'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-[10px] transition-all ${targetRole === role ? 'bg-indigo-600 text-white' : 'bg-slate-100 group-hover:bg-indigo-100'}`}>
                                            {role.charAt(0)}
                                        </div>
                                        <span className="text-[11px] font-black uppercase tracking-wider">{role.replace('_', ' ')}</span>
                                    </div>
                                    {targetRole === role && <CheckCircle2 size={18} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={submitRoleChange}
                        className="w-full bg-indigo-600 text-white font-black py-5 rounded-[1.5rem] shadow-2xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-95 uppercase tracking-widest text-[11px]"
                    >
                        Execute Authority Shift
                    </button>
                    <p className="text-[10px] text-center text-slate-400 font-bold px-6 leading-relaxed italic">
                        Warning: Role changes take effect immediately. All active sessions for this user will be renewed with new permissions.
                    </p>
                </div>
            </motion.div>
        </div>
    );

    const TrashTable = () => (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-rose-50/20">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                        <Trash2 size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-none">Archived Records</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Data retention & restoration vault</p>
                    </div>
                </div>
                <span className="px-4 py-2 bg-rose-50 text-rose-600 rounded-2xl text-[11px] font-black tracking-widest uppercase">{(trashUsers || []).length} ARCHIVED</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            <th className="px-8 py-5">Subject Identity</th>
                            <th className="px-8 py-5">System Role</th>
                            <th className="px-8 py-5">Archive Date</th>
                            <th className="px-8 py-5 text-center">Protocol Control</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {trashUsers.map((t, idx) => (
                            <tr key={idx} className="hover:bg-rose-50/10 transition-colors">
                                <td className="px-8 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-black text-[10px] uppercase font-mono">{t.name?.charAt(0) || 'T'}</div>
                                        <div>
                                            <p className="text-sm font-black text-slate-800 tracking-tight leading-none">{t.name || t.username}</p>
                                            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{t.mobile}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-4">
                                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest">{t.role || 'GUEST'}</span>
                                </td>
                                <td className="px-8 py-4 text-xs font-bold text-slate-400 tabular-nums">{new Date(t.updated_at || t.created_at).toLocaleDateString()}</td>
                                <td className="px-8 py-4">
                                    <div className="flex justify-center gap-3">
                                        <button onClick={() => handleRestoreUser(t.username)} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest shadow-sm">
                                            <RefreshCcw size={14} /> Restore Unit
                                        </button>
                                        <button onClick={() => { if (window.confirm('PERMANENTLY DELETE?')) { dataService.deleteUser(t.username); refreshData(); } }} className="flex items-center gap-2 px-6 py-2.5 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest shadow-sm">
                                            <Trash2 size={14} /> Wipe Data
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {(!trashUsers || trashUsers.length === 0) && (
                            <tr><td colSpan={4} className="py-24 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-slate-100 text-slate-200"><Trash2 size={24} /></div>
                                <p className="font-black text-slate-200 text-[11px] uppercase tracking-[0.5em] italic">Archive vault is empty</p>
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const AddSuperAdminModal = () => (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative"
            >
                <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tight">
                            {showSAOTPView ? 'Confirm Identity' : 'Provision SuperAdmin'}
                        </h3>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            {showSAOTPView ? `Enter OTP sent to ${saForm.email}` : 'Direct registration of high-level distributors'}
                        </p>
                    </div>
                    <button onClick={() => { setShowAddSAModal(false); setShowSAOTPView(false); }} className="p-3 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-2xl transition-all">
                        <X size={24} />
                    </button>
                </div>

                {!showSAOTPView ? (
                    <form onSubmit={handleInviteSA} className="p-10 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Partner Name</label>
                                <input required type="text" value={saForm.name} onChange={e => setSaForm({ ...saForm, name: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 focus:border-[#4f46e5] focus:bg-white transition-all outline-none" placeholder="Full Name" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Agency Name</label>
                                <input required type="text" value={saForm.businessName} onChange={e => setSaForm({ ...saForm, businessName: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 focus:border-[#4f46e5] focus:bg-white transition-all outline-none" placeholder="Business ID" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mobile No</label>
                                <input required type="tel" maxLength="10" value={saForm.mobile} onChange={e => setSaForm({ ...saForm, mobile: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 focus:border-[#4f46e5] focus:bg-white transition-all outline-none" placeholder="Primary Contact" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email</label>
                                <input required type="email" value={saForm.email} onChange={e => setSaForm({ ...saForm, email: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 focus:border-[#4f46e5] focus:bg-white transition-all outline-none" placeholder="verification@email.com" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Zone</label>
                                <select value={saForm.state} onChange={e => setSaForm({ ...saForm, state: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 focus:border-[#4f46e5] focus:bg-white transition-all outline-none appearance-none">
                                    {['Bihar', 'UP', 'MP', 'Delhi', 'West Bengal', 'Mumbai'].map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">City</label>
                                <input required type="text" value={saForm.city} onChange={e => setSaForm({ ...saForm, city: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 focus:border-[#4f46e5] focus:bg-white transition-all outline-none" placeholder="Master Hub" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">System Password</label>
                            <input required type="text" value={saForm.password} onChange={e => setSaForm({ ...saForm, password: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 focus:border-[#4f46e5] focus:bg-white transition-all outline-none" />
                        </div>

                        <div className="pt-6 sticky bottom-0 bg-white">
                            <button disabled={saAdding} type="submit" className="w-full bg-[#4f46e5] text-white font-black py-5 rounded-2xl text-[11px] uppercase tracking-[0.25em] shadow-2xl active:scale-95 transition-all disabled:opacity-50">
                                {saAdding ? 'SENDING OTP...' : 'INITIATE PROVISIONING'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="p-10 space-y-10 text-center">
                        <div className="flex justify-center gap-3">
                            {[...Array(6)].map((_, i) => (
                                <input
                                    key={i}
                                    type="text"
                                    maxLength="1"
                                    value={saOtp[i] || ''}
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (val) {
                                            const newOtp = saOtp.split('');
                                            newOtp[i] = val;
                                            setSaOtp(newOtp.join(''));
                                            if (e.target.nextSibling) e.target.nextSibling.focus();
                                        }
                                    }}
                                    onKeyDown={e => {
                                        if (e.key === 'Backspace' && !saOtp[i] && e.target.previousSibling) {
                                            e.target.previousSibling.focus();
                                        }
                                    }}
                                    className="w-12 h-16 text-center text-2xl font-black bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#4f46e5] transition-all outline-none shadow-sm"
                                />
                            ))}
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={handleVerifyAndAddSA}
                                disabled={saVerifying || saOtp.length < 6}
                                className="w-full bg-emerald-500 text-white font-black py-5 rounded-2xl text-[11px] uppercase tracking-[0.25em] shadow-2xl active:scale-95 transition-all disabled:opacity-50"
                            >
                                {saVerifying ? 'VERIFYING...' : 'FINALIZE PROVISIONING'}
                            </button>
                            <button
                                onClick={() => setShowSAOTPView(false)}
                                className="text-slate-400 font-black text-[9px] uppercase tracking-widest hover:text-slate-600 transition-colors"
                            >
                                CANCEL & BACK
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );

    const AddMemberModal = () => (
        <div className="fixed inset-0 z-[150] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-white w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl relative"
            >
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 uppercase italic">Add Network Partner</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Direct system provisioning</p>
                    </div>
                    <button onClick={() => setShowAddMemberModal(false)} className="p-3 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-2xl transition-all"><X size={24} /></button>
                </div>

                <form onSubmit={handleUnifiedAddMember} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Partner Role</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['RETAILER', 'DISTRIBUTOR', 'SUPER_DISTRIBUTOR'].map(r => (
                                <button key={r} type="button" onClick={() => setMemberFormData({ ...memberFormData, role: r })}
                                    className={`py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border-2
                                        ${memberFormData.role === r ? 'bg-slate-900 text-white border-transparent shadow-lg scale-105' : 'bg-slate-50 text-slate-400 border-transparent hover:border-slate-200'}`}>
                                    {r.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                            <input required type="text" value={memberFormData.name} onChange={e => setMemberFormData({ ...memberFormData, name: e.target.value })} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 outline-none focus:border-indigo-500 transition-all shadow-sm" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Mobile No</label>
                            <input required type="tel" maxLength="10" value={memberFormData.mobile} onChange={e => setMemberFormData({ ...memberFormData, mobile: e.target.value })} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 outline-none focus:border-indigo-500 transition-all shadow-sm" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Business Name</label>
                            <input required type="text" value={memberFormData.businessName} onChange={e => setMemberFormData({ ...memberFormData, businessName: e.target.value })} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 outline-none focus:border-indigo-500 transition-all shadow-sm" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Email ID</label>
                            <input required type="email" value={memberFormData.email} onChange={e => setMemberFormData({ ...memberFormData, email: e.target.value })} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 outline-none focus:border-indigo-500 transition-all shadow-sm" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Zone (State)</label>
                            <select value={memberFormData.state} onChange={e => setMemberFormData({ ...memberFormData, state: e.target.value })} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 outline-none appearance-none">
                                {['Bihar', 'UP', 'Delhi', 'Haryana', 'MP', 'Punjab', 'Maharashtra'].map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">City</label>
                            <input required type="text" value={memberFormData.city} onChange={e => setMemberFormData({ ...memberFormData, city: e.target.value })} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 outline-none focus:border-indigo-500 transition-all shadow-sm" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">System Password (Numeric)</label>
                            <input required type="text" pattern="[0-9]*" value={memberFormData.password} onChange={e => setMemberFormData({ ...memberFormData, password: e.target.value.replace(/\D/g, '') })} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 outline-none focus:border-indigo-500 transition-all font-mono shadow-sm" placeholder="Numbers only" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Security PIN (4-Digit)</label>
                            <input required type="text" maxLength="4" pattern="[0-9]*" value={memberFormData.pin} onChange={e => setMemberFormData({ ...memberFormData, pin: e.target.value.replace(/\D/g, '') })} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 outline-none focus:border-indigo-500 transition-all font-mono shadow-sm" placeholder="4 digit PIN" />
                        </div>
                    </div>

                    <button disabled={isSavingMember} type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-[1.8rem] uppercase tracking-[0.2em] text-[11px] shadow-2xl hover:bg-black transition-all active:scale-95 disabled:opacity-50">
                        {isSavingMember ? 'Transmitting Registry...' : 'Execute Provisioning'}
                    </button>
                    <p className="text-[10px] text-center text-slate-400 font-bold italic">Credentials will be emailed automatically upon success.</p>
                </form>
            </motion.div>
        </div>
    );

    // ── Distributors Panel ────────────────────────────────────────────────
    const [showDistApprovalModal, setShowDistApprovalModal] = useState(false);
    const [selectedDist, setSelectedDist] = useState(null);
    const [distApprovalForm, setDistApprovalForm] = useState({ password: '', distribId: '' });
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assignTargetDist, setAssignTargetDist] = useState(null);
    const [assignSearch, setAssignSearch] = useState('');

    const handleDistApproveClick = (dist) => {
        setSelectedDist(dist);
        // Auto-generate distributor ID and password for admin to review before approving
        setDistApprovalForm({
            password: 'Dist@' + Math.floor(1000 + Math.random() * 9000),
            distribId: dist.id   // already auto-generated on registration
        });
        setShowDistApprovalModal(true);
    };

    const submitDistApproval = async () => {
        if (!distApprovalForm.password) { alert('Please set a login password.'); return; }

        const targetDist = selectedDist;
        const targetId = targetDist.id;

        // 1. Mark as processing
        setApprovingIds(prev => new Set(prev).add(targetId));
        setShowDistApprovalModal(false);

        const shareData = {
            name: targetDist.name,
            mobile: targetDist.mobile,
            password: distApprovalForm.password,
            idLabel: 'Distributor ID',
            idValue: distApprovalForm.distribId,
            portalType: 'Distributor',
            url: window.location.origin,
            emailStatus: 'sending'
        };

        setCredentialData(shareData);
        setShowCredentialCard(true);

        try {
            // 2. Email First
            const result = await sendApprovalEmail({
                to: targetDist.email,
                name: shareData.name,
                loginId: shareData.mobile,
                password: shareData.password,
                idLabel: shareData.idLabel,
                idValue: shareData.idValue,
                portalType: shareData.portalType
            });

            if (result.success) {
                // 3. Update DB
                sharedDataService.approveDistributor(targetId, distApprovalForm.password, distApprovalForm.distribId);

                setCredentialData(prev => ({
                    ...prev,
                    emailStatus: 'sent'
                }));
                // Need to refresh both distributors and the main data
                refreshDists();
                refreshData();
            } else {
                setCredentialData(prev => ({
                    ...prev,
                    emailStatus: 'failed',
                    error: result.message || 'Email delivery failed'
                }));
            }
        } catch (err) {
            setCredentialData(prev => ({
                ...prev,
                emailStatus: 'failed',
                error: 'Connection error'
            }));
        } finally {
            // 4. Cleanup
            setApprovingIds(prev => {
                const next = new Set(prev);
                next.delete(targetId);
                return next;
            });
        }
    };

    const renderCredentialSharerModal = () => {
        if (!credentialData) return null;

        const shareText = `*RUPIKSHA FINTECH APPROVAL* 🚀\n\n` +
            `Hello *${credentialData.name}*,\n` +
            `Aapka *${credentialData.portalType}* account approve ho gaya hai.\n\n` +
            `*Login Details:*\n` +
            `• ID: ${credentialData.mobile}\n` +
            `• Password: ${credentialData.password}\n` +
            `• ${credentialData.idLabel}: ${credentialData.idValue}\n\n` +
            `Login here: ${credentialData.url}\n\n` +
            `_Team RUPIKSHA_`;

        const copyAll = () => {
            navigator.clipboard.writeText(shareText);
            alert('Credentials Copied! Ab aap paste kar sakte hain.');
        };

        const shareWA = () => {
            const url = `https://wa.me/91${credentialData.mobile}?text=${encodeURIComponent(shareText)}`;
            window.open(url, '_blank');
        };

        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
                <motion.div initial={{ scale: 0.9, y: 40, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
                    className="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-md border border-slate-200 text-center space-y-8"
                >
                    <div className="relative">
                        <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto border-4 border-emerald-100/50 shadow-inner">
                            {credentialData.emailStatus === 'sending' ? (
                                <RefreshCcw size={40} className="animate-spin text-amber-500" />
                            ) : credentialData.emailStatus === 'sent' ? (
                                <CheckCircle2 size={48} className="drop-shadow-sm" />
                            ) : (
                                <AlertTriangle size={48} className="text-rose-500" />
                            )}
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-indigo-600 rounded-full border-4 border-white flex items-center justify-center text-white">
                            <CheckCircle2 size={14} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight italic">
                            {credentialData.emailStatus === 'sending' ? 'Provisioning...' :
                                credentialData.emailStatus === 'sent' ? 'Transmission_Success' : 'Relay_Failed'}
                        </h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-relaxed px-10">
                            {credentialData.emailStatus === 'failed' ? credentialData.error : 'Agent Credentials generated and validated'}
                        </p>
                    </div>

                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-8 text-left space-y-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none italic font-black text-6xl">DATA</div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Password</span>
                                <span className="text-sm font-black text-slate-800 font-mono">{credentialData.password}</span>
                            </div>
                            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex flex-col items-center">
                                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1.5 leading-none">Account PIN</span>
                                <span className="text-sm font-black text-indigo-700 font-mono">{credentialData.pin}</span>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">{credentialData.idLabel}</span>
                                <span className="text-sm font-black text-slate-800 font-mono">{credentialData.idValue}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-400 uppercase tracking-tight">Access Link :</span>
                                <span className="font-black text-indigo-500 underline text-[10px] uppercase truncate ml-4 tracking-tighter">portal.rupiksha.in</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-400 uppercase tracking-tight">Mobile ID :</span>
                                <span className="font-black text-slate-700 tracking-wider font-mono">{credentialData.mobile}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-400 uppercase tracking-tight">Access Key :</span>
                                <span className="font-black text-slate-700 tracking-wider font-mono bg-amber-100 px-2 py-0.5 rounded-md">{credentialData.password}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                        <button onClick={shareWA} className="w-full bg-[#128C7E] text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-[#075E54] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-[11px]">
                            <Megaphone size={18} /> Direct WhatsApp Push
                        </button>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={copyAll} className="w-full bg-slate-900 text-white font-black py-4 rounded-xl shadow-lg hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]">
                                <Copy size={16} /> Clip_Data
                            </button>
                            <button onClick={() => setShowCredentialCard(false)} className="w-full bg-slate-100 text-slate-500 font-black py-4 rounded-xl hover:bg-slate-200 active:scale-95 transition-all uppercase tracking-widest text-[10px]">
                                Dismiss
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    };


    const renderDistApprovalModal = () => (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-md border border-slate-200"
            >
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3 italic">
                            <Building2 size={24} className="text-amber-500" /> Distributor_Auth
                        </h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Authorization Protocol Layer-2</p>
                    </div>
                    <button onClick={() => setShowDistApprovalModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"><X size={24} /></button>
                </div>

                <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm">
                        <Mail size={24} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-amber-600 uppercase tracking-[0.2em] mb-0.5">Automated Relay Active</p>
                        <p className="text-xs font-black text-slate-700 tracking-tight">{selectedDist?.email || 'OFF_GRID'}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Entity Name</label>
                            <p className="font-black text-slate-800 text-sm tracking-tight">{selectedDist?.businessName}</p>
                        </div>
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Root Login</label>
                            <p className="font-black text-slate-800 text-sm font-mono tracking-tight">{selectedDist?.mobile}</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Assign Global ID</label>
                        <input type="text" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-mono font-black text-slate-700 outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all"
                            value={distApprovalForm.distribId}
                            onChange={e => setDistApprovalForm({ ...distApprovalForm, distribId: e.target.value })}
                            placeholder="DISTR_ID_001"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">System Access Key</label>
                        <input type="text" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-mono font-black text-slate-700 outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-mono"
                            value={distApprovalForm.password}
                            onChange={e => setDistApprovalForm({ ...distApprovalForm, password: e.target.value })}
                        />
                    </div>

                    <div className="pt-4">
                        <button onClick={submitDistApproval}
                            className="w-full bg-amber-500 text-white font-black py-5 rounded-[1.5rem] shadow-2xl shadow-amber-500/20 hover:bg-amber-600 transition-all active:scale-95 uppercase tracking-[0.25em] text-[11px] flex items-center justify-center gap-3"
                        >
                            <ShieldCheck size={20} /> Deploy Credentials
                        </button>
                        <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest mt-6 italic opacity-60">Manual review confirmed - Encryption active</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );

    const renderAssignRetailersModal = () => {
        const allRetailers = (dataService.getData().users || []).filter(u => u.status === 'Approved' && u.username !== 'admin');
        const assignedToDist = assignTargetDist?.assignedRetailers || [];
        const filtered = allRetailers.filter(r =>
            r.name?.toLowerCase().includes(assignSearch.toLowerCase()) ||
            r.mobile?.includes(assignSearch) ||
            r.username?.includes(assignSearch)
        );
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-[2.5rem] shadow-2xl p-8 w-full max-w-xl border border-slate-200 max-h-[85vh] flex flex-col"
                >
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight italic flex items-center gap-3">
                                <UserPlus size={24} className="text-amber-500" /> Assignment_Hub
                            </h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Linking agents to {assignTargetDist?.name}</p>
                        </div>
                        <button onClick={() => { setShowAssignModal(false); setAssignSearch(''); }} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"><X size={24} /></button>
                    </div>

                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" placeholder="Filter agents by name, mobile, or username..." value={assignSearch}
                            onChange={e => setAssignSearch(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition-all"
                        />
                    </div>

                    <div className="overflow-y-auto flex-1 space-y-3 pr-2 custom-scrollbar">
                        {filtered.length === 0 && (
                            <div className="py-20 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200"><Users size={32} /></div>
                                <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em]">No agents match query</p>
                            </div>
                        )}
                        {filtered.map((r, i) => {
                            const isAssigned = assignedToDist.includes(r.username);
                            const otherDist = !isAssigned ? sharedDataService.getDistributorForRetailer(r.username) : null;
                            return (
                                <motion.div key={i} whileHover={{ x: 5 }} className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all
                                    ${isAssigned ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50 border-slate-100/50 hover:border-slate-200'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${isAssigned ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                            {r.name?.charAt(0) || 'R'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-800 tracking-tight leading-none">{r.name || r.username}</p>
                                            <p className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-tighter">{r.mobile} · {r.state}</p>
                                            {otherDist && (
                                                <div className="mt-1 flex items-center gap-1">
                                                    <div className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
                                                    <p className="text-[8px] text-rose-500 font-black uppercase">Reserved: {otherDist.name}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (isAssigned) {
                                                sharedDataService.unassignRetailerFromDistributor(assignTargetDist.id, r.username);
                                            } else {
                                                if (otherDist) sharedDataService.unassignRetailerFromDistributor(otherDist.id, r.username);
                                                sharedDataService.assignRetailerToDistributor(assignTargetDist.id, r.username);
                                            }
                                            setAssignTargetDist(sharedDataService.getDistributorById(assignTargetDist.id));
                                            refreshDists();
                                        }}
                                        className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm active:scale-95
                                            ${isAssigned
                                                ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-100'
                                                : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20'}`}
                                    >
                                        {isAssigned ? 'Revoke_Link' : 'Link_Agent'}
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        );
    };

    const renderAddDistributorModal = () => (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative"
            >
                <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tight">
                            {showDistOTPView ? 'Confirm Identity' : 'Provision Distributor'}
                        </h3>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            {showDistOTPView ? `Enter OTP sent to ${distForm.email}` : 'Direct registration with hierarchy assignment'}
                        </p>
                    </div>
                    <button onClick={() => { setShowAddDistModal(false); setShowDistOTPView(false); }} className="p-3 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-2xl transition-all">
                        <X size={24} />
                    </button>
                </div>

                {!showDistOTPView ? (
                    <form onSubmit={handleInviteDist} className="p-10 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Name</label>
                                <input required type="text" value={distForm.name} onChange={e => setDistForm({ ...distForm, name: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 focus:border-[#4f46e5] focus:bg-white transition-all outline-none" placeholder="Full Name" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Agency Name</label>
                                <input required type="text" value={distForm.businessName} onChange={e => setDistForm({ ...distForm, businessName: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 focus:border-[#4f46e5] focus:bg-white transition-all outline-none" placeholder="Business Name" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mobile No</label>
                                <input required type="tel" maxLength="10" value={distForm.mobile} onChange={e => setDistForm({ ...distForm, mobile: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 focus:border-[#4f46e5] focus:bg-white transition-all outline-none" placeholder="Primary Contact" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email</label>
                                <input required type="email" value={distForm.email} onChange={e => setDistForm({ ...distForm, email: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 focus:border-[#4f46e5] focus:bg-white transition-all outline-none" placeholder="verification@email.com" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Zone</label>
                                <select value={distForm.state} onChange={e => setDistForm({ ...distForm, state: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black text-slate-900 focus:border-[#4f46e5] focus:bg-white transition-all outline-none appearance-none">
                                    {['Bihar', 'UP', 'MP', 'Delhi', 'West Bengal', 'Mumbai'].map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">City</label>
                                <input required type="text" value={distForm.city} onChange={e => setDistForm({ ...distForm, city: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black text-slate-900 focus:border-[#4f46e5] focus:bg-white transition-all outline-none" placeholder="City" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Assign SuperAdmin (Owner)</label>
                            <select value={distForm.ownerId} onChange={e => setDistForm({ ...distForm, ownerId: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black text-slate-900 focus:border-[#4f46e5] focus:bg-white transition-all outline-none appearance-none">
                                <option value="">Direct (Admin Controlled)</option>
                                {superadmins.map(sa => <option key={sa.id} value={sa.id}>{sa.name} ({sa.businessName})</option>)}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">System Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input required type="text" value={distForm.password} onChange={e => setDistForm({ ...distForm, password: e.target.value })} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 focus:border-[#4f46e5] focus:bg-white transition-all outline-none font-mono" />
                            </div>
                        </div>

                        <div className="pt-6 sticky bottom-0 bg-white">
                            <button disabled={distAdding} type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] text-[11px] uppercase tracking-[0.25em] shadow-2xl active:scale-95 transition-all disabled:opacity-50">
                                {distAdding ? 'TRANSMITTING OTP...' : 'INITIATE_PROVISIONING'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="p-10 space-y-10 text-center">
                        <div className="flex justify-center gap-3">
                            {[...Array(6)].map((_, i) => (
                                <input
                                    key={i}
                                    type="text"
                                    maxLength="1"
                                    value={distOtp[i] || ''}
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (val) {
                                            const newOtp = distOtp.split('');
                                            newOtp[i] = val;
                                            setDistOtp(newOtp.join(''));
                                            if (e.target.nextSibling) e.target.nextSibling.focus();
                                        }
                                    }}
                                    onKeyDown={e => {
                                        if (e.key === 'Backspace' && !distOtp[i] && e.target.previousSibling) {
                                            e.target.previousSibling.focus();
                                        }
                                    }}
                                    className="w-12 h-16 text-center text-2xl font-black bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#4f46e5] transition-all outline-none shadow-sm"
                                />
                            ))}
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={handleVerifyAndAddDist}
                                disabled={distVerifying || distOtp.length < 6}
                                className="w-full bg-emerald-500 text-white font-black py-5 rounded-[2rem] text-[11px] uppercase tracking-[0.25em] shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {distVerifying ? 'VERIFYING...' : 'FINALIZE_PROVISIONING'}
                            </button>
                            <button
                                onClick={() => setShowDistOTPView(false)}
                                className="text-slate-400 font-black text-[9px] uppercase tracking-widest hover:text-slate-600 transition-colors"
                            >
                                ABORT & RETURN
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );

    const DistributorsTable = () => {
        const pending = (distributors || []).filter(d => d?.status === 'Pending');
        const approved = (distributors || []).filter(d => d?.status === 'Approved');

        return (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* ── PENDING ACCOUNTS ────────────────────────────────────────── */}
                {pending.length > 0 && (
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                        <div className="relative bg-white rounded-[2.5rem] shadow-xl border border-amber-100 overflow-hidden">
                            <div className="p-8 border-b border-amber-50 flex justify-between items-center bg-amber-50/30">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 italic uppercase tracking-tight">
                                        <Building2 size={24} className="text-amber-500" /> Pending_Provisions
                                    </h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Found {pending.length} entities awaiting clearance</p>
                                </div>
                                <span className="px-4 py-2 bg-amber-100 text-amber-700 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-amber-200 shadow-sm animate-pulse">Action Required</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        <tr>
                                            <th className="px-8 py-5">Principal Entity</th>
                                            <th className="px-8 py-5">Corporate_ID</th>
                                            <th className="px-8 py-5">Geo_Tag</th>
                                            <th className="px-8 py-5">Entry_Log</th>
                                            <th className="px-8 py-5 text-right">Authorize</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {pending.map((d, i) => (
                                            <tr key={i} className="hover:bg-amber-50/30 transition-all group/row">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white text-lg font-black shadow-lg shadow-amber-500/20 group-hover/row:scale-110 transition-transform">{d.name.charAt(0)}</div>
                                                        <div>
                                                            <p className="font-black text-slate-800 text-base tracking-tight">{d.name}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-tight">{d.mobile} · {d.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-sm font-black text-slate-600 font-mono bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">{d.businessName}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{d.city}</span>
                                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">{d.state}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-[11px] font-black text-slate-400 font-mono">{new Date(d.createdAt).toLocaleDateString()}</td>
                                                <td className="px-8 py-6">
                                                    <div className="flex justify-end gap-3">
                                                        {approvingIds.has(d.id) ? (
                                                            <span className="flex items-center gap-2 text-amber-600 font-black text-[10px] uppercase animate-pulse">
                                                                <RefreshCcw size={14} className="animate-spin" /> Transmitting...
                                                            </span>
                                                        ) : (
                                                            <>
                                                                <button onClick={() => handleDistApproveClick(d)}
                                                                    className="p-3 bg-white text-amber-500 rounded-xl hover:bg-amber-500 hover:text-white transition-all shadow-md hover:shadow-amber-500/20 border border-amber-100"
                                                                    title="Grant Access"
                                                                ><ShieldCheck size={20} /></button>
                                                                <button onClick={() => { if (window.confirm('Terminate Request?')) { sharedDataService.rejectDistributor(d.id); refreshDists(); } }}
                                                                    className="p-3 bg-white text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-md hover:shadow-rose-500/20 border border-rose-100"
                                                                    title="Deny"
                                                                ><X size={20} /></button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── ACTIVE NETWORK ──────────────────────────────────────────── */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden relative">
                    <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3 italic uppercase tracking-tight">
                                <Building2 size={28} className="text-emerald-500" /> Distributor_Network
                            </h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Authenticated nodes operational across grid</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowAddDistModal(true)}
                                className="bg-slate-900 text-white px-8 py-4 rounded-[1.25rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 flex items-center gap-3 hover:translate-y-[-2px] active:translate-y-[0px] transition-all"
                            >
                                <Plus size={18} /> Provision_New
                            </button>
                            <div className="px-4 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-center min-w-[120px]">
                                <span className="block text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-1">Network_Size</span>
                                <span className="text-xl font-black text-emerald-600 leading-none">{approved.length} ACCOUNTS</span>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                <tr>
                                    <th className="px-10 py-6">Node_Descriptor</th>
                                    <th className="px-10 py-6">Logic_ID</th>
                                    <th className="px-10 py-6">Sub_Nodes</th>
                                    <th className="px-10 py-6">Asset_Liquidity</th>
                                    <th className="px-10 py-6 text-right">System_Ops</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/50">
                                {approved.map((d, i) => (
                                    <tr key={i} className="hover:bg-slate-50/80 transition-all group/row">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className="relative">
                                                    <div className="w-14 h-14 rounded-[1.5rem] bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 flex items-center justify-center text-white text-xl font-black shadow-xl shadow-indigo-500/20 group-hover/row:rotate-6 transition-transform">{d.name.charAt(0)}</div>
                                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center text-white">
                                                        <ShieldCheck size={10} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 text-lg tracking-tighter leading-none">{d.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-tight group-hover/row:text-indigo-500 transition-colors">{d.mobile} · {d.email}</p>
                                                    <div className="mt-2 flex items-center gap-1.5">
                                                        <MapPin size={10} className="text-slate-300" />
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{d.city}, {d.state}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 font-mono font-black text-indigo-600 text-sm tracking-tighter">
                                            <div className="bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100 inline-block">
                                                {d.id}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="inline-flex flex-col">
                                                <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-[10px] font-black px-4 py-2 rounded-xl border border-blue-100 shadow-sm">
                                                    <Users size={14} />
                                                    {(d.assignedRetailers || []).length} ACTIVE_AGENTS
                                                </span>
                                                <button onClick={() => { setAssignTargetDist(d); setShowAssignModal(true); }} className="mt-2 text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em] hover:underline text-left pl-1">Modify_Hierarchy →</button>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-900 text-lg tracking-tighter leading-none">₹ {d.wallet?.balance || '0.00'}</span>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Settled_Dynamics</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center justify-end gap-2.5">
                                                <button
                                                    onClick={() => handleResendCredentials(d)}
                                                    className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                                    title="Resend Credentials (Password + PIN)"
                                                ><Mail size={18} /></button>

                                                <button
                                                    onClick={() => handleLoginAsDistributor(d)}
                                                    className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-3 rounded-xl border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all group/btn"
                                                    title="Simulate Node"
                                                >
                                                    <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">Impersonate</span>
                                                    <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                                </button>

                                                <button
                                                    onClick={() => handleRoleChangeClick(d)}
                                                    className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                    title="Re-Role Entity"
                                                ><TrendingUp size={18} /></button>

                                                <button
                                                    onClick={() => navigate(`/admin/distributor/${d.id}`)}
                                                    className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                    title="Diagnostic Data"
                                                ><Eye size={18} /></button>

                                                <button
                                                    onClick={() => handleReject(d.username)}
                                                    className="p-3 bg-rose-50 text-rose-400 rounded-xl border border-rose-100 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                                    title="Terminate"
                                                ><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {approved.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-10 py-32 text-center">
                                            <div className="flex flex-col items-center gap-6 max-w-sm mx-auto">
                                                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 border-2 border-dashed border-slate-100">
                                                    <Building2 size={48} />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-slate-800 font-black uppercase tracking-[0.3em] text-sm">NO_NETWORK_NODES</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed tracking-widest px-8">The distribution grid is currently offline. Check the <span className="text-amber-500 font-black italic underline cursor-pointer hover:text-amber-600 transition-colors" onClick={() => setActiveSection('Approvals')}>Approvals</span> gateway for inbound requests.</p>
                                                </div>
                                                <button
                                                    onClick={() => { sharedDataService.resetToDefaults(); refreshDists(); }}
                                                    className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] shadow-2xl hover:bg-black hover:translate-y-[-2px] active:translate-y-[0px] transition-all"
                                                >
                                                    RESTORE_DEFAULT_GRID
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    // ── KYC Management Component ──────────────────────────────────────────
    const KYCManager = ({ type }) => {
        const [kycSearch, setKycSearch] = useState('');
        const [viewingDocs, setViewingDocs] = useState(null);
        const [kycRequests, setKycRequests] = useState([]);
        const [loading, setLoading] = useState(true);

        const fetchKycRequests = async () => {
            setLoading(true);
            try {
                const resData = await dataService.getPendingKycs(type);
                if (resData.success) {
                    setKycRequests(resData.kycs || []);
                } else {
                    console.error("Fetch KYC error", resData.message);
                    // Only alert if we're not just getting an empty list
                    if (resData.message) alert("Error fetching KYC: " + resData.message);
                }
            } catch (err) {
                console.error("Fetch KYC error", err);
                alert("Failed to connect to server while fetching KYC.");
            } finally {
                setLoading(false);
            }
        };

        useEffect(() => {
            fetchKycRequests();
        }, [type]);

        const kycUsers = kycRequests.filter(u => {
            const searchStr = (u.fullName || u.loginId || u.userMobile || '').toLowerCase();
            return !kycSearch || searchStr.includes(kycSearch.toLowerCase());
        });

        const handleApproveKyc = async (username, currentMerchantId = null) => {
            let merchantId = null;
            if (type === 'AEPS') {
                merchantId = window.prompt(`Enter Fingpay Merchant ID for ${username}:`, currentMerchantId || '');
                if (merchantId === null) return; 
            } else {
                if (!confirm(`Are you sure you want to approve ${type} KYC for ${username}?`)) return;
            }

            try {
                const res = await dataService.approveKyc(username, type, merchantId);
                if (res.success) {
                    setStatus({ type: 'success', message: `${type} KYC Approved for ${username}` });
                    fetchKycRequests();
                } else {
                    alert(res.message || 'Failed to approve KYC');
                }
            } catch (e) {
                alert('Error approving KYC');
            }
        };

        const handleRejectKyc = async (username) => {
            const reason = window.prompt(`Enter Rejection Reason for ${username}:`, 'Invalid Documents');
            if (reason === null) return;

            try {
                const res = await dataService.rejectKyc(username, type, reason);
                if (res.success) {
                    setStatus({ type: 'success', message: `${type} KYC Rejected for ${username}` });
                    fetchKycRequests();
                } else {
                    alert(res.message || 'Failed to reject KYC');
                }
            } catch (e) {
                alert('Error rejecting KYC');
            }
        };

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-gradient-to-br from-purple-900 to-indigo-950 rounded-3xl p-7 text-white shadow-2xl flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                            <ShieldCheck size={28} className="text-purple-300" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">{type === 'MAIN' ? 'Profile KYC' : 'AEPS KYC'}</h2>
                            <p className="text-purple-300 text-xs font-bold uppercase tracking-widest mt-1">Pending KYC Verification Requests</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-2xl font-black text-white leading-none">{kycUsers.length}</p>
                            <p className="text-[9px] text-purple-400 uppercase tracking-widest mt-1 font-black">Pending Requests</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            value={kycSearch}
                            onChange={e => setKycSearch(e.target.value)}
                            placeholder="Search by name, mobile, username..."
                            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-purple-400 transition-all font-semibold"
                        />
                    </div>
                    <button onClick={fetchKycRequests} className="p-2.5 bg-white border-2 border-slate-200 rounded-xl text-slate-500 hover:text-purple-600 hover:border-purple-200 transition-all">
                        <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    {['User', 'Contact', 'Submission Date', 'Documents', 'Actions'].map(h => (
                                        <th key={h} className="text-left px-5 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {kycUsers.map((u, i) => (
                                    <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-black">
                                                    {(u.fullName || u.loginId || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-800 leading-tight">{u.fullName || u.loginId}</p>
                                                    <p className="text-[9px] text-slate-400 mt-0.5">{u.loginId} {u.shop_name ? `(${u.shop_name})` : ''}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-xs font-semibold text-slate-700">{u.userMobile}</p>
                                            <p className="text-[9px] text-slate-400">{u.userEmail}</p>
                                        </td>
                                        <td className="px-5 py-4 text-xs text-slate-500 font-medium">
                                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <button
                                                onClick={() => setViewingDocs({ ...u, name: u.fullName || u.loginId, username: u.loginId })}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-indigo-100 transition-all"
                                            >
                                                <Eye size={12} /> View Docs
                                            </button>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleApproveKyc(u.loginId, u.merchant_id)}
                                                    className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleRejectKyc(u.loginId)}
                                                    className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {kycUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-200 border-2 border-dashed border-slate-100">
                                                    <ShieldCheck size={32} />
                                                </div>
                                                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">No pending {type} KYC requests</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Doc Viewer Modal */}
                {viewingDocs && (
                    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                                    <FileText size={20} className="text-indigo-500" /> Documents for {viewingDocs.name}
                                </h3>
                                <button onClick={() => setViewingDocs(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-all">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-8 bg-slate-100/50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {[
                                        { label: 'Aadhaar Front', img: viewingDocs.aadhaarFront || viewingDocs.aadhaar_front },
                                        { label: 'Aadhaar Back', img: viewingDocs.aadhaarBack || viewingDocs.aadhaar_back },
                                        { label: 'PAN Card', img: viewingDocs.panNumber || viewingDocs.pan_number_img },
                                        { label: 'Profile/Shop Selfie', img: viewingDocs.shopSelfie || viewingDocs.shop_photo },
                                        { label: 'GST Certificate', img: viewingDocs.gstCertificate },
                                        { label: 'TDS Certificate', img: viewingDocs.tdsCertificate },
                                    ].map((doc, i) => (
                                        <div key={i} className="space-y-3">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{doc.label}</p>
                                            <div className="aspect-[4/3] bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm flex items-center justify-center relative group">
                                                {doc.img ? (
                                                    <img src={doc.img} alt={doc.label} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-center space-y-2 opacity-30">
                                                        <ImageIcon size={48} className="mx-auto" />
                                                        <p className="text-[10px] font-black uppercase">Not Uploaded</p>
                                                    </div>
                                                )}
                                                {doc.img && (
                                                    <a href={doc.img} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="bg-white text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase">Open Full View</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-6 border-t bg-white flex justify-end gap-3">
                                <button onClick={() => { handleRejectKyc(viewingDocs.username); setViewingDocs(null); }} className="px-8 py-3 bg-rose-50 text-rose-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all">Reject KYC</button>
                                <button onClick={() => { handleApproveKyc(viewingDocs.username, viewingDocs.merchant_id); setViewingDocs(null); }} className="px-8 py-3 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 transition-all">Approve KYC</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const [adminViewingDoc, setAdminViewingDoc] = useState(null);


    // ── All Members Table (merged Retailers + Distributors + SuperDistributors) ──
;


    // ── nav metadata ──────────────────────────────────────────────────

    const isEmployee = currentUser && ['NATIONAL_HEADER', 'STATE_HEADER', 'REGIONAL_HEADER'].includes(currentUser.role);
    const isAdminUser = sessionStorage.getItem('admin_auth') === 'true' || currentUser?.role === 'ADMIN';

    // Sections employee is allowed to see
    const EMPLOYEE_ALLOWED_SECTIONS = ['Dashboard', 'EmployeeManager'];

    // Beautiful Unauthorized Access Screen
    const UnauthorizedAccess = ({ sectionName }) => (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center min-h-[70vh] relative overflow-hidden"
        >
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-3xl" />
                <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-2xl" />
            </div>

            <motion.div
                className="relative z-10 text-center max-w-lg mx-auto px-6"
                initial={{ y: 30 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            >
                {/* Shield Icon with pulse */}
                <div className="relative inline-flex mb-8">
                    <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shadow-2xl shadow-rose-500/30">
                        <ShieldCheck size={52} className="text-white" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-black text-sm">!</span>
                    </span>
                    {/* Ping animation */}
                    <div className="absolute inset-0 rounded-[2rem] bg-rose-500/20 animate-ping" style={{ animationDuration: '2s' }} />
                </div>

                {/* Title */}
                <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight mb-2">
                    Unauthorized Access
                </h2>
                <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.2em] mb-1">
                    🔒 {sectionName || 'This Section'}
                </p>
                <div className="w-16 h-1 bg-gradient-to-r from-rose-500 to-amber-500 rounded-full mx-auto my-6" />

                {/* Message Card */}
                <div className="bg-white rounded-2xl border border-rose-100 shadow-xl p-6 mb-6 text-left space-y-3">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                        <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center">
                            <AlertTriangle size={16} className="text-rose-500" />
                        </div>
                        <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Access Restricted</p>
                    </div>
                    <p className="text-sm text-slate-500 font-semibold leading-relaxed">
                        You don't have permission to view <span className="text-rose-600 font-black">{sectionName || 'this section'}</span>.
                        This area is reserved for Administrators only.
                    </p>
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                        <Mail size={14} className="text-amber-600 shrink-0" />
                        <p className="text-xs font-black text-amber-700">Contact your Admin to request access</p>
                    </div>
                </div>

                {/* Role badge */}
                <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 px-4 py-2 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Logged in as: {currentUser?.role?.replace(/_/g, ' ')}
                    </span>
                </div>

                {/* Go back */}
                <div className="mt-6">
                    <button
                        onClick={() => setActiveSection('Dashboard')}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:scale-[1.03] active:scale-95 transition-all"
                    >
                        ← Return to Dashboard
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );

    const ANALYTICS_NAV = [
        { id: 'Overview', icon: LayoutGrid, label: 'Dashboard' },
        { id: 'Dashboard', icon: Activity, label: 'Live Feed' },
        { id: 'ReportsAnalyst', icon: BarChart3, label: 'Analytics' },
    ];

    const OPERATIONS_NAV = [
        { id: 'Approvals', icon: CheckCircle2, label: 'Approvals', badge: 'New' },
        { id: 'Loans', icon: IndianRupee, label: 'Loan Approval' },
        { id: 'Wallet-Overview', icon: Wallet, label: 'Wallet Manager' },
    ];

    const MANAGEMENT_NAV = [
        { id: 'AllMembers', icon: Users, label: 'Members/Plans' },
        { id: 'EmployeeManager', icon: ShieldCheck, label: 'Employee Mgr' },
        { id: 'Landing Content', icon: FileText, label: 'Landing CMS' },
        { id: 'Services', icon: Package, label: 'Services' },
        { id: 'Promotions', icon: Video, label: 'Promotions' },
        { id: 'OurMap', icon: MapPin, label: 'Our Map' },
    ];

    const SYSTEM_NAV = [
        { id: 'Logins', icon: RefreshCcw, label: 'Login Logs' },
        { id: 'Trash', icon: Trash2, label: 'Trash Bin' },
        { id: 'Settings', icon: Settings, label: 'Settings' },
    ];

    const MEMBERS = [
        { name: 'Sandra Perry', role: 'Product Manager', avatar: 'SP' },
        { name: 'Antony Cardenas', role: 'Sales Manager', avatar: 'AC' },
        { name: 'Jamal Connolly', role: 'Sales Manager', avatar: 'JC' },
        { name: 'Cara Carr', role: 'SEO Specialist', avatar: 'CC' },
    ];

    const GROUP_NAV = [
        {
            group: 'Wallet',
            icon: Wallet,
            color: '#10b981',
            children: [
                { id: 'Wallet-Overview', label: 'Overview' },
                { id: 'Wallet-Credit', label: 'Credit Fund' },
                { id: 'Wallet-Debit', label: 'Debit Fund' },
                { id: 'Wallet-Requests', label: 'Fund Requests' },
                { id: 'Wallet-Lock', label: 'Lock Amount' },
                { id: 'Wallet-Release', label: 'Release Lock' },
            ]
        },
        {
            group: 'All Members',
            icon: Users,
            color: '#3b82f6',
            children: [
                { id: 'AllMembers', label: 'All Members' },
                { id: 'Plans-retailer', label: 'Retailer Plans' },
                { id: 'Plans-distributor', label: 'Dist Plans' },
                { id: 'Plans-superdistributor', label: 'SuperDist Plans' },
            ]
        },
        {
            group: 'KYC Management',
            icon: ShieldCheck,
            color: '#8b5cf6',
            children: [
                { id: 'KYC-Profile', label: 'Profile KYC' },
            ]
        },
    ];
    const activeLabel = ANALYTICS_NAV.find(n => n.id === activeSection)?.label
        || OPERATIONS_NAV.find(n => n.id === activeSection)?.label
        || MANAGEMENT_NAV.find(n => n.id === activeSection)?.label
        || SYSTEM_NAV.find(n => n.id === activeSection)?.label
        || GROUP_NAV.flatMap(g => g.children).find(c => c.id === activeSection)?.label
        || activeSection;




    return (
        <div className="h-screen flex relative overflow-hidden bg-[#fcfcf7]" style={{ fontFamily: "'Inter',sans-serif" }}>
            {/* Modals */}
            {showApprovalModal && <ApprovalModal />}
            {showDistApprovalModal && renderDistApprovalModal()}
            {showSAApprovalModal && <SAApprovalModal />}
            {showRoleModal && <ChangeRoleModal />}
            {showAddSAModal && AddSuperAdminModal()}
            {showAddMemberModal && AddMemberModal()}
            {showAssignModal && assignTargetDist && renderAssignRetailersModal()}
            {showCredentialCard && renderCredentialSharerModal()}

            {/* Mobile overlay */}
            <AnimatePresence>
                {showMobileSidebar && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setShowMobileSidebar(false)}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden" />
                )}
            </AnimatePresence>

            {/* ══════════════ SIDEBAR ══════════════ */}
            <aside className={`fixed lg:relative !w-72 bg-white border-r border-[#f1f5f9] flex flex-col h-screen z-50 transition-all duration-300 ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} shrink-0`}>

                {/* Logo area */}
                <div className="flex items-center gap-3 px-8 py-8 shrink-0">
                    <h1 className="text-2xl font-black text-[#18181b] tracking-tighter uppercase italic">RUPIKSHA</h1>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-2 px-6 space-y-8 scrollbar-hide">
                    
                    {/* Analytics Section */}
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em] mb-4 ml-3">Analytics</p>
                        {ANALYTICS_NAV.map(item => {
                            const isActive = activeSection === item.id;
                            return (
                                <button key={item.id}
                                    onClick={() => { setActiveSection(item.id); setShowMobileSidebar(false); }}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all duration-200 ${isActive ? 'bg-[#fcfcf7] border shadow-sm border-[#f1f5f9]' : 'hover:bg-slate-50'}`}>
                                    <div className="flex items-center gap-4">
                                         <item.icon size={18} className={isActive ? 'text-[#18181b]' : 'text-[#94a3b8]'} />
                                         <span className={`text-[14px] font-bold ${isActive ? 'text-[#18181b]' : 'text-[#64748b]'}`}>{item.label}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Operations Section */}
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em] mb-4 ml-3">Operations</p>
                        {OPERATIONS_NAV.map(item => {
                            const isActive = activeSection === item.id;
                            return (
                                <button key={item.id}
                                    onClick={() => { setActiveSection(item.id); setShowMobileSidebar(false); }}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all duration-200 ${isActive ? 'bg-[#fcfcf7] border shadow-sm border-[#f1f5f9]' : 'hover:bg-slate-50'}`}>
                                    <div className="flex items-center gap-4">
                                         <item.icon size={18} className={isActive ? 'text-[#18181b]' : 'text-[#94a3b8]'} />
                                         <span className={`text-[14px] font-bold ${isActive ? 'text-[#18181b]' : 'text-[#64748b]'}`}>{item.label}</span>
                                    </div>
                                    {item.badge && (
                                        <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg text-[10px] font-black border border-emerald-100">{item.badge}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Management Section */}
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em] mb-4 ml-3">Management</p>
                        {MANAGEMENT_NAV.map(item => {
                            const isActive = activeSection === item.id;
                            return (
                                <button key={item.id}
                                    onClick={() => { setActiveSection(item.id); setShowMobileSidebar(false); }}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all duration-200 ${isActive ? 'bg-[#fcfcf7] border shadow-sm border-[#f1f5f9]' : 'hover:bg-slate-50'}`}>
                                    <div className="flex items-center gap-4">
                                         <item.icon size={18} className={isActive ? 'text-[#18181b]' : 'text-[#94a3b8]'} />
                                         <span className={`text-[14px] font-bold ${isActive ? 'text-[#18181b]' : 'text-[#64748b]'}`}>{item.label}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* System Section */}
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em] mb-4 ml-3">System</p>
                        {SYSTEM_NAV.map(item => {
                            const isActive = activeSection === item.id;
                            return (
                                <button key={item.id}
                                    onClick={() => { setActiveSection(item.id); setShowMobileSidebar(false); }}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all duration-200 ${isActive ? 'bg-[#fcfcf7] border shadow-sm border-[#f1f5f9]' : 'hover:bg-slate-50'}`}>
                                    <div className="flex items-center gap-4">
                                         <item.icon size={18} className={isActive ? 'text-[#18181b]' : 'text-[#94a3b8]'} />
                                         <span className={`text-[14px] font-bold ${isActive ? 'text-[#18181b]' : 'text-[#64748b]'}`}>{item.label}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                </nav>

                {/* Bottom Profile / Exit */}
                <div className="px-6 py-8 border-t border-[#f1f5f9]">
                    <div className="flex items-center justify-between px-3">
                        <div className="flex items-center gap-3">
                             <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                                 <User size={20} className="text-slate-400" />
                             </div>
                             <span className="text-sm font-bold text-[#64748b]">{currentUser?.name || 'Admin'}</span>
                        </div>
                        <ArrowLeft size={20} className="text-[#94a3b8] cursor-pointer rotate-180 hover:text-[#18181b] transition-colors" onClick={() => navigate('/dashboard')} title="Back to Portal" />
                    </div>
                </div>
            </aside>

            {/* ══════════════ MAIN ══════════════ */}
            <div className={`flex-1 flex flex-col min-w-0 overflow-hidden bg-[#fcfcf7]`}>

                {/* Top Header Removal (it's inside Overview now) */}
                {activeSection !== 'Overview' && (
                    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/60 px-5 py-3 flex items-center justify-between sticky top-0 z-30 shrink-0">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setShowMobileSidebar(true)}
                                className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-100 lg:hidden transition-all">
                                <LayoutDashboard size={15} className="text-slate-600" />
                            </button>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">Admin</span>
                                <ChevronRight size={11} className="text-slate-300 hidden sm:block" />
                                <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">{activeLabel}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button onClick={handleReset} title="Reset to defaults"
                                className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 transition-all">
                                <RefreshCcw size={14} />
                            </button>
                            <button onClick={handleSave}
                                className="flex items-center gap-1.5 bg-[#6366f1] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide shadow-md hover:scale-105 active:scale-95 transition-all">
                                <Save size={13} /> Save
                            </button>
                            <div className="w-px h-5 bg-slate-200 mx-1 hidden sm:block" />
                            <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 relative transition-all">
                                <Zap size={14} />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                            </button>
                            <div className="w-10 h-10 rounded-xl bg-[#6366f1] flex items-center justify-center text-white text-xs font-black shadow-md">A</div>

                        </div>
                    </header>
                )}

                {/* Page content */}
                <main className={`flex-1 overflow-y-auto ${['Overview', 'ReportsAnalyst'].includes(activeSection) ? '' : 'p-4 md:p-6'}`}>
                    <AnimatePresence>
                        {status && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className={`mb-5 p-4 rounded-2xl flex items-center gap-3 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                                <span className="text-sm font-bold">{status.message}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className={['Overview', 'ReportsAnalyst', 'AllMembers'].includes(activeSection) ? 'w-full space-y-5 px-4 md:px-8' : 'max-w-full lg:max-w-[1800px] mx-auto space-y-5 px-4 md:px-6'}>

                        {/* ── Permission gate for employee users ── */}
                        {isEmployee && !EMPLOYEE_ALLOWED_SECTIONS.includes(activeSection) ? (
                            <UnauthorizedAccess sectionName={activeLabel} />
                        ) : (
                            <>
                                {activeSection === 'Overview' && <Overview data={data} distributors={distributors} superadmins={superadmins} onNavigate={setActiveSection} />}
                                {activeSection === 'Approvals' && <ApprovalsTable 
                                    data={data} 
                                    distributors={distributors} 
                                    superadmins={superadmins} 
                                    refreshData={refreshData} 
                                    refreshDists={refreshDists}
                                    handleApproveClick={handleApproveClick}
                                    handleReject={handleReject}
                                    handleDistApproveClick={handleDistApproveClick}
                                    handleSAApproveClick={handleSAApproveClick}
                                    approvingIds={approvingIds}
                                />}
                                {activeSection === 'Dashboard' && <LiveDashboard data={data} distributors={distributors} superadmins={superadmins} />}
                                {activeSection === 'EmployeeManager' && <EmployeeManager currentUserForEmployee={isEmployee ? currentUser : null} />}
                                {activeSection === 'Landing Content' && <LandingCMS />}
                                {activeSection === 'Trash' && <TrashTable />}
                                {activeSection === 'Services' && ServicesEditor()}
                                {activeSection === 'Promotions' && PromotionsEditor()}
                                {activeSection === 'ReportsAnalyst' && <ReportsAnalyst />}
                                {activeSection === 'Logins' && LoginsTable()}
                                {activeSection === 'Loans' && <LoanApprovalManager />}
                                {activeSection === 'OurMap' && <OurMap />}
                                {activeSection === 'Plans' && <AdminPlanManager defaultType="retailer" />}
                                {activeSection === 'Plans-retailer' && <AdminPlanManager defaultType="retailer" restrictType={true} />}
                                {activeSection === 'Plans-distributor' && <AdminPlanManager defaultType="distributor" restrictType={true} />}
                                {activeSection === 'Plans-superdistributor' && <AdminPlanManager defaultType="superdistributor" restrictType={true} />}

                                {/* Wallet Management */}
                                {activeSection === 'Wallet-Overview' && <WalletManager initialTab="overview" />}
                                {activeSection === 'Wallet-Credit' && <WalletManager initialTab="credit" />}
                                {activeSection === 'Wallet-Debit' && <WalletManager initialTab="debit" />}
                                {activeSection === 'Wallet-Requests' && <WalletManager initialTab="requests" />}
                                {activeSection === 'Wallet-Lock' && <WalletManager initialTab="lock" />}
                                {activeSection === 'Wallet-Release' && <WalletManager initialTab="release" />}

                                {/* All Members — merged Retailers + Distributors + SuperDistributors */}
                                {activeSection === 'AllMembers' && (
                                    <AllMembersTable 
                                        data={data}
                                        distributors={distributors}
                                        superadmins={superadmins}
                                        refreshData={refreshData}
                                        setShowAddMemberModal={setShowAddMemberModal}
                                        setMemberFormData={setMemberFormData}
                                        memberFormData={memberFormData}
                                        handleLoginAsRetailer={handleLoginAsRetailer}
                                        handleLoginAsDistributor={handleLoginAsDistributor}
                                    />
                                )}

                                {/* KYC Management */}
                                {activeSection === 'KYC-Profile' && <KYCManager type="MAIN" />}
                            </>
                        )}
                        {false && activeSection === '__DISABLED_SuperDistributors__' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Network Reach', val: superadmins.length, sub: 'Super Dists', color: '#6366f1', bg: '#eef2ff' },
                                        { label: 'Distributors', val: distributors.length, sub: 'Linked', color: '#f59e0b', bg: '#fffbeb' },
                                        { label: 'Retailers', val: (data.users || []).length, sub: 'Endpoints', color: '#10b981', bg: '#ecfdf5' },
                                        { label: 'System Float', val: `₹${[...superadmins, ...distributors, ...(data.users || [])].reduce((a, c) => a + parseFloat((c.wallet?.balance || '0').replace(/,/g, '')), 0).toLocaleString('en-IN')}`, sub: 'Capital', color: '#334155', bg: '#f8fafc' },
                                    ].map((s, i) => (
                                        <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                                            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
                                                <div className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                                            </div>
                                            <p className="text-xl font-black" style={{ color: s.color }}>{s.val}</p>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
                                            <p className="text-[9px] text-slate-300 mt-0.5">{s.sub}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2"><UserPlus size={15} className="text-indigo-500" /> Provision Super Distributor</h3>
                                    <form onSubmit={handleInviteSA} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {[
                                            { label: 'Full Name', field: 'name', type: 'text' },
                                            { label: 'Mobile', field: 'mobile', type: 'tel' },
                                            { label: 'Email', field: 'email', type: 'email' },
                                            { label: 'City', field: 'city', type: 'text' },
                                        ].map(f => (
                                            <div key={f.field}>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">{f.label}</label>
                                                <input required={f.field !== 'city'} type={f.type}
                                                    value={saInviteForm[f.field] || ''} onChange={e => setSaInviteForm(p => ({ ...p, [f.field]: e.target.value }))}
                                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400 transition-all" />
                                            </div>
                                        ))}
                                        <div className="md:col-span-2 lg:col-span-4 flex justify-end">
                                            <button type="submit" disabled={saInviteLoading}
                                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg disabled:opacity-50 hover:scale-105 transition-all">
                                                {saInviteLoading ? 'Sending...' : '+ Invite & Provision'}
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                        <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide">Super Distributor Network</h3>
                                        <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full">{superadmins.length} accounts</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead><tr className="bg-slate-50 border-b border-slate-100">
                                                {['Name', 'Username', 'Contact', 'Wallet', 'Status', 'Actions'].map(h => (
                                                    <th key={h} className="text-left px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                                ))}
                                            </tr></thead>
                                            <tbody>
                                                {superadmins.map((sa, i) => (
                                                    <tr key={i} className="border-b border-slate-50 hover:bg-indigo-50/30 transition-colors">
                                                        <td className="px-5 py-3.5">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-xs font-black">{sa.name?.charAt(0) || 'S'}</div>
                                                                <div><p className="text-xs font-black text-slate-800">{sa.name}</p><p className="text-[9px] text-slate-400">{sa.city || 'N/A'}</p></div>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3.5 text-xs font-mono text-indigo-600 font-bold">{sa.username || sa.id}</td>
                                                        <td className="px-5 py-3.5"><p className="text-xs font-semibold text-slate-700">{sa.mobile}</p><p className="text-[9px] text-slate-400">{sa.email}</p></td>
                                                        <td className="px-5 py-3.5 text-xs font-black text-emerald-600">₹{sa.wallet?.balance || '0.00'}</td>
                                                        <td className="px-5 py-3.5"><span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${sa.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>{sa.status || 'Pending'}</span></td>
                                                        <td className="px-5 py-3.5"><button onClick={() => handleLoginAdminSA(sa)} className="text-[9px] font-black text-indigo-600 border border-indigo-200 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition-all">Login As</button></td>
                                                    </tr>
                                                ))}
                                                {superadmins.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-slate-400 text-xs font-bold">No Super Distributors yet</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {(!isEmployee || EMPLOYEE_ALLOWED_SECTIONS.includes(activeSection)) && activeSection === 'Settings' && (
                            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-16 text-center border border-white/10 shadow-2xl relative overflow-hidden">
                                <div className="absolute inset-0 pointer-events-none">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
                                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
                                </div>
                                <div className="relative z-10">
                                    <div className="w-20 h-20 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                                        <Settings size={36} className="text-indigo-300" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">System Settings</h3>
                                    <p className="text-indigo-300 text-sm font-bold uppercase tracking-widest mb-6">Advanced configuration module</p>
                                    <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 px-5 py-2.5 rounded-full">
                                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                        <span className="text-amber-300 font-black text-xs uppercase tracking-widest">Coming Soon</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </main>
            </div>

            {/* Success credential overlay */}
            <AnimatePresence>
                {geofenceAlert && (
                    <motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }}
                        className="fixed top-8 right-8 z-[200] w-full max-w-sm bg-rose-600 rounded-3xl shadow-2xl p-1 overflow-hidden">
                        <div className="bg-white/10 backdrop-blur-md p-6 relative">
                            <button onClick={() => setGeofenceAlert(null)} className="absolute top-4 right-4 text-white/60 hover:text-white"><X size={20} /></button>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white animate-pulse">
                                    <AlertTriangle size={28} />
                                </div>
                                <div>
                                    <h4 className="text-white font-black uppercase text-xs tracking-widest">Geofence Violation!</h4>
                                    <p className="text-white/70 text-[10px] uppercase font-bold tracking-tight">External Access Detected</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="bg-black/20 rounded-2xl p-4">
                                    <p className="text-white/60 text-[9px] font-black uppercase tracking-widest mb-1">Retailer Details</p>
                                    <p className="text-white font-black text-sm">{geofenceAlert.username}</p>
                                    <p className="text-white/70 text-[10px]">{geofenceAlert.transactionType} Attempted</p>
                                </div>
                                <div className="bg-rose-700/40 rounded-2xl p-4 border border-white/10">
                                    <p className="text-white/60 text-[9px] font-black uppercase tracking-widest mb-1">Violation Info</p>
                                    <p className="text-white font-black text-sm">{geofenceAlert.distance?.toFixed(2)} km Away</p>
                                    <p className="text-white/70 text-[10px]">Allowed: {geofenceAlert.allowedRange} km</p>
                                </div>
                            </div>
                            <button onClick={() => { setActiveSection('Retailers'); setGeofenceAlert(null); }} className="w-full mt-4 bg-white text-rose-600 font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-rose-50 transition-all">
                                View Retailer & Edit Range
                            </button>
                        </div>
                    </motion.div>
                )}

                {showSuccessView && createdCredentials && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
                            className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-8 pt-8 pb-6 text-center">
                                <div className="w-14 h-14 bg-white/20 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                                    <CheckCircle2 size={26} className="text-white" />
                                </div>
                                <h3 className="text-lg font-black text-white">Account Created!</h3>
                                <p className="text-indigo-200 text-xs mt-1">Credentials sent via email ✅</p>
                            </div>
                            <div className="p-6 space-y-3">
                                {[
                                    { label: 'Username', value: createdCredentials?.loginId, cls: 'font-mono text-slate-800' },
                                    { label: 'Password', value: createdCredentials?.password, cls: 'font-mono text-amber-600' },
                                    { label: 'Portal', value: createdCredentials?.portalType, cls: 'text-blue-600' },
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between items-center text-xs font-black uppercase tracking-wider py-2 border-b border-slate-100 last:border-0">
                                        <span className="text-slate-400">{item.label}</span>
                                        <span className={item.cls}>{item.value}</span>
                                    </div>
                                ))}
                                <button onClick={() => setShowSuccessView(false)}
                                    className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black py-4 rounded-2xl text-[11px] uppercase tracking-[0.25em] shadow-xl hover:scale-[1.02] transition-all">
                                    Continue to Dashboard
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Approval Components (Moved Outside to prevent re-remounting loops) ──────
const ApprovalSection = ({ title, icon: Icon, count, data: items, color, onApprove, onReject, processingIds, typeLabel, isAeps }) => (
    <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 overflow-hidden mb-12 transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
        {/* Modern Header with Glass effect tint */}
        <div className="px-10 py-8 flex justify-between items-center border-b border-slate-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full" style={{ background: color }} />
            <div className="flex items-center gap-6 relative z-10">
                <div className="w-14 h-14 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl transform -rotate-3 hover:rotate-0 transition-transform duration-500" style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}>
                    <Icon size={24} strokeWidth={2.5} />
                </div>
                <div>
                    <h3 className="text-xl font-extrabold text-[#1e1b4b] tracking-tight mb-1">{title}</h3>
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">Verification Queue — Manual Review Required</p>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-end gap-1">
                <span className="px-6 py-2.5 rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-sm ring-1 ring-inset" style={{ 
                    background: `${color}10`, 
                    color: color,
                    ringColor: `${color}20`
                }}>
                    {count} REQUESTS
                </span>
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50/50">
                        <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Profile & Identity</th>
                        <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Contact Channels</th>
                        <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Jurisdiction</th>
                        <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#fcfcf7] transition-all duration-300 group">
                            <td className="px-10 py-6">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 font-extrabold text-lg uppercase group-hover:bg-white group-hover:scale-110 group-hover:shadow-lg transition-all duration-500 border border-transparent group-hover:border-slate-100">
                                            {item.name?.charAt(0) || 'U'}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg bg-white shadow-sm flex items-center justify-center border border-slate-50">
                                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: color }} />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[15px] font-black text-[#1e1b4b] tracking-tight leading-tight mb-0.5">{item.name || 'Unnamed Applicant'}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-500 rounded text-[9px] font-black uppercase tracking-tighter border border-indigo-100/50">
                                                {item.businessName || typeLabel}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium">#{item.id?.toString().slice(-4) || 'QUE-92'}</span>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-10 py-6">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-700 tracking-tight flex items-center gap-2">
                                        <Smartphone size={14} className="text-slate-300" />
                                        {item.mobile}
                                    </p>
                                    <p className="text-[11px] font-medium text-slate-400 flex items-center gap-2">
                                        <Mail size={14} className="text-slate-200" />
                                        {item.email}
                                    </p>
                                </div>
                            </td>
                            <td className="px-10 py-6">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <MapPin size={16} className="text-slate-300" />
                                    <span className="text-xs font-bold uppercase tracking-tight">
                                        {(item.city ? `${item.city}, ` : '') + (item.state || 'Universal')}
                                    </span>
                                </div>
                            </td>
                            <td className="px-10 py-6">
                                <div className="flex justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                                    {isAeps ? (
                                        <>
                                            <button onClick={() => onApprove(item)}
                                                className="h-11 px-6 bg-emerald-500 text-white rounded-[1rem] hover:bg-emerald-600 transition-all text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2">
                                                <CheckCircle2 size={16} strokeWidth={3} /> Approve AEPS
                                            </button>
                                            <button onClick={() => onReject(item)}
                                                className="h-11 w-11 bg-rose-50 text-rose-500 rounded-[1rem] hover:bg-rose-500 hover:text-white transition-all shadow-sm hover:shadow-rose-500/20 active:scale-95 flex items-center justify-center">
                                                <X size={18} strokeWidth={3} />
                                            </button>
                                        </>
                                    ) : processingIds?.has(item.username || item.id) ? (
                                        <div className="h-11 px-6 bg-slate-900 text-white rounded-[1rem] font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl">
                                            <RefreshCcw size={14} className="animate-spin text-emerald-400" /> System_Sync
                                        </div>
                                    ) : (
                                        <>
                                            <button onClick={() => onApprove(item)}
                                                className="h-11 px-8 bg-[#1e1b4b] text-white rounded-[1rem] hover:bg-indigo-600 transition-all text-[11px] font-bold uppercase tracking-[0.15em] shadow-xl shadow-indigo-500/10 active:scale-95 flex items-center gap-2">
                                                <CheckCircle2 size={16} strokeWidth={2.5} /> Confirm
                                            </button>
                                            <button onClick={() => onReject(item.username || item.id)}
                                                className="h-11 w-11 bg-white border border-slate-200 text-slate-400 rounded-[1rem] hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all active:scale-95 flex items-center justify-center group/btn">
                                                <Trash2 size={18} className="group-hover/btn:scale-110 transition-transform" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    {items.length === 0 && (
                        <tr>
                            <td colSpan={4} className="py-24 text-center">
                                <div className="flex flex-col items-center justify-center opacity-20 grayscale">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                        <Icon size={32} />
                                    </div>
                                    <p className="font-black text-slate-400 uppercase tracking-[0.5em] text-[11px]">No Pending {typeLabel}s</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

const ApprovalsTable = ({ 
    data, 
    distributors, 
    superadmins, 
    refreshData, 
    refreshDists, 
    handleApproveClick, 
    handleReject, 
    handleDistApproveClick, 
    handleSAApproveClick, 
    approvingIds 
}) => {
    const [view, setView] = useState('main'); // 'main', 'members', 'retailers', 'distributors', 'superadmins', 'ekyc'
    const [pendingAepsKycs, setPendingAepsKycs] = useState([]);
    
    const pendingUsers = (data.users || []).filter(u => u?.status?.toLowerCase() === 'pending');
    const pendingDists = (distributors || []).filter(d => d?.status?.toLowerCase() === 'pending');
    const pendingSAs = (superadmins || []).filter(s => s?.status?.toLowerCase() === 'pending');

    useEffect(() => {
        const fetchAepsKycs = async () => {
            const res = await dataService.getPendingKycs('AEPS');
            if (res.success) setPendingAepsKycs(res.kycs);
        };
        fetchAepsKycs();
    }, []);

    const handleApproveAeps = async (kyc) => {
        const mId = prompt("Enter Merchant ID for AEPS Approval:", kyc.merchant_id || "");
        if (mId === null) return;
        const res = await dataService.approveKyc(kyc.loginId, 'AEPS', mId);
        if (res.success) {
            alert("AEPS KYC Approved");
            const res2 = await dataService.getPendingKycs('AEPS');
            if (res2.success) setPendingAepsKycs(res2.kycs);
            refreshData();
        } else {
            alert("Failed to approve: " + res.message);
        }
    };

    const handleRejectAeps = async (kyc) => {
        const reason = prompt("Enter rejection reason:");
        if (reason === null) return;
        const res = await dataService.rejectKyc(kyc.loginId, 'AEPS', reason);
        if (res.success) {
            alert("AEPS KYC Rejected");
            const res2 = await dataService.getPendingKycs('AEPS');
            if (res2.success) setPendingAepsKycs(res2.kycs);
            refreshData();
        } else {
            alert("Failed to reject: " + res.message);
        }
    };

    const NavCard = ({ title, count, icon: Icon, color, onClick, desc }) => (
        <div 
            onClick={onClick}
            className="group relative bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-500 cursor-pointer overflow-hidden active:scale-95 flex flex-col items-center text-center max-w-sm mx-auto w-full"
        >
            {/* Background Aesthetic Elements */}
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-700" style={{ background: color, filter: 'blur(60px)' }} />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-700" style={{ background: color, filter: 'blur(60px)' }} />
            
            <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-white mb-10 shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500" style={{ background: color }}>
                    <Icon size={32} strokeWidth={2.5} />
                </div>
                
                <h3 className="text-3xl font-[900] text-[#1e1b4b] mb-3 tracking-tight group-hover:text-indigo-600 transition-colors">{title}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mb-10 leading-relaxed max-w-[220px]">{desc}</p>
                
                <div className="flex flex-col items-center gap-6">
                    <span className="px-8 py-3 rounded-2xl text-[12px] font-black uppercase tracking-[0.15em] shadow-sm ring-1 ring-inset" style={{ 
                        background: `${typeof color === 'string' && color.includes('gradient') ? '#6366f110' : color + '10'}`, 
                        color: typeof color === 'string' && color.includes('gradient') ? '#6366f1' : color,
                        ringColor: typeof color === 'string' && color.includes('gradient') ? '#6366f120' : color + '20'
                    }}>
                        {count} Request{count !== 1 ? 's' : ''} Pending
                    </span>
                    
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#1e1b4b] group-hover:text-white group-hover:translate-y-[-4px] transition-all duration-300">
                        <ArrowRight size={20} />
                    </div>
                </div>
            </div>
        </div>
    );

    const BackButton = () => (
        <button 
            onClick={() => setView(view === 'members' ? 'main' : (['retailers', 'distributors', 'superadmins'].includes(view) ? 'members' : 'main'))}
            className="flex items-center gap-3 px-8 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 mb-14 active:scale-95 mx-auto"
        >
            <ArrowLeft size={16} strokeWidth={2.5} /> Back to {view === 'members' ? 'Selection' : 'Category Menu'}
        </button>
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000 flex flex-col items-center justify-center min-h-[60vh] py-10 px-4">
            {view === 'main' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-5xl justify-items-center">
                    <NavCard 
                        title="Pending Members"
                        desc="Verification of accounts & business profiles"
                        count={pendingUsers.length + pendingDists.length + pendingSAs.length}
                        icon={Users}
                        color="linear-gradient(135deg, #6366f1, #4338ca)"
                        onClick={() => setView('members')}
                    />
                    <NavCard 
                        title="Pending E-KYC"
                        desc="Digital authentication & AEPS onboarding"
                        count={pendingAepsKycs.length}
                        icon={Smartphone}
                        color="linear-gradient(135deg, #ec4899, #be185d)"
                        onClick={() => setView('ekyc')}
                    />
                </div>
            )}

            {view === 'members' && (
                <div className="w-full max-w-7xl">
                    <BackButton />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 justify-items-center">
                        <NavCard 
                            title="Retailers"
                            desc="Agent Level Authorization"
                            count={pendingUsers.length}
                            icon={UserPlus}
                            color="#10b981"
                            onClick={() => setView('retailers')}
                        />
                        <NavCard 
                            title="Distributors"
                            desc="Partner Level Authorization"
                            count={pendingDists.length}
                            icon={Building2}
                            color="#f59e0b"
                            onClick={() => setView('distributors')}
                        />
                        <NavCard 
                            title="Super Admins"
                            desc="Master Level Authorization"
                            count={pendingSAs.length}
                            icon={ShieldCheck}
                            color="#6366f1"
                            onClick={() => setView('superadmins')}
                        />
                    </div>
                </div>
            )}

            {view === 'retailers' && (
                <div className="w-full">
                    <BackButton />
                    <ApprovalSection
                        title="Pending Retailers" icon={CheckCircle2} count={pendingUsers.length} data={pendingUsers}
                        color="#10b981" onApprove={handleApproveClick} onReject={handleReject}
                        processingIds={approvingIds} typeLabel="Retailer" />
                </div>
            )}

            {view === 'distributors' && (
                <div className="w-full">
                    <BackButton />
                    <ApprovalSection
                        title="Pending Distributors" icon={Building2} count={pendingDists.length} data={pendingDists}
                        color="#f59e0b" onApprove={handleDistApproveClick} onReject={(id) => { if (window.confirm('Reject?')) { sharedDataService.rejectDistributor(id); refreshDists(); } }}
                        processingIds={approvingIds} typeLabel="Distributor" />
                </div>
            )}

            {view === 'superadmins' && (
                <div className="w-full">
                    <BackButton />
                    <ApprovalSection
                        title="Pending SuperAdmins" icon={ShieldCheck} count={pendingSAs.length} data={pendingSAs}
                        color="#6366f1" onApprove={handleSAApproveClick} onReject={(id) => { if (window.confirm('Delete?')) { sharedDataService.rejectSuperAdmin(id); refreshData(); } }}
                        processingIds={approvingIds} typeLabel="SuperAdmin" />
                </div>
            )}

            {view === 'ekyc' && (
                <div className="w-full">
                    <BackButton />
                    <ApprovalSection
                        title="Pending AEPS KYC" icon={Smartphone} count={pendingAepsKycs.length} data={pendingAepsKycs}
                        color="#ec4899" onApprove={handleApproveAeps} onReject={handleRejectAeps}
                        processingIds={new Set()} typeLabel="AEPS Merchant" isAeps={true} />
                </div>
            )}
        </div>
    );
};


// ── All Members Table (merged Retailers + Distributors + SuperDistributors) ──
const AllMembersTable = ({ 
    data, 
    distributors, 
    superadmins, 
    refreshData, 
    setShowAddMemberModal, 
    setMemberFormData, 
    memberFormData, 
    handleLoginAsRetailer, 
    handleLoginAsDistributor 
}) => {
    const [memberSearch, setMemberSearch] = useState('');
    const [memberRoleFilter, setMemberRoleFilter] = useState('ALL');

    const allMembers = [
        ...(data.users || []).map(u => ({ ...u, memberType: 'Retailer', typeColor: '#10b981', typeBg: '#ecfdf5' })),
        ...(distributors || []).map(d => ({ ...d, memberType: 'Distributor', typeColor: '#f59e0b', typeBg: '#fffbeb' })),
        ...(superadmins || []).map(s => ({ ...s, memberType: 'Super Dist.', typeColor: '#6366f1', typeBg: '#eef2ff' })),
    ];

    const filtered = allMembers.filter(m => {
        const matchRole = memberRoleFilter === 'ALL' || m.memberType === memberRoleFilter;
        const matchSearch = !memberSearch ||
            m.name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
            m.mobile?.includes(memberSearch) ||
            m.username?.toLowerCase().includes(memberSearch.toLowerCase()) ||
            m.email?.toLowerCase().includes(memberSearch.toLowerCase()) ||
            m.business_name?.toLowerCase().includes(memberSearch.toLowerCase());
        return matchRole && matchSearch;
    });

    const counts = {
        ALL: allMembers.length,
        Retailer: allMembers.filter(m => m.memberType === 'Retailer').length,
        Distributor: allMembers.filter(m => m.memberType === 'Distributor').length,
        'Super Dist.': allMembers.filter(m => m.memberType === 'Super Dist.').length,
    };

    const handleOpenMap = (m) => {
        const address = m.address || m.business_address || m.shop_address || m.business_name || '';
        const lat = m.shop_latitude;
        const lng = m.shop_longitude;
        let url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        if (lat && lng && parseFloat(lat) !== 0) {
            url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        }
        window.open(url, '_blank');
    };

    const handleDelete = async (m) => {
        if (window.confirm(`Are you sure you want to delete ${m.name || m.username}? This action is irreversible.`)) {
            try {
                const res = await dataService.deleteUser(m.username);
                if (res.success) {
                    alert("User deleted successfully!");
                    refreshData();
                } else {
                    alert(res.message || "Failed to delete user.");
                }
            } catch (err) {
                alert("Error: " + err.message);
            }
        }
    };

    return (
        <div className="py-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ fontFamily: "'Outfit', sans-serif" }}>
            
            {/* Top Action Row - Search, Filters & Add Member */}
            <div className="flex flex-col xl:flex-row items-center gap-4">
                {/* Search Component */}
                <div className="relative flex-1 w-full bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden group focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                    <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                        value={memberSearch} 
                        onChange={e => setMemberSearch(e.target.value)}
                        placeholder="Search by name, mobile, shop or UID..."
                        className="w-full pl-16 pr-6 py-5 bg-transparent border-none text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400" 
                    />
                </div>
                
                {/* Filters & Actions */}
                <div className="flex items-center gap-3 w-full xl:w-auto">
                    <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm flex-1 xl:flex-none">
                        {['ALL', 'Retailer', 'Distributor', 'Super Dist.'].map(f => (
                            <button 
                                key={f} 
                                onClick={() => setMemberRoleFilter(f)}
                                className={`flex-1 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                                    ${memberRoleFilter === f 
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => {
                            setMemberFormData({ ...memberFormData, role: 'RETAILER' });
                            setShowAddMemberModal(true);
                        }}
                        className="bg-slate-900 hover:bg-indigo-600 text-white h-[60px] px-8 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-3 shrink-0">
                        <Plus size={18} /> <span className="hidden sm:inline">Add Member</span>
                    </button>
                </div>
            </div>

            {/* Summary Statistics Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_25px_rgb(0,0,0,0.02)] flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex flex-wrap items-center gap-6 lg:gap-10">
                    {[
                        { label: 'Total Members', val: counts.ALL, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                        { label: 'Retailers', val: counts.Retailer, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Distributors', val: counts.Distributor, color: 'text-amber-600', bg: 'bg-amber-50' },
                        { label: 'Super Dist.', val: counts['Super Dist.'], color: 'text-violet-600', bg: 'bg-violet-50' },
                    ].map((s, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center text-sm font-black ${s.color}`}>
                                {s.val}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col items-end pr-4 border-l border-slate-50 pl-8">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Network Balance</p>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                        ₹{allMembers.reduce((acc, m) => acc + parseFloat((m.wallet?.balance || m.balance || '0').toString().replace(/,/g, '')), 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </h2>
                </div>
            </div>

            {/* Members List Header Label Row */}
            <div className="hidden lg:flex items-center gap-6 px-8 py-4 bg-slate-50/50 rounded-2xl border border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <div className="min-w-[240px]">User Name</div>
                <div className="w-[140px]">User Contact</div>
                <div className="flex-1">User Address</div>
                <div className="w-[180px]">User Shop Name</div>
                <div className="w-[160px] text-right">Available Balance</div>
                <div className="w-[120px] text-right">Actions</div>
            </div>

            {/* Members List - Premium Item View */}
            <div className="grid gap-3">
                {filtered.length > 0 ? (
                    filtered.map((m) => (
                        <motion.div
                            key={m.id || m.username}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2rem] border border-slate-100 py-8 px-6 shadow-sm hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all flex flex-col lg:flex-row lg:items-center gap-8 group"
                        >
                            {/* User Name & Info */}
                            <div className="flex items-center gap-4 min-w-[240px] shrink-0">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-black shadow-inner shrink-0"
                                    style={{ background: `linear-gradient(135deg, ${m.typeColor}, ${m.typeColor}dd)` }}>
                                    {(m.name || m.username || 'M').charAt(0).toUpperCase()}
                                </div>
                                <div className="truncate">
                                    <h3 className="text-sm font-black text-slate-800 tracking-tight truncate">{m.name || m.username}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter bg-slate-50 px-1.5 py-0.5 rounded">@{m.username}</span>
                                        <span className="text-[9px] font-black uppercase" style={{ color: m.typeColor }}>{m.memberType}</span>
                                    </div>
                                </div>
                            </div>

                            {/* User Contact */}
                            <div className="w-[140px] shrink-0 lg:border-l lg:border-slate-50 lg:pl-4">
                                <p className="text-[11px] font-bold text-slate-600 flex items-center gap-2">
                                    <Smartphone size={12} className="text-slate-300" />
                                    {m.mobile || '—'}
                                </p>
                            </div>

                            {/* User Address */}
                            <div className="flex-1 min-w-0 lg:border-l lg:border-slate-50 lg:pl-4">
                                <p className="text-[11px] font-bold text-slate-500 truncate italic">
                                    {m.address || m.business_address || m.shop_address || 'No Address Provided'}
                                </p>
                            </div>

                            {/* User Shop Name */}
                            <div className="w-[180px] shrink-0 lg:border-l lg:border-slate-50 lg:pl-4">
                                <p className="text-[11px] font-black text-slate-600 truncate flex items-center gap-2">
                                    <Home size={12} className="text-slate-300" />
                                    {m.business_name || m.businessName || '—'}
                                </p>
                            </div>

                            {/* Available Balance */}
                            <div className="w-[160px] shrink-0 text-right lg:border-l lg:border-slate-50 lg:pl-4">
                                <p className="text-lg font-black text-slate-900 tracking-tight">
                                    ₹{parseFloat((m.wallet?.balance || m.balance || '0').toString().replace(/,/g, '')).toLocaleString('en-IN')}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-2 w-[120px] shrink-0 ml-auto xl:ml-0">
                                <button onClick={() => handleOpenMap(m)} className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-xl transition-all" title="View Map">
                                    <MapPin size={18} />
                                </button>
                                {m.memberType !== 'Super Dist.' && (
                                    <button onClick={() => (m.memberType === 'Retailer' ? handleLoginAsRetailer(m) : handleLoginAsDistributor(m))} 
                                        className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-indigo-600 text-slate-400 hover:text-white rounded-xl transition-all" title="Login as Member">
                                        <Zap size={18} />
                                    </button>
                                )}
                                <button onClick={() => handleDelete(m)} className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-rose-500 text-slate-400 hover:text-white rounded-xl transition-all" title="Delete">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="bg-white rounded-[2rem] p-20 text-center border-2 border-dashed border-slate-100">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <Search size={32} />
                        </div>
                        <h3 className="text-xl font-black text-slate-800">No members found</h3>
                        <p className="text-slate-400 mt-2 font-medium">Try adjusting your search or filters to find what you're looking for.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;

