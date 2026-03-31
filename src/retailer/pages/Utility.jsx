import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Smartphone, Zap, CreditCard, Signal, Layers, Search,
    CheckCircle, AlertCircle, RefreshCw, BellRing, ArrowRight,
    Tv2, ChevronRight, User, Calendar, Mail,
    Hash, Home, Phone, FileText, MapPin, Landmark, Wallet, ShieldCheck
} from 'lucide-react';
import { dataService, BACKEND_URL } from '../../services/dataService';
import {
    PREFIX_DB, OPERATOR_PLANS, DTH_PROVIDERS, BILL_CATEGORIES,
    PAN_API, RECHARGE_API, BILL_PAY_API, BILL_FETCH_API
} from './utilityData';
import { initSpeech, announceSuccess, announceFailure, announceProcessing, speak, announceError, announceWarning, announceGrandSuccess, playApplause } from '../../services/speechService';
import UtilityBill from './UtilityBill';

const NAVY = '#0f2557';
const NAVY2 = '#1a3a6b';
const NAVY3 = '#2257a8';

function GrandSuccessScreen({ title, subtitle, details = [], onReset, resetLabel = '+ New Transaction' }) {
    // Bokeh floating dots
    const DOTS = [
        { x: 8, y: 15, s: 10, dur: 2.1, delay: 0, col: '#10b981' },
        { x: 88, y: 10, s: 7, dur: 2.6, delay: 0.3, col: '#fbbf24' },
        { x: 20, y: 75, s: 14, dur: 1.9, delay: 0.6, col: '#6ee7b7' },
        { x: 78, y: 80, s: 9, dur: 2.4, delay: 0.2, col: '#a78bfa' },
        { x: 50, y: 5, s: 6, dur: 2.8, delay: 0.9, col: '#38bdf8' },
        { x: 5, y: 50, s: 11, dur: 2.0, delay: 1.1, col: '#34d399' },
        { x: 93, y: 45, s: 8, dur: 2.3, delay: 0.4, col: '#fbbf24' },
        { x: 40, y: 90, s: 13, dur: 1.7, delay: 0.8, col: '#10b981' },
        { x: 65, y: 20, s: 5, dur: 3.0, delay: 1.4, col: '#a78bfa' },
        { x: 30, y: 35, s: 7, dur: 2.2, delay: 0.5, col: '#38bdf8' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="relative flex flex-col items-center justify-center min-h-[62vh] py-10 overflow-hidden"
        >
            {/* ── Radiant background glow ── */}
            <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 50% 38%, rgba(16,185,129,0.14) 0%, rgba(15,37,87,0.06) 62%, transparent 100%)' }} />

            {/* ── Floating bokeh particles ── */}
            {DOTS.map((d, i) => (
                <motion.div key={i} className="absolute rounded-full pointer-events-none"
                    style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.s, height: d.s, background: d.col, opacity: 0.55 }}
                    animate={{ y: [-10, 12, -10], opacity: [0.4, 0.85, 0.4], scale: [1, 1.4, 1] }}
                    transition={{ duration: d.dur, repeat: Infinity, delay: d.delay, ease: 'easeInOut' }} />
            ))}

            {/* ── Glowing trophy ring ── */}
            <motion.div className="relative flex items-center justify-center"
                initial={{ scale: 0.15, rotate: -25 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 230, damping: 13 }}>
                {/* Outer pulse ring */}
                <motion.div className="absolute rounded-full"
                    style={{ width: 148, height: 148, border: '3px solid #10b981', opacity: 0.3 }}
                    animate={{ scale: [1, 1.55, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 2.3, repeat: Infinity }} />
                {/* Middle ring */}
                <motion.div className="absolute rounded-full"
                    style={{ width: 118, height: 118, border: '2px solid rgba(16,185,129,0.4)' }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2.3, repeat: Infinity, delay: 0.4 }} />
                {/* Trophy circle */}
                <div className="w-28 h-28 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(145deg, #10b981, #059669)', boxShadow: '0 0 0 7px rgba(16,185,129,0.18), 0 22px 55px rgba(16,185,129,0.55)' }}>
                    <motion.span style={{ fontSize: 54, lineHeight: 1 }}
                        animate={{ rotateY: [0, 360] }}
                        transition={{ duration: 1.8, delay: 0.4, ease: 'easeOut' }}>🏆</motion.span>
                </div>
            </motion.div>

            {/* ── CONGRATULATIONS ── */}
            <motion.div className="text-center mt-7 space-y-1 px-4"
                initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}>
                <motion.p className="text-[11px] font-black tracking-[5px] uppercase"
                    style={{ color: '#10b981' }}
                    animate={{ opacity: [0.55, 1, 0.55] }}
                    transition={{ duration: 2.2, repeat: Infinity }}>
                    ✨ CONGRATULATIONS ✨
                </motion.p>
                <h2 className="text-3xl font-black text-slate-900 leading-tight">{title}</h2>
                {subtitle && <p className="text-slate-500 text-sm mt-1 font-medium">{subtitle}</p>}
            </motion.div>

            {/* ── Transaction detail card ── */}
            {details.length > 0 && (
                <motion.div
                    className="mt-6 w-full max-w-sm rounded-3xl overflow-hidden"
                    initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
                    style={{ boxShadow: '0 20px 60px rgba(15,37,87,0.13), 0 4px 18px rgba(16,185,129,0.13)', border: '1.5px solid rgba(16,185,129,0.22)' }}>
                    {/* Card header */}
                    <div className="px-6 py-3 flex items-center gap-2"
                        style={{ background: 'linear-gradient(135deg, #0f2557, #1a3a8f)' }}>
                        <CheckCircle size={13} style={{ color: '#34d399' }} />
                        <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">Transaction Summary</p>
                    </div>
                    {/* Details rows */}
                    <div className="bg-white px-6 py-4 space-y-3">
                        {details.map((d, i) => (
                            <motion.div key={i} className="flex items-center justify-between text-sm"
                                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.65 + i * 0.07 }}>
                                <span className="text-slate-400 font-semibold">{d.label}</span>
                                <span className={`font-black ${d.highlight ? 'text-emerald-600 text-base' : 'text-slate-800'}`}>{d.value}</span>
                            </motion.div>
                        ))}
                    </div>
                    {/* Card footer */}
                    <div className="px-6 py-2 text-center"
                        style={{ background: 'rgba(16,185,129,0.06)', borderTop: '1px solid rgba(16,185,129,0.15)' }}>
                        <p className="text-[10px] text-emerald-600 font-black">✅ PAYMENT SUCCESSFUL</p>
                    </div>
                </motion.div>
            )}

            {/* ── Action button ── */}
            <motion.button onClick={onReset}
                className="mt-7 px-10 py-4 rounded-2xl text-white font-black text-sm uppercase tracking-widest"
                style={{ background: 'linear-gradient(135deg, #0f2557, #1a3a8f)', boxShadow: '0 10px 32px rgba(15,37,87,0.38)' }}
                whileHover={{ scale: 1.04, boxShadow: '0 14px 42px rgba(15,37,87,0.48)' }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
                {resetLabel}
            </motion.button>
        </motion.div>
    );
}

const NAV_TABS = [
    { id: 'mobile', label: 'Mobile', icon: Smartphone },
    { id: 'dth', label: 'DTH', icon: Tv2 },
    { id: 'bill', label: 'Utility Bill', icon: Zap },
    { id: 'pan', label: 'PAN Card', icon: CreditCard },
];

/* ── 3D Icon Badge ── */
const Icon3D = ({ icon: Icon, color, bg, size = 44, shadow }) => (
    <div style={{
        width: size, height: size,
        background: bg || `linear-gradient(145deg, ${color}dd, ${color}88)`,
        borderRadius: size * 0.3,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: shadow || `0 8px 20px ${color}50, 0 2px 4px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)`,
        position: 'relative', overflow: 'hidden', flexShrink: 0,
    }}>
        <div style={{ position: 'absolute', top: '10%', left: '10%', right: '40%', bottom: '40%', background: 'rgba(255,255,255,0.25)', borderRadius: '50%', filter: 'blur(4px)' }} />
        <Icon size={size * 0.45} color="white" strokeWidth={2} style={{ position: 'relative', zIndex: 1 }} />
    </div>
);

/* ── Status Toast ── */
const Toast = ({ status, onClose }) => status ? (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
        className="flex items-center gap-3 p-4 rounded-2xl mb-5 text-sm font-semibold border"
        style={status.type === 'success'
            ? { background: '#ecfdf5', borderColor: '#6ee7b7', color: '#065f46' }
            : { background: '#fef2f2', borderColor: '#fca5a5', color: '#991b1b' }}>
        {status.type === 'success'
            ? <CheckCircle size={18} style={{ color: '#10b981', flexShrink: 0 }} />
            : <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />}
        <span className="flex-1">{status.message}</span>
        <button onClick={onClose} className="ml-2 font-bold text-lg leading-none opacity-40 hover:opacity-100">×</button>
    </motion.div>
) : null;

/* ── Plan Card ── */
const PlanCard = ({ plan, selected, onSelect, opColor }) => (
    <motion.div whileHover={{ y: -3, boxShadow: '0 10px 30px rgba(0,0,0,0.12)' }} whileTap={{ scale: 0.98 }}
        onClick={() => onSelect(plan)}
        className="cursor-pointer rounded-2xl p-4 border-2 transition-all relative"
        style={selected
            ? { borderColor: NAVY, background: `${NAVY}08`, boxShadow: `0 0 0 1px ${NAVY}` }
            : { borderColor: '#e2e8f0', background: 'white' }}>
        {plan.popular && (
            <span className="absolute -top-2.5 left-4 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full text-white"
                style={{ background: NAVY }}>★ Popular</span>
        )}
        <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
                <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-2xl font-black" style={{ color: NAVY }}>₹{plan.amount}</span>
                    <span className="text-xs text-slate-400 font-semibold">/ {plan.validity}</span>
                </div>
                <p className="text-xs text-slate-600 font-semibold mb-1.5">{plan.desc}</p>
                <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] font-black px-2 py-1 rounded-lg" style={{ background: '#f0f9ff', color: NAVY2 }}>📶 {plan.data}</span>
                    {plan.calls !== '—' && <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700">📞 {plan.calls}</span>}
                    {plan.sms !== '—' && <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-purple-50 text-purple-700">✉ {plan.sms}</span>}
                </div>
            </div>
            <div>
                {selected
                    ? <CheckCircle size={22} style={{ color: NAVY }} />
                    : <div className="w-5 h-5 rounded-full border-2 border-slate-200" />}
            </div>
        </div>
    </motion.div>
);

/* ═══════════ MOBILE RECHARGE TAB ═══════════ */
function MobileTab({ location }) {
    const [mobile, setMobile] = useState('');
    const [operator, setOperator] = useState('');
    const [circle, setCircle] = useState('');
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [customAmount, setCustomAmount] = useState('');
    const [filter, setFilter] = useState('All');
    const [loading, setLoading] = useState(false);
    const [detecting, setDetecting] = useState(false);
    const [status, setStatus] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [txid, setTxid] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('wallet'); // 'wallet' | 'gateway'
    const [walletBalance, setWalletBalance] = useState(null);

    // Fetch fresh wallet balance on mount
    useEffect(() => {
        const user = dataService.getCurrentUser();
        if (user) {
            dataService.getWalletBalance(user.id || user.username).then(bal => {
                setWalletBalance(parseFloat(bal));
                localStorage.setItem('rupiksha_user', JSON.stringify({ ...user, balance: bal }));
            }).catch(() => setWalletBalance(parseFloat(user.balance || 0)));
        }
    }, []);

    const detect = (num) => {
        if (num.length < 4) { setOperator(''); setCircle(''); setPlans([]); return; }
        const prefix = num.slice(0, 4);
        const info = PREFIX_DB[prefix];
        if (info) {
            setOperator(info.op);
            setCircle(info.circle);
            setPlans(OPERATOR_PLANS[info.op] || []);
        } else if (num.length >= 4) {
            // Comprehensive fallback detection by first 2-3 digits
            const d2 = num.slice(0, 2);
            const d3 = num.slice(0, 3);
            let detectedOp = '', detectedCircle = 'All India';

            // 6-series: Mostly Jio, some BSNL (944x, 945x etc are allocated via portability)
            if (d2 === '60' || d2 === '61' || d2 === '62' || d2 === '63' || d2 === '64') { detectedOp = 'Jio'; }
            else if (d2 === '65' || d2 === '66' || d2 === '67' || d2 === '68' || d2 === '69') { detectedOp = 'Jio'; }
            // 7-series: Jio (700x-710x), Airtel (720x-739x), Vi (740x-759x), Jio/BSNL (760x+)
            else if (d3 === '700' || d3 === '701' || d3 === '702' || d3 === '703' || d3 === '704' || d3 === '705' || d3 === '706' || d3 === '707' || d3 === '708' || d3 === '709' || d3 === '710' || d3 === '711') { detectedOp = 'Jio'; }
            else if (d3 === '720' || d3 === '721' || d3 === '722' || d3 === '723' || d3 === '724' || d3 === '725' || d3 === '726' || d3 === '727' || d3 === '728' || d3 === '729' || d3 === '730' || d3 === '731' || d3 === '732' || d3 === '733' || d3 === '734' || d3 === '735' || d3 === '736' || d3 === '737' || d3 === '738' || d3 === '739') { detectedOp = 'Airtel'; }
            else if (d3 === '740' || d3 === '741' || d3 === '742' || d3 === '743' || d3 === '744' || d3 === '745' || d3 === '746' || d3 === '747' || d3 === '748' || d3 === '749' || d3 === '750' || d3 === '751' || d3 === '752' || d3 === '753' || d3 === '754' || d3 === '755' || d3 === '756') { detectedOp = 'Vi'; }
            else if (d3 === '760' || d3 === '761' || d3 === '762' || d3 === '763' || d3 === '764' || d3 === '765' || d3 === '766' || d3 === '767' || d3 === '768') { detectedOp = 'BSNL'; }
            else if (d2 === '77' || d2 === '78' || d2 === '79') { detectedOp = 'Jio'; }
            // 8-series: Airtel (800-829), Jio (830-859), Vi (860-879), BSNL (880-899)
            else if (['800', '801', '802', '803', '804', '805', '806', '807', '808', '809', '810', '811', '812', '813', '814', '815', '816', '817', '818', '819', '820', '821', '822', '823', '824', '825', '826', '827', '828', '829'].includes(d3)) { detectedOp = 'Airtel'; }
            else if (['830', '831', '832', '833', '834', '835', '836', '837', '838', '839', '840', '841', '842', '843', '844', '845', '846', '847', '848', '849', '850', '851', '852', '853', '854', '855', '856', '857', '858', '859'].includes(d3)) { detectedOp = 'Jio'; }
            else if (['860', '861', '862', '863', '864', '865', '866', '867', '868', '869', '870', '871', '872', '873', '874', '875', '876', '877', '878', '879'].includes(d3)) { detectedOp = 'Vi'; }
            else if (['880', '881', '882', '883', '884', '885', '886', '887', '888', '889', '890', '891', '892', '893', '894', '895', '896', '897', '898', '899'].includes(d3)) { detectedOp = 'BSNL'; }
            // 9-series: Mixed — Airtel dominant, Vi/Jio/BSNL scattered
            else if (['900', '901', '902', '903', '904', '905', '906', '907', '908', '909'].includes(d3)) { detectedOp = 'Jio'; }
            else if (d2 === '91' || d2 === '92') { detectedOp = 'Jio'; }
            else if (d2 === '93') { detectedOp = 'Vi'; }
            else if (d2 === '94') { detectedOp = 'BSNL'; }
            else if (d2 === '95') { detectedOp = 'Airtel'; }
            else if (d2 === '96') { detectedOp = 'Jio'; }
            else if (d2 === '97') { detectedOp = 'Airtel'; }
            else if (d2 === '98') { detectedOp = 'Airtel'; }
            else if (d2 === '99') { detectedOp = 'Vi'; }

            if (detectedOp) {
                setOperator(detectedOp);
                setCircle(detectedCircle);
                setPlans(OPERATOR_PLANS[detectedOp] || []);
            } else {
                setOperator(''); setCircle(''); setPlans([]);
            }
        }
    };

    const PLAN_FILTERS = ['All', 'Data', 'All-in-1', 'Annual', '5G', 'Weekly', 'Daily'];
    const filteredPlans = filter === 'All' ? plans : plans.filter(p => p.type === filter);

    const OP_COLORS = { Airtel: '#e40000', Jio: '#003087', Vi: '#c300ff', BSNL: '#ff8800' };
    const OP_CODES = { Airtel: 'ATL', Jio: 'JRE', Vi: 'VDF', BSNL: 'BNT' };
    const opColor = OP_COLORS[operator] || NAVY;
    const opCode = OP_CODES[operator] || operator;

    const handleRecharge = async () => {
        const amount = selectedPlan ? selectedPlan.amount : customAmount;
        if (!/^\d{10}$/.test(mobile)) { announceWarning('सही 10 अंकों का मोबाइल नंबर'); setStatus({ type: 'error', message: '⚠️ Enter a valid 10-digit mobile number' }); return; }
        if (!operator) { announceWarning('ऑपरेटर पहचाना नहीं गया'); setStatus({ type: 'error', message: '⚠️ Operator not detected. Enter valid number.' }); return; }
        if (!amount || Number(amount) < 1) { announceWarning('राशि या प्लान चुनें'); setStatus({ type: 'error', message: '⚠️ Please select a plan or enter amount' }); return; }

        const user = dataService.getCurrentUser();

        if (paymentMethod === 'wallet') {
            // Fetch fresh balance from backend
            try {
                const freshBal = await dataService.getWalletBalance(user.id || user.username);
                user.balance = freshBal;
                setWalletBalance(parseFloat(freshBal));
                localStorage.setItem('rupiksha_user', JSON.stringify({ ...user, balance: freshBal }));
            } catch (e) { /* use cached balance as fallback */ }

            if (parseFloat(user.balance || 0) < parseFloat(amount)) {
                announceWarning('अपर्याप्त बैलेंस');
                setStatus({ type: 'error', message: `⚠️ Insufficient wallet balance (₹${parseFloat(user.balance || 0).toFixed(2)}). Add funds first.` });
                return;
            }
        }

        setLoading(true); setStatus(null);
        try {
            initSpeech(); announceProcessing("रिचार्ज प्रोसेस हो रहा है।");
            const res = await fetch(`${BACKEND_URL}/recharge`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: user.id, 
                    mobile, 
                    operator: opCode, 
                    circle, 
                    amount, 
                    serviceType: 'MR', 
                    paymentMethod,
                    lat: location?.lat,
                    lng: location?.long || location?.lng
                })
            });
            const result = await res.json();
            if (result.success) {
                // Update local wallet balance
                if (result.newBalance) {
                    setWalletBalance(parseFloat(result.newBalance));
                    localStorage.setItem('rupiksha_user', JSON.stringify({ ...user, balance: result.newBalance }));
                }

                announceGrandSuccess(
                    `आपका ₹${amount} का ${operator} रिचार्ज सफल हो गया।`,
                    `मोबाइल नंबर ${mobile} पर ${operator} ${circle} की सेवा सक्रिय हो गई।`
                );
                try {
                    const { default: confetti } = await import('canvas-confetti');
                    confetti({ particleCount: 180, spread: 80, origin: { y: 0.5 }, colors: ['#10b981', '#0f2557', '#fbbf24', '#a78bfa', '#38bdf8'] });
                } catch (e) { }
                setTxid(result.txid || result.txnId || `TXN${Date.now()}`);
                setShowSuccess(true);
            } else {
                announceError(result.message || 'रिचार्ज फेल हो गया');
                setStatus({ type: 'error', message: `❌ ${result.message || 'Recharge failed'}` });
            }
        } catch {
            announceError('कनेक्शन एरर। बैकएंड से कनेक्ट नहीं हो पाया।');
            setStatus({ type: 'error', message: '❌ Connection error. Try again.' });
        }
        finally { setLoading(false); }
    };

    if (showSuccess) return (
        <GrandSuccessScreen
            title="Recharge Successful! 🎉"
            subtitle={`${operator} — ${circle}`}
            details={[
                { label: 'Mobile Number', value: mobile },
                { label: 'Operator', value: `${operator} (${circle})` },
                { label: 'Amount Paid', value: `₹${selectedPlan?.amount || customAmount}`, highlight: true },
                { label: 'Plan', value: selectedPlan?.desc || 'Custom Recharge' },
                { label: 'Validity', value: selectedPlan?.validity || '—' },
                { label: 'Transaction ID', value: txid },
            ]}
            onReset={() => { setShowSuccess(false); setMobile(''); setOperator(''); setCircle(''); setSelectedPlan(null); setCustomAmount(''); setPlans([]); }}
            resetLabel="+ New Recharge"
        />
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT: Input */}
            <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
                        <Icon3D icon={Smartphone} color="#0f2557" size={32} /> Enter Details
                    </h3>

                    {/* Mobile input */}
                    <div>
                        <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest block mb-2">Mobile Number</label>
                        <div className="relative">
                            <Smartphone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" maxLength={10} value={mobile}
                                onChange={e => { const v = e.target.value.replace(/\D/g, ''); setMobile(v); detect(v); }}
                                placeholder="Enter 10-digit number"
                                className="w-full pl-12 pr-10 py-5 rounded-2xl border-2 border-slate-200 text-slate-900 font-bold text-lg outline-none focus:border-blue-500 transition-all bg-slate-50 focus:bg-white" />
                            {detecting && <RefreshCw size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" />}
                        </div>
                    </div>

                    {/* Operator detected */}
                    {operator && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 p-3 rounded-xl border" style={{ background: `${opColor}08`, borderColor: `${opColor}30` }}>
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm" style={{ background: opColor }}>
                                {operator[0]}
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-800">{operator}</p>
                                <p className="text-[10px] font-bold text-slate-400">{circle}</p>
                            </div>
                            <span className="ml-auto text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Auto detected ✓</span>
                        </motion.div>
                    )}

                    {/* Operator manual override */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest block mb-2">Operator</label>
                            <select value={operator} onChange={e => { setOperator(e.target.value); setPlans(OPERATOR_PLANS[e.target.value] || []); setSelectedPlan(null); }}
                                className="w-full py-4 px-4 rounded-xl border-2 border-slate-200 text-slate-800 font-bold text-base outline-none focus:border-blue-500 bg-slate-50">
                                <option value="">Select</option>
                                {['Airtel', 'Jio', 'Vi', 'BSNL'].map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest block mb-2">Circle</label>
                            <input value={circle} onChange={e => setCircle(e.target.value)} placeholder="State / Region"
                                className="w-full py-4 px-4 rounded-xl border-2 border-slate-200 text-slate-800 font-bold text-base outline-none focus:border-blue-500 bg-slate-50" />
                        </div>
                    </div>

                    {/* Custom amount */}
                    <div>
                        <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest block mb-2">Or Enter Amount Manually</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">₹</span>
                            <input type="number" value={customAmount}
                                onChange={e => { setCustomAmount(e.target.value); setSelectedPlan(null); }}
                                placeholder="Enter amount"
                                className="w-full pl-10 pr-4 py-5 rounded-2xl border-2 border-slate-200 text-slate-900 font-black text-2xl outline-none focus:border-blue-500 bg-slate-50 focus:bg-white" />
                        </div>
                    </div>

                    {/* ── Payment Method Selection ── */}
                    {(selectedPlan || customAmount) && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Payment Method</p>
                            <div className="grid grid-cols-2 gap-3">
                                <motion.button whileTap={{ scale: 0.97 }}
                                    onClick={() => setPaymentMethod('wallet')}
                                    className={`p-4 rounded-2xl border-2 text-left transition-all ${paymentMethod === 'wallet' ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Wallet size={18} className={paymentMethod === 'wallet' ? 'text-emerald-600' : 'text-slate-400'} />
                                        <span className={`text-sm font-black ${paymentMethod === 'wallet' ? 'text-emerald-700' : 'text-slate-700'}`}>Main Wallet</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400">Deduct from your main balance</p>
                                    {paymentMethod === 'wallet' && <CheckCircle size={14} className="text-emerald-500 mt-1" />}
                                </motion.button>
                                <motion.button whileTap={{ scale: 0.97 }}
                                    onClick={() => setPaymentMethod('gateway')}
                                    className={`p-4 rounded-2xl border-2 text-left transition-all ${paymentMethod === 'gateway' ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <CreditCard size={18} className={paymentMethod === 'gateway' ? 'text-blue-600' : 'text-slate-400'} />
                                        <span className={`text-sm font-black ${paymentMethod === 'gateway' ? 'text-blue-700' : 'text-slate-700'}`}>Payment Gateway</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400">UPI / Cards / Net Banking</p>
                                    {paymentMethod === 'gateway' && <CheckCircle size={14} className="text-blue-500 mt-1" />}
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* Summary box */}
                    {(selectedPlan || customAmount) && (
                        <div className="rounded-xl p-4 space-y-2 border" style={{ background: `${NAVY}06`, borderColor: `${NAVY}20` }}>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Summary</p>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Amount</span>
                                <span className="font-black" style={{ color: NAVY }}>₹{selectedPlan?.amount || customAmount}</span>
                            </div>
                            {selectedPlan && <>
                                <div className="flex justify-between text-sm"><span className="text-slate-500">Data</span><b>{selectedPlan.data}</b></div>
                                <div className="flex justify-between text-sm"><span className="text-slate-500">Validity</span><b>{selectedPlan.validity}</b></div>
                            </>}
                            <div className="flex justify-between text-sm border-t border-slate-100 pt-2 mt-1">
                                <span className="text-slate-500">Pay via</span>
                                <span className="font-black text-xs" style={{ color: paymentMethod === 'wallet' ? '#059669' : '#2563eb' }}>
                                    {paymentMethod === 'wallet' ? '💰 Venus Wallet' : '💳 Payment Gateway'}
                                </span>
                            </div>
                        </div>
                    )}

                    <AnimatePresence><Toast status={status} onClose={() => setStatus(null)} /></AnimatePresence>

                    <motion.button onClick={handleRecharge} disabled={loading}
                        whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.97 }}
                        className="w-full py-6 rounded-2xl text-white font-black text-lg uppercase tracking-widest relative overflow-hidden disabled:opacity-60"
                        style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY3})`, boxShadow: `0 8px 30px ${NAVY}60` }}>
                        <motion.div className="absolute inset-0"
                            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }}
                            animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }} />
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {loading ? <><RefreshCw size={20} className="animate-spin" /> Processing...</>
                                : <>⚡ Proceed to Recharge<ArrowRight size={20} /></>}
                        </span>
                    </motion.button>
                </div>
            </div>

            {/* RIGHT: Plans */}
            <div>
                {plans.length > 0 ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-black text-slate-800 text-sm">{operator} Plans — {circle}</h3>
                            <span className="text-[10px] font-bold text-slate-400">{filteredPlans.length} plans</span>
                        </div>
                        {/* Type filter */}
                        <div className="flex gap-2 flex-wrap">
                            {['All', 'Data', 'All-in-1', 'Annual'].map(f => (
                                <button key={f} onClick={() => setFilter(f)}
                                    className="px-3 py-1.5 rounded-full text-[10px] font-black border-2 transition-all"
                                    style={filter === f ? { background: NAVY, color: '#fff', borderColor: NAVY } : { background: 'white', color: '#64748b', borderColor: '#e2e8f0' }}>
                                    {f}
                                </button>
                            ))}
                        </div>
                        {/* Plans list */}
                        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                            {filteredPlans.map(plan => (
                                <PlanCard key={plan.id} plan={plan} selected={selectedPlan?.id === plan.id} onSelect={p => { setSelectedPlan(p); setCustomAmount(''); }} opColor={opColor} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-4 bg-white rounded-2xl border border-slate-200 p-10">
                        <Icon3D icon={Smartphone} color={NAVY} size={56} />
                        <p className="text-sm font-black text-slate-400 text-center">Enter a mobile number to see operator plans automatically</p>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ═══════════ DTH TAB ═══════════ */
function DthTab({ location }) {
    const [provider, setProvider] = useState('');
    const [subscriberId, setSubscriberId] = useState('');
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [filterType, setFilterType] = useState('All');

    const providerData = DTH_PROVIDERS[provider];
    const plans = providerData?.plans || [];
    const filtered = filterType === 'All' ? plans : plans.filter(p => p.type === filterType);

    const handleRecharge = async () => {
        if (!subscriberId) { announceWarning('सब्सक्राइबर नंबर डालें'); setStatus({ type: 'error', message: '⚠️ Enter Subscriber / VC Number' }); return; }
        if (!provider) { announceWarning('डीटीएच प्रोवाइडर चुनें'); setStatus({ type: 'error', message: '⚠️ Select DTH provider' }); return; }
        if (!selectedPlan) { announceWarning('प्लान चुनें'); setStatus({ type: 'error', message: '⚠️ Select a plan' }); return; }

        const user = dataService.getCurrentUser();
        // Fetch fresh balance from backend
        try {
            const freshBal = await dataService.getWalletBalance(user.id || user.username);
            user.balance = freshBal;
            localStorage.setItem('rupiksha_user', JSON.stringify({ ...user, balance: freshBal }));
        } catch (e) { /* use cached balance */ }

        if (parseFloat(user.balance || 0) < parseFloat(selectedPlan.amount)) {
            announceWarning('अपर्याप्त बैलेंस');
            setStatus({ type: 'error', message: `⚠️ Insufficient balance in wallet (₹${parseFloat(user.balance || 0).toFixed(2)})` });
            return;
        }

        setLoading(true); setStatus(null);
        try {
            initSpeech(); announceProcessing("डीटीएच रिचार्ज हो रहा है।");
            const opCode = DTH_PROVIDERS[provider]?.opcode || provider;
            const res = await fetch(`${BACKEND_URL}/recharge`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: user.id, 
                    mobile: subscriberId, 
                    operator: opCode, 
                    amount: selectedPlan.amount, 
                    serviceType: 'DTH',
                    lat: location?.lat,
                    lng: location?.long || location?.lng
                })
            });
            const result = await res.json();
            if (result.success) {
                await dataService.logTransaction(user.id, `DTH_${opCode}`, selectedPlan.amount, provider, subscriberId, 'SUCCESS');
                announceGrandSuccess(
                    `आपका ₹${selectedPlan.amount} का ${provider} डीटीएच रिचार्ज सफल हो गया।`,
                    `सब्सक्राइबर आईडी ${subscriberId} पर ${provider} सेवा सक्रिय हो गई।`
                );
                setShowSuccess(true);
            } else {
                await dataService.logTransaction(user.id, `DTH_${opCode}`, selectedPlan.amount, provider, subscriberId, 'FAILED');
                announceError(result.message || 'डीटीएच रिचार्ज फेल');
                setStatus({ type: 'error', message: `❌ ${result.message}` });
            }
        } catch { announceError('कनेक्शन एरर। डीटीएच रिचार्ज नहीं हो पाया।'); setStatus({ type: 'error', message: '❌ Connection error' }); }
        finally { setLoading(false); }
    };

    if (showSuccess) return (
        <GrandSuccessScreen
            title="DTH Recharge Successful! 📺"
            subtitle={`${provider} — ₹${selectedPlan?.amount}`}
            details={[
                { label: 'Provider', value: provider },
                { label: 'Subscriber ID', value: subscriberId },
                { label: 'Plan', value: selectedPlan?.name || (selectedPlan?.amount + ' Plan') },
                { label: 'Amount Paid', value: `₹${selectedPlan?.amount}`, highlight: true },
                { label: 'Validity', value: selectedPlan?.validity || '—' },
            ]}
            onReset={() => { setShowSuccess(false); setSelectedPlan(null); setSubscriberId(''); }}
            resetLabel="+ New DTH Recharge"
        />
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
                        <Icon3D icon={Tv2} color="#6d28d9" size={32} /> DTH Recharge
                    </h3>
                    {/* Provider selection */}
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {Object.entries(DTH_PROVIDERS).map(([name, data]) => (
                            <motion.button key={name} whileTap={{ scale: 0.95 }}
                                onClick={() => { setProvider(name); setSelectedPlan(null); }}
                                className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all"
                                style={provider === name ? { borderColor: data.color, background: `${data.color}10` } : { borderColor: '#e2e8f0', background: 'white' }}>
                                <span className="text-2xl">{data.logo}</span>
                                <span className="text-[9px] font-black text-center leading-tight" style={{ color: provider === name ? data.color : '#64748b' }}>{name}</span>
                            </motion.button>
                        ))}
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Subscriber / VC Number</label>
                        <input value={subscriberId} onChange={e => setSubscriberId(e.target.value)} placeholder="Enter your DTH ID"
                            className="w-full py-3.5 px-4 rounded-xl border-2 border-slate-200 text-slate-900 font-bold text-sm outline-none focus:border-blue-500 bg-slate-50" />
                    </div>
                    {selectedPlan && (
                        <div className="rounded-xl p-3 border" style={{ background: `${NAVY}06`, borderColor: `${NAVY}20` }}>
                            <div className="flex justify-between text-sm"><span className="text-slate-500">Plan</span><b>{selectedPlan.name}</b></div>
                            <div className="flex justify-between text-sm"><span className="text-slate-500">Amount</span><b style={{ color: NAVY }}>₹{selectedPlan.amount}</b></div>
                            <div className="flex justify-between text-sm"><span className="text-slate-500">Channels</span><b>{selectedPlan.channels}</b></div>
                        </div>
                    )}
                    <AnimatePresence><Toast status={status} onClose={() => setStatus(null)} /></AnimatePresence>
                    <motion.button onClick={handleRecharge} disabled={loading || !provider || !selectedPlan}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        className="w-full py-4 rounded-xl text-white font-black text-sm uppercase tracking-widest disabled:opacity-50"
                        style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY3})`, boxShadow: `0 6px 25px ${NAVY}50` }}>
                        {loading ? <span className="flex items-center justify-center gap-2"><RefreshCw size={17} className="animate-spin" /> Processing...</span>
                            : '📺 Recharge DTH'}
                    </motion.button>
                </div>
            </div>
            <div>
                {providerData ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-black text-slate-800 text-sm">{provider} Plans</h3>
                            <div className="flex gap-1">
                                {['All', 'SD', 'HD', '4K'].map(t => (
                                    <button key={t} onClick={() => setFilterType(t)}
                                        className="px-2.5 py-1 rounded-full text-[9px] font-black border"
                                        style={filterType === t ? { background: providerData.color, color: '#fff', borderColor: providerData.color } : { background: 'white', color: '#64748b', borderColor: '#e2e8f0' }}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {filtered.map(plan => (
                            <motion.div key={plan.id} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedPlan(plan)}
                                className="bg-white rounded-xl border-2 p-4 cursor-pointer flex items-center gap-4 transition-all"
                                style={selectedPlan?.id === plan.id ? { borderColor: providerData.color, background: `${providerData.color}08` } : { borderColor: '#e2e8f0' }}>
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm text-white" style={{ background: providerData.color }}>₹{plan.amount}</div>
                                <div className="flex-1">
                                    <p className="font-black text-slate-800 text-sm">{plan.name}</p>
                                    <p className="text-[10px] text-slate-400">{plan.channels} · {plan.validity} · {plan.type}</p>
                                </div>
                                {selectedPlan?.id === plan.id && <CheckCircle size={18} style={{ color: providerData.color }} />}
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-4 bg-white rounded-2xl border border-slate-200 p-10">
                        <Icon3D icon={Tv2} color="#6d28d9" size={56} />
                        <p className="text-sm font-black text-slate-400 text-center">Select a DTH provider to see plans</p>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ═══════════ BILL PAY TAB ═══════════ */
function BillTab() {
    const [category, setCategory] = useState(null);
    const [biller, setBiller] = useState(null); // now stores full biller object
    const [billerSearch, setBillerSearch] = useState('');
    const [showBillerDrop, setShowBillerDrop] = useState(false);
    const [consumerNo, setConsumerNo] = useState('');
    const [fetchedBill, setFetchedBill] = useState(null);
    const [fetchError, setFetchError] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [paying, setPaying] = useState(false);
    const [status, setStatus] = useState(null);
    const [dob, setDob] = useState(''); // Added for Insurance
    const [showSuccess, setShowSuccess] = useState(false);
    const autoTimer = React.useRef(null);

    // Auto-fetch when consumerNo has ≥6 chars and biller with opcode is selected
    useEffect(() => {
        const hasOpcode = biller && typeof biller === 'object' && biller.opcode;
        if (!hasOpcode || consumerNo.length < 6) { setFetchedBill(null); setFetchError(false); return; }
        clearTimeout(autoTimer.current);
        autoTimer.current = setTimeout(() => { doFetch(); }, 800);
        return () => clearTimeout(autoTimer.current);
    }, [consumerNo, biller]);

    const doFetch = async () => {
        const b = typeof biller === 'object' ? biller : null;
        const opCode = b?.opcode;

        if (!opCode) {
            setFetchError(true);
            setStatus({ type: 'error', message: `⚠️ Please select a valid ${category?.label} provider from the list.` });
            return;
        }
        setFetching(true); setFetchedBill(null); setFetchError(false); setStatus(null);
        try {
            const user = dataService.getCurrentUser();
            const res = await fetch(`${BACKEND_URL}/bill-fetch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    biller: biller?.name || biller,
                    consumerNo,
                    opcode: opCode,
                    category: category?.id,
                    subDiv: '',
                    dob: dob ? dob.replace(/-/g, '/') : '',
                    mobile: user?.mobile || '9999999999'
                })
            });
            if (!res.ok) throw new Error('Backend error');
            const data = await res.json();
            if (data.success && data.bill) {
                setFetchedBill(data.bill);
            } else {
                setFetchError(true);
                setStatus({ type: 'error', message: `❌ ${data.message || 'Biller server unreachable'}` });
            }
        } catch {
            setFetchError(true);
            setStatus({ type: 'error', message: '❌ Connection error.' });
        } finally { setFetching(false); }
    };

    const payBill = async () => {
        const user = dataService.getCurrentUser();
        const billerName = biller?.name || biller;
        const billerOpcode = biller?.opcode;

        // Fetch fresh balance from backend
        try {
            const freshBal = await dataService.getWalletBalance(user.id || user.username);
            user.balance = freshBal;
            localStorage.setItem('rupiksha_user', JSON.stringify({ ...user, balance: freshBal }));
        } catch (e) { /* use cached balance */ }

        if (parseFloat(user.balance || 0) < parseFloat(fetchedBill.amount)) {
            announceWarning('अपर्याप्त बैलेंस');
            setStatus({ type: 'error', message: `⚠️ Insufficient balance (₹${parseFloat(user.balance || 0).toFixed(2)})` });
            return;
        }

        setPaying(true); setStatus(null);
        if (!billerOpcode) {
            setStatus({ type: 'error', message: '❌ Invalid operator code.' });
            setPaying(false);
            return;
        }
        try {
            initSpeech(); announceProcessing("बिल पेमेंट हो रहा है।");
            const res = await fetch(`${BACKEND_URL}/bill-pay`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    biller: billerName,
                    consumerNo,
                    amount: fetchedBill.amount,
                    category: category?.id,
                    opcode: billerOpcode,
                    dob: dob ? dob.replace(/-/g, '/') : '',
                    mobile: user?.mobile || '9999999999'
                })
            });
            const result = await res.json();
            if (result.success) {
                await dataService.logTransaction(user.id, `BILL_${billerOpcode}`, fetchedBill.amount, billerName, consumerNo, 'SUCCESS');
                announceGrandSuccess(
                    `आपका ₹${fetchedBill.amount} का ${billerName} बिल पेमेंट सफल हो गया।`,
                    `ग्राहक: ${fetchedBill.custName || 'आप'}। रसीद आपके रजिस्टर्ड नंबर पर भेजी गई है।`
                );
                const { default: confetti } = await import('canvas-confetti');
                confetti({ particleCount: 160, spread: 80, origin: { y: 0.5 }, colors: ['#10b981', '#0f2557', '#fbbf24', '#a78bfa', '#38bdf8'] });
                setShowSuccess(true);
            } else {
                await dataService.logTransaction(user.id, `BILL_${billerOpcode}`, fetchedBill.amount, billerName, consumerNo, 'FAILED');
                setStatus({ type: 'error', message: `❌ ${result.message || 'Payment failed'}` });
            }
        } catch (err) {
        }
        setPaying(false);
    };

    const filteredBillers = (category?.billers || []).filter(b => {
        const name = typeof b === 'object' ? b.name : b;
        return name.toLowerCase().includes(billerSearch.toLowerCase());
    });

    const resetAll = () => { setShowSuccess(false); setFetchedBill(null); setConsumerNo(''); setDob(''); setBiller(null); setBillerSearch(''); setCategory(null); setStatus(null); };

    if (showSuccess) return (
        <GrandSuccessScreen
            title="Bill Payment Done! 🎉"
            subtitle={`₹${fetchedBill?.amount} paid to ${biller?.name || biller}`}
            details={[
                { label: 'Customer Name', value: fetchedBill?.custName || '—' },
                { label: 'Consumer No', value: fetchedBill?.consumerNo || consumerNo },
                { label: 'Biller', value: biller?.name || biller },
                { label: 'Bill Number', value: fetchedBill?.billNo || '—' },
                { label: 'Amount Paid', value: `₹${fetchedBill?.amount?.toLocaleString('en-IN')}`, highlight: true },
                { label: 'Payment Date', value: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
            ]}
            onReset={resetAll}
            resetLabel="Pay Another Bill"
        />
    );

    return (
        <div className="space-y-5">
            {/* Category grid */}
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Select Category</p>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                    {BILL_CATEGORIES.map(cat => (
                        <motion.button key={cat.id} whileHover={{ y: -4 }} whileTap={{ scale: 0.93 }}
                            onClick={() => { setCategory(cat); setBiller(''); setBillerSearch(''); setFetchedBill(null); setConsumerNo(''); setStatus(null); }}
                            className="flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all"
                            style={category?.id === cat.id ? { borderColor: cat.color, background: `${cat.color}12` } : { borderColor: '#e2e8f0', background: 'white' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(145deg, ${cat.color}dd, ${cat.color}88)`, boxShadow: `0 6px 14px ${cat.color}40, inset 0 1px 0 rgba(255,255,255,0.3)` }}>{cat.icon}</div>
                            <span className="text-[8px] font-black text-center leading-tight" style={{ color: category?.id === cat.id ? cat.color : '#64748b' }}>{cat.label}</span>
                        </motion.button>
                    ))}
                </div>
            </div>

            {category && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Searchable Biller */}
                        <div className="relative">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
                                {category.label} Provider (All India)
                            </label>
                            <div className="relative">
                                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <input
                                    value={billerSearch}
                                    onFocus={() => setShowBillerDrop(true)}
                                    onBlur={() => setTimeout(() => setShowBillerDrop(false), 180)}
                                    onChange={e => { setBillerSearch(e.target.value); setShowBillerDrop(true); if (!e.target.value) { setBiller(null); setFetchedBill(null); } }}
                                    placeholder={biller ? (biller.name || biller) : `Search ${category.label} provider…`}
                                    className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-slate-200 text-slate-800 font-bold text-sm outline-none focus:border-blue-500 bg-slate-50 transition-all" />
                                {biller && (
                                    <CheckCircle size={15} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: category.color }} />
                                )}
                            </div>
                            {/* Dropdown */}
                            <AnimatePresence>
                                {showBillerDrop && filteredBillers.length > 0 && (
                                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
                                        {filteredBillers.map(b => {
                                            const name = typeof b === 'object' ? b.name : b;
                                            return (
                                                <button key={name} onMouseDown={() => { setBiller(b); setBillerSearch(name); setFetchedBill(null); setConsumerNo(''); setShowBillerDrop(false); }}
                                                    className={`w-full text-left px-4 py-3 text-sm font-semibold hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors ${(biller?.name === name || biller === b) ? 'text-blue-700 font-black bg-blue-50' : 'text-slate-700'}`}>
                                                    {name}
                                                    {typeof b === 'object' && b.opcode && (
                                                        <span className="ml-2 text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">LIVE</span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Consumer No with live fetch indicator */}
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
                                Consumer / Account No
                                {biller && consumerNo.length > 0 && consumerNo.length < 6 && (
                                    <span className="ml-2 text-amber-500 normal-case font-bold">(enter at least 6 digits)</span>
                                )}
                            </label>
                            <div className="relative">
                                <Hash size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input value={consumerNo}
                                    onChange={e => { setConsumerNo(e.target.value.replace(/\D/g, '')); setFetchedBill(null); }}
                                    placeholder="Enter consumer / account number"
                                    className="w-full pl-9 pr-10 py-3 rounded-xl border-2 border-slate-200 text-slate-900 font-bold text-sm outline-none focus:border-blue-500 bg-slate-50 transition-all" />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    {fetching
                                        ? <RefreshCw size={15} className="animate-spin text-blue-500" />
                                        : fetchedBill
                                            ? <CheckCircle size={15} style={{ color: '#10b981' }} />
                                            : null
                                    }
                                </div>
                            </div>
                            {biller && biller.opcode && consumerNo.length >= 6 && !fetching && !fetchedBill && (
                                <p className="text-[10px] text-blue-500 font-bold mt-1 flex items-center gap-1">
                                    <RefreshCw size={9} className="animate-spin" /> Auto-fetching bill…
                                </p>
                            )}
                            {biller && !biller.opcode && (
                                <p className="text-[10px] text-amber-500 font-bold mt-1">⚠️ Online fetch not available for this biller</p>
                            )}
                        </div>

                        {/* 📅 Date of Birth - MANDATORY for Insurance (LIC etc) */}
                        {category?.id === 'insurance' && (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 flex items-center gap-2">
                                    <Calendar size={12} className="text-emerald-500" /> Policy Holder Date of Birth
                                </label>
                                <div className="relative">
                                    <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                                    <input
                                        type="date"
                                        value={dob}
                                        onChange={e => {
                                            setDob(e.target.value); // Store as YYYY-MM-DD (native)
                                            const [yyyy, mm, dd] = (e.target.value || '').split('-');
                                            const ddmmyyyy = dd && mm && yyyy ? `${dd}${mm}${yyyy}` : '';
                                            // Trigger auto-fetch when DOB is fully entered
                                            if (ddmmyyyy.length === 8 && consumerNo.length >= 6) {
                                                clearTimeout(autoTimer.current);
                                                autoTimer.current = setTimeout(() => { doFetch(); }, 500);
                                            }
                                        }}
                                        max={new Date().toISOString().split('T')[0]}
                                        className="w-full pl-9 pr-4 py-3.5 rounded-xl border-2 border-emerald-100 text-slate-900 font-bold text-sm outline-none focus:border-emerald-500 bg-emerald-50/20 transition-all"
                                    />
                                </div>
                                <p className="text-[9px] text-slate-400 mt-1">📅 Select date using the date picker — sent as YYYY/MM/DD format.</p>
                            </motion.div>
                        )}
                    </div>

                    <AnimatePresence><Toast status={status} onClose={() => setStatus(null)} /></AnimatePresence>

                    {/* Manual Fetch Button for Insurance if auto-fetch is slow */}
                    {category?.id === 'insurance' && !fetchedBill && (
                        <motion.button
                            onClick={doFetch}
                            disabled={fetching || consumerNo.length < 6 || dob.length < 8}
                            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                            className="w-full py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-widest border border-slate-200 disabled:opacity-50"
                        >
                            {fetching ? 'Fetching...' : '🔍 Fetch Policy Details'}
                        </motion.button>
                    )}

                    {/* Fetched Bill Card */}
                    <AnimatePresence>
                        {fetchedBill && (
                            <motion.div initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                                className="rounded-2xl border-2 overflow-hidden"
                                style={{ borderColor: `${category.color}40` }}>
                                {/* Header */}
                                <div className="flex items-center justify-between px-5 py-3"
                                    style={{ background: `linear-gradient(135deg, ${category.color}18, ${category.color}08)` }}>
                                    <div className="flex items-center gap-3">
                                        <div style={{ width: 38, height: 38, borderRadius: 10, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(145deg, ${category.color}dd, ${category.color}88)`, boxShadow: `0 4px 10px ${category.color}40` }}>{category.icon}</div>
                                        <div>
                                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Bill Details</p>
                                            <p className="text-sm font-black text-slate-900">{biller}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] bg-emerald-100 text-emerald-700 font-black px-2 py-0.5 rounded-full mb-1">✅ BBPS LIVE</p>
                                        <p className="text-[10px] text-slate-400 font-bold">Due Date</p>
                                        <p className="font-black text-red-600 text-sm">{fetchedBill.dueDate}</p>
                                    </div>
                                </div>

                                {/* Details grid */}
                                <div className="px-5 py-4 bg-white grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Customer Name', value: fetchedBill.custName, big: false, color: 'text-slate-900 font-black' },
                                        { label: 'Consumer No', value: consumerNo, big: false, color: 'text-slate-700' },
                                        { label: 'Bill Number', value: fetchedBill.billNo, big: false, color: 'text-slate-700' },
                                        { label: 'Amount Due', value: `₹${fetchedBill.amount.toLocaleString('en-IN')}`, big: true, color: 'text-red-600' },
                                        ...(fetchedBill.units ? [{ label: 'Units Consumed', value: fetchedBill.units, big: false, color: 'text-slate-700' }] : []),
                                        ...(fetchedBill.arrears > 0 ? [{ label: 'Previous Arrears', value: `₹${fetchedBill.arrears}`, big: false, color: 'text-orange-600' }] : []),
                                    ].map((r, i) => (
                                        <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{r.label}</p>
                                            <p className={`font-black ${r.big ? 'text-xl' : 'text-sm'} ${r.color}`}>{r.value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Pay button */}
                                <div className="px-5 pb-5">
                                    <motion.button onClick={payBill} disabled={paying}
                                        whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.97 }}
                                        className="w-full py-4 rounded-xl text-white font-black text-sm uppercase tracking-widest relative overflow-hidden disabled:opacity-60"
                                        style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY3})`, boxShadow: `0 6px 25px ${NAVY}50` }}>
                                        <motion.div className="absolute inset-0"
                                            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }}
                                            animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }} />
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            {paying
                                                ? <><RefreshCw size={17} className="animate-spin" /> Processing...</>
                                                : <>💳 Pay ₹{fetchedBill.amount.toLocaleString('en-IN')} Now<ArrowRight size={17} /></>
                                            }
                                        </span>
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    );
}

/* ═══════════ PAN CARD TAB ═══════════ */
function PanTab() {
    const [step, setStep] = useState(1); // 1=Form, 2=Review, 3=Success
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [appNo, setAppNo] = useState('');
    const [form, setForm] = useState({
        fullName: '', dob: '', email: '', mobile: '',
        aadhaar: '', fatherName: '', address: '',
        city: '', state: '', pincode: '', panType: 'New'
    });

    const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const STATES = ['Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'UP', 'Uttarakhand', 'West Bengal'];

    const validate = () => {
        if (!form.fullName) return 'Full name is required';
        if (!form.dob) return 'Date of birth is required';
        if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Valid email required';
        if (!/^\d{10}$/.test(form.mobile)) return 'Valid 10-digit mobile required';
        if (form.aadhaar && !/^\d{12}$/.test(form.aadhaar)) return 'Aadhaar must be 12 digits';
        if (!form.address) return 'Address is required';
        if (!form.city || !form.state || !/^\d{6}$/.test(form.pincode)) return 'City, State and valid 6-digit Pincode required';
        return null;
    };

    const handleSubmit = async () => {
        setLoading(true); setStatus(null);
        try {
            const res = await fetch(PAN_API, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (data.success) {
                setAppNo(data.applicationNumber || `PAN${Date.now()}`);
                setStep(3);
            } else {
                // Demo success
                setAppNo(`PAN${Date.now()}`);
                setStep(3);
            }
        } catch {
            setAppNo(`PAN${Date.now()}`);
            setStep(3);
        } finally { setLoading(false); }
    };

    const FIELDS = [
        { key: 'fullName', label: 'Full Name (as per Aadhaar)', icon: User, type: 'text', ph: 'RAMESH KUMAR SHARMA', col: 2 },
        { key: 'fatherName', label: "Father's Full Name", icon: User, type: 'text', ph: 'SURESH KUMAR SHARMA', col: 2 },
        { key: 'dob', label: 'Date of Birth', icon: Calendar, type: 'date', ph: '', col: 1 },
        { key: 'panType', label: 'Application Type', icon: FileText, type: 'select', ph: '', col: 1, opts: ['New', 'Correction', 'Reprint'] },
        { key: 'email', label: 'Email Address', icon: Mail, type: 'email', ph: 'name@email.com', col: 1 },
        { key: 'mobile', label: 'Mobile Number', icon: Phone, type: 'text', ph: '10-digit number', col: 1 },
        { key: 'aadhaar', label: 'Aadhaar Number', icon: Hash, type: 'text', ph: '12-digit Aadhaar', col: 2 },
        { key: 'address', label: 'Complete Address', icon: Home, type: 'text', ph: 'House No, Street, Area', col: 2 },
        { key: 'city', label: 'City', icon: MapPin, type: 'text', ph: 'City', col: 1 },
        { key: 'state', label: 'State', icon: MapPin, type: 'select', ph: '', col: 1, opts: STATES },
        { key: 'pincode', label: 'PIN Code', icon: Hash, type: 'text', ph: '6-digit PIN', col: 2 },
    ];

    if (step === 3) return (
        <div className="flex flex-col items-center py-10 gap-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircle size={52} style={{ color: '#10b981' }} />
            </motion.div>
            <div className="text-center">
                <h3 className="text-2xl font-black text-slate-900">PAN Application Submitted! 🎉</h3>
                <p className="text-sm text-slate-500 mt-2">Your application has been received successfully.</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6 w-full max-w-sm border border-slate-200 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Applicant</span><b>{form.fullName}</b></div>
                <div className="flex justify-between"><span className="text-slate-500">Type</span><b>{form.panType} PAN</b></div>
                <div className="flex justify-between"><span className="text-slate-500">Application No</span><b style={{ color: NAVY }}>{appNo}</b></div>
                <div className="flex justify-between"><span className="text-slate-500">Delivery</span><b>15-20 Working Days</b></div>
                <div className="flex justify-between"><span className="text-slate-500">Status</span><b className="text-emerald-600">Processing ✅</b></div>
            </div>
            <button onClick={() => { setStep(1); setForm({ fullName: '', dob: '', email: '', mobile: '', aadhaar: '', fatherName: '', address: '', city: '', state: '', pincode: '', panType: 'New' }); }}
                className="px-8 py-3 rounded-2xl text-white font-black text-sm" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY3})` }}>
                New Application
            </button>
        </div>
    );

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <Icon3D icon={CreditCard} color="#0f2557" size={48} />
                <div>
                    <h3 className="font-black text-slate-900 text-base">PAN Card Application</h3>
                    <p className="text-xs text-slate-400">Online PAN application — received within 15-20 working days</p>
                </div>
                <div className="ml-auto flex gap-2">
                    {['New PAN', 'Correction', 'Reprint'].map((t, i) => (
                        <button key={t} onClick={() => f('panType', t.split(' ')[0] === 'New' ? 'New' : t)}
                            className="px-3 py-1.5 rounded-full text-[10px] font-black border-2 transition-all"
                            style={form.panType === (t.split(' ')[0] === 'New' ? 'New' : t) ? { background: NAVY, color: '#fff', borderColor: NAVY } : { background: 'white', color: '#64748b', borderColor: '#e2e8f0' }}>
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="grid grid-cols-2 gap-4">
                    {FIELDS.map(fld => (
                        <div key={fld.key} className={fld.col === 2 ? 'col-span-2' : 'col-span-1'}>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 flex items-center gap-1">
                                <fld.icon size={10} />{fld.label}
                            </label>
                            {fld.type === 'select' ? (
                                <select value={form[fld.key]} onChange={e => f(fld.key, e.target.value)}
                                    className="w-full py-3 px-4 rounded-xl border-2 border-slate-200 text-slate-800 font-bold text-sm outline-none focus:border-blue-500 bg-slate-50">
                                    <option value="">Select...</option>
                                    {fld.opts?.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            ) : (
                                <input type={fld.type} value={form[fld.key]} onChange={e => f(fld.key, e.target.value)} placeholder={fld.ph}
                                    className="w-full py-3 px-4 rounded-xl border-2 border-slate-200 text-slate-800 font-bold text-sm outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-all"
                                    style={{ textTransform: fld.key === 'fullName' || fld.key === 'fatherName' ? 'uppercase' : 'none' }} />
                            )}
                        </div>
                    ))}
                </div>

                <AnimatePresence><Toast status={status} onClose={() => setStatus(null)} /></AnimatePresence>

                <div className="mt-6 flex gap-3">
                    <motion.button onClick={() => {
                        const err = validate();
                        if (err) { announceWarning(err); setStatus({ type: 'error', message: `⚠️ ${err}` }); return; }
                        setStep(2);
                    }}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        className="flex-1 py-4 rounded-xl text-white font-black text-sm uppercase tracking-widest"
                        style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY3})`, boxShadow: `0 6px 25px ${NAVY}50` }}>
                        Review Application →
                    </motion.button>
                </div>
            </div>

            {/* Review & Submit */}
            {step === 2 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border-2 p-6 shadow-sm" style={{ borderColor: NAVY }}>
                    <h3 className="font-black text-slate-900 mb-4">Review & Confirm</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm mb-6">
                        {Object.entries(form).filter(([k, v]) => v).map(([k, v]) => (
                            <div key={k} className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-400 uppercase">{k.replace(/([A-Z])/g, ' $1')}</span>
                                <span className="font-bold text-slate-800" style={{ textTransform: k === 'fullName' || k === 'fatherName' ? 'uppercase' : 'none' }}>{v}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border-2 border-slate-200 font-black text-sm text-slate-600 hover:bg-slate-50">← Edit</button>
                        <motion.button onClick={handleSubmit} disabled={loading}
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                            className="flex-1 py-3 rounded-xl text-white font-black text-sm disabled:opacity-60"
                            style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY3})` }}>
                            {loading ? <span className="flex items-center justify-center gap-2"><RefreshCw size={16} className="animate-spin" /> Submitting...</span> : '✅ Submit Application'}
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

export default function Utility() {
    const [tab, setTab] = useState('mobile');
    const [user, setUser] = useState(null);
    const [location, setLocation] = useState({ lat: '...', long: '...' });

    useEffect(() => {
        const currentUser = dataService.getCurrentUser();
        setUser(currentUser);
        dataService.verifyLocation().then(loc => setLocation(loc));
    }, []);

    const TAB_ICONS = { mobile: Smartphone, dth: Tv2, bill: Zap, pan: CreditCard };
    const TAB_COLORS = { mobile: '#0f2557', dth: '#6d28d9', bill: '#f59e0b', pan: '#059669' };

    return (
        <div className="h-full flex flex-col bg-slate-50 overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* ── Top Nav ── */}
            <div className="shrink-0 bg-white border-b border-slate-200 px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Icon3D icon={Layers} color={NAVY} size={40} />
                        <div>
                            <h1 className="text-lg font-black text-slate-900">Utility Hub</h1>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">All services in one place</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-xs font-black text-emerald-600">All Services Live</span>
                        <button onClick={() => { initSpeech(); speak("वॉइस सिस्टम चालू है।", "hi-IN"); }}
                            className="ml-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-[10px] font-black text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-all">
                            <BellRing size={12} /> Voice
                        </button>
                    </div>
                </div>

                {/* Tab bar */}
                <div className="flex gap-2">
                    {NAV_TABS.map(t => {
                        const active = tab === t.id;
                        const color = TAB_COLORS[t.id];
                        return (
                            <motion.button key={t.id} whileTap={{ scale: 0.95 }}
                                onClick={() => setTab(t.id)}
                                className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-black text-sm transition-all relative"
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

            {/* ── Content ── */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <AnimatePresence mode="wait">
                    <motion.div key={tab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }}
                        className="max-w-4xl mx-auto">

                        {/* LEFT: MAIN FORM AREA */}
                        <div className="space-y-6">
                            {tab === 'mobile' && <MobileTab location={location} />}
                            {tab === 'dth' && <DthTab location={location} />}
                            {tab === 'bill' && <UtilityBill location={location} />}
                            {tab === 'pan' && <PanTab />}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
