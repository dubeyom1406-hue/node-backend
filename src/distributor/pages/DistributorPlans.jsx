import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CheckCircle2, Zap, ArrowRight, X, Info, Sparkles } from 'lucide-react';
import { planService } from '../../services/planService';
import logo from '../../assets/rupiksha_logo.png';
import { useNavigate } from 'react-router-dom';

const DistributorPlans = () => {
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState(null);

    // Fetch dynamically from Admin
    const availablePlans = planService.getPlansForType('distributor').filter(p => p.active);

    const plans = availablePlans.map(p => ({
        name: p.label,
        price: p.price === 0 ? 'Free' : `₹ ${p.price.toLocaleString('en-IN')}`,
        desc: p.label === 'Premium' ? 'Maximum benefits for top Distributors' : (p.label === 'Standard' ? 'Powerful tools for growing agents' : 'Essential features for small shops'),
        features: p.features,
        color: p.label === 'Premium' ? 'indigo' : (p.label === 'Standard' ? 'amber' : 'slate'),
        icon: p.label === 'Premium' ? CheckCircle2 : (p.label === 'Standard' ? Zap : ShieldCheck),
        featured: p.label === 'Premium',
        id: p.id
    }));

    return (
        <div className="min-h-screen bg-slate-50 font-['Montserrat',sans-serif]">
            {/* Nav */}
            <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
                <img src={logo} alt="Logo" className="h-10 cursor-pointer" onClick={() => navigate('/')} />
                <button
                    onClick={() => navigate('/login')}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-colors"
                >
                    Back to Login
                </button>
            </nav>

            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-12">
                <div className="text-center space-y-4 max-w-2xl mx-auto">
                    <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                        <Sparkles size={10} /> Distributor Enrollment
                    </span>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight uppercase">Elevate Your Network</h1>
                    <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-widest">Select a plan that fits your business scale. No hidden charges, just pure growth.</p>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((p, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -10 }}
                            className={`bg-white rounded-[2.5rem] p-8 border ${p.featured ? 'border-indigo-400 shadow-2xl shadow-indigo-500/10' : 'border-slate-100 shadow-sm'} flex flex-col relative overflow-hidden`}
                        >
                            {p.featured && (
                                <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[9px] font-black uppercase px-6 py-2 rounded-bl-3xl tracking-widest">Most Selected</div>
                            )}
                            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 shadow-lg ${p.color === 'amber' ? 'bg-amber-500 shadow-amber-500/20' : p.color === 'indigo' ? 'bg-indigo-500 shadow-indigo-500/20' : 'bg-slate-800 shadow-slate-800/20'}`}>
                                <p.icon size={30} className="text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-2">{p.name}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">{p.desc}</p>

                            <div className="mb-10 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">One Time Setup</span>
                                <span className="text-4xl font-black text-slate-900">{p.price}</span>
                            </div>

                            <div className="space-y-4 flex-1">
                                {p.features.map((f, j) => (
                                    <div key={j} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle2 size={12} className="text-emerald-500" />
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-600">{f}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setSelectedPlan(p)}
                                className={`w-full mt-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg
                                    ${p.color === 'amber' ? 'bg-amber-500 shadow-amber-500/30' : p.color === 'indigo' ? 'bg-indigo-500 shadow-indigo-500/30' : 'bg-slate-900 shadow-slate-900/20'} text-white`}
                            >
                                Get Started Now
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Selection Modal */}
            <AnimatePresence>
                {selectedPlan && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[3rem] p-10 max-w-md w-full relative shadow-2xl">
                            <button onClick={() => setSelectedPlan(null)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all"><X size={20} /></button>
                            <div className="space-y-8">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Zap size={24} className="text-indigo-600" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Complete Enrollment</h3>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">You selected the {selectedPlan.name} Plan</p>
                                </div>
                                <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 space-y-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Setup Fee</span>
                                        <span className="text-xl font-black text-slate-900">{selectedPlan.price}</span>
                                    </div>
                                    <div className="h-px bg-slate-200" />
                                    <p className="text-[10px] font-bold text-slate-400 leading-relaxed text-center uppercase tracking-wide">
                                        Please complete your registration to activate this plan. Our team will verify your documents within 24 hours.
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-500/30 active:scale-95 transition-all"
                                >
                                    Proceed to Register
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DistributorPlans;
