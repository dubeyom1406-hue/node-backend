
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    IndianRupee, CreditCard, Zap, Smartphone,
    FileText, ShieldCheck, CheckCircle2,
    Info, LayoutGrid, Building2, Flame
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { planService } from '../../services/planService';

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

const Plans = () => {
    const [selectedCategory, setSelectedCategory] = useState('AEPS & MATM');
    const appData = dataService.getData();
    const specialRates = appData.specialRates || [];
    const currentUser = dataService.getCurrentUser();

    // Get assigned plan label from Admin logic
    const assignedPlanId = planService.getUserPlan(currentUser?.id);
    const assignedPlan = assignedPlanId ? planService.getPlanById(assignedPlanId) : null;
    const planLabel = assignedPlan?.label || 'Standard Retailer';

    const categories = [
        { id: 'AEPS & MATM', icon: Landmark, color: '#4a148c' },
        { id: 'DMT (Money Transfer)', icon: IndianRupee, color: '#0ea5e9' },
        { id: 'Recharge & BBPS', icon: Zap, color: '#f59e0b' },
        { id: 'Other Services', icon: LayoutGrid, color: '#10b981' }
    ];

    // Fallback data if none in appData
    const fallbackRates = [
        {
            service: "AEPS & MATM",
            plans: [
                { range: "100 - 499", commission: "0.25", type: "Flat" },
                { range: "500 - 999", commission: "1.00", type: "Flat" },
                { range: "1000 - 1499", commission: "2.50", type: "Flat" },
                { range: "1500 - 1999", commission: "3.50", type: "Flat" },
                { range: "2000 - 2499", commission: "5.50", type: "Flat" },
                { range: "2500 - 2999", commission: "6.00", type: "Flat" },
                { range: "3000 - 6999", commission: "10.00", type: "Flat" },
                { range: "7000 - 10000", commission: "12.00", type: "Flat" }
            ]
        },
        {
            service: "DMT (Money Transfer)",
            plans: [
                { range: "1 - 1000", commission: "10.00", type: "Charge" },
                { range: "1001 - 2500", commission: "0.45%", type: "Charge" },
                { range: "2501 - 5000", commission: "0.45%", type: "Charge" },
                { range: "Above 5000", commission: "0.45%", type: "Charge" },
            ]
        },
        {
            service: "Recharge & BBPS",
            plans: [
                { range: "Jio Prepaid", commission: "2.50%", type: "Comm" },
                { range: "Airtel Prepaid", commission: "1.80%", type: "Comm" },
                { range: "VI Prepaid", commission: "3.20%", type: "Comm" },
                { range: "DTH Recharge", commission: "3.00%", type: "Comm" },
                { range: "Electricity Bill", commission: "0.50", type: "Flat" },
            ]
        }
    ];

    const currentRates = (specialRates.length > 0 ? specialRates : fallbackRates).find(r => r.service.includes(selectedCategory))?.plans || [];

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24 font-['Inter',sans-serif]">
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <Icon3D icon={FileText} color="#4a148c" size={48} />
                    <div>
                        <p className="text-[10px] font-black text-[#4a148c] uppercase tracking-[4px] mb-1">Commercial Structure</p>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">My Plans & Rates</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Professional commission slabs & service rates</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="bg-emerald-50 border border-emerald-100 px-6 py-3 rounded-2xl flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                            <CheckCircle2 size={18} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-emerald-800 uppercase tracking-widest">Active Plan</p>
                            <p className="text-xs font-black text-emerald-600 uppercase">{planLabel}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Info Box ── */}
            <div className="p-6 bg-slate-900 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#4a148c] opacity-20 blur-3xl -mr-20 -mt-20 group-hover:opacity-40 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500 opacity-10 blur-3xl -ml-20 -mb-20" />

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                        <Flame size={40} className="text-amber-400 animate-pulse" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Earn Up To ₹12.00 Commission</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1.5 leading-relaxed">
                            Rupiksha offers the most competitive rates in the market. Get real-time settlement & extra margins on peak days.
                        </p>
                    </div>
                    <button className="px-8 py-4 bg-white text-slate-900 rounded-3xl text-[11px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-transform active:scale-95">
                        Upgrade To VIP Plan
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* ── Left Navigation ── */}
                <div className="lg:col-span-1 space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-4">Service Categories</p>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`w-full flex items-center gap-3 p-4 rounded-3xl border transition-all
                            ${selectedCategory === cat.id
                                    ? 'bg-[#4a148c] border-[#4a148c] text-white shadow-xl shadow-[#4a148c2a] scale-[1.03]'
                                    : 'bg-white border-slate-100 text-slate-600 hover:border-[#4a148c50] hover:bg-slate-50'}`}
                        >
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors
                                ${selectedCategory === cat.id ? 'bg-white/20' : 'bg-slate-100'}`}>
                                <cat.icon size={20} className={selectedCategory === cat.id ? 'text-white' : 'text-slate-500'} />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-tight text-left leading-tight">{cat.id}</span>
                        </button>
                    ))}

                    <div className="mt-8 p-6 bg-[#4a148c08] border border-[#4a148c1a] rounded-[2rem] space-y-4">
                        <div className="flex items-start gap-3">
                            <Info size={16} className="text-[#4a148c] shrink-0 mt-0.5" />
                            <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase"> Rates are subject to operator changes. Any updates will be notified via news feed.</p>
                        </div>
                    </div>
                </div>

                {/* ── Main Rates Table ── */}
                <div className="lg:col-span-3">
                    <motion.div
                        key={selectedCategory}
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden"
                    >
                        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{selectedCategory}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Margin Structure</p>
                            </div>
                            <ShieldCheck size={28} className="text-[#4a148c] opacity-20" />
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentRates.map((plan, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ y: -4, shadow: 'lg' }}
                                        className="p-5 bg-white border border-slate-100 rounded-3xl flex items-center justify-between group cursor-default"
                                    >
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Amount Range</p>
                                            <p className="text-base font-black text-slate-800 tracking-tight">{plan.range}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center justify-end gap-1.5 mb-1.5">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{plan.type === 'Charge' ? 'Service Charge' : 'Commission'}</p>
                                            </div>
                                            <p className={`text-xl font-black tracking-tighter ${plan.type === 'Charge' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                {plan.type === 'Charge' ? '-' : '+'} ₹{plan.commission}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {currentRates.length === 0 && (
                                <div className="py-20 text-center">
                                    <p className="text-sm font-black text-slate-400 uppercase tracking-[2px]">No custom rates defined for this category.</p>
                                    <p className="text-xs font-bold text-slate-300 uppercase mt-2">Check 'Other Services' or contact admin for VIP slabs.</p>
                                </div>
                            )}

                            <div className="mt-8 pt-8 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                                        ))}
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trusted by 5,000+ Retailers</p>
                                </div>
                                <button className="flex items-center gap-2 text-[10px] font-black uppercase text-[#4a148c] tracking-widest hover:gap-3 transition-all">
                                    Download Full Rate Chart <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

const Landmark = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-landmark"><line x1="3" x2="21" y1="22" y2="22" /><line x1="6" x2="6" y1="18" y2="11" /><line x1="10" x2="10" y1="18" y2="11" /><line x1="14" x2="14" y1="18" y2="11" /><line x1="18" x2="18" y1="18" y2="11" /><polygon points="12 2 20 7 4 7 12 2" /></svg>
);

const ArrowRight = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
);

export default Plans;
