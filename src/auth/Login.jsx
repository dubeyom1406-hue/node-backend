import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Lock, Eye, EyeOff, RefreshCcw,
    Facebook, Twitter, Linkedin, Youtube, Send,
    MessageSquare, Phone, Mail, Instagram, Globe,
    ChevronDown, ChevronRight, ChevronLeft, QrCode,
    Calendar, Smartphone, Check, HelpCircle,
    Building2, Users, ArrowRight, Shield
} from 'lucide-react';
import logo from '../assets/rupiksha_logo.png';
import { dataService, BACKEND_URL } from '../services/dataService';
import DistributorLogin from '../distributor/components/DistributorLogin';
import SuperAdminLogin from '../superadmin/components/SuperAdminLogin';
import RetailerLogin from '../retailer/components/RetailerLogin';

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
    "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const TRANSLATIONS = {
    en: {
        income_calc: "? INCOME CALCULATOR",
        welcome: "WELCOME TO RUPIKSHA",
        login_btn: "Login",
        register_btn: "Register",
        submit_btn: "Submit",
        forgot_password: "Forgot Password?",
        username_placeholder: "Mobile Number",
        password_placeholder: "Password",
        captcha_placeholder: "Enter captcha",
        remember_me: "Remember me",
        new_user: "New User?",
        create_account_link: "Create a free account.",
        already_registered: "Already registered?",
        log_in_link: "Log in.",
        create_account_title: "Create a free account",
        register_p: "Get yourself a free account and start transacting today",
        mobile_label: "Mobile Number",
        name_label: "Full Name",
        email_label: "Email",
        state_label: "Please select your state",
        lang_label: "Please select your preferred language",
        dob_label: "Date of Birth",
        dob_note: "Note: Enter the Date of Birth as per RUPIKSHA record. Format should be DD/MM/YYYY",
        get_app: "GET RUPIKSHA APP",
        rights: "© RuPiKsha Digital Services Private Limited | All rights reserved.",
        chat_with_us: "CHAT WITH US NOW!",
        english: "English",
        hindi: "Hindi",
        select_lang: "SELECT LANGUAGE",
        back_to_login: "Back to login?",
        agreement: "I agree to receive communication over whatsapp, RCS service, mobile & email.",
        success_reg: "Registration Successful! Logging in...",
        success_login: "Login Successful!",
        otp_title: "Verify Mobile OTP",
        otp_placeholder: "Enter 6-digit OTP",
        otp_sent: "OTP sent to your registered mobile number",
        verify_otp_btn: "Verify & Login",
        resend_otp: "Resend Mobile OTP",
        invalid_otp: "Invalid OTP. Please try again.",
        cred_error: "Invalid credentials.",
        login_by_password: "Password Login",
        login_by_otp: "OTP Login",
        user_not_found: "User not found. Please register.",
        mobile_placeholder: "Enter Mobile Number"
    },
    hi: {
        income_calc: "? ?? ?????????",
        welcome: "???????? ??? ???? ?????? ??",
        login_btn: "?????",
        register_btn: "???????",
        submit_btn: "?????",
        forgot_password: "??????? ??? ???",
        username_placeholder: "?????? ????",
        password_placeholder: "???????",
        captcha_placeholder: "?????? ???? ????",
        remember_me: "???? ??? ????",
        new_user: "?? ???????????",
        create_account_link: "??: ????? ???? ??????",
        already_registered: "???? ?? ??????? ????",
        log_in_link: "????? ?????",
        create_account_title: "?? ??: ????? ???? ?????",
        register_p: "?? ?? ???? ?????? ???? ??????? ???? ?? ?????? ???? ????",
        mobile_label: "?????? ????",
        name_label: "???? ???",
        email_label: "????",
        state_label: "????? ???? ????? ?????",
        lang_label: "????? ???? ??????? ???? ?????",
        dob_label: "???? ????",
        dob_note: "???: ???????? ??????? ?? ?????? ???? ???? ???? ????? ??????? DD/MM/YYYY ???? ?????",
        get_app: "???????? ?? ??????? ????",
        rights: "© ???????? ?????? ???????? ???????? ??????? | ?????????? ?????????",
        chat_with_us: "??? ???? ??? ????!",
        english: "English",
        hindi: "?????",
        select_lang: "???? ?????",
        back_to_login: "????? ?? ???? ?????",
        agreement: "??? ?????????, RCS ????, ?????? ?? ???? ?? ????? ??????? ???? ?? ??? ???? ????",
        success_reg: "??????? ???! ????? ???? ?? ??? ??...",
        success_login: "????? ???!",
        otp_title: "?????? ????? ???????? ????",
        otp_placeholder: "6-????? ????? ???? ????",
        otp_sent: "????? ???? ??????? ?????? ???? ?? ??? ???? ??? ??",
        verify_otp_btn: "???????? ???? ?? ????? ????",
        resend_otp: "?????? ????? ???: ?????",
        invalid_otp: "?????? ?????? ????? ???: ?????? ?????",
        cred_error: "?????? ????????????",
        login_by_password: "??????? ?????",
        login_by_otp: "????? ?????",
        user_not_found: "?????????? ???? ????? ????? ??????? ?????",
        mobile_placeholder: "?????? ???? ???? ????"
    }
};

import { useLanguage } from '../context/LanguageContext';

// ... (existing imports)

const Login = () => {
    const navigate = useNavigate();
    const { language: lang, setLanguage: setLang, t: translate } = useLanguage();
    // Helper to map global translations to local legacy TRANSLATIONS object if needed, 
    // OR just use local t function that uses global lang.
    // However, existing code uses `t(key)` helper that looks up `TRANSLATIONS[lang][key]`.
    // Let's keep `TRANSLATIONS` object in Login.jsx for now but control `lang` via context.

    // Legacy t function for Login page specific strings (keeping local dictionary for now as it has many keys)
    const t = (key) => {
        if (!TRANSLATIONS[lang]) return key;
        return TRANSLATIONS[lang][key] || key;
    };

    // portal: 'select' ? show portal chooser, 'retailer' ? retailer login, 'distributor' ? distributor login
    const [portal, setPortal] = useState('select');
    const [view, setView] = useState('login'); // 'login', 'register', 'forgot'
    // const [lang, setLang] = useState('en'); // Removed local state
    const [showLangMenu, setShowLangMenu] = useState(false);
    const { setUser, setIsLocked } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginStep, setLoginStep] = useState('credentials'); // 'credentials', 'otp'
    const [loginMethod, setLoginMethod] = useState('password'); // 'password', 'otp'
    const [enteredOtp, setEnteredOtp] = useState('');
    const [tempUser, setTempUser] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Form States
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    // Initialize registerForm lang with global lang
    const [registerForm, setRegisterForm] = useState({ name: '', mobile: '', email: '', state: '', role: 'RETAILER', lang: lang === 'en' ? 'English' : 'Hindi', agreement: false });
    const [forgotForm, setForgotForm] = useState({ mobile: '', dob: '' });

    // Update register form when global lang changes
    useEffect(() => {
        setRegisterForm(prev => ({ ...prev, lang: lang === 'en' ? 'English' : 'Hindi' }));
    }, [lang]);

    const slides = [
        {
            title: "Never-Before Offer",
            subtitle: "100% FREE IRCTC Rail Agent ID",
            desc: "Valid for 1 Full Year | OTP-Based Activation | Instant Activation",
            action: "ACTIVATE TODAY – LIMITED TIME OFFER",
            image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1000"
        },
        {
            title: "Expand Your Business",
            subtitle: "Multiple Services, One Platform",
            desc: "Banking, Utility & Travel Services at your fingertips",
            action: "JOIN THE NETWORK",
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const handleAction = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (view === 'login') {
            if (loginStep === 'credentials') {
                if (loginMethod === 'password') {
                    let location = null;
                    try {
                        const pos = await new Promise((resolve, reject) => {
                            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 });
                        });
                        location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    } catch (e) { }

                    const logRes = await dataService.loginUser(loginForm.username, loginForm.password, location);
                    if (logRes.success) {
                        setUser(logRes.user);
                        setIsLocked(false);
                        const role = logRes.user?.role;
                        if (role === 'DISTRIBUTOR') navigate('/distributor');
                        else if (role === 'SUPER_DISTRIBUTOR' || role === 'SUPERADMIN') navigate('/superadmin');
                        else if (['ADMIN', 'NATIONAL_HEADER', 'STATE_HEADER', 'REGIONAL_HEADER', 'EMPLOYEE'].includes(role)) navigate('/admin');
                        else navigate('/dashboard');
                    } else {
                        alert(logRes.message || t('cred_error'));
                    }
                    setIsLoading(false);
                    return;
                } else {
                    // OTP Login Method
                    const user = dataService.getUserByUsername(loginForm.username);
                    if (!user) {
                        alert(t('user_not_found'));
                        setIsLoading(false);
                        return;
                    }
                    setTempUser(user);
                    try {
                        const mobile = user.mobile || loginForm.username;
                        const backendRes = await fetch(`${BACKEND_URL}/send-mobile-otp`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ mobile: mobile })
                        });

                        if (backendRes.ok) {
                            setLoginStep('otp');
                        } else {
                            alert("Failed to send OTP.");
                        }
                    } catch (err) {
                        alert(`Connection error: ${err.message}`);
                    }
                    setIsLoading(false);
                }
            } else if (loginStep === 'otp') {
                // Verify Mobile OTP
                try {
                    const response = await fetch(`${BACKEND_URL}/verify-otp`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ identity: tempUser.mobile || tempUser.username, otp: enteredOtp })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        localStorage.setItem('rupiksha_user', JSON.stringify(tempUser));
                        localStorage.setItem('rupiksha_token', data.token || 'MOCK_TOKEN_' + Date.now());
                        setUser(tempUser);
                        setIsLocked(false);
                        const role = tempUser.role;
                        if (role === 'DISTRIBUTOR') navigate('/distributor');
                        else if (role === 'SUPER_DISTRIBUTOR' || role === 'SUPERADMIN') navigate('/superadmin');
                        else if (['ADMIN', 'NATIONAL_HEADER', 'STATE_HEADER', 'REGIONAL_HEADER', 'EMPLOYEE'].includes(role)) navigate('/admin');
                        else navigate('/dashboard');
                    } else {
                        alert("Verification failed.");
                    }
                } catch (error) {
                    alert(`Connection error: ${error.message}`);
                }
                setIsLoading(false);
            }
        } else if (view === 'register') {
            // Register usually goes to backend
            try {
                const res = await fetch(`${BACKEND_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...registerForm, role: registerForm.role || 'RETAILER' })
                });
                if (!res.ok) {
                    const errorText = await res.text();
                    console.error("Login Page Register Fail:", res.status, errorText);
                    alert(`Registration Failed (${res.status}): ${errorText.substring(0, 50)}`);
                    setIsLoading(false);
                    return;
                }
                const data = await res.json();
                if (data.success) {
                    setView('login');
                    alert(`Registration Successful! Please wait for admin approval.`);
                } else {
                    alert(data.message || "Registration Failed");
                }
            } catch (e) {
                console.error("Login Page Register Exception:", e);
                alert("Server Connection Failed or CORS Error. Please ensure backend is running.");
            }
            setIsLoading(false);
        } else {
            // Forgot Password handling
            setTimeout(() => {
                setView('login');
                setIsLoading(false);
            }, 1000);
        }
    };


    // -- Portal Selection Screen --------------------------------------------
    if (portal === 'select') {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-start font-['Montserrat',sans-serif] relative overflow-x-clip py-10 md:py-8 px-4">


                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full max-w-[1240px] flex flex-col items-center z-10"
                >
                    {/* Brand Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex flex-col items-center mb-4 md:mb-6 text-center"
                    >
                        <div className="relative mb-2 md:mb-3">
                            <img src={logo} alt="Rupiksha" style={{ height: '200px' }} className="object-contain brightness-0 invert" />
                        </div>
                        <h1 className="text-white text-xl md:text-lg font-black uppercase tracking-[0.15em] leading-tight">
                            SELECT YOUR <span className="text-blue-500">PORTAL</span>
                        </h1>
                        <p className="text-white/40 text-[9px] md:text-[9px] font-bold uppercase tracking-[0.4em] mt-1">Making Life Simple & Digital</p>
                    </motion.div>

                    {/* Portal Selection Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10 w-full max-w-[95vw] lg:max-w-[1400px]">
                        {/* Retailer Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            whileHover={{ y: -12, transition: { duration: 0.3 } }}
                            className="group relative h-[320px] md:h-[500px] bg-gradient-to-b from-blue-600 to-blue-900 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-8 flex flex-col text-left overflow-hidden border border-white/10"
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-500">
                                    <Users size={32} className="text-white" />
                                </div>
                                <div className="space-y-4">
                                    <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] opacity-60">Panel A</span>
                                    <h3 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tighter leading-none">
                                        RETAILER
                                    </h3>
                                </div>

                                <div className="mt-auto">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setPortal('retailer')}
                                        className="inline-flex items-center gap-3 text-white font-black text-[10px] uppercase tracking-[0.2em] cursor-pointer bg-white/10 hover:bg-white/20 px-6 py-3 rounded-full border border-white/10 transition-all"
                                    >
                                        <span className="group-hover:tracking-[0.3em] transition-all duration-300">LOGIN NOW</span>
                                        <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-300" />
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Distributor Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            whileHover={{ y: -12, transition: { duration: 0.3 } }}
                            className="group relative h-[320px] md:h-[500px] bg-gradient-to-b from-amber-500 to-orange-700 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-8 flex flex-col text-left overflow-hidden border border-white/10"
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-500">
                                    <Building2 size={32} className="text-white" />
                                </div>
                                <div className="space-y-4">
                                    <span className="text-[10px] font-black text-amber-200 uppercase tracking-[0.2em] opacity-60">Panel B</span>
                                    <h3 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tighter leading-none">
                                        DISTRIBUTOR
                                    </h3>
                                </div>

                                <div className="mt-auto">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setPortal('distributor')}
                                        className="inline-flex items-center gap-3 text-white font-black text-[10px] uppercase tracking-[0.2em] cursor-pointer bg-white/10 hover:bg-white/20 px-6 py-3 rounded-full border border-white/10 transition-all"
                                    >
                                        <span className="group-hover:tracking-[0.3em] transition-all duration-300">LOGIN NOW</span>
                                        <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-300" />
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>

                        {/* SuperAdmin Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            whileHover={{ y: -12, transition: { duration: 0.3 } }}
                            className="group relative h-[320px] md:h-[500px] bg-gradient-to-b from-indigo-700 to-purple-900 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-8 flex flex-col text-left overflow-hidden border border-white/10"
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-500">
                                    <Shield size={32} className="text-white" />
                                </div>
                                <div className="space-y-4">
                                    <span className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] opacity-60">Control Center</span>
                                    <h3 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tighter leading-none">
                                        SUPER DISTRIBUTOR
                                    </h3>
                                </div>

                                <div className="mt-auto">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setPortal('superadmin')}
                                        className="inline-flex items-center gap-3 text-white font-black text-[10px] uppercase tracking-[0.2em] cursor-pointer bg-white/10 hover:bg-white/20 px-6 py-3 rounded-full border border-white/10 transition-all"
                                    >
                                        <span className="group-hover:tracking-[0.3em] transition-all duration-300">SUPER DISTRIBUTOR Login</span>
                                        <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-300" />
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Footer Copyright */}
                    <div className="mt-24 md:mt-32 text-center opacity-30">
                        <p className="text-white text-[10px] font-black uppercase tracking-[0.8em]">
                            © 2026 RuPiKsha Digital Services Pvt. Ltd.
                        </p>
                    </div>
                </motion.div>
            </div>
        );
    }

    // -- Distributor Login Screen ---------------------------------------------
    if (portal === 'distributor') {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex flex-col font-['Montserrat',sans-serif]">
                <header className="bg-white px-4 md:px-8 py-2 flex items-center justify-between shadow-sm border-b border-slate-100 sticky top-0 z-50">
                    <div className="flex flex-col items-center cursor-pointer" onClick={() => setPortal('select')}>
                        <img src={logo} alt="RUPIKSHA" style={{ height: '40px', width: 'auto' }} className="object-contain" />
                        <span className="text-[8px] font-bold text-slate-400 -mt-1 uppercase tracking-tighter self-start">Making Life Simple</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-amber-200">Distributor Portal — B Panel</span>
                        <button
                            onClick={() => setPortal('select')}
                            className="text-[10px] font-black text-slate-500 hover:text-slate-800 uppercase tracking-wider flex items-center gap-1"
                        >
                            <ChevronLeft size={14} /> Change Portal
                        </button>
                    </div>
                </header>

                <main className="flex-1 flex flex-col md:flex-row overflow-hidden bg-white">
                    {/* Left: Distributor Login */}
                    <div className="w-full md:w-[45%] lg:w-[40%] p-6 md:p-12 flex flex-col items-center justify-center bg-white overflow-y-auto">
                        <div className="w-full max-w-[440px] space-y-6">
                            <h2 className="text-amber-500 text-2xl md:text-3xl font-black text-center tracking-tighter uppercase">
                                Distributor Login
                            </h2>
                            <div className="bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-slate-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center py-2.5 font-bold uppercase tracking-widest text-sm">
                                    B Panel — Distributor Access
                                </div>
                                <div className="p-8">
                                    <DistributorLogin />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Distributor promo banner */}
                    <div className="hidden md:flex flex-1 bg-gradient-to-br from-[#162543] to-[#0d1b35] relative overflow-hidden items-center justify-center p-8 lg:p-14">
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 blur-[150px] rounded-full -mr-48 -mt-48" />
                            <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/10 blur-[120px] rounded-full -ml-40 -mb-40" />
                        </div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6 }}
                            className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12 text-white max-w-md text-center space-y-6 z-10"
                        >
                            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/30">
                                <Building2 size={40} className="text-white" />
                            </div>
                            <div className="space-y-2">
                                <span className="text-[9px] font-black text-amber-300 uppercase tracking-widest">Distributor B Panel</span>
                                <h3 className="text-3xl font-black tracking-tight">Manage Your<br />Retailer Network</h3>
                                <p className="text-white/60 text-sm font-bold">Track retailer performance, manage transactions, and grow your distribution business.</p>
                            </div>
                            {[
                                '142+ Active Retailers',
                                'Real-time Transaction Reports',
                                'Commission Tracking',
                                'Ledger Management',
                            ].map((f, i) => (
                                <div key={i} className="flex items-center gap-3 text-left bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                                    <div className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center shrink-0">
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
    }

    // -- SuperAdmin Login Screen ---------------------------------------------
    if (portal === 'superadmin') {
        return (
            <div className="min-h-screen bg-[#f0f4ff] flex flex-col font-['Montserrat',sans-serif]">
                <header className="bg-white px-4 md:px-8 py-2 flex items-center justify-between shadow-sm border-b border-slate-100 sticky top-0 z-50">
                    <div className="flex flex-col items-center cursor-pointer" onClick={() => setPortal('select')}>
                        <img src={logo} alt="RUPIKSHA" style={{ height: '40px', width: 'auto' }} className="object-contain" />
                        <span className="text-[8px] font-bold text-slate-400 -mt-1 uppercase tracking-tighter self-start">Making Life Simple</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="bg-indigo-100 text-indigo-700 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-200">Control Panel — SuperAdmin</span>
                        <button
                            onClick={() => setPortal('select')}
                            className="text-[10px] font-black text-slate-500 hover:text-slate-800 uppercase tracking-wider flex items-center gap-1"
                        >
                            <ChevronLeft size={14} /> Change Portal
                        </button>
                    </div>
                </header>

                <main className="flex-1 flex flex-col md:flex-row overflow-hidden bg-white">
                    {/* Left: SuperAdmin Login */}
                    <div className="w-full md:w-[45%] lg:w-[40%] p-6 md:p-12 flex flex-col items-center justify-center bg-white overflow-y-auto">
                        <div className="w-full max-w-[440px] space-y-6">
                            <h2 className="text-[#312e81] text-2xl md:text-3xl font-black text-center tracking-tighter uppercase italic">
                                Master Portal Login
                            </h2>
                            <div className="bg-white rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-slate-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-[#312e81] to-[#4338ca] text-white text-center py-2.5 font-bold uppercase tracking-widest text-sm">
                                    System Control — Master Node Access
                                </div>
                                <div className="p-8">
                                    <SuperAdminLogin />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: SuperAdmin promo banner */}
                    <div className="hidden md:flex flex-1 bg-gradient-to-br from-[#1e1b4b] to-[#312e81] relative overflow-hidden items-center justify-center p-8 lg:p-14">
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400/10 blur-[150px] rounded-full -mr-48 -mt-48" />
                            <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 blur-[120px] rounded-full -ml-40 -mb-40" />
                        </div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6 }}
                            className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12 text-white max-w-md text-center space-y-6 z-10"
                        >
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/30">
                                <Shield size={40} className="text-white" />
                            </div>
                            <div className="space-y-2">
                                <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">Super Distributor Control Panel</span>
                                <h3 className="text-3xl font-black tracking-tight">Ultimate Authority & OverSight</h3>
                                <p className="text-white/60 text-sm font-bold">Monitor the entire ecosystem from a single dashboard. Manage partners, track growth and ensure security.</p>
                            </div>
                            {[
                                'Manage All Distributors',
                                'Manage All Retailers',
                                'System-wide Transactions',
                                'Direct Service Overrides',
                            ].map((f, i) => (
                                <div key={i} className="flex items-center gap-3 text-left bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                                    <div className="w-5 h-5 bg-indigo-400 rounded-full flex items-center justify-center shrink-0">
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
    }

    // -- Retailer Portal (Default / portal === 'retailer') ----------------------
    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col font-['Montserrat',sans-serif]">
            {/* Header — similar style to other portals */}
            <header className="bg-white px-4 md:px-8 py-2 flex items-center justify-between shadow-sm border-b border-slate-100 sticky top-0 z-50">
                <div className="flex flex-col items-center cursor-pointer" onClick={() => setPortal('select')}>
                    <img src={logo} alt="RUPIKSHA" style={{ height: '40px', width: 'auto' }} className="object-contain" />
                    <span className="text-[8px] font-bold text-slate-400 -mt-1 uppercase tracking-tighter self-start">Making Life Simple</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="bg-blue-100 text-blue-700 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-200">Retailer Portal — A Panel</span>
                    <button
                        onClick={() => setPortal('select')}
                        className="text-[10px] font-black text-slate-500 hover:text-slate-800 uppercase tracking-wider flex items-center gap-1"
                    >
                        <ChevronLeft size={14} /> Change Portal
                    </button>
                </div>
            </header>

            <main className="flex-1 flex flex-col md:flex-row overflow-hidden bg-white">
                {/* Left: Retailer Login */}
                <div className="w-full md:w-[45%] lg:w-[40%] p-6 md:p-12 flex flex-col items-center justify-center bg-white overflow-y-auto">
                    <div className="w-full max-w-[440px] space-y-6">
                        <h2 className="text-[#1e40af] text-2xl md:text-3xl font-black text-center tracking-tighter uppercase italic">
                            Retailer Login
                        </h2>
                        <div className="bg-white rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-slate-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white text-center py-2.5 font-bold uppercase tracking-widest text-sm">
                                A Panel — Retailer Access
                            </div>
                            <div className="p-8">
                                <RetailerLogin />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Retailer Promo Panel */}
                <div className="hidden md:flex flex-1 bg-gradient-to-br from-[#0c1a3a] via-[#1e40af] to-[#0c1a3a] relative overflow-hidden items-center justify-center p-8 lg:p-14">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-300/10 blur-[150px] rounded-full -mr-48 -mt-48" />
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-200/10 blur-[120px] rounded-full -ml-40 -mb-40" />
                    </div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12 text-white max-w-md text-center space-y-6 z-10"
                    >
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-700 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/30">
                            <Users size={40} className="text-white" />
                        </div>
                        <div className="space-y-2">
                            <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest">Retailer A Panel</span>
                            <h3 className="text-3xl font-black tracking-tight">Grow Your<br />Business Today</h3>
                            <p className="text-white/60 text-sm font-bold">Access AEPS, DMT, BBPS, Travel &amp; 20+ services — all on one powerful platform.</p>
                        </div>
                        {[
                            'AEPS & Micro ATM Services',
                            'BBPS — Utility Bill Payments',
                            'DMT — Money Transfer',
                            'Travel Booking & Insurance',
                            '24×7 Dedicated Support',
                        ].map((f, i) => (
                            <div key={i} className="flex items-center gap-3 text-left bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                                <div className="w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center shrink-0">
                                    <Check size={11} className="text-white" />
                                </div>
                                <span className="text-sm font-bold text-white/80">{f}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </main>

            {/* WhatsApp Float */}
            <a href="https://wa.me/919289309524" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-[100] group">
                <div className="absolute -top-14 right-0 bg-white text-[#1e40af] px-4 py-2 rounded-lg shadow-2xl text-[10px] font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 border border-slate-100 uppercase">
                    Chat with Us
                    <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-white rotate-45 border-r border-b border-slate-100" />
                </div>
                <div className="bg-[#25D366] text-white p-4 rounded-full shadow-[0_10px_30px_rgba(37,211,102,0.5)] hover:bg-[#128C7E] hover:scale-110 active:scale-90 transition-all relative flex items-center justify-center">
                    <MessageSquare size={32} />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold animate-bounce shadow">1</span>
                </div>
            </a>
        </div>
    );
};

export default Login;

