import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, ChevronRight, Zap, ArrowRight, Activity, ShieldCheck, CheckCircle2 } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   3D Icon Component – Premium Apple-like 3D feel
───────────────────────────────────────────────────────────────*/
const Icon3D = ({ emoji, bg, shadow }) => (
    <div className="icon-3d relative group-hover:shadow-2xl" style={{
        width: '76px', height: '76px',
        background: bg,
        borderRadius: '24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '36px',
        boxShadow: shadow || '0 10px 30px -10px rgba(0,0,0,0.3)',
        transform: 'perspective(200px) rotateX(10deg)',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid rgba(255,255,255,0.6)',
        zIndex: 10
    }}>
        {/* Inner glow */}
        <div className="absolute inset-0 rounded-[24px] bg-gradient-to-tr from-white/0 to-white/40 pointer-events-none" />
        <span style={{ filter: 'drop-shadow(0 8px 8px rgba(0,0,0,0.15))' }}>{emoji}</span>
    </div>
);

/* ─────────────────────────────────────────────────────────────
   Premium Service Card
───────────────────────────────────────────────────────────────*/
const ServiceCard = ({ title, icon3d, actionLabel, actionColor, isLarge, onClick, delay, active }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay * 0.04, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        onClick={onClick}
        className="group relative bg-[#ffffff]/60 backdrop-blur-xl border border-white/80 rounded-[32px] p-6 flex flex-col items-center gap-4 cursor-pointer
                   hover:bg-white hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 overflow-hidden"
        style={{ minHeight: isLarge ? 220 : 190 }}
    >
        {/* Animated background gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 via-white/0 to-blue-50/0 group-hover:from-indigo-100/40 group-hover:to-blue-100/40 transition-colors duration-500 pointer-events-none" />

        {/* 3D icon container */}
        <div className="group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 ease-out z-10 mt-3">
            {icon3d}
        </div>

        {/* Title */}
        <p className="text-[13px] font-extrabold text-slate-800 text-center tracking-wide leading-snug mt-2 flex-1 flex items-center z-10">
            {title}
        </p>

        {/* Status indicator */}
        {active && (
            <div className="absolute top-5 right-5 flex items-center justify-center w-6 h-6 bg-emerald-50 rounded-full border border-emerald-100 z-10 transition-transform group-hover:scale-110">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse" />
            </div>
        )}

        {/* Action buttons (Appears on Hover) */}
        <div className="w-full relative z-10 opacity-0 group-hover:opacity-100 transform translate-y-6 group-hover:translate-y-0 transition-all duration-400">
            {actionLabel ? (
                <button className={`w-full ${actionColor || 'bg-blue-600'} text-white text-[11px] font-black py-3 rounded-2xl uppercase tracking-[0.15em] flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all`}>
                    {actionLabel} <ChevronRight size={14} />
                </button>
            ) : (
                <button className="w-full bg-slate-900 group-hover:bg-indigo-600 text-white text-[11px] font-black py-3 rounded-2xl uppercase tracking-[0.15em] flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
                    Transact <ArrowRight size={14} />
                </button>
            )}
        </div>
    </motion.div>
);

/* ─────────────────────────────────────────────────────────────
   Section Header
───────────────────────────────────────────────────────────────*/
const SectionHeader = ({ label, color, count }) => (
    <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
            <div className="w-1.5 h-8 rounded-full mr-4 shadow-sm" style={{ background: color }} />
            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">{label}</h2>
        </div>
        {count && (
            <span className="bg-slate-100 text-slate-500 text-[11px] font-bold px-3 py-1.5 rounded-full border border-slate-200">
                {count} Services
            </span>
        )}
    </div>
);

/* ═══════════════════════════════════════════════════════════════
   SERVICE DATA
═══════════════════════════════════════════════════════════════*/
const bankingServices = [
    { id: 'quick_mr', title: 'Quick MR Plus', showTransact: true, isLarge: true, icon3d: <Icon3D emoji="💸" bg="linear-gradient(135deg,#dbeafe,#bfdbfe)" shadow="0 10px 30px rgba(37,99,235,0.25)" /> },
    { id: 'pw_money_ekyc', title: 'PW Money eKYC', showTransact: true, isLarge: true, icon3d: <Icon3D emoji="🪪" bg="linear-gradient(135deg,#ede9fe,#ddd6fe)" shadow="0 10px 30px rgba(124,58,237,0.25)" /> },
    { id: 'aeps_services', title: 'AEPS Services', showTransact: true, isLarge: true, icon3d: <Icon3D emoji="🏧" bg="linear-gradient(135deg,#d1fae5,#a7f3d0)" shadow="0 10px 30px rgba(16,185,129,0.25)" /> },
    { id: 'matm', title: '2-in-1 mPOS (New)', actionLabel: 'Purchase', actionColor: 'bg-gradient-to-r from-blue-600 to-indigo-600', icon3d: <Icon3D emoji="💳" bg="linear-gradient(135deg,#dbeafe,#bfdbfe)" shadow="0 10px 30px rgba(37,99,235,0.2)" /> },
    { id: 'fino_suvidha', title: 'Fino Suvidha', actionLabel: 'Purchase', actionColor: 'bg-gradient-to-r from-blue-600 to-indigo-600', icon3d: <Icon3D emoji="🏦" bg="linear-gradient(135deg,#ecfdf5,#d1fae5)" shadow="0 10px 30px rgba(16,185,129,0.2)" /> },
    { id: 'smart_pos', title: 'Smart POS', actionLabel: 'Purchase', actionColor: 'bg-gradient-to-r from-blue-600 to-indigo-600', icon3d: <Icon3D emoji="🖥️" bg="linear-gradient(135deg,#dbeafe,#e0f2fe)" shadow="0 10px 30px rgba(14,165,233,0.2)" /> },
    { id: 'matm_cash', title: 'm-ATM Cash', icon3d: <Icon3D emoji="💰" bg="linear-gradient(135deg,#fef9c3,#fef08a)" shadow="0 10px 30px rgba(202,138,4,0.2)" /> },
    { id: 'matm_mp63', title: 'mATM – MP63', icon3d: <Icon3D emoji="📱" bg="linear-gradient(135deg,#eff6ff,#dbeafe)" shadow="0 10px 30px rgba(37,99,235,0.15)" /> },
    { id: 'qpos_mini', title: '2-IN-1 QPOS Mini', actionLabel: 'Purchase', actionColor: 'bg-gradient-to-r from-blue-600 to-indigo-600', icon3d: <Icon3D emoji="🔌" bg="linear-gradient(135deg,#ecfdf5,#d1fae5)" shadow="0 10px 30px rgba(16,185,129,0.2)" /> },
    { id: 'ybl_mr', title: 'Indo Nepal MR', actionLabel: 'Purchase', actionColor: 'bg-gradient-to-r from-blue-600 to-indigo-600', icon3d: <Icon3D emoji="🌏" bg="linear-gradient(135deg,#e0f2fe,#bae6fd)" shadow="0 10px 30px rgba(14,165,233,0.2)" /> },
    { id: 'cms', title: 'CMS Banking', icon3d: <Icon3D emoji="🏛️" bg="linear-gradient(135deg,#fdf4ff,#f3e8ff)" shadow="0 10px 30px rgba(168,85,247,0.2)" /> },
];

const travelServices = [
    { title: 'Hotel Booking', icon3d: <Icon3D emoji="🏨" bg="linear-gradient(135deg,#dbeafe,#bfdbfe)" shadow="0 8px 24px rgba(37,99,235,0.2)" /> },
    { title: 'Rail E-Ticketing', icon3d: <Icon3D emoji="🚂" bg="linear-gradient(135deg,#fef3c7,#fde68a)" shadow="0 8px 24px rgba(245,158,11,0.2)" /> },
    { title: 'Train', icon3d: <Icon3D emoji="🚆" bg="linear-gradient(135deg,#e0f2fe,#bae6fd)" shadow="0 8px 24px rgba(14,165,233,0.2)" /> },
    { title: 'Bus Ticketing', icon3d: <Icon3D emoji="🚌" bg="linear-gradient(135deg,#d1fae5,#a7f3d0)" shadow="0 8px 24px rgba(16,185,129,0.2)" /> },
    { title: 'Air Ticketing', icon3d: <Icon3D emoji="✈️" bg="linear-gradient(135deg,#eff6ff,#dbeafe)" shadow="0 8px 24px rgba(37,99,235,0.25)" /> },
    { title: 'New Air Ticketing', icon3d: <Icon3D emoji="🛫" bg="linear-gradient(135deg,#f0f9ff,#e0f2fe)" shadow="0 8px 24px rgba(14,165,233,0.2)" /> },
];

const bharatConnectServices = [
    { title: 'Bill Pay', icon3d: <Icon3D emoji="🧾" bg="linear-gradient(135deg,#fdf4ff,#ede9fe)" shadow="0 8px 24px rgba(124,58,237,0.2)" /> },
    { title: 'Loan Payments', icon3d: <Icon3D emoji="🏦" bg="linear-gradient(135deg,#dbeafe,#bfdbfe)" shadow="0 8px 24px rgba(37,99,235,0.2)" /> },
    { title: 'Electricity Bill', icon3d: <Icon3D emoji="⚡" bg="linear-gradient(135deg,#fef9c3,#fef08a)" shadow="0 8px 24px rgba(202,138,4,0.25)" /> },
    { title: 'Gas Cylinder', icon3d: <Icon3D emoji="🔥" bg="linear-gradient(135deg,#fee2e2,#fecaca)" shadow="0 8px 24px rgba(239,68,68,0.2)" /> },
    { title: 'Piped Gas Bill', icon3d: <Icon3D emoji="🌡️" bg="linear-gradient(135deg,#fff7ed,#fed7aa)" shadow="0 8px 24px rgba(249,115,22,0.2)" /> },
    { title: 'Water Bill', icon3d: <Icon3D emoji="💧" bg="linear-gradient(135deg,#e0f2fe,#bae6fd)" shadow="0 8px 24px rgba(14,165,233,0.25)" /> },
    { title: 'FASTag Payments', icon3d: <Icon3D emoji="🚗" bg="linear-gradient(135deg,#d1fae5,#a7f3d0)" shadow="0 8px 24px rgba(16,185,129,0.2)" /> },
    { title: 'DTH', icon3d: <Icon3D emoji="📡" bg="linear-gradient(135deg,#ede9fe,#ddd6fe)" shadow="0 8px 24px rgba(124,58,237,0.2)" /> },
    { title: 'Broadband', icon3d: <Icon3D emoji="🌐" bg="linear-gradient(135deg,#dbeafe,#bfdbfe)" shadow="0 8px 24px rgba(37,99,235,0.2)" /> },
    { title: 'Landline Postpaid', icon3d: <Icon3D emoji="☎️" bg="linear-gradient(135deg,#e0f2fe,#bae6fd)" shadow="0 8px 24px rgba(14,165,233,0.2)" /> },
    { title: 'Mobile Postpaid', icon3d: <Icon3D emoji="📲" bg="linear-gradient(135deg,#eff6ff,#dbeafe)" shadow="0 8px 24px rgba(37,99,235,0.2)" /> },
    { title: 'LIC Premium', icon3d: <Icon3D emoji="🛡️" bg="linear-gradient(135deg,#d1fae5,#a7f3d0)" shadow="0 8px 24px rgba(16,185,129,0.25)" /> },
    { title: 'Insurance', icon3d: <Icon3D emoji="🔒" bg="linear-gradient(135deg,#ecfdf5,#d1fae5)" shadow="0 8px 24px rgba(16,185,129,0.2)" /> },
    { title: 'Credit Card Bill', icon3d: <Icon3D emoji="💳" bg="linear-gradient(135deg,#fdf4ff,#f3e8ff)" shadow="0 8px 24px rgba(168,85,247,0.2)" /> },
    { title: 'Visa/Master CC Bill', icon3d: <Icon3D emoji="🏧" bg="linear-gradient(135deg,#ede9fe,#ddd6fe)" shadow="0 8px 24px rgba(124,58,237,0.2)" /> },
    { title: 'Municipal Taxes', icon3d: <Icon3D emoji="🏛️" bg="linear-gradient(135deg,#dbeafe,#bfdbfe)" shadow="0 8px 24px rgba(37,99,235,0.2)" /> },
    { title: 'Housing Societies', icon3d: <Icon3D emoji="🏘️" bg="linear-gradient(135deg,#d1fae5,#a7f3d0)" shadow="0 8px 24px rgba(16,185,129,0.2)" /> },
    { title: 'Digital Cable TV', icon3d: <Icon3D emoji="📺" bg="linear-gradient(135deg,#e0f2fe,#bae6fd)" shadow="0 8px 24px rgba(14,165,233,0.2)" /> },
    { title: 'Subscription', icon3d: <Icon3D emoji="🔔" bg="linear-gradient(135deg,#fef9c3,#fef08a)" shadow="0 8px 24px rgba(202,138,4,0.2)" /> },
    { title: 'Hospital Bill', icon3d: <Icon3D emoji="🏥" bg="linear-gradient(135deg,#fee2e2,#fecaca)" shadow="0 8px 24px rgba(239,68,68,0.15)" /> },
    { title: 'Clubs & Associations', icon3d: <Icon3D emoji="🤝" bg="linear-gradient(135deg,#dbeafe,#bfdbfe)" shadow="0 8px 24px rgba(37,99,235,0.2)" /> },
    { title: 'Education Bill', icon3d: <Icon3D emoji="🎓" bg="linear-gradient(135deg,#fdf4ff,#ede9fe)" shadow="0 8px 24px rgba(124,58,237,0.2)" /> },
];

const utilityServices = [
    { title: 'Mobile Recharge', icon3d: <Icon3D emoji="📱" bg="linear-gradient(135deg,#dbeafe,#bfdbfe)" shadow="0 8px 24px rgba(37,99,235,0.2)" /> },
    { title: 'DTH Recharge', icon3d: <Icon3D emoji="📡" bg="linear-gradient(135deg,#ede9fe,#ddd6fe)" shadow="0 8px 24px rgba(124,58,237,0.2)" /> },
    { title: 'Collection', icon3d: <Icon3D emoji="🪙" bg="linear-gradient(135deg,#fef9c3,#fef08a)" shadow="0 8px 24px rgba(202,138,4,0.25)" /> },
    { title: 'Instant PAN Card', icon3d: <Icon3D emoji="🪪" bg="linear-gradient(135deg,#d1fae5,#a7f3d0)" shadow="0 8px 24px rgba(16,185,129,0.2)" /> },
    { title: 'Ayushpay Subscription', icon3d: <Icon3D emoji="🩺" bg="linear-gradient(135deg,#fee2e2,#fecaca)" shadow="0 8px 24px rgba(239,68,68,0.15)" /> },
    { title: 'Digital Wallet Top-up', icon3d: <Icon3D emoji="👛" bg="linear-gradient(135deg,#eff6ff,#dbeafe)" shadow="0 8px 24px rgba(37,99,235,0.2)" /> },
    { title: 'Vouchers', icon3d: <Icon3D emoji="🎟️" bg="linear-gradient(135deg,#fff7ed,#fed7aa)" shadow="0 8px 24px rgba(249,115,22,0.2)" /> },
    { title: 'HDFC BF', icon3d: <Icon3D emoji="🏦" bg="linear-gradient(135deg,#e0f2fe,#bae6fd)" shadow="0 8px 24px rgba(14,165,233,0.2)" /> },
    { title: 'Recharge OTT', icon3d: <Icon3D emoji="🎬" bg="linear-gradient(135deg,#fdf4ff,#f3e8ff)" shadow="0 8px 24px rgba(168,85,247,0.2)" /> },
    { title: 'Digi Gold', icon3d: <Icon3D emoji="🥇" bg="linear-gradient(135deg,#fef9c3,#fde68a)" shadow="0 8px 24px rgba(202,138,4,0.3)" /> },
    { title: 'PAN Card', icon3d: <Icon3D emoji="📋" bg="linear-gradient(135deg,#d1fae5,#a7f3d0)" shadow="0 8px 24px rgba(16,185,129,0.2)" /> },
    { title: 'ITR Filing', icon3d: <Icon3D emoji="📑" bg="linear-gradient(135deg,#dbeafe,#bfdbfe)" shadow="0 8px 24px rgba(37,99,235,0.2)" /> },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════*/
const AllServices = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const routeMap = {
        aeps_services: '/aeps',
        cms: '/cms',
        travel: '/travel',
        utility: '/utility',
        quick_mr: '/dmt', // Assuming /dmt exists or redirect appropriately
        matm: '/matm',
        matm_cash: '/matm',
        matm_mp63: '/matm',
    };

    const go = (id) => {
        const route = routeMap[id];
        if (route) {
            navigate(route);
        } else {
            console.log('Service routing not implemented yet for:', id);
        }
    };

    // Filter Logic
    const filterData = (data) => data.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredBanking = filterData(bankingServices);
    const filteredTravel = filterData(travelServices);
    const filteredBharat = filterData(bharatConnectServices);
    const filteredUtility = filterData(utilityServices);

    const totalActive = filteredBanking.length + filteredTravel.length + filteredBharat.length + filteredUtility.length;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
                .all-svcs-root * { font-family: 'Outfit', sans-serif; }
                .icon-3d:hover { transform: perspective(200px) rotateX(0deg) scale(1.05) !important; }
                .group:hover .icon-3d { transform: perspective(200px) rotateX(0deg) translateY(-6px) scale(1.08); }
                body { background-color: #f8fafc; }
            `}</style>

            <div className="all-svcs-root p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto space-y-12 pb-24 min-h-screen">

                <div className="h-4"></div>

                {/* ── Services Grid Sections ── */}
                <div className="space-y-16">
                    {/* ── Banking ── */}
                    {filteredBanking.length > 0 && (
                        <section>
                            <SectionHeader label="Banking & Finance" color="#4f46e5" count={filteredBanking.length} />
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                {filteredBanking.map((s, i) => (
                                    <ServiceCard key={i} delay={i}
                                        title={s.title} icon3d={s.icon3d} active
                                        showTransact={s.showTransact} actionLabel={s.actionLabel}
                                        actionColor={s.actionColor} isLarge={s.isLarge}
                                        onClick={() => s.id ? go(s.id) : go('banking')}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ── Travel ── */}
                    {filteredTravel.length > 0 && (
                        <section>
                            <SectionHeader label="Travel Services" color="#10b981" count={filteredTravel.length} />
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                {filteredTravel.map((s, i) => (
                                    <ServiceCard key={i} delay={i} title={s.title} icon3d={s.icon3d} active onClick={() => go('travel')} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ── Bharat Connect ── */}
                    {filteredBharat.length > 0 && (
                        <section>
                            <SectionHeader label="Bharat Connect (BBPS)" color="#8b5cf6" count={filteredBharat.length} />
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                {filteredBharat.map((s, i) => (
                                    <ServiceCard key={i} delay={i} title={s.title} icon3d={s.icon3d} active onClick={() => go('utility')} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ── Utility ── */}
                    {filteredUtility.length > 0 && (
                        <section>
                            <SectionHeader label="Utility & Other Services" color="#f97316" count={filteredUtility.length} />
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                {filteredUtility.map((s, i) => (
                                    <ServiceCard key={i} delay={i} title={s.title} icon3d={s.icon3d} active onClick={() => go('utility')} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* No Results Fallback */}
                    {totalActive === 0 && (
                        <div className="py-20 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200">
                            <span className="text-6xl mb-4">🔍</span>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No services found</h3>
                            <p className="text-sm font-medium text-slate-500">Try adjusting your search query.</p>
                            <button
                                onClick={() => setSearchQuery('')}
                                className="mt-6 px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                            >
                                Clear Search
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AllServices;
