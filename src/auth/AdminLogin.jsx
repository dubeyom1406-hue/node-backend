import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Eye, EyeOff, RefreshCcw, ArrowRight, ShieldCheck,
    Lock, User, Mail, KeyRound, CheckCircle2, AlertCircle, Loader2, ChevronLeft, Check, Palette
} from 'lucide-react';

import logo from '../assets/rupiksha_logo.png';
import { dataService, BACKEND_URL } from '../services/dataService';
import { useAuth } from '../context/AuthContext';

/* ── Config ────────────────────────────────── */
const ADMIN_CREDENTIALS = { username: 'admin', password: 'Admin@123' };
const OTP_EMAIL = 'dubeyom1406@gmail.com';

const TABS = ['Password', 'OTP Login', 'Employee'];
const OTP_LENGTH = 6;
const OTP_EXPIRY = 120; // seconds

/* ══════════════════════════════════════════════════════════════ */
const AdminLogin = () => {
    const navigate = useNavigate();

    const [tab, setTab] = useState(0);

    /* password tab */
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [captcha, setCaptcha] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [pwError, setPwError] = useState('');
    const [pwLoading, setPwLoading] = useState(false);

    /* otp tab */
    const [otpEmail, setOtpEmail] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpValues, setOtpValues] = useState(Array(OTP_LENGTH).fill(''));
    const [timer, setTimer] = useState(0);
    const [otpError, setOtpError] = useState('');
    const [otpInfo, setOtpInfo] = useState('');
    const [sendLoading, setSendLoading] = useState(false);
    const [verifyLoading, setVerifyLoading] = useState(false);
    const otpRefs = useRef([]);
    const timerRef = useRef(null);

    /* employee tab */
    const [empUsername, setEmpUsername] = useState('');
    const [empPassword, setEmpPassword] = useState('');
    const [empShowPw, setEmpShowPw] = useState(false);
    const [empError, setEmpError] = useState('');
    const [empLoading, setEmpLoading] = useState(false);
    const [empLoginMode, setEmpLoginMode] = useState('password'); // 'password' or 'otp'
    const [empOtpSent, setEmpOtpSent] = useState(false);
    const [empOtpValues, setEmpOtpValues] = useState(Array(OTP_LENGTH).fill(''));
    const [empGeneratedOtp, setEmpGeneratedOtp] = useState('');
    const [empTimer, setEmpTimer] = useState(0);
    const empOtpRefs = useRef([]);
    const empTimerRef = useRef(null);
    const { login, setUser, setIsLocked } = useAuth();
    const [brandColor, setBrandColor] = useState(localStorage.getItem('rupiksha_brand_color') || '#064e3b');

    useEffect(() => {
        document.documentElement.style.setProperty('--brand-color', brandColor);
        localStorage.setItem('rupiksha_brand_color', brandColor);
    }, [brandColor]);

    /* captcha */
    const genCaptcha = () => {
        const c = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let r = '';
        for (let i = 0; i < 4; i++) { r += c[Math.floor(Math.random() * c.length)]; if (i === 1) r += ' '; }
        setCaptcha(r);
    };
    useEffect(() => { genCaptcha(); }, []);

    /* countdown */
    useEffect(() => {
        clearInterval(timerRef.current);
        if (timer <= 0) return;
        timerRef.current = setInterval(() => setTimer(t => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; }), 1000);
        return () => clearInterval(timerRef.current);
    }, [timer]);

    const handlePasswordLogin = async (e) => {
        e.preventDefault(); setPwError('');
        const raw = captcha.replace(/\s/g, '');
        if (captchaInput.replace(/\s/g, '').toLowerCase() !== raw.toLowerCase()) {
            setPwError('Incorrect captcha. Please try again.'); genCaptcha(); setCaptchaInput(''); return;
        }
        setPwLoading(true);
        // Fallback or override logic for specific admin credentials
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            const adminUser = { username: 'admin', name: 'Super Admin', role: 'ADMIN', balance: '125000' };
            localStorage.setItem('rupiksha_user', JSON.stringify(adminUser));
            localStorage.setItem('rupiksha_token', 'ADMIN_BYPASS_' + Date.now());
            setUser(adminUser);
            sessionStorage.setItem('admin_auth', 'true');
            setIsLocked(false);
            navigate('/admin');
            setPwLoading(false);
            return;
        }
        try {
            const res = await fetch(`${BACKEND_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role: 'ADMIN' })
            });
            // Safe JSON parse — read text first, then parse
            let data;
            try {
                const text = await res.text();
                data = (text && text.trim().startsWith('{')) ? JSON.parse(text) : null;
            } catch { data = null; }
            // If we couldn't parse JSON at all, backend is likely down (Vite proxy returns HTML)
            if (!data) {
                setPwError('Backend server is not running. Please start the Java backend on port 5001.');
                genCaptcha(); setCaptchaInput('');
                setPwLoading(false);
                return;
            }
            if (data.success) {
                localStorage.setItem('rupiksha_user', JSON.stringify(data.user));
                localStorage.setItem('rupiksha_token', data.token);
                setUser(data.user);
                sessionStorage.setItem('admin_auth', 'true');
                setIsLocked(false);
                navigate('/admin');
            } else {
                setPwError(data.message || data.error || 'Invalid credentials.');
                genCaptcha(); setCaptchaInput('');
            }
        } catch (err) {
            setPwError('Backend server is not running. Please start the Java backend on port 5001.');
        } finally {
            setPwLoading(false);
        }
    };

    /* ── Send OTP (calls Java backend) ── */
    const handleSendOTP = async (e) => {
        e.preventDefault(); setOtpError(''); setOtpInfo('');
        if (otpEmail.trim().toLowerCase() !== OTP_EMAIL) {
            setOtpError('This email is not registered for OTP login.'); return;
        }
        setSendLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/send-admin-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: otpEmail.trim().toLowerCase() }),
            });
            let data;
            try { const t = await res.text(); data = (t && t.trim().startsWith('{')) ? JSON.parse(t) : null; }
            catch { data = null; }
            if (!data) { setOtpError('Backend server is not running. Please start the Java backend on port 5001.'); setSendLoading(false); return; }
            if (!res.ok) { setOtpError(data.error || 'Failed to send OTP.'); setSendLoading(false); return; }
            setOtpInfo(`OTP sent to ${OTP_EMAIL}. Check your inbox.`);
            setOtpSent(true);
            setOtpValues(Array(OTP_LENGTH).fill(''));
            setTimer(OTP_EXPIRY);
            setTimeout(() => otpRefs.current[0]?.focus(), 120);
        } catch (err) {
            setOtpError('Backend server is not running. Please start the Java backend on port 5001.');
        }
        setSendLoading(false);
    };

    /* ── OTP box handlers ── */
    const handleOtpKey = (val, idx) => {
        if (!/^\d?$/.test(val)) return;
        const nxt = [...otpValues]; nxt[idx] = val; setOtpValues(nxt);
        if (val && idx < OTP_LENGTH - 1) otpRefs.current[idx + 1]?.focus();
    };
    const handleOtpBack = (e, idx) => {
        if (e.key === 'Backspace' && !otpValues[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
    };

    /* ── Verify OTP (calls Java backend) ── */
    const handleVerifyOTP = async (e) => {
        e.preventDefault(); setOtpError('');
        if (timer <= 0) { setOtpError('OTP expired. Please resend.'); return; }
        const entered = otpValues.join('');
        if (entered.length < OTP_LENGTH) { setOtpError('Please enter the complete 6-digit OTP.'); return; }
        setVerifyLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/verify-admin-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: OTP_EMAIL, otp: entered }),
            });
            let data;
            try { const t = await res.text(); data = (t && t.trim().startsWith('{')) ? JSON.parse(t) : null; }
            catch { data = null; }
            if (!data) { setOtpError('Backend server is not running. Please start the Java backend on port 5001.'); setVerifyLoading(false); return; }
            if (!res.ok) { setOtpError(data.error || 'Verification failed.'); setVerifyLoading(false); return; }
            // OTP verified — build admin user session (backend may not return user/token for OTP flow)
            const adminUser = data.user || { username: OTP_EMAIL, name: 'Super Admin', role: 'SUPERADMIN' };
            localStorage.setItem('rupiksha_user', JSON.stringify(adminUser));
            localStorage.setItem('rupiksha_token', data.token || 'OTP_AUTH_' + Date.now());
            setUser(adminUser);
            sessionStorage.setItem('admin_auth', 'true');
            setIsLocked(false);
            navigate('/admin');
        } catch (err) {
            setOtpError('Backend server is not running. Please start the Java backend on port 5001.');
            setVerifyLoading(false);
        }
    };

    const resendOTP = () => { setOtpSent(false); setOtpError(''); setOtpInfo(''); setOtpValues(Array(OTP_LENGTH).fill('')); setTimer(0); };
    const timerFmt = `${String(Math.floor(timer / 60)).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')}`;

    /* ── Employee Login ── */
    const handleEmployeeLogin = async (e) => {
        e.preventDefault();
        setEmpError('');
        setEmpLoading(true);

        try {
            const res = await login(empUsername, empPassword);
            if (res.success) {
                const savedUserStr = localStorage.getItem('rupiksha_user');
                if (savedUserStr) {
                    const savedUser = JSON.parse(savedUserStr);
                    if (['NATIONAL_HEADER', 'STATE_HEADER', 'REGIONAL_HEADER', 'EMPLOYEE'].includes(savedUser.role)) {
                        navigate('/admin');
                    } else {
                        setEmpError("Access denied. Authorized personnel only.");
                        localStorage.removeItem('rupiksha_token');
                        localStorage.removeItem('rupiksha_user');
                    }
                } else {
                    setEmpError("Error establishing secure session.");
                }
            } else {
                setEmpError(res.message || "Invalid Employee Credentials.");
            }
        } catch (err) {
            setEmpError("Connection failed to Employee Database.");
        } finally {
            setEmpLoading(false);
        }
    };

    const handleSendEmployeeOTP = async (e) => {
        e.preventDefault();
        setEmpError('');
        setEmpLoading(true);
        try {
            const allUsers = await dataService.getAllUsers();
            const user = allUsers.find(u => u.username === empUsername || u.mobile === empUsername);
            if (!user) {
                setEmpError('Employee ID not found.');
                setEmpLoading(false);
                return;
            }
            if (!user.email) {
                setEmpError('No email registered for this employee.');
                setEmpLoading(false);
                return;
            }
            const res = await dataService.sendEmployeeLoginOTP(user.email, user.name);
            if (res.success) {
                setEmpGeneratedOtp(res.otp);
                setEmpOtpSent(true);
                setEmpTimer(OTP_EXPIRY);
                setEmpOtpValues(Array(OTP_LENGTH).fill(''));
                setTimeout(() => empOtpRefs.current[0]?.focus(), 120);
            } else {
                setEmpError(res.message || 'Failed to send OTP.');
            }
        } catch (err) {
            setEmpError('Failed to initiate OTP login.');
        }
        setEmpLoading(false);
    };

    const handleVerifyEmployeeOTP = async (e) => {
        e.preventDefault();
        setEmpError('');
        const entered = empOtpValues.join('');
        if (entered.length < OTP_LENGTH) { setEmpError('Enter 6-digit OTP.'); return; }
        if (entered !== empGeneratedOtp) { setEmpError('Invalid OTP! Access Denied.'); return; }

        setEmpLoading(true);
        try {
            // Find user again to get full object
            const allUsers = await dataService.getAllUsers();
            const user = allUsers.find(u => u.username === empUsername || u.mobile === empUsername);
            if (user) {
                // Mock login success
                localStorage.setItem('rupiksha_user', JSON.stringify(user));
                setIsLocked(true);
                navigate('/admin');
            } else {
                setEmpError('Session error. Please try again.');
            }
        } catch (err) {
            setEmpError('Verification failed.');
        }
        setEmpLoading(false);
    };

    const handleEmpOtpKey = (val, idx) => {
        if (!/^\d?$/.test(val)) return;
        const nxt = [...empOtpValues]; nxt[idx] = val; setEmpOtpValues(nxt);
        if (val && idx < OTP_LENGTH - 1) empOtpRefs.current[idx + 1]?.focus();
    };

    const handleEmpOtpBack = (e, idx) => {
        if (e.key === 'Backspace' && !empOtpValues[idx] && idx > 0) empOtpRefs.current[idx - 1]?.focus();
    };

    useEffect(() => {
        clearInterval(empTimerRef.current);
        if (empTimer <= 0) return;
        empTimerRef.current = setInterval(() => setEmpTimer(t => t > 0 ? t - 1 : 0), 1000);
        return () => clearInterval(empTimerRef.current);
    }, [empTimer]);

    const empTimerFmt = `${String(Math.floor(empTimer / 60)).padStart(2, '0')}:${String(empTimer % 60).padStart(2, '0')}`;

    return (
        <div className="h-screen bg-slate-50 flex flex-col font-['Montserrat',sans-serif] overflow-hidden">
            <header className="bg-white px-6 md:px-12 py-3 flex items-center justify-between shadow-sm border-b border-slate-100 sticky top-0 z-50">
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/login')}>
                    <img src={logo} alt="RUPIKSHA" style={{ height: '40px', width: 'auto' }} className="object-contain" />
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                        <div className="w-6 h-6 rounded-lg shadow-inner flex items-center justify-center overflow-hidden relative" style={{ backgroundColor: brandColor }}>
                            <input
                                type="color"
                                value={brandColor}
                                onChange={(e) => setBrandColor(e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer w-10 h-10"
                                title="Choose Theme Color"
                            />
                            <Palette size={12} className={parseInt(brandColor.replace('#',''), 16) > 0xffffff/2 ? 'text-black' : 'text-white'} />
                        </div>
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest hidden sm:inline">Theme Control</span>
                    </div>

                    <div className="hidden md:flex flex-col items-end">
                        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-emerald-100 shadow-sm" style={{ color: brandColor, borderColor: brandColor + '20', backgroundColor: brandColor + '05' }}>
                            Headquarters Protocol
                        </span>
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        className="h-10 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-all flex items-center gap-2 group border border-slate-200"
                    >
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[11px] font-black uppercase tracking-wider">Back</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 flex flex-col md:flex-row bg-white">
                {/* Left: Login Form */}
                <div className="w-full md:w-[45%] lg:w-[42%] p-8 md:p-10 flex flex-col items-center justify-center bg-amber-100 border-r border-amber-200/50 shadow-2xl relative z-10 h-full overflow-y-auto">
                    <div className="w-full max-w-[420px] space-y-6">
                        <div className="text-center space-y-1">
                            <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic" style={{ color: brandColor }}>
                                Login
                            </h2>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Access System Headquarters</p>
                        </div>

                        <div className="bg-white rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden">
                            <div className="text-white text-center py-4 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2" style={{ backgroundColor: brandColor }}>
                                <ShieldCheck size={16} /> Restricted Access — Authorized Personnel
                            </div>

                            <div className="p-6">
                                {/* Tabs */}
                                <div className="flex bg-slate-100 rounded-xl p-1 mb-5">
                                    {TABS.map((t, i) => (
                                        <button key={t} onClick={() => { setTab(i); setPwError(''); setOtpError(''); setOtpInfo(''); }}
                                            className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${tab === i ? 'bg-white shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                                            style={tab === i ? { color: brandColor } : {}}>
                                            {t}
                                        </button>
                                    ))}
                                </div>

                                <AnimatePresence mode="wait">

                                    {/* ═══ PASSWORD TAB ═══ */}
                                    {tab === 0 && (
                                        <motion.div key="pw" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                                            <AnimatePresence>
                                                {pwError && (
                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                        className="bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
                                                        <AlertCircle size={13} />{pwError}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            <form onSubmit={handlePasswordLogin} className="space-y-4">
                                                <div className="relative">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><User size={16} /></div>
                                                    <input type="text" placeholder="Admin Username" value={username} onChange={e => setUsername(e.target.value)} required
                                                        className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-xl text-slate-800 focus:border-emerald-500 outline-none text-sm font-bold transition-all" />
                                                </div>
                                                <div className="relative">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Lock size={16} /></div>
                                                    <input type={showPw ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
                                                        className="w-full pl-11 pr-12 py-3.5 bg-white border-2 border-slate-100 rounded-xl text-slate-800 focus:border-emerald-500 outline-none text-sm font-bold transition-all" />
                                                    <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors">
                                                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="flex items-center justify-between bg-slate-50 border-2 border-slate-100 px-3 py-2.5 rounded-xl">
                                                        <span className="text-xl tracking-widest text-slate-600 select-none flex-1 text-center line-through decoration-slate-400 font-mono italic font-black">{captcha}</span>
                                                        <button type="button" onClick={genCaptcha} className="text-slate-400 hover:text-emerald-500 hover:rotate-180 transition-all duration-500 ml-2"><RefreshCcw size={14} /></button>
                                                    </div>
                                                    <input type="text" placeholder="Enter captcha" value={captchaInput} onChange={e => setCaptchaInput(e.target.value)} required
                                                        className="w-full px-4 py-3.5 bg-white border-2 border-slate-100 rounded-xl text-slate-800 focus:border-emerald-500 outline-none text-sm font-bold transition-all" />
                                                </div>
                                                <motion.button type="submit" disabled={pwLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                                    className="w-full mt-2 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-black hover:to-slate-800 text-white font-black py-4 rounded-xl text-[11px] uppercase tracking-widest shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 transition-all disabled:opacity-60">
                                                    {pwLoading ? <><Loader2 size={14} className="animate-spin" /> Authenticating...</> : <><ShieldCheck size={15} /> Login as Admin <ArrowRight size={14} /></>}
                                                </motion.button>

                                            </form>
                                        </motion.div>
                                    )}

                                    {/* ═══ EMPLOYEE TAB ═══ */}
                                    {tab === 2 && (
                                        <motion.div key="emp" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                                            <AnimatePresence>
                                                {empError && (
                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                        className="bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
                                                        <AlertCircle size={13} />{empError}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            <div className="flex gap-4 mb-4 border-b border-slate-100 pb-2">
                                                <button type="button" onClick={() => { setEmpLoginMode('password'); setEmpOtpSent(false); }} className={`text-[9px] font-black uppercase tracking-widest ${empLoginMode === 'password' ? 'text-emerald-700 underline underline-offset-4' : 'text-slate-400 font-bold'}`}>Passcode Login</button>
                                                <button type="button" onClick={() => setEmpLoginMode('otp')} className={`text-[9px] font-black uppercase tracking-widest ${empLoginMode === 'otp' ? 'text-emerald-700 underline underline-offset-4' : 'text-slate-400 font-bold'}`}>OTP (Email) Login</button>
                                            </div>

                                            {empLoginMode === 'password' ? (
                                                <form onSubmit={handleEmployeeLogin} className="space-y-4">
                                                    <div className="relative">
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><User size={16} /></div>
                                                        <input type="text" placeholder="Employee ID / Mobile" value={empUsername} onChange={e => setEmpUsername(e.target.value)} required
                                                            className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-xl text-slate-800 focus:border-emerald-500 outline-none text-sm font-bold transition-all" />
                                                    </div>
                                                    <div className="relative">
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Lock size={16} /></div>
                                                        <input type={empShowPw ? 'text' : 'password'} placeholder="Employee Password" value={empPassword} onChange={e => setEmpPassword(e.target.value)} required
                                                            className="w-full pl-11 pr-12 py-3.5 bg-white border-2 border-slate-100 rounded-xl text-slate-800 focus:border-emerald-500 outline-none text-sm font-bold transition-all" />
                                                        <button type="button" onClick={() => setEmpShowPw(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors">
                                                            {empShowPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                                        </button>
                                                    </div>
                                                    <motion.button type="submit" disabled={empLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                                        className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-4 rounded-xl text-[11px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 transition-all disabled:opacity-60">
                                                        {empLoading ? <><Loader2 size={14} className="animate-spin" /> Authenticating...</> : <><ShieldCheck size={15} /> Header Portal Login <ArrowRight size={14} /></>}
                                                    </motion.button>
                                                </form>
                                            ) : (
                                                <div className="space-y-4">
                                                    {!empOtpSent ? (
                                                        <form onSubmit={handleSendEmployeeOTP} className="space-y-4">
                                                            <div className="relative">
                                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><User size={16} /></div>
                                                                <input type="text" placeholder="Employee ID / Mobile" value={empUsername} onChange={e => setEmpUsername(e.target.value)} required
                                                                    className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-xl text-slate-800 focus:border-emerald-500 outline-none text-sm font-bold transition-all" />
                                                            </div>
                                                            <motion.button type="submit" disabled={empLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                                                className="w-full bg-slate-800 text-white font-black py-4 rounded-xl text-[11px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all disabled:opacity-60">
                                                                {empLoading ? <><Loader2 size={14} className="animate-spin" /> Fetching & Sending...</> : <><Mail size={14} /> Send OTP to Email <ArrowRight size={14} /></>}
                                                            </motion.button>
                                                        </form>
                                                    ) : (
                                                        <form onSubmit={handleVerifyEmployeeOTP} className="space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-slate-400 text-[9px] font-bold uppercase">Enter OTP</p>
                                                                <span className="text-[10px] font-black tabular-nums text-emerald-600">{empTimerFmt}</span>
                                                            </div>
                                                            <div className="flex gap-2 justify-center">
                                                                {Array(OTP_LENGTH).fill(0).map((_, i) => (
                                                                    <input key={i} ref={el => empOtpRefs.current[i] = el}
                                                                        type="text" inputMode="numeric" maxLength={1} value={empOtpValues[i]}
                                                                        onChange={e => handleEmpOtpKey(e.target.value, i)}
                                                                        onKeyDown={e => handleEmpOtpBack(e, i)}
                                                                        className={`w-11 h-12 text-center text-slate-800 font-black text-lg bg-white border-2 rounded-xl border-slate-200 outline-none transition-all
                                                                            ${empOtpValues[i] ? 'border-emerald-500 bg-emerald-50' : 'focus:border-emerald-400'}`} />
                                                                ))}
                                                            </div>
                                                            <motion.button type="submit" disabled={empLoading || empTimer === 0} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                                                className="w-full bg-emerald-600 text-white font-black py-4 rounded-xl text-[11px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all disabled:opacity-60">
                                                                {empLoading ? <><Loader2 size={14} className="animate-spin" /> Verifying...</> : <><KeyRound size={14} /> Verify & Access <ArrowRight size={14} /></>}
                                                            </motion.button>
                                                            <button type="button" onClick={() => setEmpOtpSent(false)} className="w-full text-[9px] font-bold text-slate-400 hover:text-slate-600 uppercase text-center">Back / Resend</button>
                                                        </form>
                                                    )}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* ═══ OTP TAB ═══ */}
                                    {tab === 1 && (
                                        <motion.div key="otp" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }} className="space-y-4">
                                            <AnimatePresence>
                                                {otpError && (
                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                        className="bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
                                                        <AlertCircle size={13} />{otpError}
                                                    </motion.div>
                                                )}
                                                {otpInfo && !otpError && (
                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                        className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
                                                        <CheckCircle2 size={13} />{otpInfo}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {!otpSent ? (
                                                <form onSubmit={handleSendOTP} className="space-y-4">
                                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Enter registered admin email</p>
                                                    <div className="relative">
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Mail size={16} /></div>
                                                        <input type="email" placeholder="Admin Email Address" value={otpEmail} onChange={e => setOtpEmail(e.target.value)} required
                                                            className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-xl text-slate-800 focus:border-emerald-500 outline-none text-sm font-bold transition-all" />
                                                    </div>
                                                    <motion.button type="submit" disabled={sendLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black py-4 rounded-xl text-[11px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 transition-all disabled:opacity-60">
                                                        {sendLoading ? <><Loader2 size={14} className="animate-spin" /> Sending OTP...</> : <><Mail size={14} /> Send OTP to Email <ArrowRight size={14} /></>}
                                                    </motion.button>
                                                </form>
                                            ) : (
                                                <form onSubmit={handleVerifyOTP} className="space-y-5">
                                                    <div>
                                                        <div className="flex items-center justify-between mb-3">
                                                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Enter 6-digit OTP</p>
                                                            <span className={`text-[11px] font-black tabular-nums ${timer > 30 ? 'text-emerald-500' : 'text-red-500'}`}>⏱ {timerFmt}</span>
                                                        </div>
                                                        <div className="flex gap-2 justify-center">
                                                            {Array(OTP_LENGTH).fill(0).map((_, i) => (
                                                                <input key={i} ref={el => otpRefs.current[i] = el}
                                                                    type="text" inputMode="numeric" maxLength={1} value={otpValues[i]}
                                                                    onChange={e => handleOtpKey(e.target.value, i)}
                                                                    onKeyDown={e => handleOtpBack(e, i)}
                                                                    className={`w-11 h-12 text-center text-slate-800 font-black text-lg bg-white border-2 rounded-xl border-slate-200 outline-none transition-all
                                                                        ${otpValues[i] ? 'border-emerald-500 bg-emerald-50' : 'focus:border-emerald-400'}`} />
                                                            ))}
                                                        </div>
                                                        <p className="text-slate-400 text-[9px] font-bold text-center mt-3 uppercase tracking-widest">Sent to {OTP_EMAIL}</p>
                                                    </div>

                                                    <motion.button type="submit" disabled={verifyLoading || timer === 0} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                                        className="w-full text-white font-black py-4 rounded-xl text-[11px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all disabled:opacity-60"
                                                        style={{ backgroundColor: brandColor, boxShadow: `0 20px 40px ${brandColor}33` }}>
                                                        {verifyLoading ? <><Loader2 size={14} className="animate-spin" /> Verifying...</> : <><KeyRound size={14} /> Verify & Login <ArrowRight size={14} /></>}
                                                    </motion.button>

                                                    <button type="button" onClick={resendOTP}
                                                        className={`w-full text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-2 transition-colors ${timer === 0 ? 'text-amber-500 hover:text-amber-600' : 'text-slate-400 hover:text-slate-600'}`}>
                                                        <RefreshCcw size={12} /> {timer === 0 ? 'OTP Expired — Resend' : 'Resend OTP'}
                                                    </button>
                                                </form>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="text-center opacity-40">
                            <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.8em]">© 2026 RuPiKsha Digital</p>
                        </div>
                    </div>
                </div>

                {/* Right: Splash */}
                <div className="hidden md:flex flex-1 relative overflow-hidden items-center justify-center p-8 h-full" style={{ background: `linear-gradient(135deg, ${brandColor}, ${brandColor}dd)` }}>
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 blur-[150px] rounded-full -mr-48 -mt-48" />
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 blur-[120px] rounded-full -ml-40 -mb-40" />
                    </div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12 text-white max-w-md text-center space-y-6 z-10"
                    >
                        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl" style={{ backgroundColor: 'white', color: brandColor, boxShadow: `0 20px 40px rgba(0,0,0,0.2)` }}>
                            <ShieldCheck size={40} />
                        </div>
                        <div className="space-y-2">
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-70">Headquarters Protocol</span>
                            <h3 className="text-3xl font-black tracking-tight">System<br />Administration</h3>
                            <p className="text-white/60 text-sm font-bold">Manage the entire platform layout, monitor live active employees, and maintain system integrity.</p>
                        </div>
                        {[
                            'Real-time Employee Directory',
                            'Geofenced Tracking Map',
                            'System Integrity & Security',
                            'Hierarchical Flow Management',
                        ].map((f, i) => (
                            <div key={i} className="flex items-center gap-3 text-left bg-white/10 border border-white/10 rounded-xl px-4 py-3">
                                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: brandColor }}>
                                    <Check size={11} className="text-white" />
                                </div>
                                <span className="text-sm font-bold text-white/80">{f}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default AdminLogin;
