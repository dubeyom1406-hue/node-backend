import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck, Zap, Crown, Check, ArrowRight, X,
    Info, Users, Building2, HelpCircle, Sparkles
} from 'lucide-react';
import logo from '../../assets/rupiksha_logo.png';
import { sharedDataService } from '../../services/sharedDataService';
import { getDistributorPlan, PLAN_CONFIG } from '../config/planConfig';
import { planService } from '../../services/planService';

const PlansRates = () => {
    const [dist, setDist] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [selectedModal, setSelectedModal] = useState(null);

    // Fetch dynamic plans
    const availablePlans = planService.getPlansForType('distributor').filter(p => p.active);

    const PLANS = availablePlans.map(p => ({
        id: p.id,
        label: p.label.toUpperCase() + ' PLAN',
        panelLabel: p.label === 'Premium' ? 'Control Center — Unlimited' : (p.label === 'Standard' ? 'Panel B — Growing Network' : 'Panel A — Entry Level'),
        price: p.price,
        priceLabel: p.price === 0 ? 'Free Forever' : `₹${p.price.toLocaleString()} One-time`,
        cardGradient: p.label === 'Premium' ? 'from-indigo-700 to-purple-900' : (p.label === 'Standard' ? 'from-amber-500 to-orange-700' : 'from-blue-600 to-blue-900'),
        icon: p.label === 'Premium' ? <Crown size={26} className="text-white" /> : (p.label === 'Standard' ? <Zap size={26} className="text-white" /> : <ShieldCheck size={26} className="text-white" />),
        limits: { retailers: p.maxRetailers >= 999999 ? '∞' : p.maxRetailers, distributors: p.maxSubDist || null },
        features: p.features,
        cta: p.price === 0 ? 'Activate Free' : `Choose ${p.label}`,
    }));

    const commissionRates = [
        { service: 'AEPS (Till ₹3000)', rate: '0.25%', sub: 'Instantly Credited' },
        { service: 'DMT (Per ₹5000)', rate: 'Flat ₹25', sub: 'Low Charge' },
        { service: 'Mobile Recharge', rate: '2.5 ~ 4.0%', sub: 'Varies by Operator' },
        { service: 'Electricity Bill', rate: '₹1.50', sub: 'Flat per Bill' },
        { service: 'CMS Service', rate: '0.12%', sub: 'Max Collection' },
    ];

    useEffect(() => {
        const session = sharedDataService.getCurrentDistributor();
        if (session) {
            const fresh = sharedDataService.getDistributorById(session.id) || session;
            setDist(fresh);
        }
    }, []);

    const currentPlan = getDistributorPlan(dist);

    const handleCardClick = (plan) => {
        setExpandedId(prev => prev === plan.id ? null : plan.id);
    };

    const handleCTA = (e, plan) => {
        e.stopPropagation();
        if (plan.id === currentPlan.id) return; // already active
        setSelectedModal(plan);
    };

    return (
        <div
            className="min-h-full font-['Montserrat',sans-serif] relative overflow-hidden bg-white"
        >
            {/* subtle light glows */}
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-100/60 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-100/60 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 px-4 md:px-10 py-10 max-w-[1200px] mx-auto space-y-10">

                {/* Hero */}
                <div className="flex flex-col items-center text-center">
                    <img
                        src={logo}
                        alt="RuPiKsha"
                        className="h-14 md:h-18 object-contain mb-5"
                    />
                    <span className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-400/30 text-amber-600 text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
                        <Sparkles size={10} /> Subscription Plans
                    </span>
                    <h1 className="text-slate-800 text-2xl md:text-3xl font-black uppercase tracking-tight leading-none">
                        CHOOSE YOUR <span className="text-amber-500">BUSINESS</span> PLAN
                    </h1>
                    <p className="text-slate-400 text-[11px] font-semibold mt-3 tracking-wide uppercase">
                        Active Plan: <span className="font-black" style={{ color: PLAN_CONFIG[currentPlan.id]?.accent || '#f59e0b' }}>{currentPlan.label}</span>
                        &nbsp;·&nbsp; Click card to see details &nbsp;·&nbsp; Click button to upgrade
                    </p>
                </div>

                {/* Plan Cards */}
                <div className="flex flex-col md:flex-row gap-5 lg:gap-7 items-stretch justify-center">
                    {PLANS.map((plan, i) => {
                        const isExpanded = expandedId === plan.id;
                        const isActive = currentPlan.id === plan.id;

                        return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.15 }}
                                whileHover={!isExpanded ? { y: -6, transition: { type: 'spring', stiffness: 100, damping: 12 } } : {}}
                                onClick={() => handleCardClick(plan)}
                                className={`group relative flex-1 min-w-0 rounded-[2.5rem] flex flex-col cursor-pointer overflow-hidden
                                    bg-gradient-to-b ${plan.cardGradient}
                                    ${isActive ? 'shadow-2xl shadow-white/15 ring-2 ring-white/30 ring-inset' : ''}
                                    transition-shadow duration-300
                                `}
                                style={{ maxWidth: 360 }}
                            >
                                {/* Active badge */}
                                {isActive && (
                                    <div className="absolute top-4 left-4 z-20">
                                        <span className="text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/20 text-white border border-white/30 flex items-center gap-1">
                                            <Check size={8} strokeWidth={3} /> Active
                                        </span>
                                    </div>
                                )}

                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[2.5rem]" />

                                <div className="p-6 flex flex-col flex-1 relative z-10 min-h-[300px]">
                                    <AnimatePresence mode="wait">
                                        {!isExpanded ? (
                                            /* DEFAULT VIEW */
                                            <motion.div
                                                key="default"
                                                initial={{ opacity: 0, y: 16 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.22 }}
                                                className="flex flex-col flex-1"
                                            >
                                                <div className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-500">
                                                    {plan.icon}
                                                </div>

                                                <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.25em] mb-1 block">{plan.label}</span>
                                                <span className="text-white text-3xl font-black tracking-tight">
                                                    {plan.price === 0 ? 'FREE' : `₹${plan.price.toLocaleString()}`}
                                                </span>
                                                <p className="text-white/50 text-[10px] font-bold mb-5">{plan.priceLabel}</p>

                                                {/* ID chips */}
                                                <div className="flex gap-2 mb-6">
                                                    {plan.limits.distributors && (
                                                        <div className="flex-1 rounded-xl p-2.5 text-center bg-white/10 border border-white/10">
                                                            <Building2 size={12} className="mx-auto mb-0.5 text-white/70" />
                                                            <p className="text-white text-sm font-black">{plan.limits.distributors}</p>
                                                            <p className="text-white/40 text-[7px] font-black uppercase tracking-wider">Sub-IDs</p>
                                                        </div>
                                                    )}
                                                    <div className="flex-1 rounded-xl p-2.5 text-center bg-white/10 border border-white/10">
                                                        <Users size={12} className="mx-auto mb-0.5 text-white/70" />
                                                        <p className="text-white text-sm font-black">{plan.limits.retailers}</p>
                                                        <p className="text-white/40 text-[7px] font-black uppercase tracking-wider">Retailers</p>
                                                    </div>
                                                </div>

                                                <div className="mt-auto">
                                                    <button
                                                        onClick={(e) => handleCTA(e, plan)}
                                                        className={`inline-flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] px-5 py-3 rounded-full border transition-all w-full justify-center
                                                            ${isActive
                                                                ? 'bg-white text-gray-900 border-white shadow-lg cursor-default'
                                                                : 'text-white bg-white/10 hover:bg-white/20 border-white/10'
                                                            }
                                                        `}
                                                    >
                                                        {isActive
                                                            ? <><Check size={13} strokeWidth={3} /> Currently Active</>
                                                            : <><span className="group-hover:tracking-[0.3em] transition-all duration-300">{plan.cta}</span> <ArrowRight size={13} className="group-hover:translate-x-2 transition-transform duration-300" /></>
                                                        }
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            /* DESCRIPTION VIEW */
                                            <motion.div
                                                key="description"
                                                initial={{ opacity: 0, y: 24 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 16 }}
                                                transition={{ duration: 0.25 }}
                                                className="flex flex-col flex-1"
                                                onClick={e => e.stopPropagation()}
                                            >
                                                <div className="flex items-center justify-between mb-5">
                                                    <div>
                                                        <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.25em] block">{plan.panelLabel}</span>
                                                        <span className="text-white font-black text-base uppercase tracking-tight">
                                                            {plan.price === 0 ? 'FREE' : `₹${plan.price.toLocaleString()}`}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setExpandedId(null); }}
                                                        className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                                                    >
                                                        <X size={14} className="text-white" />
                                                    </button>
                                                </div>

                                                <div className="flex flex-col gap-2.5 flex-1 mb-4">
                                                    {plan.features.map((f, fi) => (
                                                        <motion.div
                                                            key={fi}
                                                            initial={{ opacity: 0, x: -12 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: fi * 0.06 }}
                                                            className="bg-white/10 rounded-2xl px-4 py-3 border border-white/10 flex items-center gap-3"
                                                        >
                                                            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                                                <Check size={9} strokeWidth={3} className="text-white" />
                                                            </div>
                                                            <span className="text-white font-black text-[11px]">{f}</span>
                                                        </motion.div>
                                                    ))}
                                                </div>

                                                <button
                                                    onClick={(e) => handleCTA(e, plan)}
                                                    className={`inline-flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] px-5 py-3 rounded-full border transition-all w-full justify-center
                                                        ${isActive
                                                            ? 'bg-white text-gray-900 border-white shadow-lg cursor-default'
                                                            : 'text-white bg-white/20 hover:bg-white/30 border-white/20'
                                                        }
                                                    `}
                                                >
                                                    {isActive ? <><Check size={13} strokeWidth={3} /> Currently Active</> : <>{plan.cta} <ArrowRight size={13} /></>}
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Commission Rates */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-slate-800 text-lg font-black uppercase tracking-tight">Commission Rates</h2>
                        <button className="flex items-center gap-2 text-[9px] font-black text-amber-600 uppercase tracking-widest border border-amber-200 px-4 py-2 rounded-xl hover:bg-amber-50 transition-colors">
                            <HelpCircle size={14} /> Full Slab Details
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {commissionRates.map((r, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.07 }}
                                className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between hover:border-amber-300 hover:bg-amber-50/50 transition-all group"
                            >
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{r.service}</p>
                                    <p className="text-[10px] font-bold text-slate-300">{r.sub}</p>
                                </div>
                                <p className="text-lg font-black text-slate-800 group-hover:text-amber-600 transition-colors">{r.rate}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Upgrade Modal */}
            <AnimatePresence>
                {selectedModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className={`bg-gradient-to-b ${selectedModal.cardGradient} rounded-3xl p-8 max-w-md w-full relative overflow-hidden`}
                        >
                            <div className="absolute -right-8 -top-8 w-36 h-36 bg-white/5 rounded-full pointer-events-none" />
                            <button onClick={() => setSelectedModal(null)} className="absolute top-6 right-6 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all z-10">
                                <X size={16} className="text-white" />
                            </button>

                            <div className="relative z-10 space-y-6">
                                <div>
                                    <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Upgrade to</p>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">{selectedModal.label}</h3>
                                    <p className="text-white/60 text-sm font-bold mt-1">{selectedModal.priceLabel}</p>
                                </div>

                                <div className="bg-white/10 rounded-2xl p-5 space-y-3 border border-white/10">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-white/50">Plan Amount</span>
                                        <span className="text-white">{selectedModal.price === 0 ? 'Free' : `₹${selectedModal.price.toLocaleString()}`}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-white/50">GST (18%)</span>
                                        <span className="text-white">Included</span>
                                    </div>
                                    <div className="h-px bg-white/10" />
                                    <div className="flex justify-between">
                                        <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Total</span>
                                        <span className="text-xl font-black text-white">{selectedModal.priceLabel}</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-white/10 rounded-2xl border border-white/10">
                                    <Info className="text-amber-300 shrink-0 mt-0.5" size={16} />
                                    <p className="text-[10px] font-bold text-white/60 leading-relaxed">Payment will be collected by admin. Contact support to activate your plan.</p>
                                </div>

                                <button className="w-full bg-white text-gray-900 font-black py-4 rounded-xl text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                                    Request Upgrade
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PlansRates;
