import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Eye, EyeOff, RefreshCcw, Smartphone, Mail, User,
    Building2, MapPin, ChevronDown, ArrowRight, ArrowLeft,
    CheckCircle2, Clock, Lock, Globe, Users
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { dataService, BACKEND_URL } from '../../services/dataService';

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
    "West Bengal", "Delhi", "Chandigarh", "Jammu and Kashmir", "Ladakh",
    "Andaman and Nicobar Islands", "Lakshadweep", "Puducherry"
];

const SuperAdminLogin = () => {
    const { login, setUser, setIsLocked } = useAuth();
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot' | 'success' | 'otp'

    // ── Login state ──
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loginMethod, setLoginMethod] = useState('password'); // 'password' | 'otp'
    const [enteredOtp, setEnteredOtp] = useState('');
    const [tempUser, setTempUser] = useState(null);

    // ── Register state ──
    const [registerForm, setRegisterForm] = useState({
        name: '', mobile: '', email: '', dob: '', businessName: '', state: '', 
        city: '', pincode: '', address: '',
        role: 'SUPER_DISTRIBUTOR',
        lang: language === 'en' ? 'English' : 'Hindi', agreement: false
    });

    // ── Forgot Password state ──
    const [forgotForm, setForgotForm] = useState({ mobile: '', dob: '' });


    // ── Handle Login Actions ──
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        setIsLoading(true);

        try {
            if (loginMethod === 'otp' && mode === 'login') {
                // Request OTP
                const res = await fetch(`${BACKEND_URL}/request-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mobile: loginForm.username })
                });
                const data = await res.json();
                if (data.success) {
                    setTempUser(data.user);
                    setMode('otp');
                } else {
                    setLoginError(data.message || 'OTP request failed');
                }
            } else if (mode === 'otp') {
                // Verify OTP
                const res = await fetch(`${BACKEND_URL}/verify-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mobile: tempUser.mobile, otp: enteredOtp })
                });
                const data = await res.json();
                if (data.success) {
                    localStorage.setItem('rupiksha_user', JSON.stringify(data.user));
                    localStorage.setItem('rupiksha_token', data.token);
                    setUser(data.user);
                    setIsLocked(false);

                    const role = data.user.role;
                    if (role === 'RETAILER') navigate('/dashboard');
                    else if (role === 'DISTRIBUTOR') navigate('/distributor');
                    else if (['ADMIN', 'NATIONAL_HEADER', 'STATE_HEADER', 'REGIONAL_HEADER', 'EMPLOYEE'].includes(role)) navigate('/admin');
                    else navigate('/superadmin');
                } else {
                    setLoginError(data.message || 'Invalid OTP');
                }
            } else {
                // Password Login via AuthContext
                // Triggers the safety PIN flow for SuperAdmins
                const result = await login(loginForm.username, loginForm.password);
                if (result.success) {
                    const userStr = localStorage.getItem('rupiksha_user');
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        const role = user.role;
                        if (role === 'RETAILER') navigate('/dashboard');
                        else if (role === 'DISTRIBUTOR') navigate('/distributor');
                        else if (['ADMIN', 'NATIONAL_HEADER', 'STATE_HEADER', 'REGIONAL_HEADER', 'EMPLOYEE'].includes(role)) navigate('/admin');
                        else navigate('/superadmin');
                    }
                } else {
                    setLoginError(result.message || 'Invalid credentials or system access denied.');
                }
            }
        } catch (err) {
            setLoginError('Server connection failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoginError('');
        if (!registerForm.agreement) {
            setLoginError('Please accept the terms');
            return;
        }
        setIsLoading(true);

        try {
            const data = await dataService.requestRegistration({ ...registerForm });
            if (data.success) {
                setTempUser({ ...registerForm, id: data.registrationId });
                setMode('success');
            } else {
                setLoginError(data.message || 'Registration failed');
            }
        } catch (err) {
            setLoginError('Server Connection Failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgot = async (e) => {
        e.preventDefault();
        setLoginError('');
        setIsLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(forgotForm)
            });
            const data = await res.json();
            if (data.success) {
                alert(`Recovery initiated. Check your system mobile/email.`);
                setMode('login');
            } else {
                setLoginError(data.message || 'Recovery request failed');
            }
        } catch (err) {
            setLoginError('Request failed.');
        } finally {
            setIsLoading(false);
        }
    };

    if (mode === 'success') {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 py-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                    className="w-20 h-20 bg-emerald-50 border-4 border-emerald-200 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={40} className="text-emerald-500" />
                </motion.div>
                <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">System Request Submitted!</h3>
                    <p className="text-xs font-bold text-slate-500 leading-relaxed">
                        Aapki super distributor application review ke liye bhej di gayi hai.<br />
                        Verification ke baad aapko credentials mil jayenge.
                    </p>
                </div>
                <div className="flex items-center justify-center gap-2 bg-indigo-50 border border-indigo-200 rounded-2xl px-5 py-3">
                    <Clock size={16} className="text-indigo-500" />
                    <span className="text-xs font-black text-indigo-700 uppercase tracking-widest">Awaiting System Approval</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-1.5">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Technical Details</p>
                    <p className="text-xs font-bold text-slate-700">Name: {tempUser?.name}</p>
                    <p className="text-xs font-bold text-slate-700">Mobile: {tempUser?.mobile}</p>
                    <p className="text-xs font-bold text-slate-700">Entity: {tempUser?.businessName}</p>
                    <p className="text-xs font-bold text-slate-700">Permission: {tempUser?.role}</p>
                </div>
                <button onClick={() => { setMode('login'); }}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-800 text-white font-black py-3 rounded-xl text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                    <ArrowLeft size={14} /> Back to Login
                </button>
            </motion.div>
        );
    }

    if (mode === 'otp') {
        return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Lock size={24} className="text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{t('otp_sent')}</h3>
                    <p className="text-xs font-bold text-slate-500 tracking-widest">{tempUser?.mobile}</p>
                </div>

                {loginError && <div className="bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold px-3 py-2 rounded-xl text-center">{loginError}</div>}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="6-Digit Secure OTP"
                            className="w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-indigo-500 outline-none text-xl font-black tracking-[0.5em] text-center"
                            value={enteredOtp}
                            onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            required
                        />
                    </div>
                    <button type="submit" disabled={isLoading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-800 text-white font-black py-4 rounded-2xl text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">
                        {isLoading ? 'Decrypting Access...' : 'Authenticate Access'}
                    </button>
                    <button type="button" onClick={() => setMode('login')} className="w-full text-center text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest">
                        ← Restart Authentication
                    </button>
                </form>
            </motion.div>
        );
    }

    if (mode === 'register') {
        return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="text-center mb-2">
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Super Dist. Enrollment</h3>
                </div>

                {loginError && <div className="bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold px-3 py-2 rounded-xl">{loginError}</div>}

                <form onSubmit={handleRegister} className="space-y-3.5">
                    <div className="relative">
                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder={t('name_label')} value={registerForm.name}
                            onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })} required
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-indigo-500 outline-none text-sm font-medium text-slate-900" />
                    </div>
                    <div className="relative">
                        <Smartphone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="tel" placeholder={t('mobile_label')} value={registerForm.mobile}
                            onChange={e => setRegisterForm({ ...registerForm, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })} required
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-indigo-500 outline-none text-sm font-medium text-slate-900" />
                    </div>
                    <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="email" placeholder={t('email_label')} value={registerForm.email}
                            onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })} required
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-indigo-500 outline-none text-sm font-medium text-slate-900" />
                    </div>
                    <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Date of Birth (DD/MM/YYYY)" value={registerForm.dob}
                            onChange={e => setRegisterForm({ ...registerForm, dob: e.target.value })} required
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-indigo-500 outline-none text-sm font-medium text-slate-900" />
                    </div>

                    <div className="relative">
                        <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Organization / Master Agency Name" value={registerForm.businessName}
                            onChange={e => setRegisterForm({ ...registerForm, businessName: e.target.value })} required
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-indigo-500 outline-none text-sm font-medium text-slate-900" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" placeholder="City" value={registerForm.city}
                                onChange={e => setRegisterForm({ ...registerForm, city: e.target.value })} required
                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-indigo-500 outline-none text-sm font-medium text-slate-900" />
                        </div>
                        <div className="relative">
                            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" placeholder="Pincode" value={registerForm.pincode}
                                onChange={e => setRegisterForm({ ...registerForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} required
                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-indigo-500 outline-none text-sm font-medium text-slate-900" />
                        </div>
                    </div>

                    <div className="relative">
                        <MapPin size={16} className="absolute left-3 top-3 text-slate-400" />
                        <textarea placeholder="Full Address" value={registerForm.address}
                            onChange={e => setRegisterForm({ ...registerForm, address: e.target.value })} required
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-indigo-500 outline-none text-sm font-medium text-slate-900 min-h-[60px] resize-none"></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                            <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select value={registerForm.role} onChange={e => setRegisterForm({ ...registerForm, role: e.target.value })} required
                                className="w-full pl-10 pr-8 py-3 bg-white border border-slate-300 rounded-xl focus:border-indigo-500 outline-none text-[11px] font-black uppercase appearance-none text-slate-900">
                                <option value="SUPER_DISTRIBUTOR">Super Dist.</option>
                                <option value="DISTRIBUTOR">Distributor</option>
                                <option value="RETAILER">Retailer</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                        <div className="relative">
                            <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select value={registerForm.state} onChange={e => setRegisterForm({ ...registerForm, state: e.target.value })} required
                                className="w-full pl-10 pr-8 py-3 bg-white border border-slate-300 rounded-xl focus:border-indigo-500 outline-none text-[11px] font-black uppercase appearance-none text-slate-900">
                                <option value="">State</option>
                                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>


                    <label className="flex items-start gap-3 cursor-pointer mt-1">
                        <input type="checkbox" checked={registerForm.agreement} onChange={e => setRegisterForm({ ...registerForm, agreement: e.target.checked })} required
                            className="w-4 h-4 mt-0.5 rounded border-slate-300 text-indigo-600" />
                        <span className="text-[9px] font-bold text-slate-500 uppercase leading-tight">Master Agreement & Communication Consent</span>
                    </label>

                    <button type="submit" disabled={isLoading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-800 text-white font-black py-3 rounded-xl text-[11px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60">
                        {isLoading ? 'Verifying Node...' : 'Request Master Node'}
                    </button>
                    <button type="button" onClick={() => setMode('login')} className="w-full text-center text-[10px] font-black text-slate-500 uppercase tracking-wider">
                        ← Return to Authentication
                    </button>
                </form>
            </motion.div>
        );
    }

    if (mode === 'forgot') {
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="text-center">
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Access Recovery</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">Verify identity to restore node access</p>
                </div>
                {loginError && <div className="bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold px-3 py-2 rounded-xl">{loginError}</div>}
                <form onSubmit={handleForgot} className="space-y-4">
                    <div className="relative">
                        <Smartphone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="tel" placeholder="Master Mobile Number" value={forgotForm.mobile}
                            onChange={e => setForgotForm({ ...forgotForm, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })} required
                            className="w-full pl-10 pr-4 py-3.5 bg-white border border-slate-300 rounded-xl focus:border-indigo-500 outline-none text-sm font-medium text-slate-900" />
                    </div>
                    <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="System DOB (DD/MM/YYYY)" value={forgotForm.dob}
                            onChange={e => setForgotForm({ ...forgotForm, dob: e.target.value })} required
                            className="w-full pl-10 pr-4 py-3.5 bg-white border border-slate-300 rounded-xl focus:border-indigo-500 outline-none text-sm font-medium text-slate-900" />
                    </div>
                    <button type="submit" disabled={isLoading}
                        className="w-full bg-slate-900 text-white font-black py-4 rounded-xl text-[11px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                        {isLoading ? 'Decrypting Recovery...' : 'Initiate Recovery'}
                    </button>
                    <button type="button" onClick={() => setMode('login')} className="w-full text-center text-[10px] font-black text-slate-400 hover:text-slate-800 uppercase tracking-wider">
                        ← Back to Authentication
                    </button>
                </form>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                <button onClick={() => setLoginMethod('password')}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${loginMethod === 'password' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500'}`}>
                    Password
                </button>
                <button onClick={() => setLoginMethod('otp')}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${loginMethod === 'otp' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500'}`}>
                    Secure OTP
                </button>
            </div>

            {loginError && <div className="bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold px-4 py-3 rounded-2xl text-center">{loginError}</div>}

            <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative group">
                    <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-slate-400 border-r border-slate-200 bg-slate-50/50 rounded-l-2xl group-focus-within:text-indigo-600 group-focus-within:bg-indigo-50 transition-colors">
                        <Smartphone size={18} />
                    </div>
                    <input type="text" placeholder="Mobile / System ID"
                        value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} required
                        className="w-full pl-14 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none text-sm font-bold text-slate-900 transition-all" />
                </div>

                {loginMethod === 'password' && (
                    <>
                        <div className="relative group">
                            <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-slate-400 border-r border-slate-200 bg-slate-50/50 rounded-l-2xl group-focus-within:text-indigo-600 group-focus-within:bg-indigo-50 transition-colors">
                                <Lock size={18} />
                            </div>
                            <input type={showPassword ? 'text' : 'password'} placeholder="System Password"
                                value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} required
                                className="w-full pl-14 pr-12 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none text-sm font-bold text-slate-900 transition-all" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center text-slate-400 hover:text-indigo-600">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </>
                )}

                <button type="submit" disabled={isLoading}
                    className="w-full bg-gradient-to-r from-[#312e81] to-[#4338ca] hover:shadow-indigo-500/25 text-white font-black py-4 rounded-2xl text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-60">
                    {isLoading ? <><span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> Authenticating...</> : <>Enter Master Portal <ArrowRight size={16} /></>}
                </button>

                <div className="flex items-center gap-4 py-2">
                    <div className="flex-1 h-px bg-slate-100" />
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Master Enrollment</span>
                    <div className="flex-1 h-px bg-slate-100" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setMode('register')}
                        className="border-2 border-indigo-100 hover:bg-indigo-50 text-indigo-600 font-black py-3 rounded-xl text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                        <Users size={14} /> Request Access
                    </button>
                    <button type="button" onClick={() => setMode('forgot')}
                        className="bg-slate-50 text-slate-500 font-black py-3 rounded-xl text-[10px] uppercase tracking-widest transition-all hover:bg-slate-100">
                        Forgot?
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SuperAdminLogin;
