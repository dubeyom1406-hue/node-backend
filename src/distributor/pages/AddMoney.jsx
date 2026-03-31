import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2, Copy, CheckCircle2, Send, ShieldCheck,
    Landmark, CreditCard, Smartphone, Hash, ImageIcon,
    AlertCircle, IndianRupee, Clock, Zap, ArrowRight, X
} from 'lucide-react';
import { announceGrandSuccess } from '../../services/speechService';

/* ── Brand tokens (same as Utility.jsx) ── */
const NAVY = '#0f2557';
const NAVY2 = '#1a3a6b';
const NAVY3 = '#2257a8';

const AddMoney = () => {
    const [amount, setAmount] = useState('');
    const [mode, setMode] = useState('IMPS / NEFT');
    const [utr, setUtr] = useState('');
    const [copied, setCopied] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [slipName, setSlipName] = useState('');
    const fileRef = useRef();

    const bankDetails = [
        { label: 'Account Holder', val: 'RUPIKSHA FINTECH PVT LTD', icon: Building2 },
        { label: 'Bank Name', val: 'ICICI BANK', icon: Landmark },
        { label: 'Account No.', val: '002105112233', icon: CreditCard },
        { label: 'IFSC Code', val: 'ICIC0000021', icon: Hash },
        { label: 'Mobile / Phone', val: '+91-7839XXXXXX', icon: Smartphone },
    ];

    const quickAmts = [
        { label: '₹5K', val: '5000' },
        { label: '₹10K', val: '10000' },
        { label: '₹25K', val: '25000' },
        { label: '₹50K', val: '50000' },
    ];

    const payModes = ['IMPS / NEFT', 'RTGS', 'CDM Deposit', 'UPI Transfer'];

    const copyToClipboard = (val, key) => {
        navigator.clipboard.writeText(val);
        setCopied(key);
        setTimeout(() => setCopied(null), 1800);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        announceGrandSuccess(
            `आपका ₹${Number(amount).toLocaleString('en-IN')} का फंड रिक्वेस्ट सफलतापूर्वक भेजा गया।`,
            `15–30 मिनट में अप्रूवल हो जाएगा। रूपिक्षा डिस्ट्रिब्यूटर पोर्टल पर भरोसा रखने के लिए धन्यवाद।`
        );
        setShowSuccess(true);
    };

    /* ── Stat chips at top ── */
    const stats = [
        { label: 'Min. Transfer', val: '₹1,000', icon: IndianRupee, col: '#10b981' },
        { label: 'Approval Time', val: '15–30 min', icon: Clock, col: '#f59e0b' },
        { label: 'Speed', val: 'Instant', icon: Zap, col: '#6366f1' },
    ];

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-16">

            {/* ── Page Header ── */}
            <motion.div
                initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[4px] mb-1"
                        style={{ color: NAVY3 }}>DISTRIBUTOR PORTAL</p>
                    <h1 className="text-3xl font-black tracking-tight" style={{ color: NAVY }}>
                        Add Money
                    </h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Fund wallet via bank transfer — instant credit
                    </p>
                </div>
                <motion.div
                    whileHover={{ scale: 1.04 }}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl border"
                    style={{ background: 'linear-gradient(135deg,#ecfdf5,#d1fae5)', borderColor: '#6ee7b7' }}
                >
                    <ShieldCheck size={18} style={{ color: '#059669' }} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                        RBI Secured · 256-bit SSL
                    </span>
                </motion.div>
            </motion.div>

            {/* ── Stat chips ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="grid grid-cols-3 gap-4"
            >
                {stats.map((s, i) => (
                    <div key={i}
                        className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: `${s.col}18` }}>
                            <s.icon size={18} style={{ color: s.col }} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                            <p className="text-sm font-black text-slate-800">{s.val}</p>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* ── Main 2-col grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                {/* ══ LEFT: Bank Details Card (3 cols) ══ */}
                <motion.div
                    initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.12 }}
                    className="lg:col-span-3 space-y-5"
                >
                    {/* Bank card — navy gradient header */}
                    <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-100">
                        {/* Card header */}
                        <div className="p-7 relative overflow-hidden"
                            style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY3})` }}>
                            {/* Decorative circles */}
                            <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-10"
                                style={{ background: 'white' }} />
                            <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full opacity-10"
                                style={{ background: 'white' }} />
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                                    style={{ background: 'rgba(255,255,255,0.15)' }}>
                                    <Building2 size={28} color="white" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-white/60 uppercase tracking-[3px]">Official Transfer Account</p>
                                    <h3 className="text-xl font-black text-white tracking-tight mt-0.5">
                                        Company Bank Details
                                    </h3>
                                </div>
                            </div>
                        </div>

                        {/* Bank fields */}
                        <div className="bg-white p-6 space-y-3">
                            {bankDetails.map((item, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ x: 4 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                    className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/70 group cursor-default"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                                            style={{ background: `${NAVY}12` }}>
                                            <item.icon size={15} style={{ color: NAVY }} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                                            <p className="text-sm font-black text-slate-800 tracking-tight">{item.val}</p>
                                        </div>
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => copyToClipboard(item.val, i)}
                                        className="p-2 rounded-xl transition-all"
                                        style={{
                                            background: copied === i ? '#10b98120' : 'transparent',
                                            color: copied === i ? '#10b981' : '#94a3b8'
                                        }}
                                    >
                                        {copied === i
                                            ? <CheckCircle2 size={16} />
                                            : <Copy size={16} />}
                                    </motion.button>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Important notice */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }}
                        className="flex gap-4 p-5 rounded-2xl border"
                        style={{ background: '#fffbeb', borderColor: '#fde68a' }}
                    >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: '#fef3c7' }}>
                            <AlertCircle size={20} style={{ color: '#d97706' }} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1">
                                ज़रूरी सूचना
                            </p>
                            <p className="text-xs font-bold text-amber-700 leading-relaxed">
                                Fund transfer ke baad{' '}
                                <span className="font-black underline underline-offset-2">UTR No. aur Deposit Slip</span>{' '}
                                submit karna anivaarya hai. Approval{' '}
                                <span className="font-black">15–30 min</span> ke andar ho jayega.
                            </p>
                        </div>
                    </motion.div>
                </motion.div>

                {/* ══ RIGHT: Submission Form (2 cols) ══ */}
                <motion.div
                    initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.16 }}
                    className="lg:col-span-2"
                >
                    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                        {/* Form header */}
                        <div className="px-7 py-6 border-b border-slate-100 flex items-center justify-between"
                            style={{ background: 'linear-gradient(135deg,#f8fafc,#f1f5f9)' }}>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[3px]">Step 2</p>
                                <h3 className="text-lg font-black text-slate-800 tracking-tight">Submit Request</h3>
                            </div>
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                                style={{ background: `${NAVY}12` }}>
                                <Send size={18} style={{ color: NAVY }} />
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">

                            {/* Amount input */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Deposit Amount
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black"
                                        style={{ color: NAVY }}>₹</span>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        required min="1000"
                                        className="w-full pl-10 pr-4 py-4 rounded-2xl border text-lg font-black transition-all outline-none"
                                        style={{
                                            background: '#f8fafc',
                                            borderColor: amount ? NAVY3 : '#e2e8f0',
                                            color: NAVY,
                                            boxShadow: amount ? `0 0 0 3px ${NAVY3}18` : 'none'
                                        }}
                                    />
                                </div>
                                {/* Quick amount chips */}
                                <div className="grid grid-cols-4 gap-2 pt-1">
                                    {quickAmts.map(q => (
                                        <motion.button
                                            key={q.val} type="button"
                                            whileTap={{ scale: 0.93 }}
                                            onClick={() => setAmount(q.val)}
                                            className="py-2 rounded-xl text-[10px] font-black border transition-all"
                                            style={{
                                                background: amount === q.val ? NAVY : '#f1f5f9',
                                                color: amount === q.val ? 'white' : '#64748b',
                                                borderColor: amount === q.val ? NAVY : '#e2e8f0'
                                            }}
                                        >
                                            {q.label}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Payment mode */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Payment Mode
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {payModes.map(m => (
                                        <motion.button
                                            key={m} type="button"
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setMode(m)}
                                            className="py-3 px-3 rounded-2xl text-[10px] font-black border transition-all text-left"
                                            style={{
                                                background: mode === m ? `${NAVY}` : '#f8fafc',
                                                color: mode === m ? 'white' : '#64748b',
                                                borderColor: mode === m ? NAVY : '#e2e8f0',
                                                boxShadow: mode === m ? `0 4px 14px ${NAVY}35` : 'none'
                                            }}
                                        >
                                            {m}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* UTR input */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    UTR / Reference No.
                                </label>
                                <input
                                    type="text"
                                    placeholder="12-digit transaction ref."
                                    value={utr}
                                    onChange={e => setUtr(e.target.value)}
                                    required maxLength={22}
                                    className="w-full px-4 py-4 rounded-2xl border text-sm font-bold outline-none transition-all"
                                    style={{
                                        background: '#f8fafc',
                                        borderColor: utr ? NAVY3 : '#e2e8f0',
                                        color: '#1e293b',
                                        boxShadow: utr ? `0 0 0 3px ${NAVY3}18` : 'none'
                                    }}
                                />
                            </div>

                            {/* Slip upload */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Payment Slip
                                </label>
                                <label
                                    className="w-full h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group"
                                    style={{ borderColor: slipName ? NAVY3 : '#cbd5e1', background: slipName ? `${NAVY3}08` : '#f8fafc' }}
                                >
                                    <ImageIcon size={24} style={{ color: slipName ? NAVY3 : '#94a3b8' }} />
                                    <span className="text-[10px] font-black uppercase tracking-widest"
                                        style={{ color: slipName ? NAVY3 : '#94a3b8' }}>
                                        {slipName || 'Click to upload slip'}
                                    </span>
                                    <input type="file" className="hidden" ref={fileRef}
                                        onChange={e => setSlipName(e.target.files?.[0]?.name || '')} />
                                </label>
                            </div>

                            {/* Submit button */}
                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                className="w-full text-white font-black py-4 rounded-2xl text-[11px] uppercase tracking-widest flex items-center justify-center gap-2"
                                style={{
                                    background: `linear-gradient(135deg, ${NAVY}, ${NAVY3})`,
                                    boxShadow: `0 10px 30px ${NAVY}40`
                                }}
                            >
                                <Send size={15} />
                                Request Balance Update
                                <ArrowRight size={15} />
                            </motion.button>
                        </form>
                    </div>
                </motion.div>
            </div>

            {/* ══ Success Modal ══ */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ background: 'rgba(15,37,87,0.72)', backdropFilter: 'blur(10px)' }}
                    >
                        <motion.div
                            initial={{ scale: 0.82, opacity: 0, y: 32 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 220, damping: 14 }}
                            className="bg-white rounded-3xl max-w-sm w-full text-center relative overflow-hidden shadow-2xl"
                        >
                            {/* Top gradient bar */}
                            <div className="h-1.5 w-full"
                                style={{ background: 'linear-gradient(90deg,#10b981,#059669,#10b981)' }} />

                            <div className="p-8 space-y-5">
                                {/* Icon */}
                                <motion.div
                                    className="w-24 h-24 mx-auto rounded-full flex items-center justify-center"
                                    style={{
                                        background: 'linear-gradient(145deg,#10b981,#059669)',
                                        boxShadow: '0 0 0 8px rgba(16,185,129,0.15),0 20px 50px rgba(16,185,129,0.45)'
                                    }}
                                    initial={{ scale: 0.3, rotate: -20 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 250, damping: 13, delay: 0.1 }}
                                >
                                    <span style={{ fontSize: 46 }}>🏦</span>
                                </motion.div>

                                {/* Text */}
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.28 }}
                                >
                                    <p className="text-[10px] font-black uppercase tracking-[4px]"
                                        style={{ color: '#10b981' }}>✅ Request Submitted</p>
                                    <h3 className="text-2xl font-black text-slate-800 mt-1">Fund Request Sent!</h3>
                                    <p className="text-xs font-bold text-slate-500 mt-2 leading-relaxed">
                                        Aapka{' '}
                                        <span className="font-black"
                                            style={{ color: NAVY }}>
                                            ₹{Number(amount).toLocaleString('en-IN')}
                                        </span>{' '}
                                        fund request bhej diya gaya.
                                        15–30 min mein approval hogi.
                                    </p>
                                </motion.div>

                                {/* UTR info row */}
                                {utr && (
                                    <div className="p-3 rounded-2xl border text-left"
                                        style={{ background: `${NAVY}08`, borderColor: `${NAVY}20` }}>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">UTR / Ref No.</p>
                                        <p className="text-sm font-black mt-0.5" style={{ color: NAVY }}>{utr}</p>
                                    </div>
                                )}

                                {/* Close button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                    onClick={() => setShowSuccess(false)}
                                    className="w-full text-white font-black py-4 rounded-2xl text-[11px] uppercase tracking-widest"
                                    style={{
                                        background: `linear-gradient(135deg, ${NAVY}, ${NAVY3})`,
                                        boxShadow: `0 10px 30px ${NAVY}40`
                                    }}
                                >
                                    Okay, Understood
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AddMoney;
