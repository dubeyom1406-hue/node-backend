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
import characterShop from '../assets/character_shop_3d.png';
import distributorChar from '../assets/distributor_character_3d.png';
import superDistributorChar from '../assets/super_distributor_magnet_3d.png';
import { dataService, BACKEND_URL } from '../services/dataService';
import { otpService } from '../services/apiService';
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

    // Update form when global lang changes
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
                        else if (['ADMIN', 'SUPERADMIN', 'NATIONAL_HEADER', 'STATE_HEADER', 'REGIONAL_HEADER', 'EMPLOYEE'].includes(role)) navigate('/admin');
                        else navigate('/dashboard');
                    } else {
                        alert(logRes.message || t('cred_error'));
                    }
                    setIsLoading(false);
                    return;
                } else {
                    // OTP Login Method
                    const mobile = loginForm.username;
                    try {
                        const data = await otpService.sendMobileOtp(mobile);
                        if (data.success) {
                            setTempUser({ username: mobile, mobile: mobile });
                            setLoginStep('otp');
                        } else {
                            alert(data.message || "Failed to send OTP.");
                        }
                    } catch (err) {
                        alert(`Connection error: ${err.message}`);
                    }
                    setIsLoading(false);
                }
            } else if (loginStep === 'otp') {
                // Verify Mobile OTP
                try {
                    const data = await otpService.verifyOtp(tempUser.mobile || tempUser.username, enteredOtp);
                    if (data.success) {
                        const verifiedUser = { ...data.user };
                        if (verifiedUser.role) verifiedUser.role = String(verifiedUser.role).toUpperCase();

                        localStorage.setItem('rupiksha_user', JSON.stringify(verifiedUser));
                        localStorage.setItem('rupiksha_token', data.token);
                        setUser(verifiedUser);
                        setIsLocked(false);

                        const role = verifiedUser.role;
                        if (role === 'DISTRIBUTOR') navigate('/distributor');
                        else if (role === 'SUPER_DISTRIBUTOR' || role === 'SUPERADMIN') navigate('/superadmin');
                        else if (['ADMIN', 'SUPERADMIN', 'NATIONAL_HEADER', 'STATE_HEADER', 'REGIONAL_HEADER', 'EMPLOYEE'].includes(role)) navigate('/admin');
                        else navigate('/dashboard');
                    } else {
                        alert(data.message || "Verification failed.");
                    }
                } catch (error) {
                    alert(`Connection error: ${error.message}`);
                }
                setIsLoading(false);
            }
        } else if (view === 'register') {
            try {
                const res = await dataService.requestRegistration(registerForm);
                if (res.success) {
                    setView('login');
                    alert(`Registration Successful! Please wait for admin approval.`);
                } else {
                    alert(res.message || "Registration Failed");
                }
            } catch (e) {
                alert("Server Connection Failed. Please ensure backend is running.");
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
            <div className="h-screen bg-white flex flex-col items-center justify-center font-['Outfit',sans-serif] relative overflow-hidden p-4 md:p-8">
                {/* ── PREMIUM MESH BACKGROUND ── */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{
                            x: [0, 100, 0],
                            y: [0, -50, 0],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-[120px]"
                    />
                    <motion.div
                        animate={{
                            x: [0, -80, 0],
                            y: [0, 100, 0],
                            scale: [1, 1.3, 1],
                        }}
                        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-indigo-100/30 rounded-full blur-[150px]"
                    />
                    <motion.div
                        animate={{
                            x: [0, 50, 0],
                            y: [0, 80, 0],
                        }}
                        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-amber-100/20 rounded-full blur-[100px]"
                    />

                    {/* Subtle Dot Pattern */}
                    <div className="absolute inset-0 opacity-[0.4] mix-blend-multiply"
                        style={{ backgroundImage: 'radial-gradient(#e2e8f0 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }} />
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full max-w-7xl flex flex-col items-center z-10"
                >
                    {/* Brand Section */}
                    <div className="flex flex-col items-center text-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 100, damping: 15 }}
                        >
                            <img src={logo} alt="Rupiksha" style={{ height: '100px', width: 'auto' }} className="object-contain" />
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-6xl mt-6 md:mt-8 z-10 px-4">
                        {/* Retailer Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{
                                y: -8,
                                backgroundColor: 'rgba(30, 58, 138, 0.98)',
                                borderColor: 'rgba(147, 197, 253, 0.5)',
                            }}
                            className="bg-blue-600/10 backdrop-blur-[40px] rounded-[2.5rem] overflow-hidden border border-blue-200/50 flex flex-col h-auto min-h-[280px] md:min-h-[320px] shadow-[0_40px_100px_rgba(30,58,138,0.06)] transition-all duration-700 group cursor-pointer relative"
                            onClick={() => setPortal('retailer')}
                        >
                            <div className="flex-1 p-4 flex items-center justify-center bg-blue-50/30 group-hover:bg-transparent transition-colors duration-700">
                                <img src={characterShop} alt="Retailer" className="h-24 md:h-28 object-contain group-hover:scale-110 transition-transform duration-1000 drop-shadow-xl" />
                            </div>
                            <div className="p-6 text-center space-y-4 z-10">
                                <h3 className="text-blue-900 group-hover:text-white text-xl font-black uppercase tracking-tighter transition-colors">
                                    Retailer
                                </h3>
                                <motion.button className="w-full bg-blue-600 text-white group-hover:bg-white group-hover:text-blue-700 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2">
                                    Login <ArrowRight size={14} className="group-hover:text-blue-700" />
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* Distributor Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            whileHover={{
                                y: -8,
                                backgroundColor: 'rgba(17, 24, 39, 0.98)',
                                borderColor: 'rgba(99, 102, 241, 0.4)',
                            }}
                            className="bg-slate-900/10 backdrop-blur-[40px] rounded-[2.5rem] overflow-hidden border border-slate-200 flex flex-col h-auto min-h-[280px] md:min-h-[320px] shadow-[0_40px_100px_rgba(0,0,0,0.03)] transition-all duration-700 group cursor-pointer relative"
                            onClick={() => setPortal('distributor')}
                        >
                            <div className="flex-1 p-4 flex items-center justify-center bg-slate-50/50 group-hover:bg-transparent transition-colors duration-700">
                                <img src={distributorChar} alt="Distributor" className="h-24 md:h-28 object-contain group-hover:scale-110 transition-transform duration-1000 drop-shadow-xl" />
                            </div>
                            <div className="p-6 text-center space-y-4 z-10">
                                <h3 className="text-slate-900 group-hover:text-white text-xl font-black uppercase tracking-tighter transition-colors">
                                    Distributor
                                </h3>
                                <motion.button className="w-full bg-slate-900 text-white group-hover:bg-white group-hover:text-slate-900 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2">
                                    Login <ArrowRight size={14} className="group-hover:text-slate-900" />
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* Super Distributor Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            whileHover={{
                                y: -8,
                                backgroundColor: 'rgba(234, 88, 12, 0.98)', // Premium Orange (Orange 600)
                                borderColor: 'rgba(251, 191, 36, 0.6)',
                            }}
                            className="bg-amber-600/10 backdrop-blur-[40px] rounded-[2.5rem] overflow-hidden border border-amber-200/50 flex flex-col h-auto min-h-[280px] md:min-h-[320px] shadow-[0_40px_100px_rgba(234,88,12,0.05)] transition-all duration-700 group cursor-pointer relative"
                            onClick={() => setPortal('distributor')} // Assuming it uses distributor login logic for now
                        >
                            <div className="flex-1 p-4 flex items-center justify-center bg-amber-50/30 group-hover:bg-transparent transition-colors duration-700">
                                <img src={superDistributorChar} alt="Super Distributor" className="h-24 md:h-28 object-contain group-hover:scale-110 transition-transform duration-1000 drop-shadow-xl" />
                            </div>
                            <div className="p-6 text-center space-y-4 z-10">
                                <h3 className="text-amber-900 group-hover:text-white text-xl font-black uppercase tracking-tighter transition-colors">
                                    Super <br /> Distributor
                                </h3>
                                <motion.button className="w-full bg-amber-600 text-white group-hover:bg-white group-hover:text-orange-600 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2">
                                    Access Elite <ArrowRight size={14} className="group-hover:text-orange-600" />
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        );
    }

    // -- Distributor Login Screen ---------------------------------------------
    if (portal === 'distributor') {
        return (
            <div className="h-screen bg-white flex flex-col font-['Outfit',sans-serif] overflow-hidden">
                <header className="bg-white/80 backdrop-blur-md px-6 md:px-12 py-3 flex items-center justify-between shadow-sm sticky top-0 z-50 border-b border-slate-100">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => setPortal('select')}
                    >
                        <img src={logo} alt="RUPIKSHA" style={{ height: '44px', width: 'auto' }} className="object-contain" />
                    </motion.div>
                    <div className="flex items-center gap-3 md:gap-5">
                        <div className="flex items-center bg-slate-100 rounded-full p-1 p-0.5">
                            <button onClick={() => setLang('en')} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${lang === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>EN</button>
                            <button onClick={() => setLang('hi')} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${lang === 'hi' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>HI</button>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => { e.stopPropagation(); setPortal('select'); }}
                            className="bg-amber-50 text-amber-600 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-amber-100 flex items-center gap-1.5 transition-all"
                        >
                            <ChevronLeft size={12} />
                            Distributor
                        </motion.button>
                        <div className="hidden sm:flex flex-col text-[12px] font-bold text-slate-600 tracking-wide border-l border-slate-200 pl-4 space-y-0.5">
                            <span className="flex items-center gap-2 uppercase"><Phone size={14} className="text-blue-600 fill-blue-50" strokeWidth={2.5} /> 0621-4008548 | 7004128310</span>
                            <span className="flex items-center gap-2 lowercase"><Mail size={14} className="text-blue-600 fill-blue-50" strokeWidth={2.5} /> customercare@rupiksha.com</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* Left: Login Form */}
                    <div className="w-full md:w-1/2 lg:w-[40%] p-6 md:p-12 flex flex-col items-center justify-center bg-amber-100 h-full">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full max-w-[420px] space-y-4 md:space-y-6"
                        >
                            <div className="space-y-2">
                                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                                    Welcome to <span className="text-amber-500">Rupiksha</span>
                                </h2>
                            </div>

                            <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                                <div className="bg-blue-600 py-3 flex items-center justify-center">
                                    <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Distributor Login</span>
                                </div>
                                <div className="p-6 md:p-10">
                                    <DistributorLogin />
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Premium Creative Banner */}
                    <div className="hidden md:flex flex-1 bg-slate-50 relative overflow-hidden items-center justify-center p-12">
                        <div className="absolute inset-0">
                            <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-amber-500/5 rounded-full blur-[100px] -mr-40 -mt-40" />
                            <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-orange-500/5 rounded-full blur-[100px] -ml-20 -mb-20" />
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="relative z-10 w-full max-w-lg"
                        >
                            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-amber-900/5 border border-white space-y-4 md:space-y-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                                    <Building2 size={32} className="text-white" />
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-3xl font-black text-slate-900">Scale Your<br />Network Efficiently.</h3>
                                    <p className="text-slate-500 font-medium">Real-time monitoring and advanced reporting for modern distributors.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    {[
                                        'Centralized Member Management',
                                        'Instant Commission Settlement',
                                        'Hierarchical Performance Tracking',
                                        'Dedicated Channel Support'
                                    ].map((f, i) => (
                                        <div key={i} className="flex items-center gap-4 bg-slate-50 rounded-2xl px-5 py-4 border border-slate-100">
                                            <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                                                <Check size={14} className="text-amber-600" />
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </main>
            </div>
        );
    }

    // -- SuperAdmin Login Screen ---------------------------------------------
    if (portal === 'superadmin') {
        return (
            <div className="h-screen bg-white flex flex-col font-['Outfit',sans-serif] overflow-hidden">
                <header className="bg-white/80 backdrop-blur-md px-6 md:px-12 py-3 flex items-center justify-between shadow-sm sticky top-0 z-50 border-b border-slate-100">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => setPortal('select')}
                    >
                        <img src={logo} alt="RUPIKSHA" style={{ height: '44px', width: 'auto' }} className="object-contain" />
                    </motion.div>
                    <div className="flex items-center gap-3 md:gap-5">
                        <div className="flex items-center bg-slate-100 rounded-full p-1 p-0.5">
                            <button onClick={() => setLang('en')} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${lang === 'en' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>EN</button>
                            <button onClick={() => setLang('hi')} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${lang === 'hi' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>HI</button>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => { e.stopPropagation(); setPortal('select'); }}
                            className="bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-100 flex items-center gap-1.5 transition-all"
                        >
                            <ChevronLeft size={12} />
                            Master
                        </motion.button>
                        <div className="hidden sm:flex flex-col text-[12px] font-bold text-slate-600 tracking-wide border-l border-slate-200 pl-4 space-y-0.5">
                            <span className="flex items-center gap-2 uppercase"><Phone size={14} className="text-blue-600 fill-blue-50" strokeWidth={2.5} /> 0621-4008548 | 7004128310</span>
                            <span className="flex items-center gap-2 lowercase"><Mail size={14} className="text-blue-600 fill-blue-50" strokeWidth={2.5} /> customercare@rupiksha.com</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* Left: Login Form */}
                    <div className="w-full md:w-1/2 lg:w-[40%] p-6 md:p-12 flex flex-col items-center justify-center bg-amber-100 h-full">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full max-w-[420px] space-y-4 md:space-y-6"
                        >
                            <div className="space-y-2">
                                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                                    Welcome to <span className="text-indigo-600">Rupiksha</span>
                                </h2>
                            </div>

                            <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-100/50 border border-indigo-50 overflow-hidden">
                                <div className="bg-blue-600 py-3 flex items-center justify-center">
                                    <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Master Login</span>
                                </div>
                                <div className="p-6 md:p-10">
                                    <SuperAdminLogin />
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Creative Banner */}
                    <div className="hidden md:flex flex-1 bg-indigo-900 relative overflow-hidden items-center justify-center p-12">
                        <div className="absolute inset-0">
                            <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-500/20 rounded-full blur-[100px] -mr-40 -mt-40" />
                            <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-purple-500/20 rounded-full blur-[100px] -ml-20 -mb-20" />
                            <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="relative z-10 w-full max-w-lg"
                        >
                            <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 border border-white/20 space-y-4 md:space-y-6 text-white">
                                <div className="w-16 h-16 bg-white flex items-center justify-center rounded-2xl shadow-xl">
                                    <Shield size={32} className="text-indigo-600" />
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-3xl font-black">Ultimate Oversight.<br />Unified Control.</h3>
                                    <p className="text-white/70 font-medium">Empower your administrative team with tools designed for massive scale.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    {[
                                        'Global Transaction Auditing',
                                        'Member Workflow Approvals',
                                        'System-wide Wallet Controls',
                                        'Advanced Security Management'
                                    ].map((f, i) => (
                                        <div key={i} className="flex items-center gap-4 bg-white/5 rounded-2xl px-5 py-4 border border-white/10">
                                            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                                                <Check size={14} className="text-white" />
                                            </div>
                                            <span className="text-sm font-bold">{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </main>
            </div>
        );
    }

    // -- Retailer Portal (Default / portal === 'retailer') ----------------------
    return (
        <div className="h-screen bg-white flex flex-col font-['Outfit',sans-serif] overflow-hidden">
            <header className="bg-white/80 backdrop-blur-md px-6 md:px-12 py-3 flex items-center justify-between shadow-sm sticky top-0 z-50 border-b border-slate-100">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => setPortal('select')}
                >
                    <img src={logo} alt="RUPIKSHA" style={{ height: '44px', width: 'auto' }} className="object-contain" />
                </motion.div>
                <div className="flex items-center gap-3 md:gap-5">
                    <div className="flex items-center bg-slate-100 rounded-full p-1 p-0.5">
                        <button onClick={() => setLang('en')} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${lang === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>EN</button>
                        <button onClick={() => setLang('hi')} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${lang === 'hi' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>HI</button>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => { e.stopPropagation(); setPortal('select'); }}
                        className="bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-100 flex items-center gap-1.5 transition-all"
                    >
                        <ChevronLeft size={12} />
                        Retailer
                    </motion.button>
                    <div className="hidden sm:flex flex-col text-[12px] font-bold text-slate-600 tracking-wide border-l border-slate-200 pl-4 space-y-0.5">
                        <span className="flex items-center gap-2 uppercase"><Phone size={14} className="text-blue-600 fill-blue-50" strokeWidth={2.5} /> 0621-4008548 | 7004128310</span>
                        <span className="flex items-center gap-2 lowercase"><Mail size={14} className="text-blue-600 fill-blue-50" strokeWidth={2.5} /> customercare@rupiksha.com</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Left: Login Form */}
                <div className="w-full md:w-1/2 lg:w-[40%] p-6 md:p-12 flex flex-col items-center justify-center bg-amber-100 h-full">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-[420px] space-y-4 md:space-y-6"
                    >
                        <div className="space-y-2">
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                                Welcome to <span className="text-blue-600">Rupiksha</span>
                            </h2>
                        </div>

                        <div className="bg-white rounded-3xl shadow-2xl shadow-blue-100/50 border border-blue-50 overflow-hidden">
                            <div className="bg-blue-600 py-3 flex items-center justify-center">
                                <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Retailer Login</span>
                            </div>
                            <div className="p-8 md:p-10">
                                <RetailerLogin />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right: Creative Banner */}
                <div className="hidden md:flex flex-1 bg-blue-50 relative overflow-hidden items-center justify-center p-12">
                    <div className="absolute inset-0">
                        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-blue-500/5 rounded-full blur-[100px] -mr-40 -mt-40" />
                        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-blue-400/5 rounded-full blur-[100px] -ml-20 -mb-20" />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="relative z-10 w-full max-w-lg"
                    >
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-blue-900/5 border border-white space-y-4 md:space-y-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Users size={32} className="text-white" />
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-3xl font-black text-slate-900">Empowering Every<br />Merchant Everyday.</h3>
                                <p className="text-slate-500 font-medium">Join 50k+ retailers providing essential digital services across India.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    'AEPS & Aadhaar Withdrawals',
                                    'DMT & Instant Money Transfer',
                                    'Utility Bill Payments (BBPS)',
                                    'Comprehensive Travel Booking'
                                ].map((f, i) => (
                                    <div key={i} className="flex items-center gap-4 bg-slate-50 rounded-2xl px-5 py-4 border border-slate-100">
                                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                            <Check size={14} className="text-blue-600" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">{f}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* WhatsApp Float */}
            <a href="https://wa.me/917004128310" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-[100] group">
                <div className="absolute -top-14 right-0 bg-white text-blue-600 px-4 py-2 rounded-lg shadow-2xl text-[10px] font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 border border-slate-100 uppercase">
                    Chat with Us
                    <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-white rotate-45 border-r border-b border-slate-100" />
                </div>
                <div className="bg-[#25D366] text-white p-4 rounded-full shadow-[0_10px_30px_rgba(37,211,102,0.5)] hover:bg-[#128C7E] hover:scale-110 active:scale-90 transition-all relative flex items-center justify-center">
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.134.298-.348.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.446 4.432-9.877 9.888-9.877 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.446-4.435 9.878-9.89 9.878m8.391-18.332A11.944 11.944 0 0012.05 0C5.41 0 .011 5.399.007 12.04c0 2.123.554 4.197 1.608 6.022L0 24l6.117-1.605a11.947 11.947 0 005.933 1.568h.005c6.637 0 12.036-5.402 12.041-12.042a11.95 11.95 0 00-3.645-8.522" />
                    </svg>
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold animate-bounce shadow">1</span>
                </div>
            </a>
        </div>
    );
};

export default Login;

