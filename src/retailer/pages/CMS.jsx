import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2, Search, RefreshCw, ArrowRight, Wallet,
    ShieldCheck, Zap, Receipt, Smartphone, Landmark, BellRing, User, Shield, TrendingUp, Waves
} from 'lucide-react';
import { initSpeech, speak, announceProcessing, announceGrandSuccess, announceWarning } from '../../services/speechService';
import { dataService } from '../../services/dataService';
import { MapPin } from 'lucide-react';
import { useEffect } from 'react';

const NAVY = '#0f2557';
const NAVY3 = '#2257a8';

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

const CMS = () => {
    const [biller, setBiller] = useState('');
    const [consumerNo, setConsumerNo] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [user, setUser] = useState(null);
    const [location, setLocation] = useState({ lat: '...', long: '...' });

    useEffect(() => {
        const currentUser = dataService.getCurrentUser();
        setUser(currentUser);

        dataService.verifyLocation()
            .then(loc => setLocation(loc))
            .catch(err => {});
    }, []);

    const handlePay = () => {
        if (!biller) { announceWarning('बैलर चुनें'); return; }
        if (!consumerNo) { announceWarning('कस्टमर आईडी डालें'); return; }
        if (!amount) { announceWarning('राशि डालें'); return; }

        setLoading(true);
        initSpeech();
        announceProcessing("सी एम एस भुगतान प्रक्रिया में है।");

        setTimeout(async () => {
            const { default: confetti } = await import('canvas-confetti');
            confetti({ particleCount: 160, spread: 80, origin: { y: 0.5 }, colors: ['#10b981', '#0f2557', '#fbbf24', '#a78bfa', '#38bdf8'] });

            announceGrandSuccess("CMS Payment Successful!", `₹${amount} paid to ${biller}`);
            setShowSuccess(true);
            setLoading(false);
        }, 2000);
    };

    if (showSuccess) return (
        <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-50">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 max-w-lg w-full text-center space-y-6">
                <div className="w-24 h-24 rounded-full bg-emerald-500 mx-auto flex items-center justify-center text-white text-4xl shadow-lg border-8 border-emerald-50">
                    ✓
                </div>
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Payment Success</h2>
                <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400 font-bold uppercase text-[9px]">Company</span>
                        <span className="font-black text-slate-800">{biller}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400 font-bold uppercase text-[9px]">Loan ID</span>
                        <span className="font-black text-slate-800">{consumerNo}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-slate-200 pt-4">
                        <span className="text-slate-400 font-bold uppercase text-[9px]">Amount Paid</span>
                        <span className="font-black text-2xl text-emerald-600">₹{Number(amount).toLocaleString('en-IN')}</span>
                    </div>
                </div>
                <button onClick={() => { setShowSuccess(false); setBiller(''); setConsumerNo(''); setAmount(''); }}
                    className="w-full py-4 rounded-xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest">
                    Pay Another EMI
                </button>
            </motion.div>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-slate-50 overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

            <div className="shrink-0 bg-white border-b border-slate-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Icon3D icon={Building2} color="#4f46e5" size={40} />
                        <div>
                            <h1 className="text-lg font-black text-slate-900 leading-none">CMS Portal</h1>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Cash Collection & Loan EMI</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Live Billing</span>
                        <button onClick={() => { initSpeech(); speak("सी एम एस हब में आपका स्वागत है।", "hi-IN"); }}
                            className="ml-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-[10px] font-black text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-all">
                            <BellRing size={12} /> Voice
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 max-w-7xl mx-auto">

                    <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <Receipt size={28} />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Loan EMI Payment</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">Direct Settlement Hub</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Biller Category</label>
                                <div className="relative">
                                    <Building2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <select value={biller} onChange={e => setBiller(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-800 font-bold text-sm outline-none focus:border-blue-500 appearance-none cursor-pointer">
                                        <option value="">Select Company</option>
                                        <option value="L&T Finance">L&T Finance</option>
                                        <option value="Hero Fincorp">Hero Fincorp</option>
                                        <option value="Bajaj Finance">Bajaj Finance</option>
                                        <option value="Mahindra Finance">Mahindra Finance</option>
                                        <option value="Muthoot Finance">Muthoot Finance</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Customer / Loan ID</label>
                                <div className="relative">
                                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input value={consumerNo} onChange={e => setConsumerNo(e.target.value)}
                                        placeholder="Enter ID"
                                        className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm outline-none focus:border-blue-500" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Collection Amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">₹</span>
                                <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                                    placeholder="0"
                                    className="w-full pl-10 pr-4 py-6 rounded-2xl border-2 border-slate-200 bg-slate-50 font-black text-4xl text-slate-900 outline-none focus:border-blue-500 transition-all" />
                            </div>
                        </div>

                        <motion.button onClick={handlePay} disabled={loading}
                            whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.97 }}
                            className="w-full py-5 rounded-2xl text-white font-black text-sm uppercase tracking-[0.2em] relative overflow-hidden"
                            style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY3})`, boxShadow: `0 8px 30px ${NAVY}40` }}>
                            <motion.div className="absolute inset-0"
                                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }}
                                animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity }} />
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                {loading ? <><RefreshCw className="animate-spin" size={20} /> PROCESSING...</> : <><Receipt size={20} /> PROCEED EMI COLLECTION</>}
                            </span>
                        </motion.button>
                    </div>

                    {/* RIGHT: UNIFIED RETAILER INFO HUB */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
                        {/* 💳 WALLET SECTION */}
                        <div className="p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 opacity-50" />
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 relative z-10">
                                <Wallet size={14} className="text-indigo-500" /> Collection Wallet
                            </h3>
                            <div className="relative z-10">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-slate-400">₹</span>
                                    <span className="text-4xl font-black text-slate-900 tracking-tighter">
                                        {user?.wallet?.balance || "0.00"}
                                    </span>
                                </div>
                                <div className="mt-4 flex items-center gap-2 p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 w-fit">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                    <span className="text-[9px] font-black text-indigo-700 uppercase tracking-tight">Ready for EMI Settlement</span>
                                </div>
                            </div>
                        </div>

                        {/* 🏦 BANK SECTION */}
                        <div className="p-8">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <Landmark size={14} className="text-blue-500" /> Settlement Bank
                            </h3>
                            {user?.banks && user.banks.length > 0 ? (
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="text-xs font-black text-slate-900 uppercase">{user.banks[0].bankName}</h4>
                                        <span className="text-[8px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full uppercase">Verified</span>
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
                                <MapPin size={14} className="text-indigo-500" /> Live System Geolocation
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
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-indigo-400 font-bold uppercase text-[8px]">
                                            <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
                                            Finding Merchant...
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg border border-slate-200 shadow-sm pointer-events-none">
                                        <span className="text-[7px] font-black text-slate-500 uppercase flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> Live Preview
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
                                            <span className="text-[8px] font-bold text-slate-300 mr-1 uppercase">Long</span>
                                            <span className="text-[10px] font-black text-slate-900 tracking-tight">{location.long}</span>
                                        </div>
                                    </div>
                                    <p className="text-[8px] font-black text-blue-500 uppercase flex items-center gap-1">
                                        <ShieldCheck size={10} /> SECURE TRACE
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CMS;
