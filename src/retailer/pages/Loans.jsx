import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dataService, BACKEND_URL } from '../../services/dataService';

// ─── Constants ─────────────────────────────────────────────────────────────────
const LENDERS = ['HDFC Bank', 'ICICI Bank', 'Axis Bank', 'SBI', 'Kotak Bank'];
const LOAN_FEATURES = [
    { icon: '⚡', label: 'Instant Approval', sub: 'Get offers within minutes' },
    { icon: '📄', label: 'Paperless Journey', sub: 'Fully digital, no physical docs' },
    { icon: '🏦', label: 'Multiple Lenders', sub: 'Compare 10+ bank offers' },
    { icon: '🔐', label: 'NPCI Secured', sub: 'End-to-end encrypted journey' },
];

const STATUS_CONFIG = {
    APPROVED: { color: 'emerald', icon: '✅', label: 'Approved', bg: 'bg-emerald-500' },
    REJECTED: { color: 'rose', icon: '❌', label: 'Rejected', bg: 'bg-rose-500' },
    INITIATED: { color: 'blue', icon: '🚀', label: 'Initiated', bg: 'bg-blue-500' },
    PENDING: { color: 'amber', icon: '⏳', label: 'Pending', bg: 'bg-amber-500' },
    PROCESSING: { color: 'indigo', icon: '⚙️', label: 'Processing', bg: 'bg-indigo-500' },
    UNKNOWN: { color: 'slate', icon: '🕒', label: 'Unknown', bg: 'bg-slate-400' },
};

// ─── PAN Validation ────────────────────────────────────────────────────────────
const validatePAN = (pan) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan?.toUpperCase());

// ─── Confetti ──────────────────────────────────────────────────────────────────
function Confetti() {
    const colors = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'];
    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => (
                <div key={i} className="absolute animate-bounce"
                    style={{
                        left: `${Math.random() * 100}%`, top: `-${Math.random() * 20}%`,
                        width: `${6 + Math.random() * 8}px`, height: `${6 + Math.random() * 8}px`,
                        background: colors[i % colors.length], borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                        animationDuration: `${1 + Math.random() * 2}s`, animationDelay: `${Math.random()}s`,
                        transform: `rotate(${Math.random() * 360}deg)`,
                    }} />
            ))}
        </div>
    );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────────
const Loans = () => {
    const currentUser = dataService.getCurrentUser();
    const [tab, setTab] = useState('personal');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Journey / SDK states
    const [journeyData, setJourneyData] = useState(null); // { url, phone, name, tracking_id, is_demo }
    const [journeyMode, setJourneyMode] = useState('form'); // 'form' | 'otp' | 'offers' | 'complete'
    const [journeyOtp, setJourneyOtp] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);

    // Loan Application Form
    const [form, setForm] = useState({
        first_name: currentUser?.name?.split(' ')[0] || '',
        last_name: currentUser?.name?.split(' ').slice(1).join(' ') || '',
        phone: currentUser?.mobile || currentUser?.phone || '',
        dob: '',
        pincode: '',
        pan: '',
        income: 30000,
        amount: 150000,
        employment_type: 'salaried',
    });
    const [panValid, setPanValid] = useState(null);

    // Tracking tab
    const [trackPhone, setTrackPhone] = useState(currentUser?.mobile || '');
    const [trackResult, setTrackResult] = useState(null);
    const [pollingRef, setPollingRef] = useState(null);

    // Loan stats
    const [loanStats, setLoanStats] = useState(null);

    useEffect(() => {
        // Fetch quick loan stats on mount
        dataService.getLoanStats().then(d => d.success && setLoanStats(d));
    }, []);

    useEffect(() => {
        return () => { if (pollingRef) clearInterval(pollingRef); };
    }, [pollingRef]);

    const handleTabChange = (t) => {
        setTab(t);
        setError('');
        setSuccess('');
        setTrackResult(null);
        if (pollingRef) clearInterval(pollingRef);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (name === 'pan') {
            setPanValid(value.length === 10 ? validatePAN(value) : null);
        }
    };

    // ── Handle Loan Application Submit ────────────────────────────────────────────
    const handleApply = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!validatePAN(form.pan)) {
            setError('Invalid PAN format. Example: ABCDE1234F');
            setLoading(false);
            return;
        }

        try {
            const data = await dataService.registerLoanLead({
                ...form,
                pan: form.pan.toUpperCase(),
                name: `${form.first_name} ${form.last_name}`.trim(),
                loanType: 'PL'
            });

            if (data.success && data.redirectionUrl) {
                setJourneyData(data);
                setJourneyMode(data.is_demo ? 'otp' : 'iframe');
            } else {
                setError(data.message || 'Unable to start loan journey. Please try again.');
            }
        } catch (err) {
            setError('Connection failed or Backend offline. Redirecting to demo...');
        } finally {
            setLoading(false);
        }
    };

    // ── Handle Journey OTP Verify (Mock Journey - mirrors mock_journey.php) ────────
    const handleOtpVerify = () => {
        if (journeyOtp === '123456' || journeyOtp === '111111') {
            setJourneyMode('offers');
        } else {
            setError('Invalid OTP. Use 123456 for simulation.');
        }
    };

    // ── Handle Offer Select (mirrors selectOffer JS in mock_journey.php) ──────────
    const handleSelectOffer = async (offer) => {
        setLoading(true);
        // Simulate webhook approval (mirrors simulateWebhook in admin_dashboard.php)
        try {
            await dataService.simulateLoanWebhook(journeyData?.tracking_id, 'approved');
        } catch (e) { }
        setLoading(false);
        setJourneyMode('complete');
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
    };

    // ── Handle Status Check ────────────────────────────────────────────────────────
    const handleTrack = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setTrackResult(null);
        if (pollingRef) clearInterval(pollingRef);

        try {
            const data = await dataService.checkLoanStatus(trackPhone);

            if (data.success) {
                setTrackResult(data);
                // Start polling
                if (!['APPROVED', 'REJECTED'].includes(data.status)) {
                    const interval = setInterval(async () => {
                        try {
                            const d = await dataService.checkLoanStatus(trackPhone);
                            if (d.success) {
                                setTrackResult(d);
                                if (['APPROVED', 'REJECTED'].includes(d.status)) {
                                    clearInterval(interval);
                                    if (d.status === 'APPROVED') {
                                        setShowConfetti(true);
                                        setTimeout(() => setShowConfetti(false), 4000);
                                    }
                                }
                            }
                        } catch (e) { }
                    }, 5000);
                    setPollingRef(interval);
                }
            } else {
                setError(data.message || 'Application not found for this number.');
            }
        } catch (err) {
            setError('Failed to fetch status. Switching to local search...');
        } finally {
            setLoading(false);
        }
    };

    // ── Render Journey iframe (for real ONDC SDK) ─────────────────────────────────
    if (journeyMode === 'iframe' && journeyData?.redirectionUrl) {
        return (
            <div className="fixed inset-0 z-[60] flex flex-col" style={{ background: 'rgba(2,6,23,0.7)', backdropFilter: 'blur(8px)' }}>
                <nav className="p-4 bg-white/90 backdrop-blur-md flex justify-between items-center shadow-lg border-b border-white/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-slate-800">Secure Loan Journey</h2>
                            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">Powered by ONDC Network</p>
                        </div>
                    </div>
                    <button onClick={() => { setJourneyData(null); setJourneyMode('form'); }}
                        className="text-xs font-black text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-rose-50">
                        ✕ Exit Journey
                    </button>
                </nav>
                <div className="flex-grow p-3 md:p-6 overflow-hidden">
                    <div className="w-full h-full rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-200">
                        <iframe src={journeyData.redirectionUrl} className="w-full h-full border-none" title="ONDC Loan Journey" />
                    </div>
                </div>
            </div>
        );
    }

    // ── Mock Journey: OTP Screen (mirrors mock_journey.php OTP screen) ─────────────
    if (journeyMode === 'otp' && journeyData) {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
                {showConfetti && <Confetti />}
                <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="max-w-md w-full rounded-3xl p-10 shadow-2xl border border-white/10"
                    style={{ background: 'rgba(30, 41, 59, 0.95)', backdropFilter: 'blur(20px)' }}>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-3xl font-black text-white shadow-lg shadow-indigo-500/30">R</div>
                        <div>
                            <h1 className="text-lg font-black text-white">Rupiksha Finance</h1>
                            <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">Simulation Mode • ONDC</p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-white mb-2">Verify Mobile</h2>
                        <p className="text-slate-400 text-sm">Enter OTP sent to <span className="text-white font-bold">{journeyData.phone}</span></p>
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">6-Digit OTP</label>
                            <input
                                type="text" maxLength={6} value={journeyOtp} onChange={e => { setJourneyOtp(e.target.value); setError(''); }}
                                placeholder="Enter 123456"
                                className="w-full rounded-2xl px-6 py-4 text-center text-3xl tracking-[0.5em] font-black text-white outline-none transition-all"
                                style={{ background: 'rgba(15,23,42,0.8)', border: error ? '2px solid #f43f5e' : '2px solid rgba(99,102,241,0.3)' }}
                                onFocus={e => e.target.style.border = '2px solid #6366f1'}
                                onBlur={e => e.target.style.border = error ? '2px solid #f43f5e' : '2px solid rgba(99,102,241,0.3)'}
                            />
                            {error && <p className="text-rose-400 text-xs text-center font-bold">{error}</p>}
                            <p className="text-slate-600 text-[10px] text-center font-bold uppercase tracking-widest">Hint: 123456 or 111111</p>
                        </div>

                        <button onClick={handleOtpVerify}
                            className="w-full py-4 rounded-2xl font-black text-lg text-white transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-emerald-500/20"
                            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                            VERIFY & CONTINUE →
                        </button>

                        <button onClick={() => { setJourneyData(null); setJourneyMode('form'); setError(''); }}
                            className="w-full py-3 rounded-2xl font-bold text-sm text-slate-500 hover:text-slate-300 transition-colors border border-white/5 hover:border-white/10">
                            ← Go Back
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ── Mock Journey: Offers Screen (mirrors offer-screen in mock_journey.php) ─────
    if (journeyMode === 'offers' && journeyData) {
        const mockOffers = [
            { lender: 'HDFC Bank', amount: journeyData.amount || 150000, roi: '10.5%', emi: '₹4,850', tenure: '36 months', badge: 'Best Rate', color: '#6366f1' },
            { lender: 'ICICI Bank', amount: (journeyData.amount || 150000) - 10000, roi: '11.0%', emi: '₹5,200', tenure: '36 months', badge: 'Quick Disbursal', color: '#8b5cf6' },
            { lender: 'Axis Bank', amount: (journeyData.amount || 150000) + 20000, roi: '12.5%', emi: '₹5,600', tenure: '48 months', badge: 'High Amount', color: '#ec4899' },
        ];

        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-auto" style={{ background: 'linear-gradient(135deg, #0f172a, #1e1b4b)' }}>
                {showConfetti && <Confetti />}
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full space-y-4 py-8">

                    <div className="text-center mb-8">
                        <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4"
                            style={{ background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.3)' }}>✓</div>
                        <h2 className="text-3xl font-black text-white">Offers Found! 🎉</h2>
                        <p className="text-slate-400 text-sm mt-2">Live quotes from {mockOffers.length} ONDC partner banks for {journeyData.name}</p>
                    </div>

                    {mockOffers.map((offer, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
                            className="rounded-3xl p-6 border transition-all hover:scale-[1.01]"
                            style={{ background: 'rgba(30,41,59,0.9)', borderColor: 'rgba(255,255,255,0.1)' }}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest"
                                        style={{ background: offer.color + '20', color: offer.color }}>{offer.badge}</span>
                                    <h3 className="text-lg font-black text-white mt-2">{offer.lender}</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-400 text-[10px] uppercase font-bold">ROI p.a.</p>
                                    <p className="text-2xl font-black" style={{ color: offer.color }}>{offer.roi}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mb-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <div>
                                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Loan Amount</p>
                                    <p className="text-white font-black text-lg">₹{offer.amount.toLocaleString('en-IN')}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Monthly EMI</p>
                                    <p className="text-white font-black text-lg">{offer.emi}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Tenure</p>
                                    <p className="text-white font-black text-lg">{offer.tenure}</p>
                                </div>
                            </div>
                            <button onClick={() => handleSelectOffer(offer)} disabled={loading}
                                className="w-full py-3 rounded-2xl font-black text-sm transition-all hover:opacity-90"
                                style={{ background: `linear-gradient(135deg, ${offer.color}, ${offer.color}aa)`, color: 'white' }}>
                                {loading ? 'PROCESSING...' : 'ACCEPT OFFER →'}
                            </button>
                        </motion.div>
                    ))}

                    <button onClick={() => { setJourneyData(null); setJourneyMode('form'); }}
                        className="w-full py-4 rounded-2xl font-bold text-slate-400 border border-white/10 hover:border-white/20 transition-all mt-4 text-sm">
                        ← Cancel & Go Back
                    </button>
                </motion.div>
            </div>
        );
    }

    // ── Journey Complete Screen ────────────────────────────────────────────────────
    if (journeyMode === 'complete') {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f172a, #0d2136)' }}>
                {showConfetti && <Confetti />}
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center">
                    <div className="w-32 h-32 rounded-full flex items-center justify-center text-7xl mx-auto mb-8"
                        style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.1))', border: '3px solid rgba(16,185,129,0.4)' }}>
                        🎉
                    </div>
                    <h2 className="text-4xl font-black text-white mb-4">Loan Approved!</h2>
                    <p className="text-slate-400 mb-4">Congratulations <span className="text-white font-black">{journeyData?.name}</span>!</p>
                    <p className="text-emerald-400 font-bold mb-10 text-sm">Your loan offer has been accepted. Disbursement details will be sent via SMS & Email.</p>

                    <div className="space-y-4">
                        <button onClick={() => { handleTabChange('myloans'); setJourneyData(null); setJourneyMode('form'); setTrackPhone(journeyData?.phone || ''); }}
                            className="w-full py-4 rounded-2xl font-black text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                            📊 Track My Application
                        </button>
                        <button onClick={() => { setJourneyData(null); setJourneyMode('form'); }}
                            className="w-full py-3 rounded-2xl font-bold text-slate-400 border border-white/10 text-sm hover:border-white/20 transition-all">
                            Apply for Another Loan
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ── Main UI ────────────────────────────────────────────────────────────────────
    const statusCfg = (s) => STATUS_CONFIG[s] || STATUS_CONFIG.UNKNOWN;

    return (
        <div className="min-h-full" style={{
            fontFamily: "'Outfit', sans-serif",
            background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 50%, #faf8ff 100%)',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234f46e5' fill-opacity='0.025'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');`}</style>
            {showConfetti && <Confetti />}

            {/* ── Sticky Header ─────────────────────────────────────────────────────── */}
            <div className="sticky top-0 z-40" style={{ background: 'rgba(248,250,255,0.85)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                {/* Top bar */}
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200"
                            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 leading-none">Loan Services</h1>
                            <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-[0.2em] mt-0.5">Powered by ONDC Network</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {loanStats && (
                            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)' }}>
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">{loanStats.total} Applications</span>
                            </div>
                        )}
                        <div className="px-4 py-1.5 rounded-xl" style={{ background: 'rgba(15,23,42,0.9)' }}>
                            <span className="text-white font-black text-[10px] tracking-widest">ONDC FS</span>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation (mirrors apply_loan.php tab navigation) */}
                <div className="max-w-7xl mx-auto px-6 flex items-center gap-1 overflow-x-auto">
                    {[
                        { id: 'personal', label: 'Personal Loan', icon: '👤' },
                        { id: 'gold', label: 'Gold Loan', icon: '🏆' },
                        { id: 'myloans', label: 'My Applications', icon: '📊' },
                    ].map(t => (
                        <button key={t.id} onClick={() => handleTabChange(t.id)}
                            className="py-4 px-6 text-xs font-black transition-all whitespace-nowrap flex items-center gap-2 uppercase tracking-widest border-b-2"
                            style={{
                                color: tab === t.id ? '#4f46e5' : '#94a3b8',
                                borderColor: tab === t.id ? '#4f46e5' : 'transparent',
                            }}>
                            <span>{t.icon}</span> {t.label}
                            {t.id === 'myloans' && loanStats?.pending > 0 && (
                                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[9px] font-black flex items-center justify-center">
                                    {loanStats.pending}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error / Success Banner */}
            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className="max-w-7xl mx-auto px-6 mt-4">
                        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl font-bold text-sm" style={{ background: '#fff1f2', border: '1.5px solid #fecdd3', color: '#be123c' }}>
                            <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-black">!</span>
                            {error}
                            <button onClick={() => setError('')} className="ml-auto text-rose-300 hover:text-rose-500 font-black">✕</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto px-6 py-8 pb-20">
                <AnimatePresence mode="wait">

                    {/* ═══════════════════════════════════════════ */}
                    {/* PERSONAL LOAN TAB (mirrors apply_loan.php) */}
                    {/* ═══════════════════════════════════════════ */}
                    {tab === 'personal' && (
                        <motion.div key="personal" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Left Info Panel */}
                            <div className="space-y-6">
                                <div className="rounded-3xl p-8 shadow-xl" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #6d28d9 100%)' }}>
                                    <h2 className="text-2xl font-black text-white mb-2 leading-snug">Unlock Your <br />Financial Growth</h2>
                                    <p className="text-indigo-200 text-sm font-medium leading-relaxed mb-6">Join thousands of Indians using the ONDC network for transparent, paperless financial growth. No hidden charges.</p>
                                    <div className="space-y-3">
                                        {['Digital Paperless Journey', 'Multiple Bank Offers', 'Instant Approval Check', 'Zero Prepayment Fee'].map(f => (
                                            <div key={f} className="flex items-center gap-3">
                                                <div className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center text-xs font-black">✓</div>
                                                <p className="text-white/90 text-sm font-bold">{f}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-8 pt-6 border-t border-white/10 flex -space-x-2">
                                        {[1, 2, 3, 4].map(i => (
                                            <img key={i} className="w-9 h-9 rounded-full border-2 border-indigo-400" src={`https://i.pravatar.cc/80?u=${i + 10}`} alt="" />
                                        ))}
                                        <div className="w-9 h-9 rounded-full border-2 border-indigo-400 bg-indigo-800 flex items-center justify-center text-[9px] font-black text-white">10K+</div>
                                    </div>
                                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-2">Trusted by users</p>
                                </div>

                                {/* Feature cards */}
                                <div className="grid grid-cols-2 gap-3">
                                    {LOAN_FEATURES.map(f => (
                                        <div key={f.label} className="rounded-2xl p-4 bg-white shadow-sm border border-slate-100 text-center">
                                            <div className="text-2xl mb-1">{f.icon}</div>
                                            <p className="text-xs font-black text-slate-800">{f.label}</p>
                                            <p className="text-[9px] text-slate-400 font-medium mt-0.5">{f.sub}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Loan Stats */}
                                {loanStats && (
                                    <div className="rounded-2xl p-5 bg-white shadow-sm border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Platform Stats</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { label: 'Total', value: loanStats.total, color: '#6366f1' },
                                                { label: 'Approved', value: loanStats.approved, color: '#10b981' },
                                                { label: 'Pending', value: loanStats.pending, color: '#f59e0b' },
                                                { label: 'Rejected', value: loanStats.rejected, color: '#f43f5e' },
                                            ].map(s => (
                                                <div key={s.label} className="rounded-xl p-3" style={{ background: s.color + '08' }}>
                                                    <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: s.color }}>{s.label}</p>
                                                    <p className="text-2xl font-black text-slate-900">{s.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Form Panel (mirrors apply_loan.php form) */}
                            <div className="lg:col-span-2">
                                <form onSubmit={handleApply} className="bg-white rounded-3xl p-8 shadow-xl space-y-8" style={{ border: '1px solid rgba(99,102,241,0.08)' }}>

                                    {/* Section: Personal Details */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-1 h-8 rounded-full" style={{ background: 'linear-gradient(180deg, #4f46e5, #7c3aed)' }} />
                                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">Personal Details</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <Field label="First Name *" name="first_name" value={form.first_name} onChange={handleFormChange} placeholder="As per PAN card" required />
                                            <Field label="Last Name" name="last_name" value={form.last_name} onChange={handleFormChange} placeholder="Optional" />
                                            <Field label="Mobile Number *" name="phone" value={form.phone} onChange={handleFormChange} placeholder="10-digit mobile" maxLength={10} required type="tel" />
                                            <Field label="Date of Birth *" name="dob" value={form.dob} onChange={handleFormChange} required type="date" />
                                            <div className="md:col-span-2">
                                                <Field label="Pincode *" name="pincode" value={form.pincode} onChange={handleFormChange} placeholder="6-digit pincode" maxLength={6} required />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section: Employment */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-1 h-8 rounded-full" style={{ background: 'linear-gradient(180deg, #4f46e5, #7c3aed)' }} />
                                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">Employment Type</h3>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['salaried', 'self-employed', 'business'].map(t => (
                                                <button key={t} type="button" onClick={() => setForm(p => ({ ...p, employment_type: t }))}
                                                    className="py-3 px-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                                                    style={{
                                                        background: form.employment_type === t ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : '#f8fafc',
                                                        color: form.employment_type === t ? 'white' : '#64748b',
                                                        border: form.employment_type === t ? 'none' : '2px solid #f1f5f9',
                                                        transform: form.employment_type === t ? 'scale(1.02)' : 'scale(1)',
                                                    }}>
                                                    {t === 'salaried' ? '👔 Salaried' : t === 'self-employed' ? '💼 Self-Employed' : '🏢 Business'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Section: Financial Verification */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-1 h-8 rounded-full" style={{ background: 'linear-gradient(180deg, #4f46e5, #7c3aed)' }} />
                                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">Financial Verification</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PAN Number *</label>
                                                <div className="relative">
                                                    <input name="pan" required maxLength={10} value={form.pan}
                                                        onChange={handleFormChange} placeholder="ABCDE1234F"
                                                        className="w-full h-14 px-5 pr-10 rounded-2xl font-black text-slate-900 uppercase tracking-widest outline-none transition-all"
                                                        style={{
                                                            background: '#fff', border: `2px solid ${panValid === true ? '#10b981' : panValid === false ? '#f43f5e' : '#f1f5f9'}`,
                                                            fontSize: '16px',
                                                        }}
                                                        onFocus={e => e.target.style.borderColor = '#4f46e5'}
                                                        onBlur={e => e.target.style.borderColor = panValid === true ? '#10b981' : panValid === false ? '#f43f5e' : '#f1f5f9'}
                                                    />
                                                    {panValid !== null && (
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg">
                                                            {panValid ? '✅' : '❌'}
                                                        </span>
                                                    )}
                                                </div>
                                                {panValid === false && <p className="text-rose-500 text-[10px] font-bold ml-1">Invalid PAN - should be like ABCDE1234F</p>}
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monthly Income *</label>
                                                <div className="relative">
                                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-400 font-black text-lg">₹</span>
                                                    <input name="income" type="number" required value={form.income} onChange={handleFormChange}
                                                        className="w-full h-14 pl-9 pr-5 rounded-2xl font-black text-slate-900 outline-none transition-all"
                                                        style={{ background: '#fff', border: '2px solid #f1f5f9' }}
                                                        onFocus={e => e.target.style.borderColor = '#4f46e5'}
                                                        onBlur={e => e.target.style.borderColor = '#f1f5f9'} />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Loan Amount *</label>
                                                <div className="relative">
                                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-400 font-black text-lg">₹</span>
                                                    <input name="amount" type="number" required value={form.amount} onChange={handleFormChange}
                                                        className="w-full h-14 pl-9 pr-5 rounded-2xl font-black text-indigo-600 text-lg outline-none transition-all"
                                                        style={{ background: '#f0f0ff', border: '2px solid #e0e7ff' }}
                                                        onFocus={e => e.target.style.borderColor = '#4f46e5'}
                                                        onBlur={e => e.target.style.borderColor = '#e0e7ff'} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Loan Amount Slider */}
                                        <div className="mt-5 p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)' }}>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Loan Amount</span>
                                                <span className="text-indigo-700 font-black text-lg">₹{(parseInt(form.amount) || 0).toLocaleString('en-IN')}</span>
                                            </div>
                                            <input type="range" min={10000} max={2000000} step={10000} value={form.amount}
                                                name="amount" onChange={handleFormChange}
                                                className="w-full accent-indigo-600" />
                                            <div className="flex justify-between mt-1">
                                                <span className="text-[9px] text-indigo-300 font-bold">₹10,000</span>
                                                <span className="text-[9px] text-indigo-300 font-bold">₹20,00,000</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit */}
                                    <div className="pt-4 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input type="checkbox" required defaultChecked className="mt-0.5 w-5 h-5 rounded accent-indigo-600" />
                                            <span className="text-[11px] text-slate-400 font-medium leading-relaxed">
                                                I authorize <strong className="text-slate-700">Rupiksha Finance</strong> to process my application via ONDC network and share my information with partner lenders.
                                            </span>
                                        </label>
                                        <button type="submit" disabled={loading}
                                            className="w-full md:w-64 h-16 rounded-2xl font-black text-white text-sm transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-xl shadow-indigo-200 uppercase tracking-widest flex items-center justify-center gap-2"
                                            style={{ background: loading ? '#a5b4fc' : 'linear-gradient(135deg, #4f46e5, #7c3aed)', minWidth: '220px' }}>
                                            {loading ? (
                                                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> PROCESSING...</>
                                            ) : (
                                                <>🚀 PROCEED NOW</>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}

                    {/* ══════════════════════════════ */}
                    {/* GOLD LOAN TAB (Coming Soon)   */}
                    {/* ══════════════════════════════ */}
                    {tab === 'gold' && (
                        <motion.div key="gold" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="max-w-3xl mx-auto">
                            <div className="bg-white rounded-3xl p-16 shadow-xl text-center border border-amber-50">
                                <div className="w-28 h-28 rounded-3xl mx-auto mb-8 flex items-center justify-center text-6xl shadow-xl shadow-amber-100"
                                    style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>🏆</div>
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6"
                                    style={{ background: '#fef3c7', color: '#92400e' }}>⚡ Coming Q2 2025</div>
                                <h2 className="text-4xl font-black text-slate-900 mb-4">Gold Loans</h2>
                                <p className="text-slate-500 text-lg mb-4 font-medium leading-relaxed max-w-lg mx-auto">
                                    Lowest ROI Gold Loans on the ONDC Network. Instant digital valuation, no physical hassle, highest loan-to-value ratio.
                                </p>
                                <div className="grid grid-cols-3 gap-4 mb-10 max-w-sm mx-auto">
                                    {[['8.5%', 'Interest Rate'], ['90%', 'LTV Ratio'], ['2 Hrs', 'Disbursal']].map(([v, l]) => (
                                        <div key={l} className="rounded-2xl p-4" style={{ background: '#fef9c3' }}>
                                            <p className="text-2xl font-black" style={{ color: '#92400e' }}>{v}</p>
                                            <p className="text-[9px] text-amber-600 font-bold uppercase tracking-widest">{l}</p>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => handleTabChange('personal')}
                                    className="px-10 py-4 rounded-2xl font-black text-white transition-all hover:scale-[1.02] shadow-lg shadow-indigo-200 uppercase tracking-widest text-sm"
                                    style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                                    Apply for Personal Loan Instead →
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ═══════════════════════════════════════════════════ */}
                    {/* MY APPLICATIONS TAB (mirrors loan_status.php)      */}
                    {/* ═══════════════════════════════════════════════════ */}
                    {tab === 'myloans' && (
                        <motion.div key="myloans" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            className="max-w-2xl mx-auto space-y-6">

                            {/* Track Form (mirrors loan_status.php form) */}
                            <div className="bg-white rounded-3xl p-8 shadow-xl relative overflow-hidden" style={{ border: '1px solid rgba(99,102,241,0.08)' }}>
                                <div className="absolute top-0 right-0 w-40 h-40 rounded-full -mr-20 -mt-20 opacity-40"
                                    style={{ background: 'radial-gradient(circle, #e0e7ff, transparent)' }} />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100"
                                            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900">Track Application</h2>
                                            <p className="text-slate-400 text-sm font-medium">Real-time status from ONDC network</p>
                                        </div>
                                    </div>
                                    <form onSubmit={handleTrack} className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registered Mobile Number</label>
                                            <input type="tel" maxLength={10} value={trackPhone} onChange={e => setTrackPhone(e.target.value)}
                                                placeholder="Enter 10-digit mobile" required
                                                className="w-full h-16 px-6 rounded-2xl text-center text-2xl font-black tracking-widest outline-none transition-all"
                                                style={{ background: '#f8fafc', border: '2px solid #e2e8f0', color: '#1e293b' }}
                                                onFocus={e => e.target.style.borderColor = '#4f46e5'}
                                                onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                                        </div>
                                        <button type="submit" disabled={loading}
                                            className="w-full h-14 rounded-2xl font-black text-white transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                                            style={{ background: '#0f172a' }}>
                                            {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> FETCHING...</> : '🔍 CHECK STATUS'}
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Status Result (mirrors loan_status.php data display) */}
                            <AnimatePresence>
                                {trackResult && (
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        className="bg-white rounded-3xl shadow-xl overflow-hidden" style={{ border: '1px solid rgba(99,102,241,0.08)' }}>

                                        {/* Header */}
                                        <div className="p-6 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}>
                                            <div>
                                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Application Status</p>
                                                <h3 className="text-white font-black text-xl">{trackResult.name}</h3>
                                                <p className="text-slate-500 text-sm">{trackResult.phone}</p>
                                            </div>
                                            <div className={`px-4 py-2 rounded-2xl font-black text-sm flex items-center gap-2`}
                                                style={{
                                                    background: statusCfg(trackResult.status).color === 'emerald' ? 'rgba(16,185,129,0.15)' :
                                                        statusCfg(trackResult.status).color === 'rose' ? 'rgba(244,63,94,0.15)' : 'rgba(99,102,241,0.15)',
                                                    color: statusCfg(trackResult.status).color === 'emerald' ? '#10b981' :
                                                        statusCfg(trackResult.status).color === 'rose' ? '#f43f5e' : '#818cf8'
                                                }}>
                                                <span>{statusCfg(trackResult.status).icon}</span>
                                                <span>{trackResult.status}</span>
                                            </div>
                                        </div>

                                        {/* Details grid */}
                                        <div className="p-6 space-y-5">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="rounded-2xl p-4" style={{ background: '#f8fafc' }}>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Reference ID</p>
                                                    <p className="font-black text-slate-900 text-sm font-mono">{trackResult.reference_id || '—'}</p>
                                                </div>
                                                <div className="rounded-2xl p-4" style={{ background: '#f8fafc' }}>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Updated</p>
                                                    <p className="font-black text-slate-900 text-sm">{trackResult.updated_at_date}</p>
                                                    <p className="text-slate-400 text-xs">{trackResult.updated_at_time}</p>
                                                </div>
                                            </div>

                                            {/* Offer Card (mirrors $data['offer_amount'] display) */}
                                            {trackResult.offer_amount ? (
                                                <div className="rounded-3xl p-6 text-white space-y-4"
                                                    style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: '1px solid rgba(99,102,241,0.2)' }}>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm">🏦</div>
                                                        <span className="text-indigo-300 text-xs font-black uppercase tracking-widest">{trackResult.lender_name}</span>
                                                    </div>
                                                    <div className="flex justify-between items-end">
                                                        <div>
                                                            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Approved Amount</p>
                                                            <p className="text-4xl font-black">₹{parseInt(trackResult.offer_amount).toLocaleString('en-IN')}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Interest p.a.</p>
                                                            <p className="text-2xl font-black text-indigo-400">{trackResult.interest_rate}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="rounded-3xl p-8 text-center" style={{ background: '#f8fafc', border: '2px dashed #e2e8f0' }}>
                                                    <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center text-2xl mx-auto mb-4 animate-bounce">⌛</div>
                                                    <p className="font-black text-slate-800">Waiting for Lender Quotes</p>
                                                    <p className="text-slate-400 text-xs mt-1">We've shared your request with ONDC partner banks. Auto-refreshing...</p>
                                                    <div className="flex items-center justify-center gap-2 mt-4">
                                                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Live sync active</span>
                                                    </div>
                                                </div>
                                            )}

                                            {trackResult.requested_amount && (
                                                <div className="flex items-center justify-between text-[10px] font-black text-slate-300 uppercase tracking-widest pt-2 border-t border-slate-50">
                                                    <span>Requested: ₹{parseInt(trackResult.requested_amount).toLocaleString('en-IN')}</span>
                                                    <span>Tracking: {trackResult.tracking_id}</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
};

// ─── Field Component ─────────────────────────────────────────────────────────────
function Field({ label, name, value, onChange, placeholder, required, type = 'text', maxLength }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            <input
                type={type} name={name} value={value} onChange={onChange}
                placeholder={placeholder} required={required} maxLength={maxLength}
                className="w-full h-14 px-5 rounded-2xl font-bold text-slate-900 outline-none transition-all"
                style={{ background: '#ffffff', border: '2px solid #f1f5f9' }}
                onFocus={e => e.target.style.borderColor = '#4f46e5'}
                onBlur={e => e.target.style.borderColor = '#f1f5f9'}
            />
        </div>
    );
}

export default Loans;
