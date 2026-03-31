import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Droplets, Flame, Wifi, Phone, Shield, CreditCard,
    Building2, Search, CheckCircle, AlertCircle, RefreshCw,
    ArrowRight, Receipt, Download, X, ChevronRight, Clock,
    Hash, User as UserIcon, Calendar, Banknote, Star, TrendingUp, Activity, Mail
} from 'lucide-react';
import { dataService, BACKEND_URL } from '../../services/dataService';
import { BILL_CATEGORIES as BILL_CATEGORIES_DATA } from './utilityData';
import { initSpeech, announceSuccess, announceFailure, announceProcessing, speak, announceError, announceWarning, announceGrandSuccess } from '../../services/speechService';


const NAVY = '#0f2557';
const NAVY3 = '#2257a8';

const VENUS_ERRORS = {
    "IAC": "Invalid User Account", "ACS": "Account Suspended", "AAB": "Account Blocked",
    "UAC": "Unauthorized Access", "IAT": "Invalid Access Token", "IAB": "Insufficient Balance",
    "IPE": "Internal Processing Error", "SNA": "Service Not Allowed", "ISR": "Invalid Service Type",
    "SPE": "Service Provider Error", "RTO": "Request Timed Out", "IRP": "Invalid Request Parameters",
    "DRD": "Duplicate Request ID", "DTX": "Duplicate Transaction", "ISE": "System Error",
    "SPD": "Service Provider Down", "IRI": "Invalid Request ID", "OUE": "Unknown Error",
    "TUP": "Transaction Under Process", "RNF": "Remitter Not Found", "IUD": "Invalid User Data",
    "NRS": "No Result Found (Check Details)", "IVC": "Invalid Verification Code",
    "RAR": "Already Registered", "ERR": "Service Error", "SLR": "Service Limit Reached",
    "ITI": "Invalid Transaction ID", "OUI": "Outlet Inactive", "ODI": "Outlet Data Incorrect",
    "ICI": "Invalid Customer ID / Consumer No.", "ITA": "Invalid Transaction Amount",
    "NPD": "No Payment Due / Bill Already Paid", "TSU": "Transaction Status Unavailable",
    "TRP": "Refund Processed (Wallet Credited)", "SAC": "Accepted for Processing",
    "SDL": "Delivered", "SSC": "Broadcast Scheduled", "SRJ": "Request Rejected",
    "SDR": "DND Recipient", "SME": "Memory Exceeded", "SIR": "Invalid Recipient",
    "SBR": "Blacklisted Recipient", "SRB": "Recipient Busy", "SNB": "Network Busy",
    "SDB": "Service Barred", "ISN": "Invalid Sender Name", "SRI": "Recipient Inactive",
    "EXP": "Expired", "RCS": "Request Completed Successfully", "IIR": "Invalid Result ID",
    "IRT": "Invalid Response Type", "TAB": "Transaction Amount Temporarily Barred"
};

const CAT_ICON_MAP = {
    electricity: { icon: Zap, emoji: '⚡', color: '#f59e0b', bg: 'linear-gradient(135deg, #f59e0b, #d97706)' },
    water: { icon: Droplets, emoji: '💧', color: '#3b82f6', bg: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
    gas: { icon: Flame, emoji: '🔥', color: '#ef4444', bg: 'linear-gradient(135deg, #ef4444, #dc2626)' },
    broadband: { icon: Wifi, emoji: '🌐', color: '#8b5cf6', bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
    landline: { icon: Phone, emoji: '📞', color: '#06b6d4', bg: 'linear-gradient(135deg, #06b6d4, #0891b2)' },
    insurance: { icon: Shield, emoji: '🛡️', color: '#10b981', bg: 'linear-gradient(135deg, #10b981, #059669)' },
    creditcard: { icon: CreditCard, emoji: '💳', color: '#7c3aed', bg: 'linear-gradient(135deg, #7c3aed, #6d28d9)' },
    loan: { icon: Building2, emoji: '🏦', color: '#1d4ed8', bg: 'linear-gradient(135deg, #1d4ed8, #1e40af)' },
};

const CATEGORIES = BILL_CATEGORIES_DATA.map(cat => ({
    ...cat,
    ...(CAT_ICON_MAP[cat.id] || { icon: Zap, emoji: '⚡', color: '#f59e0b', bg: 'linear-gradient(135deg, #f59e0b, #d97706)' }),
}));

// (old hardcoded list replaced — now sourced from utilityData.js)
const _DUMMY_PLACEHOLDER = [
    {
        id: 'electricity', label: 'Electricity', icon: Zap, emoji: '⚡', color: '#f59e0b',
        bg: 'linear-gradient(135deg, #f59e0b, #d97706)',
        billers: [
            { name: "Ajmer Vidyut Vitran Nigam Limited (AVVNL)", opcode: "AVE" },
            { name: "APDCL - ASSAM", opcode: "AAE" },
            { name: "APEPDCL-Eastern Power Distribution CO AP Ltd", opcode: "APE" },
            { name: "APSPDCL-Southern Power Distribution CO AP Ltd", opcode: "ASE" },
            { name: "Bangalore Electricity Supply Company", opcode: "BBE" },
            { name: "Bharatpur Electricity Services Ltd. (BESL)", opcode: "BEE" },
            { name: "Bikaner Electricity Supply Limited (BKESL)", opcode: "BKE" },
            { name: "Brihan Mumbai Electric Supply and Transport Undertaking", opcode: "BME" },
            { name: "BSES Rajdhani Power Limited", opcode: "BRE" },
            { name: "BSES Yamuna Power Limited", opcode: "BYE" },
            { name: "Calcutta Electricity Supply Ltd (CESC)", opcode: "CWE" },
            { name: "Chhattisgarh State Electricity Board", opcode: "CCE" },
            { name: "Dakshin Haryana (DHBVN)", opcode: "DHE", subDivLabel: "Mobile Number (10 digits)" },
            { name: "Daman and Diu Electricity", opcode: "DDE" },
            { name: "DNH Power Distribution", opcode: "DNE" },
            { name: "Gulbarga Electricity (GESCOM)", opcode: "GEE" },
            { name: "Himachal Pradesh (HPSEB)", opcode: "HPE" },
            { name: "Hubli Electricity (HESCOM)", opcode: "HNE" },
            { name: "India Power Corporation - WB", opcode: "IWE" },
            { name: "India Power Corporation - Bihar", opcode: "IBE" },
            { name: "Jaipur Vidyut Vitran (JVVNL)", opcode: "JIE" },
            { name: "Jharkhand Bijli (JBVNL)", opcode: "JBE", subDivLabel: "Subdivision Code (1-3 digits)" },
            { name: "Jodhpur Vidyut Vitran (JDVVNL)", opcode: "JDE" },
            { name: "Kanpur Electricity (KESCO)", opcode: "KNE" },
            { name: "MP Madhya Kshetra (Rural)", opcode: "MME" },
            { name: "MP Madhya Kshetra (Urban)", opcode: "MUE" },
            { name: "MP Paschim Kshetra (Indore)", opcode: "MPE" },
            { name: "MP Poorv Kshetra (Jabalpur)", opcode: "MRE" },
            { name: "MSEDC Limited (Maharashtra)", opcode: "MSE", subDivLabel: "Billing Unit (4 digits)" },
            { name: "North Bihar Power (NBPDCL)", opcode: "NBE" },
            { name: "Punjab State Power (PSPCL)", opcode: "PSE" },
            { name: "Reliance Energy", opcode: "REE", subDivLabel: "Cycle Number (2 digits)" },
            { name: "South Bihar Power (SBPDCL)", opcode: "SBE" },
            { name: "Tamil Nadu (TNEB)", opcode: "TNE" },
            { name: "Tata Power - Mumbai", opcode: "TME" },
            { name: "TATA Power-Delhi", opcode: "NDE" },
            { name: "Torrent Power - Agra", opcode: "TAE", subDivLabel: "City Name (Pass Agra)" },
            { name: "Torrent Power - Ahmedabad", opcode: "THE", subDivLabel: "City Name (Pass Ahmedabad)" },
            { name: "Torrent Power - Surat", opcode: "TSE", subDivLabel: "City Name (Pass Surat)" },
            { name: "Uttar Haryana (UHBVN)", opcode: "UHE", subDivLabel: "Mobile Number (10 digits)" },
            { name: "UPPCL - RURAL", opcode: "URE" },
            { name: "UPPCL - URBAN", opcode: "UBE" },
            { name: "Uttarakhand Power (UKCL)", opcode: "UKE" },
            { name: "WBSEDCL (West Bengal)", opcode: "WBE" }
        ]
    },
    {
        id: 'water', label: 'Water Bill', icon: Droplets, emoji: '💧', color: '#3b82f6',
        bg: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        billers: [
            'Delhi Jal Board (DJB)', 'MCGM Mumbai Water', 'BWSSB Bangalore',
            'Chennai Metro Water (CMWSSB)', 'Hyderabad Metro Water (HMWS&SB)',
            'Pune Municipal Corporation Water', 'Kolkata Municipal Corporation Water',
            'Ahmedabad Municipal Corporation Water', 'Surat Municipal Corporation Water',
            'Jaipur Nagar Nigam Water', 'Lucknow Nagar Nigam Water',
            'Greater Noida Water', 'Noida Authority Water', 'Gurgaon MCG Water',
        ]
    },
    {
        id: 'gas', label: 'Piped Gas', icon: Flame, emoji: '🔥', color: '#ef4444',
        bg: 'linear-gradient(135deg, #ef4444, #dc2626)',
        billers: [
            'Indraprastha Gas (IGL) — Delhi / NCR', 'Mahanagar Gas (MGL) — Mumbai',
            'Gujarat Gas Ltd', 'Torrent Gas', 'Adani Total Gas',
            'GAIL Gas Ltd', 'Central UP Gas Ltd (CUGL)', 'Green Gas Ltd (Lucknow / Agra)',
            'Maharashtra Natural Gas Ltd (MNGL)', 'Bhagyanagar Gas Ltd (Hyderabad)',
        ]
    },
    {
        id: 'broadband', label: 'Broadband', icon: Wifi, emoji: '🌐', color: '#8b5cf6',
        bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        billers: [
            'Airtel Xstream Fiber', 'Jio Fiber', 'BSNL Broadband', 'VI Home Broadband',
            'ACT Fibernet', 'Hathway Broadband', 'YOU Broadband', 'Excitel Fiber',
            'Tikona Broadband', 'GTPL Broadband', 'Connect Broadband (Punjab)',
        ]
    },
    {
        id: 'landline', label: 'Landline / Postpaid', icon: Phone, emoji: '📞', color: '#06b6d4',
        bg: 'linear-gradient(135deg, #06b6d4, #0891b2)',
        billers: [
            'BSNL Landline (All India)', 'MTNL Delhi Landline', 'MTNL Mumbai Landline',
            'Airtel Landline', 'VI Postpaid', 'Airtel Postpaid',
            'Jio Postpaid', 'BSNL Postpaid Mobile',
        ]
    },
    {
        id: 'insurance', label: 'Insurance', icon: Shield, emoji: '🛡️', color: '#10b981',
        bg: 'linear-gradient(135deg, #10b981, #059669)',
        billers: [
            'LIC of India Premium', 'SBI Life Insurance', 'HDFC Life Insurance',
            'ICICI Prudential Life', 'Bajaj Allianz Life', 'Max Life Insurance',
            'Tata AIA Life', 'Star Health & Allied Insurance', 'HDFC ERGO Health',
            'ICICI Lombard Health', 'Niva Bupa Health Insurance', 'Care Health Insurance',
        ]
    },
    {
        id: 'creditcard', label: 'Credit Card', icon: CreditCard, emoji: '💳', color: '#7c3aed',
        bg: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
        billers: [
            'SBI Card', 'HDFC Bank Credit Card', 'ICICI Bank Credit Card',
            'Axis Bank Credit Card', 'Kotak Mahindra Credit Card', 'Yes Bank Credit Card',
            'IndusInd Bank Credit Card', 'RBL Bank Credit Card', 'AU Small Finance Credit Card',
            'IDFC First Bank Credit Card', 'Amazon Pay ICICI Card', 'Citi Bank Credit Card',
        ]
    },
    {
        id: 'loan', label: 'Loan EMI', icon: Building2, emoji: '🏦', color: '#1d4ed8',
        bg: 'linear-gradient(135deg, #1d4ed8, #1e40af)',
        billers: [
            'SBI Home Loan', 'HDFC Home Loan', 'LIC Housing Finance',
            'ICICI Home Loan', 'Axis Bank Home Loan', 'Bajaj Finserv Personal Loan',
            'Tata Capital Home Loan', 'Shriram Finance', 'Muthoot Finance',
            'HDB Financial Services', 'Hero FinCorp', 'L&T Finance',
        ]
    },
]; // end _DUMMY_PLACEHOLDER (unused — real data comes from BILL_CATEGORIES_DATA)

const Toast = ({ status, onClose }) => status ? (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
        className="flex items-center gap-3 p-3.5 rounded-xl mb-4 text-sm font-semibold"
        style={status.type === 'success'
            ? { background: '#ecfdf5', border: '1px solid #6ee7b7', color: '#065f46' }
            : { background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b' }}>
        {status.type === 'success'
            ? <CheckCircle size={17} style={{ color: '#10b981', flexShrink: 0 }} />
            : <AlertCircle size={17} style={{ color: '#ef4444', flexShrink: 0 }} />}
        <span className="flex-1">{status.message}</span>
        <button onClick={onClose} className="opacity-40 hover:opacity-100 text-lg leading-none font-bold ml-2">×</button>
    </motion.div>
) : null;

/* ── Receipt Modal ── */
function ReceiptModal({ bill, biller, category, txId, onClose }) {
    const date = new Date().toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
    const catData = CATEGORIES.find(c => c.id === category);

    return (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}>
            <motion.div className="w-full max-w-md rounded-3xl overflow-hidden"
                initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }}
                style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.4)' }}>
                {/* Header */}
                <div style={{ background: catData?.bg || `linear-gradient(135deg, ${NAVY}, ${NAVY3})` }}
                    className="px-6 pt-8 pb-16 text-white text-center relative">
                    <button onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30">
                        <X size={16} />
                    </button>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 250, delay: 0.1 }}
                        className="w-20 h-20 mx-auto rounded-full bg-white/20 flex items-center justify-center text-4xl mb-3">
                        {catData?.emoji || '✅'}
                    </motion.div>
                    <p className="text-white/80 text-xs font-bold uppercase tracking-widest">Payment Successful</p>
                    <h2 className="text-3xl font-black mt-1">₹{bill?.amount?.toLocaleString('en-IN')}</h2>
                    <p className="text-white/70 text-sm mt-1">{biller}</p>
                </div>

                {/* Tear line */}
                <div className="relative h-4" style={{ background: '#f8fafc' }}>
                    <div className="absolute -top-3 left-0 right-0 flex">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <div key={i} className="flex-1 h-6 rounded-full bg-white" style={{ margin: '0 2px', transform: 'translateY(-50%)' }} />
                        ))}
                    </div>
                </div>

                {/* Details */}
                <div className="bg-slate-50 px-6 py-5 space-y-3">
                    {[
                        { label: 'Customer Name', value: bill?.custName },
                        { label: 'Consumer No.', value: bill?.consumerNo },
                        { label: 'Bill Number', value: bill?.billNo },
                        { label: 'Due Date', value: bill?.dueDate },
                        { label: 'Transaction ID', value: txId },
                        { label: 'Payment Date', value: date },
                    ].filter(r => r.value).map((row, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-slate-400 font-semibold">{row.label}</span>
                            <span className="font-black text-slate-800 text-right max-w-[60%] break-all">{row.value}</span>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="bg-emerald-50 px-6 py-4 text-center border-t border-emerald-100">
                    <p className="text-emerald-700 font-black text-xs uppercase tracking-widest">✅ Payment Confirmed</p>
                    <p className="text-emerald-600 text-xs mt-1">Receipt saved to your account</p>
                </div>

                <button onClick={onClose}
                    className="w-full py-4 text-white font-black text-sm uppercase tracking-widest"
                    style={{ background: catData?.bg || `linear-gradient(135deg, ${NAVY}, ${NAVY3})` }}>
                    Done
                </button>
            </motion.div>
        </motion.div>
    );
}

export default function UtilityBill({ location }) {
    /* ── Step: category → biller → consumer → fetched → paid ── */
    const [step, setStep] = useState('category'); // 'category' | 'form' | 'fetched' | 'success'
    const [selectedCat, setSelectedCat] = useState(null);
    const [billerSearch, setBillerSearch] = useState('');
    const [biller, setBiller] = useState(null); // Changed to object
    const [subDiv, setSubDiv] = useState('');
    const [showDrop, setShowDrop] = useState(false);
    const [consumerNo, setConsumerNo] = useState('');
    const [billMobile, setBillMobile] = useState(''); // Mobile MUST start empty
    const [fetchedBill, setFetchedBill] = useState(null);
    const [fetching, setFetching] = useState(false);
    const [paying, setPaying] = useState(false);
    const [status, setStatus] = useState(null);
    const [dob, setDob] = useState(''); // Added for Insurance
    const [insuranceEmail, setInsuranceEmail] = useState(''); // Optional email for Insurance
    const [txId, setTxId] = useState('');
    const [showReceipt, setShowReceipt] = useState(false);
    const [backendStatus, setBackendStatus] = useState('unknown'); // 'online' | 'offline' | 'unknown'
    const autoTimer = useRef(null);

    /* ── Check backend health ── */
    useEffect(() => {
        fetch(`${BACKEND_URL}/health`)
            .then(r => r.ok ? setBackendStatus('online') : setBackendStatus('offline'))
            .catch(() => setBackendStatus('offline'));

        // Force clear mobile on mount to stop any persistent pre-fill
        setBillMobile('');
    }, []);


    /* ── Fetching logic ── */
    useEffect(() => {
        // Force mobile to be empty on first category selection to avoid autofill issues
        if (selectedCat && !consumerNo && !billMobile) {
            setBillMobile('');
        }
    }, [selectedCat]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => clearTimeout(autoTimer.current);
    }, []);


    const catData = selectedCat ? CATEGORIES.find(c => c.id === selectedCat) : null;

    const filteredBillers = (catData?.billers || []).filter(b =>
        (typeof b === 'string' ? b : b.name).toLowerCase().includes(billerSearch.toLowerCase())
    );

    const doFetch = async () => {
        if (!biller) return;

        // ── Critical: validate opcode before hitting Venus API ──
        if (!biller || typeof biller !== 'object') {
            setStatus({ type: 'error', message: '⚠️ Please select a valid biller from the list.' });
            return;
        }

        const opCode = biller.opcode;
        const normalizedOp = (opCode || '').toString().toUpperCase();
        if (!opCode || normalizedOp === 'UNDEFINED' || normalizedOp === 'NONE' || opCode.trim() === '') {
            setStatus({
                type: 'error',
                message: '⚠️ This biller does not support online bill fetch yet. Please visit the biller website directly.'
            });
            return;
        }

        const userMobile = billMobile || '';

        // ── FINAL CLIENT-SIDE BLOCK FOR 'NONE' ──
        if (normalizedOp === 'NONE' || normalizedOp === '' || !normalizedOp) {
            setStatus({ type: 'error', message: '⚠️ Selected provider has no valid API code (NONE). Please choose a different one.' });
            return;
        }

        setFetching(true);
        setFetchedBill(null);
        setStatus(null);
        try {
            initSpeech();
            announceProcessing(`आपका ${biller.name || 'बिल'} फेच हो रहा है, कृपया प्रतीक्षा करें।`);
            const res = await fetch(`${BACKEND_URL}/bill-fetch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    biller: biller.name || biller,
                    consumerNo,
                    opcode: opCode,
                    category: selectedCat, // ensure category is passed to backend
                    subDiv: subDiv || '',
                    dob: dob || '',
                    mobile: userMobile,
                    email: insuranceEmail || ''
                })
            });
            const data = await res.json();

            if (data.success && data.bill) {
                setFetchedBill(data.bill);
                setStep('fetched');
                speak(`बिल की जानकारी मिल गई है। ${data.bill.custName || 'ग्राहक'} के लिए ${data.bill.amount} रुपये का बिल बकाया है।`, 'hi-IN');
            } else {
                const errMsg = data.message || '';
                announceError(errMsg || 'बिल फेच करने में समस्या हुई है।');
                const matchedErr = Object.keys(VENUS_ERRORS).find(k => errMsg.toUpperCase().includes(k));
                setStatus({
                    type: 'error',
                    message: matchedErr ? `⚠️ ${VENUS_ERRORS[matchedErr]} (${errMsg})` : (data.message || '⚠️ Bill Fetch Failed. Please check consumer number and try again.')
                });
            }
        } catch (err) {
            setStatus({
                type: 'error',
                message: '⚠️ Connection Error: Could not reach the BBPS server. Please ensure the backend is running.'
            });
        } finally {
            setFetching(false);
        }
    };

    const payBill = async () => {
        if (!fetchedBill) return;
        setPaying(true);
        setStatus(null);
        const user = dataService.getCurrentUser();
        if (!user) {
            setStatus({ type: 'error', message: '⚠️ Session expired. Please login again.' });
            setPaying(false);
            return;
        }
        try {
            initSpeech();
            announceProcessing("आपका पेमेंट प्रोसेस हो रहा है। कृपया पेज रिफ्रेश न करें।");
            const response = await fetch(`${BACKEND_URL}/bill-pay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id || user.username,
                    biller: biller.name || biller,
                    consumerNo,
                    amount: fetchedBill.amount,
                    category: selectedCat,
                    opcode: biller.opcode || 'UBE',
                    subDiv,
                    dob: dob || '',
                    mobile: billMobile,
                    email: insuranceEmail || '',
                    orderId: fetchedBill.orderId,
                    lat: location?.lat,
                    lng: location?.long || location?.lng
                })
            });

            const data = await response.json();

            if (data.success) {
                // Confetti for success
                try {
                    const { default: confetti } = await import('canvas-confetti');
                    confetti({
                        particleCount: 160,
                        spread: 80,
                        origin: { y: 0.55 },
                        colors: ['#10b981', '#0f2557', '#fbbf24', '#a78bfa', '#38bdf8']
                    });
                } catch (e) { }

                setTxId(data.txid || ('BPAY' + Date.now()));

                // Save to logs
                await dataService.logTransaction(
                    user.id,
                    `BILL_${biller.opcode || 'PAY'}`,
                    fetchedBill.amount,
                    biller.name || 'Utility',
                    consumerNo,
                    'SUCCESS'
                );

                announceGrandSuccess(
                    `आपका ₹${fetchedBill.amount} का ${biller.name} बिल पेमेंट सफल हो गया।`,
                    `धन्यवाद! आपकी ट्रांजैक्शन आईडी ${data.txid || 'सफल'} है।`
                );

                setStep('success');
                setShowReceipt(true);
            } else {
                const errMsg = data.message || '';
                const errCode = data.code || '';
                announceError(errMsg || 'पेमेंट फेल हो गया है।');
                const matchedErr = VENUS_ERRORS[errCode] || Object.keys(VENUS_ERRORS).find(k => errMsg.toUpperCase().includes(k));

                setStatus({
                    type: 'error',
                    message: matchedErr ? `⚠️ ${VENUS_ERRORS[matchedErr]} (${errMsg})` : (data.message || '⚠️ Payment Failed. Please check balance and try again.')
                });
            }
        } catch (err) {
            setStatus({
                type: 'error',
                message: '⚠️ Connection Error: Failed to process payment. Please check your internet or try again later.'
            });
        } finally {
            setPaying(false);
        }
    };

    const reset = () => {
        setStep('category');
        setSelectedCat(null);
        setBiller(null);
        setSubDiv('');
        setBillerSearch('');
        setConsumerNo('');
        setDob(''); // Clear DOB
        setInsuranceEmail(''); // Clear email
        setFetchedBill(null);
        setStatus(null);
        setShowReceipt(false);
        setTxId('');
    };

    /* ──────────────────────── RENDER ──────────────────────── */
    return (
        <div className="flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* ── TOP HEADER ── */}
            <div className="shrink-0 bg-white border-b border-slate-200 px-6 py-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Breadcrumb */}
                        {step !== 'category' && (
                            <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                onClick={() => { setStep('category'); setFetchedBill(null); setStatus(null); }}
                                className="flex items-center gap-1.5 text-xs font-black text-slate-400 hover:text-slate-700 transition-colors mr-2">
                                ← Back
                            </motion.button>
                        )}
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                            style={{ background: catData ? catData.bg : `linear-gradient(135deg, ${NAVY}, ${NAVY3})` }}>
                            {catData ? catData.emoji : '💡'}
                        </div>
                        <div>
                            <h1 className="text-base font-black text-slate-900">
                                {catData ? catData.label : 'Utility Bill Pay'}
                            </h1>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                {step === 'category' ? 'Select category to begin' :
                                    step === 'form' ? `${(biller?.name || biller) || 'Choose biller & enter consumer no.'}` :
                                        step === 'fetched' ? 'Review & Pay Bill' : 'Payment Success'}
                            </p>
                        </div>
                    </div>

                    {/* Backend Status Badge */}
                    <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black border
                            ${backendStatus === 'online' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                backendStatus === 'offline' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                    'bg-slate-100 border-slate-200 text-slate-500'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${backendStatus === 'online' ? 'bg-emerald-500 animate-pulse' : backendStatus === 'offline' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                            {backendStatus === 'online' ? 'BBPS Live' : backendStatus === 'offline' ? 'BBPS Offline' : 'Connecting...'}
                        </div>

                        {/* Step indicators */}
                        <div className="flex items-center gap-1.5 ml-2">
                            {['category', 'form', 'fetched'].map((s, i) => (
                                <div key={s} className="flex items-center gap-1.5">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all
                                        ${step === s || (step === 'success' && i <= 2) || (s === 'category' && ['form', 'fetched', 'success'].includes(step)) || (s === 'form' && ['fetched', 'success'].includes(step))
                                            ? 'text-white' : 'bg-slate-100 text-slate-400'}`}
                                        style={(step === s) ? { background: catData?.bg || `linear-gradient(135deg,${NAVY},${NAVY3})` } :
                                            ((s === 'category' && ['form', 'fetched', 'success'].includes(step)) || (s === 'form' && ['fetched', 'success'].includes(step))) ? { background: '#10b981' } : {}}>
                                        {((s === 'category' && ['form', 'fetched', 'success'].includes(step)) || (s === 'form' && ['fetched', 'success'].includes(step))) ? '✓' : i + 1}
                                    </div>
                                    {i < 2 && <div className={`w-5 h-px ${['form', 'fetched', 'success'].includes(step) && i === 0 ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── CONTENT ── */}
            <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">

                    {/* ══ STEP 1: CATEGORY GRID ══ */}
                    {step === 'category' && (
                        <motion.div key="cat" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                                Select Bill Category
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {CATEGORIES.map((cat) => {
                                    const Icon = cat.icon;
                                    return (
                                        <motion.button key={cat.id}
                                            whileHover={{ y: -6, boxShadow: `0 20px 50px ${cat.color}35` }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => { setSelectedCat(cat.id); setStep('form'); }}
                                            className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-white border-2 border-transparent cursor-pointer transition-all relative overflow-hidden"
                                            style={{ boxShadow: `0 4px 20px ${cat.color}20` }}>
                                            {/* Background shimmer */}
                                            <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
                                                style={{ background: `linear-gradient(135deg, ${cat.color}08, ${cat.color}04)` }} />
                                            {/* Icon */}
                                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
                                                style={{ background: cat.bg, boxShadow: `0 8px 25px ${cat.color}50` }}>
                                                <div className="absolute top-1 left-1 right-6 bottom-6 rounded-xl bg-white/20" />
                                                <Icon size={26} color="white" strokeWidth={2} style={{ position: 'relative', zIndex: 1 }} />
                                            </div>
                                            <span className="text-xs font-black text-slate-700 text-center leading-tight">{cat.label}</span>
                                            <span className="text-[9px] text-slate-400 font-semibold">{cat.billers.length}+ billers</span>
                                            {/* Arrow */}
                                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100">
                                                <ChevronRight size={14} style={{ color: cat.color }} />
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {/* Quick Stats */}
                            <div className="mt-6 grid grid-cols-3 gap-4">
                                {[
                                    { icon: Activity, label: 'Live Billers', value: '500+', color: '#10b981' },
                                    { icon: TrendingUp, label: 'Bills Paid Today', value: '1,240', color: NAVY },
                                    { icon: Star, label: 'Success Rate', value: '99.8%', color: '#f59e0b' },
                                ].map((stat, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07 }}
                                        className="bg-white rounded-2xl p-4 flex items-center gap-3 border border-slate-100"
                                        style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                            style={{ background: `${stat.color}18` }}>
                                            <stat.icon size={18} style={{ color: stat.color }} />
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-slate-800">{stat.value}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">{stat.label}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ══ STEP 2: BILLER + CONSUMER FORM ══ */}
                    {step === 'form' && catData && (
                        <motion.div key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                            className="max-w-2xl mx-auto space-y-5">

                            {/* Biller Search Card */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                                <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
                                        style={{ background: catData.bg }}>
                                        {catData.emoji}
                                    </div>
                                    Select {catData.label} Provider
                                </h3>

                                {/* Biller Search */}
                                <div className="relative">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
                                        Search Biller (All India)
                                    </label>
                                    <div className="relative">
                                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        <input
                                            value={billerSearch}
                                            onFocus={() => setShowDrop(true)}
                                            onBlur={() => setTimeout(() => setShowDrop(false), 200)}
                                            onChange={e => {
                                                setBillerSearch(e.target.value);
                                                setShowDrop(true);
                                                if (!e.target.value) { setBiller(null); setFetchedBill(null); }
                                            }}
                                            placeholder={biller ? (biller.name || biller) : `Search ${catData.label} provider…`}
                                            className="w-full pl-10 pr-10 py-3.5 rounded-xl border-2 border-slate-200 text-slate-800 font-bold text-sm outline-none focus:border-blue-400 transition-all bg-slate-50 focus:bg-white"
                                        />
                                        {biller && <CheckCircle size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: catData.color }} />}
                                    </div>

                                    {/* Dropdown */}
                                    <AnimatePresence>
                                        {showDrop && filteredBillers.length > 0 && (
                                            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                                className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-52 overflow-y-auto">
                                                {filteredBillers.map(b => (
                                                    <button key={b}
                                                        onMouseDown={() => { setBiller(b); setBillerSearch(b.name || b); setFetchedBill(null); setConsumerNo(''); setSubDiv(''); setShowDrop(false); }}
                                                        className={`w-full text-left px-4 py-3 text-sm font-semibold hover:bg-slate-50 border-b border-slate-50 last:border-0 flex items-center gap-2 ${(biller?.name === b.name || biller === b) ? 'text-blue-700 font-black bg-blue-50' : 'text-slate-700'}`}>
                                                        <span className="text-lg">{catData.emoji}</span>
                                                        {b.name || b}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Consumer No */}
                                {biller && (
                                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
                                                {selectedCat === 'fastag' ? 'Vehicle Registration Number' : 'Consumer / Account Number'}
                                                {consumerNo.length > 0 && consumerNo.length < 6 && (
                                                    <span className="ml-2 text-amber-500 normal-case font-bold">(min 6 digits)</span>
                                                )}
                                            </label>
                                            <div className="relative">
                                                <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    value={consumerNo}
                                                    onChange={e => { setConsumerNo(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')); setFetchedBill(null); setStep('form'); }}
                                                    placeholder={selectedCat === 'fastag' ? "Enter vehicle number (e.g. MH01AB1234)" : "Enter consumer / account number"}
                                                    className="w-full pl-10 pr-10 py-3.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold text-sm outline-none focus:border-blue-400 bg-slate-50 focus:bg-white transition-all"
                                                />
                                                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                                                    {fetching
                                                        ? <RefreshCw size={15} className="animate-spin text-blue-500" />
                                                        : fetchedBill
                                                            ? <CheckCircle size={15} style={{ color: '#10b981' }} />
                                                            : null
                                                    }
                                                </div>
                                            </div>
                                        </div>

                                        {/* Consumer Mobile */}
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
                                                Consumer Mobile Number
                                                {billMobile.length > 0 && billMobile.length < 10 && (
                                                    <span className="ml-2 text-amber-500 normal-case font-bold">(enter 10 digits)</span>
                                                )}
                                            </label>
                                            <div className="relative">
                                                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    id="utility-mobile-field"
                                                    autoComplete="off"
                                                    value={billMobile}
                                                    onChange={e => { setBillMobile(e.target.value.replace(/\D/g, '').slice(0, 10)); setFetchedBill(null); setStep('form'); }}
                                                    placeholder="Enter consumer mobile number"
                                                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold text-sm outline-none focus:border-blue-400 bg-slate-50 focus:bg-white transition-all"
                                                />
                                            </div>
                                        </div>

                                        {/* Date of Birth + Email — Only for Insurance */}
                                        {selectedCat === 'insurance' && (
                                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                                                {/* DOB — date picker */}
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 flex items-center gap-2">
                                                        <Calendar size={12} className="text-emerald-500" /> Policy Holder Date of Birth <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                                                        <input
                                                            type="date"
                                                            value={dob}
                                                            max={new Date().toISOString().split('T')[0]}
                                                            onChange={e => {
                                                                const newDob = e.target.value;
                                                                setDob(newDob);
                                                                if (newDob.length === 10 && consumerNo.length >= 6 && billMobile.length === 10) {
                                                                    clearTimeout(autoTimer.current);
                                                                    autoTimer.current = setTimeout(() => { doFetch(); }, 600);
                                                                }
                                                            }}
                                                            className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-emerald-100 text-slate-900 font-bold text-sm outline-none focus:border-emerald-400 bg-emerald-50/20 focus:bg-white transition-all"
                                                        />
                                                    </div>
                                                    <p className="text-[9px] text-slate-400 mt-1">📅 Select DOB using the date picker (required for insurance fetch)</p>
                                                </div>

                                                {/* Email — optional */}
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 flex items-center gap-2">
                                                        <Mail size={12} className="text-blue-400" /> Policy Holder Email <span className="text-slate-300 font-normal normal-case">(optional)</span>
                                                    </label>
                                                    <div className="relative">
                                                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                        <input
                                                            type="email"
                                                            value={insuranceEmail}
                                                            onChange={e => setInsuranceEmail(e.target.value)}
                                                            placeholder="name@email.com (optional)"
                                                            className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold text-sm outline-none focus:border-blue-400 bg-slate-50 focus:bg-white transition-all"
                                                        />
                                                    </div>
                                                    <p className="text-[9px] text-slate-400 mt-1">📧 Leave blank if email not available</p>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* SubDiv Field if exists */}
                                        {biller && biller.subDivLabel && (
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
                                                    {biller.subDivLabel}
                                                </label>
                                                <div className="relative">
                                                    <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        value={subDiv}
                                                        onChange={e => { setSubDiv(e.target.value); setFetchedBill(null); }}
                                                        placeholder={`Enter ${biller.subDivLabel}`}
                                                        className="w-full pl-10 pr-10 py-3.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold text-sm outline-none focus:border-blue-400 bg-slate-50 focus:bg-white transition-all"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Auto-fetching indicator or manual button */}
                                        {biller && consumerNo.length >= 6 && billMobile.length === 10 && !fetching && !fetchedBill && (typeof biller === 'object' && biller.opcode) && (
                                            <p className="text-[10px] text-blue-500 font-bold mt-1.5 flex items-center gap-1">
                                                <RefreshCw size={9} className="animate-spin" /> Fetching bill details…
                                            </p>
                                        )}

                                        <AnimatePresence><Toast status={status} onClose={() => setStatus(null)} /></AnimatePresence>

                                        {/* Fetch Button (Required Manual Click) */}
                                        {biller && typeof biller === 'object' && biller.opcode && consumerNo.length >= 6 && billMobile.length === 10 && (selectedCat === 'insurance' ? dob.length === 10 : true) && !fetchedBill && (
                                            <motion.button initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                                onClick={doFetch} disabled={fetching}
                                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                                className="w-full py-4 mt-4 rounded-xl text-white font-black text-sm uppercase tracking-widest disabled:opacity-60 flex items-center justify-center gap-2 group overflow-hidden relative"
                                                style={{ background: catData.bg, boxShadow: `0 12px 30px ${catData.color}50` }}>
                                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                                {fetching ? (
                                                    <><RefreshCw size={17} className="animate-spin" /> Verifying Customer Details...</>
                                                ) : (
                                                    <>Fetch & Verify Bill <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" /></>
                                                )}
                                            </motion.button>
                                        )}

                                        {biller && typeof biller === 'object' && !biller.opcode && (
                                            <p className="text-[10px] text-amber-500 font-bold mt-1.5">
                                                ⚠️ Online bill fetch not available for this biller
                                            </p>
                                        )}
                                    </motion.div>
                                )}
                            </div>

                            {/* Popular Billers Quick Select */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Quick Select — Popular Billers</p>
                                <div className="flex flex-wrap gap-2">
                                    {catData.billers.slice(0, 10).map(b => (
                                        <button key={b.name || b}
                                            onClick={() => { setBiller(b); setBillerSearch(b.name || b); }}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${(biller?.name === b.name || biller === b) ? 'text-white border-transparent' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                            style={(biller?.name === b.name || biller === b) ? { background: catData.bg, borderColor: 'transparent' } : {}}>
                                            {(b.name || b).split('(')[0].trim()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )
                    }

                    {/* ══ STEP 3: BILL DETAILS + PAY ══ */}
                    {
                        step === 'fetched' && fetchedBill && (
                            <motion.div key="fetched" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                                className="max-w-2xl mx-auto space-y-5">

                                {/* Bill Card */}
                                <motion.div className="rounded-2xl border-2 overflow-hidden"
                                    style={{ borderColor: `${catData?.color}40`, boxShadow: `0 10px 40px ${catData?.color}15` }}>
                                    {/* Card Header */}
                                    <div className="flex items-center justify-between px-5 py-4"
                                        style={{ background: catData?.bg || `linear-gradient(135deg,${NAVY},${NAVY3})` }}>
                                        <div className="flex items-center gap-3 text-white">
                                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
                                                {catData?.emoji}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Bill Details</p>
                                                <p className="text-sm font-black">{biller.name || biller}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] bg-white/20 text-white font-black px-2 py-0.5 rounded-full">✅ BBPS LIVE</p>
                                            {fetchedBill.dueDate && (
                                                <p className="text-white/70 text-[10px] font-bold mt-1 flex items-center justify-end gap-1">
                                                    <Clock size={9} /> Due: {fetchedBill.dueDate}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="bg-white px-5 py-5">
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Verification</p>
                                            <button onClick={() => speak(`ग्राहक का नाम: ${fetchedBill.custName || 'उपलब्ध नहीं'}, उपभोक्ता नंबर: ${consumerNo}, बकाया राशि: ${fetchedBill.amount} रुपये।`, 'hi-IN')}
                                                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[10px] font-black text-slate-500 hover:bg-blue-100 hover:text-blue-600 transition-all">
                                                <Activity size={12} className="text-blue-500" /> Listen Details
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            {[
                                                { label: 'Customer Name', value: fetchedBill.custName || 'Not Available', color: 'text-slate-900', icon: UserIcon },
                                                { label: 'Consumer No.', value: consumerNo, color: 'text-slate-700', icon: Hash },
                                                { label: 'Bill Date / ID', value: fetchedBill.billNo || fetchedBill.orderId || 'N/A', color: 'text-slate-700', icon: Receipt },
                                                { label: 'Amount Due', value: `₹${fetchedBill.amount?.toLocaleString('en-IN')}`, color: 'text-red-600', icon: Banknote, big: true },
                                            ].map((row, i) => (
                                                <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i, type: 'spring' }}
                                                    className="bg-slate-50 rounded-2xl p-4 border-2 border-slate-100/50 hover:border-blue-100 transition-colors group">
                                                    <div className="flex items-center gap-1.5 mb-2">
                                                        <div className="p-1.5 rounded-lg bg-white shadow-sm group-hover:bg-blue-50 transition-colors">
                                                            <row.icon size={12} className="text-slate-500" />
                                                        </div>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{row.label}</p>
                                                    </div>
                                                    <p className={`font-black ${row.big ? 'text-2xl' : 'text-[13px]'} ${row.color} break-all leading-tight`}>{row.value}</p>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {fetchedBill.arrears > 0 && (
                                            <div className="mt-3 px-4 py-2.5 rounded-xl bg-orange-50 border border-orange-200 flex items-center gap-2">
                                                <AlertCircle size={14} className="text-orange-500 flex-shrink-0" />
                                                <p className="text-xs font-bold text-orange-700">Previous Arrears: ₹{fetchedBill.arrears}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Payment Section */}
                                    <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-5">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Payable</p>
                                                <p className="text-2xl font-black text-slate-900">₹{fetchedBill.amount?.toLocaleString('en-IN')}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Instant Payment</p>
                                                <p className="text-xs text-slate-400 font-semibold">BBPS Certified</p>
                                            </div>
                                        </div>

                                        <AnimatePresence><Toast status={status} onClose={() => setStatus(null)} /></AnimatePresence>

                                        <div className="flex gap-3">
                                            <button onClick={() => { setStep('form'); setFetchedBill(null); }}
                                                className="px-5 py-3.5 rounded-xl border-2 border-slate-200 font-black text-sm text-slate-500 hover:bg-slate-100 transition-all">
                                                ← Change
                                            </button>
                                            <motion.button onClick={payBill} disabled={paying}
                                                whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.97 }}
                                                className="flex-1 py-3.5 rounded-xl text-white font-black text-sm uppercase tracking-widest relative overflow-hidden disabled:opacity-60 flex items-center justify-center gap-2"
                                                style={{ background: catData?.bg || `linear-gradient(135deg,${NAVY},${NAVY3})`, boxShadow: `0 8px 30px ${catData?.color || NAVY}45` }}>
                                                <motion.div className="absolute inset-0"
                                                    style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)' }}
                                                    animate={{ x: ['-100%', '200%'] }}
                                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.8 }} />
                                                <span className="relative z-10 flex items-center gap-2">
                                                    {paying
                                                        ? <><RefreshCw size={17} className="animate-spin" /> Processing...</>
                                                        : <>💳 Pay ₹{fetchedBill.amount?.toLocaleString('en-IN')} Now <ArrowRight size={17} /></>
                                                    }
                                                </span>
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Safety Note */}
                                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                    <Shield size={18} className="text-blue-600 flex-shrink-0" />
                                    <p className="text-xs text-blue-700 font-semibold">
                                        Payment secured by <strong>BBPS (Bharat Bill Payment System)</strong>. Your bill receipt will be generated instantly after payment.
                                    </p>
                                </div>
                            </motion.div>
                        )
                    }

                    {/* ══ STEP 4: SUCCESS ══ */}
                    {
                        step === 'success' && (
                            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="max-w-md mx-auto flex flex-col items-center py-10 gap-6 text-center">
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 220 }}
                                    className="w-28 h-28 rounded-full flex items-center justify-center text-5xl"
                                    style={{ background: catData?.bg || `linear-gradient(135deg,${NAVY},${NAVY3})`, boxShadow: `0 0 0 10px ${catData?.color || NAVY}22, 0 20px 50px ${catData?.color || NAVY}40` }}>
                                    {catData?.emoji || '✅'}
                                </motion.div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-emerald-500">✨ Congratulations ✨</p>
                                    <h2 className="text-2xl font-black text-slate-900 mt-1">Bill Paid Successfully!</h2>
                                    <p className="text-slate-500 text-sm mt-1">₹{fetchedBill?.amount?.toLocaleString('en-IN')} paid to {biller.name || biller}</p>
                                </div>

                                <div className="flex gap-3 w-full">
                                    <button onClick={() => setShowReceipt(true)}
                                        className="flex-1 py-3.5 rounded-xl border-2 font-black text-sm flex items-center justify-center gap-2"
                                        style={{ borderColor: catData?.color, color: catData?.color }}>
                                        <Receipt size={16} /> View Receipt
                                    </button>
                                    <motion.button onClick={reset}
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                        className="flex-1 py-3.5 rounded-xl text-white font-black text-sm"
                                        style={{ background: catData?.bg || `linear-gradient(135deg,${NAVY},${NAVY3})` }}>
                                        + Pay Another Bill
                                    </motion.button>
                                </div>
                            </motion.div>
                        )
                    }

                </AnimatePresence >
            </div >

            {/* ── RECEIPT MODAL ── */}
            < AnimatePresence >
                {showReceipt && (
                    <ReceiptModal
                        bill={fetchedBill}
                        biller={biller.name || biller}
                        category={selectedCat}
                        txId={txId}
                        onClose={() => setShowReceipt(false)}
                    />
                )}
            </AnimatePresence >
        </div >
    );
}
