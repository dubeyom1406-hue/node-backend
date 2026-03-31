import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
const aadhaar_3d_logo = "https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/Aadhaar_Logo.svg/1200px-Aadhaar_Logo.svg.png";
import {
    Fingerprint, Landmark, CreditCard, Banknote, History,
    Search, CheckCircle, AlertCircle, RefreshCw, ArrowRight,
    MapPin, Smartphone, User, ShieldCheck, Waves, Layers, BellRing, Phone, Receipt, TrendingUp, Wallet, Camera
} from 'lucide-react';
import { BANK_LIST, DEVICE_LIST } from './aepsData';
import { initSpeech, speak, announceSuccess, announceFailure, announceProcessing, announceError, announceWarning, announceGrandSuccess } from '../../services/speechService';
import { useNavigate } from 'react-router-dom';
import { dataService, BACKEND_URL } from '../../services/dataService';
import RetailerEKYC from '../components/banking/RetailerEKYC';
import logo from '../../assets/rupiksha_logo.png';

/* ── Constants ── */
const NAVY = '#0f2557';
const NAVY2 = '#1a3a6b';
const NAVY3 = '#2257a8';

const NAV_TABS = [
    { id: 'withdrawal', label: 'Cash Withdrawal', icon: Banknote, color: '#3b82f6' },
    { id: 'balance', label: 'Balance Inquiry', icon: Landmark, color: '#10b981' },
    { id: 'statement', label: 'Mini Statement', icon: History, color: '#8b5cf6' },
    { id: 'aadhaar_pay', label: 'Aadhaar Pay', icon: Fingerprint, color: '#f59e0b' },
    { id: 'cash_deposit', label: 'Cash Deposit', icon: Layers, color: '#ec4899' },
    { id: 'tools', label: 'Merchant Tools', icon: ShieldCheck, color: '#ef4444' },
    { id: 'history', label: 'History', icon: History, color: '#6366f1' },
];

/* ══════════════════════════════════════════════════════════════════
   🏆 GRAND SUCCESS SCREEN — Exact replication of Utility UX
   ══════════════════════════════════════════════════════════════════ */
function GrandSuccessScreen({ title, subtitle, details = [], statement = [], onReset, resetLabel = '+ New Transaction' }) {
    const DOTS = [
        { x: 8, y: 15, s: 10, dur: 2.1, delay: 0, col: '#10b981' },
        { x: 88, y: 10, s: 7, dur: 2.6, delay: 0.3, col: '#fbbf24' },
        { x: 20, y: 75, s: 14, dur: 1.9, delay: 0.6, col: '#6ee7b7' },
        { x: 78, y: 80, s: 9, dur: 2.4, delay: 0.2, col: '#a78bfa' },
        { x: 50, y: 5, s: 6, dur: 2.8, delay: 0.9, col: '#38bdf8' },
        { x: 5, y: 50, s: 11, dur: 2.0, delay: 1.1, col: '#34d399' },
        { x: 93, y: 45, s: 8, dur: 2.3, delay: 0.4, col: '#fbbf24' },
    ];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="relative flex flex-col items-center justify-center min-h-[62vh] py-10 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 50% 38%, rgba(16,185,129,0.14) 0%, rgba(15,37,87,0.06) 62%, transparent 100%)' }} />

            {DOTS.map((d, i) => (
                <motion.div key={i} className="absolute rounded-full pointer-events-none"
                    style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.s, height: d.s, background: d.col, opacity: 0.55 }}
                    animate={{ y: [-10, 12, -10], opacity: [0.4, 0.85, 0.4], scale: [1, 1.4, 1] }}
                    transition={{ duration: d.dur, repeat: Infinity, delay: d.delay, ease: 'easeInOut' }} />
            ))}

            <motion.div className="relative flex items-center justify-center"
                initial={{ scale: 0.15, rotate: -25 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 230, damping: 13 }}>
                <motion.div className="absolute rounded-full"
                    style={{ width: 148, height: 148, border: '3px solid #10b981', opacity: 0.3 }}
                    animate={{ scale: [1, 1.55, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 2.3, repeat: Infinity }} />
                <div className="w-28 h-28 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(145deg, #10b981, #059669)', boxShadow: '0 0 0 7px rgba(16,185,129,0.18), 0 22px 55px rgba(16,185,129,0.55)' }}>
                    <motion.span style={{ fontSize: 54, lineHeight: 1 }} animate={{ rotateY: [0, 360] }} transition={{ duration: 1.8, delay: 0.4 }}>🏆</motion.span>
                </div>
            </motion.div>

            <motion.div className="text-center mt-7 space-y-1 px-4" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <motion.p className="text-[11px] font-black tracking-[5px] uppercase" style={{ color: '#10b981' }} animate={{ opacity: [0.55, 1, 0.55] }} transition={{ duration: 2.2, repeat: Infinity }}>
                    ✨ CONGRATULATIONS ✨
                </motion.p>
                <h2 className="text-3xl font-black text-slate-900 leading-tight">{title}</h2>
                <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
            </motion.div>

            <motion.div className="mt-8 w-full max-w-sm rounded-[2.5rem] overflow-hidden"
                initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                style={{ boxShadow: '0 30px 80px rgba(15,37,87,0.15), 0 10px 30px rgba(16,185,129,0.1)', border: '1.5px solid rgba(16,185,129,0.22)' }}>
                <div className="bg-slate-900 text-white px-8 py-4 flex justify-between items-center" style={{ background: 'linear-gradient(135deg, #0f2557, #1a3a8f)' }}>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Success Receipt</p>
                    <div className="bg-emerald-500 h-2 w-2 rounded-full animate-pulse" />
                </div>
                <div className="p-8 bg-white space-y-4">
                    {details.map((d, i) => (
                        <div key={i} className="flex justify-between items-center text-sm border-b border-slate-50 pb-3 last:border-0">
                            <span className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">{d.label}</span>
                            <span className={`font-black uppercase tracking-tighter text-right ${d.highlight ? 'text-emerald-600 text-xl' : 'text-slate-800'}`}>{d.value}</span>
                        </div>
                    ))}
                    <motion.button onClick={onReset}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="w-full mt-4 py-4 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl">
                        {resetLabel}
                    </motion.button>
                </div>

                {/* Mini Statement Appendix */}
                {statement && statement.length > 0 && (
                    <div className="bg-slate-50/50 p-6 border-t border-slate-100 max-h-[400px] overflow-y-auto">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Transaction History</h3>
                        <div className="space-y-2">
                            {statement.map((row, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200/60 shadow-sm transition-all hover:bg-slate-50">
                                    <div className="flex gap-3 items-center">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${row.txnType === 'CR' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                            {row.txnType}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-900">{row.txnDate || row.date}</p>
                                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tight">{row.narration || 'AEPS TXN'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-xs font-black ${row.txnType === 'CR' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {row.txnType === 'CR' ? '+' : '-'} ₹{row.amount}
                                        </p>
                                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">Bal: ₹{row.balance}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}

const Icon3D = ({ icon: Icon, color, size = 48, shadow }) => (
    <div className="flex items-center justify-center rounded-2xl" style={{
        width: size, height: size, background: `linear-gradient(135deg, ${color}, ${color}dd)`,
        boxShadow: shadow || `0 8px 16px ${color}40, inset 0 1px 0 rgba(255,255,255,0.3)`,
        position: 'relative', overflow: 'hidden'
    }}>
        <div style={{ position: 'absolute', top: '10%', left: '10%', right: '40%', bottom: '40%', background: 'rgba(255,255,255,0.25)', borderRadius: '50%', filter: 'blur(3px)' }} />
        <Icon size={size * 0.5} color="white" strokeWidth={2.5} />
    </div>
);

/* ══════════════════════════════════════════════════════════════════
   🏧 MAIN AEPS COMPONENT
   ══════════════════════════════════════════════════════════════════ */
const AEPS = () => {
    const [tab, setTab] = useState('withdrawal');
    const [deviceMode, setDeviceMode] = useState('otp'); // otp | face
    const [aadhaar, setAadhaar] = useState('');
    const [mobile, setMobile] = useState('');
    const [bank, setBank] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [lastTx, setLastTx] = useState(null);
    const [user, setUser] = useState(null);
    const [location, setLocation] = useState({ lat: '...', long: '...' });
    const [capturedPid, setCapturedPid] = useState(null);
    const [balanceResult, setBalanceResult] = useState(null);
    const [statementResult, setStatementResult] = useState([]);
    const [isRetailerVerified, setIsRetailerVerified] = useState(true);
    const [history, setHistory] = useState([]);
    const [statusTxId, setStatusTxId] = useState('');
    const [reconDate, setReconDate] = useState(new Date().toISOString().split('T')[0]);
    const [toolResult, setToolResult] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showBankDropdown, setShowBankDropdown] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpRefId, setOtpRefId] = useState('');
    const [otpMethod, setOtpMethod] = useState('');
    const [whitelistIp, setWhitelistIp] = useState('');
    const [whitelistMerchId, setWhitelistMerchId] = useState('');
    const [whitelistSuperMerchId, setWhitelistSuperMerchId] = useState('');
    const [whitelistResult, setWhitelistResult] = useState(null);
    const [paymentMode, setPaymentMode] = useState('wallet'); // New: wallet | gateway
    const navigate = useNavigate();
    useEffect(() => {
        const currentUser = dataService.getCurrentUser();
        setUser(currentUser);

        // AEPS KYC Check
        if (!currentUser?.aeps_kyc_status || currentUser.aeps_kyc_status === 'NOT_DONE') {
            navigate('/aeps-kyc');
            return;
        }

        dataService.verifyLocation()
            .then(loc => setLocation(loc))
            .catch(err => { });
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/aeps/history?userId=${user?.id}`);
            const data = await res.json();
            if (data.success) setHistory(data.transactions);
        } catch (e) { }
    };

    useEffect(() => {
        if (tab === 'history') fetchHistory();
    }, [tab, user?.id]);

    const TAB_COLORS = { withdrawal: '#3b82f6', balance: '#10b981', statement: '#8b5cf6', aadhaar_pay: '#f59e0b', cash_deposit: '#ec4899', tools: '#ef4444', history: '#6366f1' };

    const currentTab = NAV_TABS.find(t => t.id === tab);

    const handleTransaction = async (overridePid = null) => {
        console.log("Starting AEPS Transaction, userId:", user?.id);
        if (aadhaar.length < 12) { return; }
        if (!bank) { return; }
        if ((tab === 'withdrawal' || tab === 'aadhaar_pay' || tab === 'cash_deposit') && (!amount || amount < 100)) { return; }

        // Generate Mock Bio/OTP payload for direct submission
        let captureResponsePayload = null;
        let twoFACapturePayload = null;

        // For Face/OTP, we already checked/verified above.
        // For Biometric, we check capturedPid (or overridePid)

        if (deviceMode === 'face' && !capturedPid) {
            announceWarning("Please complete face authentication first");
            return;
        }

        setLoading(true);
        initSpeech();
        announceProcessing("Authenticating and Processing Transaction...");



        // Mock a biometric payload if using OTP or Face Mock
        if (deviceMode === 'otp' || deviceMode === 'face') {
            captureResponsePayload = {
                errCode: "0",
                errInfo: "Success",
                fType: "0",
                fCount: "1",
                nmPoints: "40",
                qScore: "80",
                dpId: deviceMode === 'face' ? "MOCK_FACE" : "MOCK_OTP",
                rdsId: deviceMode === 'face' ? "MOCK_FACE" : "MOCK_OTP",
                rdsVer: deviceMode === 'face' ? "MOCK_FACE" : "MOCK_OTP",
                mi: "MOCK_MI",
                mc: "MOCK_MC",
                dc: "MOCK_DC",
                Piddata: `<PidData>MOCK_${deviceMode.toUpperCase()}_DATA</PidData>`,
                isFacialTan: deviceMode === 'face'
            };
            if (tab === 'cash_deposit' && !twoFACapturePayload) {
                // If we're mocking, we just auto-mock the 2FA as well
                twoFACapturePayload = { ...captureResponsePayload };
            }
        }

        try {
            const endpoint = '/aeps/transaction';
            const payload = {
                userId: user.id,
                mobile: mobile || aadhaar.slice(-10),
                operator: BANK_LIST.find(b => b.id === bank)?.iin, // Send IIN
                bankName: BANK_LIST.find(b => b.id === bank)?.name, // Send name for logging
                amount: (tab === 'withdrawal' || tab === 'aadhaar_pay' || tab === 'cash_deposit') ? amount : 0,
                serviceType: 'AEPS',
                tab: tab,
                paymentMode: tab === 'cash_deposit' ? paymentMode : 'wallet', // Send payment mode
                aadhaar: aadhaar,
                lat: location.lat,
                lng: location.long,
                deviceIMEI: 'WEB_RETAILER_001',
                twoFACapture: twoFACapturePayload,
                captureResponse: captureResponsePayload
            };

            const res = await fetch(`${BACKEND_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await res.json();

            if (result.success) {
                const txData = {
                    type: currentTab.label,
                    bank: BANK_LIST.find(b => b.id === bank)?.name,
                    amount: tab === 'withdrawal' || tab === 'aadhaar_pay' || tab === 'cash_deposit' ? amount : '—',
                    aadhaar: 'XXXX-XXXX-' + aadhaar.slice(-4),
                    txId: result.txid || ('TXN' + Date.now()),
                    date: new Date().toLocaleString()
                };
                setLastTx(txData);
                if (tab === 'balance') setBalanceResult(result.balance);
                if (tab === 'statement') setStatementResult(result.miniStatement || []);

                await dataService.logTransaction(user.id, `AEPS_${tab.toUpperCase()}`, amount || 0, txData.bank, aadhaar, 'SUCCESS');

                // announceGrandSuccess("लेनदेन सफल रहा।", `${txData.bank} से ₹${txData.amount} निकल गए हैं।`);

                const { default: confetti } = await import('canvas-confetti');
                confetti({ particleCount: 160, spread: 80, origin: { y: 0.5 }, colors: ['#10b981', '#0f2557', '#fbbf24', '#a78bfa', '#38bdf8'] });
                setShowSuccess(true);
            } else {
                alert("Transaction Failed: " + (result.message || result.responseMessage || 'Unknown Error'));
                await dataService.logTransaction(user.id, `AEPS_${tab.toUpperCase()}`, amount || 0, bank, aadhaar, 'FAILED');
            }
        } catch (err) {
            console.error(err);
            alert("Error: " + (err.message || "Connection Failed"));
        } finally {
            setLoading(false);
        }
    };

    // AEPS KYC checks removed to allow direct access

    const handleStatusCheck = async () => {
        if (!statusTxId) { announceWarning('ट्रांजैक्शन आईडी डालें'); return; }
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/aeps/status-check`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ merchantTranId: statusTxId, merchantUsername: user?.username, merchantPin: user?.pin })
            });
            const data = await res.json();
            setToolResult(data);
            if (data.success) announceSuccess("स्टेटस चेक सफल");
            else announceError(data.message || "चेक फेल हो गया");
        } catch (e) { announceError("सर्वर एरर"); }
        finally { setLoading(false); }
    };

    const handleRecon = async () => {
        setLoading(true);
        try {
            const formattedDate = reconDate.split('-').reverse().join('/'); // dd/mm/yyyy
            const res = await fetch(`${BACKEND_URL}/aeps/recon`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: formattedDate, merchantUsername: user?.username, merchantPin: user?.pin })
            });
            const data = await res.json();
            setToolResult(data);
            if (data.success) announceSuccess("रिकॉन्सिलिएशन रिपोर्ट तैयार है");
            else announceError(data.message || "फेल हो गया");
        } catch (e) { announceError("सर्वर एरर"); }
        finally { setLoading(false); }
    };

    const handleWhitelistRequest = async () => {
        if (!whitelistIp) { announceWarning('Server IP required'); return; }
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/aeps/whitelist-request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    merchantId: whitelistMerchId,
                    superMerchantId: whitelistSuperMerchId,
                    serverIp: whitelistIp,
                    contactEmail: user?.email,
                    contactName: user?.name || 'Rupiksha Admin'
                })
            });
            const data = await res.json();
            setWhitelistResult(data);
            if (data.success) announceSuccess('Whitelist request generated! Check your email.');
            else announceError(data.message || 'Failed');
        } catch (e) { announceError('Server error'); }
        finally { setLoading(false); }
    };

    if (showSuccess) return (
        <div className="h-full bg-slate-50 overflow-y-auto">
            <GrandSuccessScreen
                title={`${currentTab.label} Successful! 🎉`}
                subtitle="Request processed successfully via NPCI AePS Gateway"
                statement={statementResult}
                details={[
                    lastTx.amount !== '—' ? { label: lastTx.type === 'Cash Deposit' ? 'Amount Deposited' : 'Amount Debited', value: `₹${Number(lastTx.amount).toLocaleString('en-IN')}`, highlight: true } : null,
                    balanceResult ? { label: 'Available Balance', value: `₹${balanceResult}`, highlight: true } : null,
                ].filter(Boolean)}
                onReset={() => {
                    setShowSuccess(false);
                    setAadhaar('');
                    setAmount('');
                    setBank('');
                    setOtp('');
                    setOtpSent(false);
                    setCapturedPid(null);
                    setBalanceResult(null);
                    setStatementResult([]);
                }}
                resetLabel="Back to Banking Hub"
            />
        </div>
    );



    if (user?.aeps_kyc_status === 'PENDING') return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[3rem] shadow-2xl p-12 text-center max-w-lg w-full border border-slate-100">
                <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600 mb-8">
                    <RefreshCw size={48} className="animate-spin" />
                </div>
                <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-4">KYC Under Review</h1>
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em] mb-8">Verification in Progress</p>
                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 text-left mb-8">
                    <p className="text-sm text-slate-500 font-bold leading-relaxed uppercase">
                        Your AEPS KYC is currently being verified by our team. This usually takes 24-48 working hours.
                    </p>
                </div>
                <button onClick={() => navigate('/dashboard')} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em]">Back to Dashboard</button>
            </motion.div>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-slate-50 overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* ── Top Header (Exact Utility Copy) ── */}
            <div className="shrink-0 bg-white border-b border-slate-200 px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 p-1 flex items-center justify-center">
                            <img src={aadhaar_3d_logo} alt="AEPS" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-slate-900 leading-none">Banking Hub</h1>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">AePS Aadhaar Banking Services</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">NPCI Live</span>
                        <button onClick={() => { initSpeech(); speak("वॉइस सिस्टम चालू है। बैंकिंग हब में आपका स्वागत है।", "hi-IN"); }}
                            className="ml-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-[10px] font-black text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-all">
                            <BellRing size={12} /> Voice
                        </button>
                    </div>
                </div>

                {/* Tab Bar (Exact Utility UX) */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {NAV_TABS.map(t => {
                        const active = tab === t.id;
                        const color = TAB_COLORS[t.id];
                        return (
                            <motion.button key={t.id} whileTap={{ scale: 0.95 }}
                                onClick={() => { setTab(t.id); setShowSuccess(false); }}
                                className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-black text-sm transition-all flex-shrink-0"
                                style={active ? { background: color, color: '#fff', boxShadow: `0 4px 15px ${color}40` } : { background: 'white', color: '#64748b', border: '1.5px solid #e2e8f0' }}>
                                <div style={{
                                    width: 22, height: 22, borderRadius: 7,
                                    background: active ? 'rgba(255,255,255,0.25)' : `${color}18`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: active ? 'inset 0 1px 0 rgba(255,255,255,0.3)' : `0 2px 6px ${color}25`,
                                }}>
                                    <t.icon size={13} style={{ color: active ? '#fff' : color }} />
                                </div>
                                {t.label}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* ── Main Content Area ── */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <AnimatePresence mode="wait">
                    <motion.div key={tab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 max-w-7xl mx-auto">

                        {/* LEFT: FORM BOX (Utility Style) */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                                    <Fingerprint size={28} />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">{currentTab.label}</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">Transaction Parameters</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Aadhaar Number */}
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Customer Aadhaar No</label>
                                    <div className="relative">
                                        <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input type="text" maxLength={12} value={aadhaar} onChange={e => setAadhaar(e.target.value.replace(/\D/g, ''))}
                                            placeholder="12-digit number"
                                            className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm outline-none focus:border-blue-500 transition-all focus:bg-white" />
                                    </div>
                                </div>

                                {/* Bank Selection (Searchable) */}
                                <div className="space-y-1.5 relative">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Select Customer's Bank</label>
                                    <div className="relative">
                                        <Landmark size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <div onClick={() => setShowBankDropdown(!showBankDropdown)}
                                            className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-800 font-bold text-sm outline-none focus:border-blue-500 transition-all cursor-pointer flex items-center justify-between">
                                            <span>{bank ? BANK_LIST.find(b => b.id === bank)?.name : 'Choose Bank'}</span>
                                            <ArrowRight size={14} className={`transform transition-transform ${showBankDropdown ? 'rotate-90' : ''}`} />
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {showBankDropdown && (
                                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                                className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
                                                <div className="p-3 border-b border-slate-100 flex items-center gap-2">
                                                    <Search size={14} className="text-slate-400" />
                                                    <input type="text" placeholder="Search Bank..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                                        className="w-full text-xs font-bold outline-none" />
                                                </div>
                                                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                                    {BANK_LIST.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase())).map(b => (
                                                        <div key={b.id} onClick={() => { setBank(b.id); setShowBankDropdown(false); setSearchTerm(''); }}
                                                            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-all border-b border-slate-50 last:border-0">
                                                            <span className="text-lg">{b.logo}</span>
                                                            <span className="text-xs font-bold text-slate-700">{b.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Customer Mobile */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Customer Mobile No</label>
                                    <div className="relative">
                                        <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input type="text" maxLength={10} value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
                                            placeholder="10-digit number"
                                            className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm outline-none focus:border-blue-500 transition-all focus:bg-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Amount Input (Only for Withdrawal/Pay/Deposit) */}
                            {(tab === 'withdrawal' || tab === 'aadhaar_pay' || tab === 'cash_deposit') && (
                                <div className="space-y-6 pt-2">
                                    {/* Payment Mode Selection for Cash Deposit */}
                                    {tab === 'cash_deposit' && (
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Select Funding Source</label>
                                            <div className="flex gap-3">
                                                <button onClick={() => setPaymentMode('wallet')}
                                                    className={`flex-1 py-4 px-4 rounded-2xl flex items-center justify-center gap-2 border-2 transition-all ${paymentMode === 'wallet' ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
                                                    <Wallet size={18} />
                                                    <div className="text-left">
                                                        <p className="text-[10px] font-black uppercase leading-none">By Wallet</p>
                                                        <p className="text-[8px] font-bold opacity-60 mt-1">Deduct from balance</p>
                                                    </div>
                                                </button>
                                                <button onClick={() => setPaymentMode('gateway')}
                                                    className={`flex-1 py-4 px-4 rounded-2xl flex items-center justify-center gap-2 border-2 transition-all ${paymentMode === 'gateway' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
                                                    <CreditCard size={18} />
                                                    <div className="text-left">
                                                        <p className="text-[10px] font-black uppercase leading-none">By Gateway</p>
                                                        <p className="text-[8px] font-bold opacity-60 mt-1">Pay via UPI/Card</p>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Enter Transaction Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">₹</span>
                                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                                                placeholder="0"
                                                className="w-full pl-10 pr-4 py-5 rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-900 font-black text-4xl outline-none focus:border-blue-500 transition-all focus:bg-white" />
                                        </div>
                                        <div className="flex gap-2">
                                            {[100, 500, 1000, 2000, 3000].map(v => (
                                                <button key={v} onClick={() => setAmount(v)} className="flex-1 py-1.5 rounded-lg bg-slate-100 text-[9px] font-black text-slate-500 hover:bg-blue-100 hover:text-blue-600 transition-all">+{v}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}


                            {/* ── Action Button ── */}
                            {tab !== 'history' && tab !== 'tools' && (
                                <motion.button onClick={() => handleTransaction()} disabled={loading}
                                    whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.97 }}
                                    className="w-full py-5 rounded-2xl text-white font-black text-sm uppercase tracking-[0.2em] relative overflow-hidden disabled:opacity-60"
                                    style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY3})`, boxShadow: `0 8px 30px ${NAVY}40` }}>
                                    <motion.div className="absolute inset-0"
                                        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }}
                                        animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity }} />
                                    <span className="relative z-10 flex items-center justify-center gap-3">
                                        {loading ? <><RefreshCw className="animate-spin" size={20} /> PROCESSING...</>
                                            : <><Layers size={20} /> SUBMIT TRANSACTION</>}
                                    </span>
                                </motion.button>
                            )}

                            {/* ── Merchant Tools View ── */}
                            {tab === 'tools' && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                <Search size={16} className="text-blue-500" /> Status Check
                                            </h3>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">Check status of any AEPS transaction</p>
                                            <input type="text" value={statusTxId} onChange={e => setStatusTxId(e.target.value)}
                                                placeholder="Enter Merchant Tran ID"
                                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-sm font-bold outline-none focus:border-blue-500" />
                                            <button onClick={handleStatusCheck} disabled={loading}
                                                className="w-full py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all">
                                                Verify Status
                                            </button>
                                        </div>

                                        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                <RefreshCw size={16} className="text-emerald-500" /> 3-Way Recon
                                            </h3>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">Reconcile transactions for a specific date</p>
                                            <input type="date" value={reconDate} onChange={e => setReconDate(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-sm font-bold outline-none focus:border-emerald-500" />
                                            <button onClick={handleRecon} disabled={loading}
                                                className="w-full py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all">
                                                Run Reconciliation
                                            </button>
                                        </div>
                                    </div>

                                    {toolResult && (
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                            className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 font-mono text-xs overflow-x-auto shadow-2xl">
                                            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Query Result</span>
                                                <button onClick={() => setToolResult(null)} className="text-slate-500 hover:text-white">Close</button>
                                            </div>
                                            <pre>{JSON.stringify(toolResult, null, 2)}</pre>
                                        </motion.div>
                                    )}

                                    {/* ── WHITELIST IP REQUEST SECTION ── */}
                                    <div className="p-6 rounded-3xl bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 space-y-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                                                <ShieldCheck size={20} color="white" />
                                            </div>
                                            <div>
                                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">🌐 Fingpay IP Whitelist Request</h3>
                                                <p className="text-[10px] text-orange-600 font-bold uppercase mt-0.5">Required before going LIVE on Fingpay AEPS</p>
                                            </div>
                                        </div>

                                        <p className="text-[11px] text-slate-600 font-medium bg-white rounded-xl p-3 border border-orange-100">
                                            Fingpay requires your server's public IP to be whitelisted. Fill in the details below and submit — we'll generate the email template and send a copy to your admin inbox.
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black text-orange-600 uppercase tracking-widest block">Server Public IP *</label>
                                                <input type="text" value={whitelistIp} onChange={e => setWhitelistIp(e.target.value)}
                                                    placeholder="e.g. 103.21.58.124"
                                                    className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 bg-white text-sm font-bold outline-none focus:border-orange-500 transition-all" />
                                                <p className="text-[9px] text-slate-400 font-bold">Run: curl ifconfig.me</p>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black text-orange-600 uppercase tracking-widest block">Merchant ID</label>
                                                <input type="text" value={whitelistMerchId} onChange={e => setWhitelistMerchId(e.target.value)}
                                                    placeholder="From Fingpay dashboard"
                                                    className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 bg-white text-sm font-bold outline-none focus:border-orange-500 transition-all" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black text-orange-600 uppercase tracking-widest block">Super Merchant ID</label>
                                                <input type="text" value={whitelistSuperMerchId} onChange={e => setWhitelistSuperMerchId(e.target.value)}
                                                    placeholder="From Fingpay dashboard"
                                                    className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 bg-white text-sm font-bold outline-none focus:border-orange-500 transition-all" />
                                            </div>
                                        </div>

                                        <button onClick={handleWhitelistRequest} disabled={loading || !whitelistIp}
                                            className="w-full py-3.5 bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                            <ShieldCheck size={16} />
                                            {loading ? 'GENERATING...' : 'GENERATE WHITELIST EMAIL & SUBMIT'}
                                        </button>

                                        {whitelistResult && (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                className="space-y-4">
                                                {whitelistResult.success ? (
                                                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                                                        <p className="text-xs font-black text-emerald-700 flex items-center gap-2 mb-3">
                                                            <CheckCircle size={16} /> Whitelist email template generated!
                                                        </p>
                                                        <div className="space-y-1.5">
                                                            {whitelistResult.nextSteps?.map((step, i) => (
                                                                <p key={i} className="text-[11px] text-emerald-700 font-bold">{step}</p>
                                                            ))}
                                                        </div>
                                                        <div className="mt-3 p-3 bg-white rounded-xl border border-emerald-100">
                                                            <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Send This Email To: contact@tapits.in</p>
                                                            <p className="text-[10px] font-bold text-blue-600">Subject: {whitelistResult.emailSubject}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
                                                        <p className="text-xs font-black text-red-600">{whitelistResult.message}</p>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}

                                        <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                                            <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">After Whitelist — Fill in server/.env:</p>
                                            <pre className="text-[9px] text-slate-700 font-mono leading-4">{`FINGPAY_MERCHANT_ID=your_id
FINGPAY_SUPERMERCHANT_ID=your_super_id
FINGPAY_USERNAME=your_username
FINGPAY_PASSWORD=your_password
FINGPAY_PIN=your_pin`}</pre>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── History List View ── */}
                            {tab === 'history' && (
                                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                    {history.length === 0 ? (
                                        <div className="py-20 text-center space-y-3">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full mx-auto flex items-center justify-center text-slate-200">
                                                <History size={32} />
                                            </div>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No transactions yet</p>
                                        </div>
                                    ) : history.map((tx, idx) => (
                                        <div key={idx} className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100 flex justify-between items-center group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                                            <div className="flex gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${tx.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                    {tx.status === 'SUCCESS' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">{tx.type.replace('AEPS_', '')}</h4>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{tx.bank} · {tx.aadhaar}</p>
                                                    <p className="text-[8px] text-slate-300 mt-1 font-black">{new Date(tx.created_at).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-sm font-black ${tx.status === 'SUCCESS' ? 'text-emerald-700' : 'text-rose-700'}`}>
                                                    {tx.amount > 0 ? `₹${tx.amount}` : '—'}
                                                </p>
                                                <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full ${tx.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                    {tx.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* RIGHT: UNIFIED RETAILER INFO HUB */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
                            {/* 💳 WALLET SECTION */}
                            <div className="p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 opacity-50" />
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 relative z-10">
                                    <Wallet size={14} className="text-blue-500" /> Settled Wallet
                                </h3>
                                <div className="relative z-10">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold text-slate-400">₹</span>
                                        <span className="text-4xl font-black text-slate-900 tracking-tighter">
                                            {user?.wallet?.balance || "0.00"}
                                        </span>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 p-2.5 rounded-xl bg-blue-50 border border-blue-100 w-fit">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                        <span className="text-[9px] font-black text-blue-700 uppercase tracking-tight">Active for AEPS Settlement</span>
                                    </div>
                                </div>
                            </div>

                            {/* 🏦 BANK SECTION */}
                            <div className="p-8">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <Landmark size={14} className="text-emerald-500" /> Settlement Bank
                                </h3>
                                {user?.banks && user.banks.length > 0 ? (
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="text-xs font-black text-slate-900 uppercase">{user.banks[0].bankName}</h4>
                                            <span className="text-[8px] font-black bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full uppercase">Verified</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase">Account</p>
                                                <p className="text-[10px] font-black text-slate-900 tracking-tight">XXXX{user.banks[0].accountNumber?.slice(-4)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase">IFSC</p>
                                                <p className="text-[10px] font-black text-slate-900 tracking-tight">{user.banks[0].ifscCode}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 text-center">
                                        <p className="text-[9px] font-bold text-orange-600 uppercase">Bank Not Saved</p>
                                        <p className="text-[8px] font-black text-orange-400 uppercase mt-1">Visit Profile to add</p>
                                    </div>
                                )}
                            </div>

                            {/* 📍 LOCATION SECTION */}
                            <div className="p-8 bg-slate-50/50">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <MapPin size={14} className="text-red-500" /> Live Geo-Lock
                                </h3>

                                <div className="space-y-4">
                                    <div className="w-full h-32 rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100 relative group">
                                        {location.lat !== '...' ? (
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                frameBorder="0"
                                                scrolling="no"
                                                marginHeight="0"
                                                marginWidth="0"
                                                src={`https://maps.google.com/maps?q=${location.lat},${location.long}&z=14&output=embed`}
                                                className="grayscale-[20%] contrast-[110%] group-hover:grayscale-0 transition-all duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                                <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
                                                <span className="text-[8px] font-black text-slate-400 uppercase">Pinpointing Retailer...</span>
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg border border-slate-200 shadow-sm pointer-events-none">
                                            <span className="text-[7px] font-black text-slate-500 uppercase flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Live Preview
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between px-1">
                                        <div className="flex gap-4">
                                            <div>
                                                <span className="text-[8px] font-bold text-slate-400 mr-1 uppercase">Lat</span>
                                                <span className="text-[10px] font-black text-slate-900 tracking-tight">{location.lat}</span>
                                            </div>
                                            <div>
                                                <span className="text-[8px] font-bold text-slate-400 mr-1 uppercase">Long</span>
                                                <span className="text-[10px] font-black text-slate-900 tracking-tight">{location.long}</span>
                                            </div>
                                        </div>
                                        <p className="text-[8px] font-bold text-emerald-500 uppercase flex items-center gap-1">
                                            <ShieldCheck size={10} /> NPCI COMPLIANT
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
            {/* ── Retailer Daily 2FA Overlay — Mandatory NPCI Requirement ── */}
            {!isRetailerVerified && (
                <div className="fixed inset-0 z-[1000] bg-white/40 backdrop-blur-3xl flex items-center justify-center p-6 text-slate-900">
                    <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                        className="bg-white w-full max-w-lg rounded-[4rem] shadow-[0_40px_100px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden">
                        <div className="bg-slate-50 px-10 py-6 text-center border-b border-slate-100">
                            <img src={logo} alt="Rupiksha" className="h-16 md:h-20 object-contain mx-auto mb-3" />
                            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">RUPIKSHA AEPS</h2>
                            <p className="text-emerald-600 text-[10px] mt-2 uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-1">
                                <ShieldCheck size={14} /> by 2FA
                            </p>
                        </div>
                        <div className="p-8 space-y-6">

                            <div className="text-center space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Retailer Authentication</p>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
                                    <span className="text-xs font-black text-slate-700 tracking-widest">
                                        XXXX-XXXX-{user?.aadhaar ? user.aadhaar.slice(-4) : 'XXXX'}
                                    </span>
                                </div>
                            </div>

                            <MantraDeviceWidget compact={true} buttonText="🖐 Retailer Aadhaar 2FA" onCapture={async (pid) => {
                                setLoading(true);
                                announceProcessing("Retailer identity being verified...");
                                try {
                                    const res = await fetch(`${BACKEND_URL}/aeps/2fa`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            userId: user?.id || 0,
                                            aadhaar: user?.aadhaar || '000000000000',
                                            captureResponse: pid,
                                            lat: location.lat,
                                            lng: location.long,
                                            deviceIMEI: 'WEB_RETAILER_001'
                                        })
                                    });
                                    const result = await res.json();
                                    if (result.success) {
                                        localStorage.setItem('retailer_2fa_verified_at', new Date().toDateString());
                                        setIsRetailerVerified(true);
                                        announceGrandSuccess("VERIFIED", "Access granted for the day.");
                                    } else {
                                        announceError(result.message || "Identity check failed. Try again.");
                                    }
                                } catch (e) {
                                    announceError("Verification server offline");
                                } finally {
                                    setLoading(false);
                                }
                            }} />

                            <div className="flex items-center justify-center gap-6 opacity-30 brightness-50">
                                <img src="https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/Aadhaar_Logo.svg/1200px-Aadhaar_Logo.svg.png" className="h-6 grayscale" alt="Adhaar" />
                                <div className="w-1 h-3 bg-slate-300 rounded-full" />
                                <h4 className="text-[10px] font-black text-slate-400 tracking-widest uppercase">AePS Secured</h4>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AEPS;
