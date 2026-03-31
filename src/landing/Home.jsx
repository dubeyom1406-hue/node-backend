import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import logo from '../assets/rupiksha_logo.png';
import characterImg from '../assets/character-removebg-preview.png';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import VerticalCardSlider from '../components/VerticalCardSlider';
const aadhaar_3d_logo = "https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/Aadhaar_Logo.svg/1200px-Aadhaar_Logo.svg.png";

/* ─────────────────────────────────────────────
   Tiny hook: trigger in-view class once element
   crosses the viewport
───────────────────────────────────────────── */
function useInView(threshold = 0.15) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold }
        );
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, visible];
}

/* ─────────────── Stagger grid wrapper ─────────────── */
// One IntersectionObserver watches the *parent* wrapper.
// When it enters view every .stagger-item gets its own
// CSS transition-delay so cards pop in one by one.
function StaggerGrid({ children, className = '', itemClassName = '', baseDelay = 0, step = 120 }) {
    const wrapRef = useRef(null);
    const [triggered, setTriggered] = useState(false);

    useEffect(() => {
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTriggered(true);
                    obs.disconnect();
                }
            },
            { threshold: 0.12 }
        );
        if (wrapRef.current) obs.observe(wrapRef.current);
        return () => obs.disconnect();
    }, []);

    return (
        <div ref={wrapRef} className={className}>
            {React.Children.map(children, (child, i) => (
                <div
                    className={`stagger-item ${triggered ? 'stagger-item--visible' : ''} ${itemClassName}`}
                    style={{ animationDelay: `${baseDelay + i * step}ms` }}
                >
                    {child}
                </div>
            ))}
        </div>
    );
}

/* ─────────────── Reusable animated card (kept for non-grid use) ─────────────── */
function AnimCard({ children, delay = 0, className = '' }) {
    const [ref, visible] = useInView();
    return (
        <div
            ref={ref}
            className={`stagger-item ${visible ? 'stagger-item--visible' : ''} ${className}`}
            style={{ animationDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

/* ─────────────── Section heading ─────────────── */
function SectionHead({ tag, title, sub, center = true }) {
    const [ref, visible] = useInView();
    return (
        <div ref={ref} className={`section-head ${visible ? 'section-head--visible' : ''} ${center ? 'text-center' : ''}`}>
            <span className="section-tag">{tag}</span>
            <h2 className="section-title" dangerouslySetInnerHTML={{ __html: title }} />
            {sub && <p className="section-sub">{sub}</p>}
        </div>
    );
}

/* ══════════════════════════════════════════════
   DATA
══════════════════════════════════════════════ */
const SERVICES = [
    {
        label: 'AEPS',
        subtitle: 'Aadhaar Enabled Payment System',
        desc: 'Aadhaar Enabled Payment System allows customers to perform banking transactions using their Aadhaar number and biometric authentication.',
        features: ['Cash withdrawals using Aadhaar authentication', 'Cash deposits to any bank account', 'Balance enquiry', 'Mini statements', 'Aadhaar Pay for merchant payments', 'Interoperable across all banks'],
        grad: 'linear-gradient(160deg,#14532d 0%,#15803d 60%,#16a34a 100%)',
        glow: 'rgba(22,163,74,0.6)', tag: 'RBI Certified',
        img: aadhaar_3d_logo,
    },
    {
        emoji: '🏦', label: 'Banking Services',
        subtitle: 'Comprehensive Banking Solutions',
        desc: 'Extend banking services to your customers as a Business Correspondent. Provide account opening, cash deposits, withdrawals, and more.',
        features: ['Account opening for multiple banks', 'Cash deposits and withdrawals', 'Balance enquiry and mini statements', 'Fixed and recurring deposit creation', 'Micro-ATM services'],
        grad: 'linear-gradient(160deg,#1e3a8a 0%,#1d4ed8 60%,#2563eb 100%)',
        glow: 'rgba(37,99,235,0.6)', tag: 'Pan India',
    },
    {
        emoji: '🤝', label: 'Micro Loans',
        subtitle: '₹5,000 – ₹50,000 Quick Loans',
        desc: "Facilitate small loans for your customers' immediate needs. Our platform connects borrowers with lenders for quick and hassle-free loan disbursals.",
        features: ['Small ticket loans from ₹5,000 to ₹50,000', 'Quick approval process', 'Minimal documentation', 'Flexible repayment options', 'No collateral required'],
        grad: 'linear-gradient(160deg,#164e63 0%,#0891b2 60%,#06b6d4 100%)',
        glow: 'rgba(8,145,178,0.6)', tag: 'Fast Approval',
    },
    {
        emoji: '💳', label: 'Neo Banking',
        subtitle: 'Digital Banking Platform',
        desc: 'Offer digital banking services with enhanced features and user experience. Our neo-banking platform provides a modern alternative to traditional banking.',
        features: ['Digital savings accounts', 'Virtual debit cards', 'Real-time transaction notifications', 'Goal-based savings', 'Integrated investment options'],
        grad: 'linear-gradient(160deg,#1c1917 0%,#292524 60%,#44403c 100%)',
        glow: 'rgba(68,64,60,0.7)', tag: 'New',
    },
    {
        emoji: '🏠', label: 'CSP',
        subtitle: 'Customer Service Point',
        desc: 'Transform your shop into a Customer Service Point. Provide essential banking and government services to your local community.',
        features: ['Dedicated banking outlet', 'Agent registration', 'Multiple bank connectivity', 'Local area service provider'],
        grad: 'linear-gradient(160deg,#713f12 0%,#a16207 60%,#ca8a04 100%)',
        glow: 'rgba(202,138,4,0.6)', tag: 'Business Opportunity',
    },
    {
        emoji: '💼', label: 'Business Correspondent',
        subtitle: 'Business Correspondent',
        desc: 'Act as a Business Correspondent for leading banks. Facilitate secure transactions and financial inclusion in underserved areas.',
        features: ['Bank-authorized agent', 'Secure cash management', 'Customer enrollment', 'Financial literacy support'],
        grad: 'linear-gradient(160deg,#581c87 0%,#7c3aed 60%,#8b5cf6 100%)',
        glow: 'rgba(124,58,237,0.6)', tag: 'Certified Agent',
    },
    {
        emoji: '💸', label: 'Money Transfer',
        subtitle: 'DMT / IMPS / NEFT / RTGS',
        desc: 'Secure and instant domestic money transfers to any bank account in India. Our IMPS, NEFT, and UPI enabled services ensure your customers can send money anywhere, anytime.',
        features: ['Instant transfers through IMPS/UPI', 'Scheduled transfers through NEFT', 'Real-time transaction status updates', 'Transaction history and digital receipts', 'Secure authentication for every transaction', 'Competitive transfer fees'],
        grad: 'linear-gradient(160deg,#1e3a8a 0%,#1d4ed8 60%,#2563eb 100%)',
        glow: 'rgba(37,99,235,0.6)', tag: 'Most Popular',
    },
    {
        emoji: '🧾', label: 'Bill Payment',
        subtitle: 'BBPS Powered • 100+ Billers',
        desc: 'Comprehensive bill payment services for utilities, subscriptions, and more. Our platform supports 100+ billers across multiple categories.',
        features: ['Electricity, water, and gas bill payments', 'Mobile, broadband, and DTH recharges', 'Credit card bill payments', 'Insurance premium payments', 'Educational fee payments', 'Automatic bill payment reminders'],
        grad: 'linear-gradient(160deg,#713f12 0%,#a16207 60%,#ca8a04 100%)',
        glow: 'rgba(202,138,4,0.6)', tag: 'BBPS Certified',
    },
    {
        emoji: '📱', label: 'Recharge',
        subtitle: 'All Operators • Instant',
        desc: 'Offer prepaid recharges for mobile, DTH, data cards, and more. Our platform supports all major operators and provides instant processing.',
        features: ['Mobile prepaid recharges', 'DTH recharges', 'Data card recharges', 'Postpaid bill payments', 'Special recharge offers and cashbacks', 'Scheduled recharges'],
        grad: 'linear-gradient(160deg,#581c87 0%,#7c3aed 60%,#8b5cf6 100%)',
        glow: 'rgba(124,58,237,0.6)', tag: 'Instant Credit',
    },
    {
        emoji: '✈️', label: 'Tours & Travel',
        subtitle: 'IRCTC Certified Agent',
        desc: 'Complete travel booking solutions including flights, hotels, buses, trains, and holiday packages. Provide end-to-end travel services to your customers.',
        features: ['Domestic & international flight bookings', 'Hotel reservations across India', 'Bus and train ticket bookings', 'Customized holiday packages', 'Travel insurance', '24/7 travel support'],
        grad: 'linear-gradient(160deg,#0c4a6e 0%,#0369a1 60%,#0ea5e9 100%)',
        glow: 'rgba(14,165,233,0.6)', tag: 'IRCTC Partner',
    },
    {
        emoji: '🛡️', label: 'Insurance',
        subtitle: 'Life & General Insurance',
        desc: 'Offer a range of insurance products to provide financial security to your customers. Our platform enables quick policy issuance and claims support.',
        features: ['Life insurance policies', 'Health insurance for individuals & families', 'Two-wheeler and four-wheeler insurance', 'Travel insurance', 'Shop and business insurance', 'Digital policy documents'],
        grad: 'linear-gradient(160deg,#14532d 0%,#166534 60%,#15803d 100%)',
        glow: 'rgba(21,128,61,0.6)', tag: 'IRDAI Approved',
    },
    {
        emoji: '📋', label: 'Utility Services',
        subtitle: 'PAN • Aadhaar • Documents',
        desc: 'Provide essential document services like PAN card, Voter ID, Aadhaar updates, and more. Be a one-stop solution for all documentation needs.',
        features: ['PAN card applications', 'Voter ID applications and corrections', 'Aadhaar enrollment and updates', 'Passport application assistance', 'Certificate attestations', 'Government scheme registrations'],
        grad: 'linear-gradient(160deg,#422006 0%,#b45309 60%,#d97706 100%)',
        glow: 'rgba(180,83,9,0.6)', tag: 'Govt. Approved',
    },
];

const STATS = [
    { num: '100', label: 'Cities Covered', suffix: '+' },
    { num: '50', label: 'Active Retailers', suffix: 'K+' },
    { num: '200', label: 'Monthly Volume', prefix: '₹', suffix: 'Cr+' },
    { num: '99.9', label: 'Uptime SLA', suffix: '%' },
];

const HOW = [
    { step: '01', color: '#2563eb', title: 'Register Now', desc: 'Sign up in under 2 minutes with your mobile number. No paperwork needed.' },
    { step: '02', color: '#16a34a', title: 'Get Approved', desc: 'Our team verifies your account and activates all financial services.' },
    { step: '03', color: '#ca8a04', title: 'Start Earning', desc: 'Offer digital payments to customers and earn commissions every day.' },
];

const ADVANTAGE = [
    { icon: '🔐', title: 'Secure Transactions', desc: 'Bank-grade security with end-to-end encryption and multi-factor authentication for all transactions.', color: '#4f46e5' },
    { icon: '⚡', title: 'Real-time Processing', desc: 'Instant transaction processing with immediate confirmations and minimal wait times.', color: '#10b981' },
    { icon: '💰', title: 'High Commission', desc: 'Earn attractive commissions on every transaction with timely settlements to your account.', color: '#f59e0b' },
    { icon: '📊', title: 'Live Analytics', desc: 'Comprehensive reporting and analytics to track your transactions and business growth.', color: '#8b5cf6' },
    { icon: '🛎️', title: '24/7 Support', desc: 'Dedicated customer support available round-the-clock to assist with any queries or issues.', color: '#f43f5e' },
    { icon: '🏦', title: 'RBI Compliant', desc: 'Fully compliant with all RBI regulations and guidelines for digital payment services.', color: '#334155' },
];

const FEATURES = [
    { icon: '🔒', title: 'Bank-grade Security', desc: '256-bit SSL, RBI compliant & ISO certified.' },
    { icon: '⚡', title: 'Instant Settlement', desc: 'T+0 settlement for high-volume partners.' },
    { icon: '📊', title: 'Live Analytics', desc: 'Real-time dashboards & downloadable reports.' },
    { icon: '🤝', title: 'Dedicated Support', desc: '24×7 helpdesk via call, chat & WhatsApp.' },
    { icon: '🌐', title: 'Pan-India Network', desc: 'Operate from any state with our GST invoice.' },
    { icon: '💡', title: 'Training Videos', desc: 'Step-by-step tutorials inside your portal.' },
];

/* ══════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════ */
/* ─────────────────────────────────────────────
   Animated Counter component
───────────────────────────────────────────── */
function Counter({ end, duration = 2000, prefix = "", suffix = "" }) {
    const [count, setCount] = useState(0);
    const [ref, visible] = useInView(0.1);
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (visible && !hasAnimated.current) {
            hasAnimated.current = true;
            let startTime;
            const endVal = parseFloat(end);

            const animate = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);

                // Ease out expo
                const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

                setCount(easedProgress * endVal);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            requestAnimationFrame(animate);
        }
    }, [visible, end, duration]);

    return (
        <b ref={ref} className="rp-stat-num">
            {prefix}{count.toLocaleString(undefined, {
                minimumFractionDigits: end.includes('.') ? 1 : 0,
                maximumFractionDigits: end.includes('.') ? 1 : 0,
            })}{suffix}
        </b>
    );
}

/* ══════════════════════════════════════════════
   NAVBAR
   • Premium glass design
   • Improved mobile menu
══════════════════════════════════════════════ */

/* ══════════════════════════════════════════════
   HERO
══════════════════════════════════════════════ */
const HERO_VARIANTS = [
    {
        badge: "Easy Payment",
        h1: <>Pay <span>fast and smarter</span><br />from anywhere</>,
        sub: "Experience the future of payments: fast, secure, and tailored for the next generation's convenience and trust."
    },
    {
        badge: "Secure Transactions",
        h1: <>Banking <span>reimagined</span><br />for your life</>,
        sub: "Your security is our priority. We use world-class encryption to keep your money and data safe at all times."
    },
    {
        badge: "Next-Gen Fintech",
        h1: <>One app <span>Infinite</span><br />possibilities</>,
        sub: "Manage your finances, pay bills, and send money instantly. Everything you need is just a tap away."
    }
];

const Hero = () => {
    const navigate = useNavigate();
    const [cur, setCur] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 900);
        window.addEventListener('resize', handleResize);
        const timer = setInterval(() => {
            setCur(prev => (prev + 1) % HERO_VARIANTS.length);
        }, 4000);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearInterval(timer);
        };
    }, []);

    const content = HERO_VARIANTS[cur];

    return (
        <section className="rp-hero" id="hero">
            <div className="rp-hero-bg">
                <div className="rp-hero-bg__blob rp-hero-bg__blob--1" />
                <div className="rp-hero-bg__blob--2 rp-hero-bg__blob" />
            </div>

            <div className="rp-hero__content">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={cur}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                    >
                        <div className="rp-hero__badge">{content.badge}</div>

                        <h1 className="rp-hero__h1">
                            {content.h1}
                        </h1>

                        <p className="rp-hero__sub">
                            {content.sub}
                        </p>
                    </motion.div>
                </AnimatePresence>

                <div className="rp-hero__actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    <button className="rp-btn" style={{ 
                        background: '#2563eb', color: '#fff', fontWeight: 800, 
                        padding: isMobile ? '12px 24px' : '16px 40px', borderRadius: '50px', fontSize: isMobile ? '0.9rem' : '1.1rem', 
                        boxShadow: '0 10px 25px rgba(37,99,235,0.2)',
                    }} onClick={() => navigate('/portal')}>
                        join now →
                    </button>

                    <div className="rp-hero__stores" style={{ display: 'flex', alignItems: 'center' }}>
                        <div className="rp-store-btn" onClick={() => window.open('https://play.google.com/store', '_blank')} style={{ background: '#000', borderRadius: '12px', padding: isMobile ? '8px 16px' : '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L18.81,16.27C19.46,16.61 19.81,17.21 19.81,17.81C19.81,18.41 19.46,19.01 18.81,19.35L5.75,26.85C5.25,27.14 4.65,27.14 4.15,26.85L14.89,16.11L16.81,15.12M14.89,7.89L4.15,17.15L5.75,18.15L18.81,10.65C19.46,10.31 19.81,9.71 19.81,9.11C19.81,8.51 19.46,7.91 18.81,7.57L16.81,8.88L14.89,7.89Z"/></svg>
                            <div className="rp-store-text">
                                <small style={{ display: 'block', fontSize: '8px', opacity: 0.8 }}>GET IT ON</small>
                                <b style={{ fontSize: '12px' }}>Google Play</b>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {!isMobile && (
                <div className="rp-hero__visuals">
                    <img 
                        src={characterImg} 
                        alt="Fintech" 
                        className="rp-hero__char"
                    />
                    <div className="rp-float-widget rp-float-widget--payment">
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={cur}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="rp-payment-card"
                            >
                                <h6>{cur === 0 ? "Retailers" : cur === 1 ? "Monthly Volume" : "Agents"}</h6>
                                <h4>{cur === 0 ? "1000+" : cur === 1 ? "₹200Cr+" : "15,000+"}</h4>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </section>
    );
};

/* ══════════════════════════════════════════════
   STATS
══════════════════════════════════════════════ */
function Stats() {
    const [ref, visible] = useInView(0.12);
    return (
        <section ref={ref} className="rp-stats">
            <div className="rp-stats__inner">
                {STATS.map((s, i) => (
                    <div key={i} className={`rp-stat-card ${visible ? 'stagger-item--visible' : ''}`} style={{ animationDelay: `${i * 150}ms` }}>
                        <Counter end={s.num} prefix={s.prefix} suffix={s.suffix} />
                        <p className="rp-stat-label">{s.label}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

function Services() {
    const sectionRef = useRef(null);
    const [activeIdx, setActiveIdx] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1100);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1100);
        window.addEventListener('resize', handleResize);
        
        let ticking = false;
        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    if (sectionRef.current && !isMobile) {
                        const rect = sectionRef.current.getBoundingClientRect();
                        const scrolled = -rect.top;
                        const scrollable = rect.height - window.innerHeight;
                        if (scrollable > 0) {
                            const progress = Math.max(0, Math.min(1, scrolled / scrollable));
                            const idx = Math.min(SERVICES.length - 1, Math.floor(progress * SERVICES.length));
                            if (idx !== activeIdx) setActiveIdx(idx);
                        }
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', handleResize);
        };
    }, [activeIdx, isMobile]);

    const activeService = SERVICES[activeIdx] || SERVICES[0];

    if (isMobile) {
        return (
            <section id="services" style={{ padding: '80px 5%', background: '#fff' }}>
                <SectionHead tag="Our Services" title="What We Offer" sub="Comprehensive financial solutions for your business" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginTop: '40px' }}>
                    {SERVICES.map((s, i) => (
                        <motion.div 
                            key={i} 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                            style={{ 
                                background: s.grad, padding: '32px 24px', borderRadius: '32px', 
                                color: '#fff', boxShadow: `0 20px 40px -10px ${s.glow}`,
                                position: 'relative', overflow: 'hidden'
                            }}
                        >
                            <div style={{ position: 'relative', zIndex: 2 }}>
                                <span style={{ 
                                    fontSize: '10px', fontVariant: 'small-caps', fontWeight: 800, 
                                    textTransform: 'uppercase', letterSpacing: '2px', 
                                    background: 'rgba(255,255,255,0.15)', padding: '6px 14px', 
                                    borderRadius: '50px', border: '1px solid rgba(255,255,255,0.2)' 
                                }}>{s.tag}</span>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginTop: '20px', marginBottom: '12px', letterSpacing: '-0.5px' }}>{s.label}</h3>
                                <p style={{ fontSize: '0.9rem', opacity: 0.9, lineHeight: 1.6, marginBottom: '16px' }}>{s.desc}</p>
                            </div>

                            <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px 0 32px 0' }}>
                                <motion.div
                                    style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                    animate={{ scale: [1, 1.1, 1], y: [0, -8, 0] }}
                                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                                >
                                    {s.img ? (
                                        <img src={s.img} alt={s.label} style={{ height: '5rem', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.3))' }} />
                                    ) : (
                                        <div style={{ fontSize: '4.5rem', textShadow: '0 15px 25px rgba(0,0,0,0.3)', lineHeight: 1 }}>{s.emoji || '✦'}</div>
                                    )}
                                </motion.div>
                            </div>

                            <div style={{ position: 'relative', zIndex: 2 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                                    {(s.features || []).slice(0, 4).map((f, fi) => (
                                        <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 500 }}>
                                            <span style={{ color: '#4ade80', fontSize: '14px' }}>✓</span> {f}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section
            ref={sectionRef}
            id="services"
            style={{
                height: `${SERVICES.length * 100}vh`,
                background: '#fff',
                position: 'relative',
            }}
        >
            <div style={{
                position: 'sticky', top: 0,
                height: '100vh', width: '100%',
                background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 10,
            }}>
                <div style={{
                    width: '100%', maxWidth: 1280, height: '100%',
                    display: 'flex', alignItems: 'center', gap: 'clamp(40px, 6vw, 80px)',
                    padding: '80px 5% 40px', boxSizing: 'border-box',
                }}>
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                        <div>
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                background: '#0f172a', color: '#fff',
                                fontSize: 11, fontWeight: 800,
                                padding: '7px 16px', borderRadius: 999,
                                letterSpacing: 1.5, textTransform: 'uppercase',
                                marginBottom: 20,
                            }}>✦ {activeService.tag}</span>

                            <p style={{
                                fontSize: 11, fontWeight: 800, letterSpacing: 3,
                                textTransform: 'uppercase', color: '#94a3b8',
                                marginBottom: 12,
                            }}>{activeService.subtitle}</p>

                            <h3 style={{
                                fontSize: 'clamp(2.5rem,4vw,3.5rem)',
                                fontWeight: 900, color: '#0f172a',
                                lineHeight: 1.1, marginBottom: 16,
                                letterSpacing: '-1.5px',
                            }}>{activeService.label}</h3>

                            <p style={{
                                fontSize: '1.05rem', color: '#64748b',
                                lineHeight: 1.8, marginBottom: 30,
                                fontWeight: 400, maxWidth: '90%',
                            }}>{activeService.desc}</p>
                        </div>

                        {activeService.features && (
                            <div style={{ marginBottom: 32 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
                                    {activeService.features.map((f, fi) => (
                                        <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span style={{
                                                width: 18, height: 18, borderRadius: '50%',
                                                background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 10, color: '#fff', fontWeight: 900,
                                            }}>✓</span>
                                            <span style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 10, marginTop: 40 }}>
                            {SERVICES.map((_, i) => (
                                <div key={i} style={{
                                    width: i === activeIdx ? 32 : 10, height: 10,
                                    borderRadius: 999,
                                    background: i === activeIdx ? '#2563eb' : '#e2e8f0',
                                    transition: 'all 0.4s',
                                }} />
                            ))}
                        </div>
                    </div>

                    <div style={{
                        flex: '0 0 auto',
                        width: 'clamp(380px, 35vw, 480px)',
                        position: 'relative',
                        height: 580,
                    }}>
                        {SERVICES.map((s, i) => {
                            const offset = i - activeIdx;
                            if (offset > 3 || offset < -1) return null;
                            const isActive = offset === 0;
                            const isPast = offset < 0;
                            
                            let translateY = offset * 25;
                            let translateX = 0;
                            let scale = 1 - Math.abs(offset) * 0.05;
                            let opacity = 1 - Math.abs(offset) * 0.3;
                            let rotate = offset * 2;

                            if (isPast) {
                                translateY = -150;
                                opacity = 0;
                                scale = 0.8;
                            }

                            return (
                                <motion.div
                                    key={i}
                                    style={{
                                        position: 'absolute', inset: 0,
                                        background: s.grad,
                                        borderRadius: 40,
                                        y: translateY,
                                        x: translateX,
                                        scale,
                                        opacity,
                                        rotateZ: rotate,
                                        zIndex: 100 - i,
                                        boxShadow: `0 40px 100px -20px ${s.glow}`,
                                    }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                >
                                    <motion.div
                                        style={{
                                            padding: 40,
                                            color: '#fff',
                                            display: 'flex', flexDirection: 'column',
                                            height: '100%',
                                            borderRadius: 40,
                                        }}
                                        whileHover={{ scale: 1.03, y: -8 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                    >
                                        <h4 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 12 }}>{s.label}</h4>
                                        <p style={{ opacity: 0.9, lineHeight: 1.6, fontSize: '1rem' }}>{s.desc}</p>
                                        
                                        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '30px' }}>
                                            <motion.div
                                                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                                animate={{ scale: [1, 1.1, 1], y: [0, -10, 0] }}
                                                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                                            >
                                                {s.img ? (
                                                    <img src={s.img} alt={s.label} style={{ height: '7rem', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.3))' }} />
                                                ) : (
                                                    <div style={{ fontSize: '5.5rem', textShadow: '0 15px 30px rgba(0,0,0,0.3)', lineHeight: 1 }}>{s.emoji || '✦'}</div>
                                                )}
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}





/* ══════════════════════════════════════════════
   THE RUPIKSHA ADVANTAGE
══════════════════════════════════════════════ */
/* Advantage section header — animates only when scrolled into view */
function AdvantageHeader() {
    const headerRef = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold: 0 }
        );
        if (headerRef.current) obs.observe(headerRef.current);
        return () => obs.disconnect();
    }, []);

    return (
        <div
            ref={headerRef}
            style={{
                position: 'absolute',
                top: '4%',
                width: '100%',
                textAlign: 'center',
                pointerEvents: 'none',
                zIndex: 10
            }}
        >
            <div className={`writing-header ${visible ? 'writing-header--visible' : ''}`}>
                <span className={`tag-reveal ${visible ? 'tag-reveal--visible' : ''}`}>Why Choose Us</span>
                <h2 className={`typewriter-title ${visible ? 'typewriter-title--visible' : ''}`}>The Rupiksha Advantage</h2>
            </div>
        </div>
    );
}

function AdvantageCard({ item, i, progress, count }) {
    // We use useTransform to calculate style values from motion values
    // This happens outside of the React render cycle, which is MUCH smoother.
    const rel = useTransform(progress, p => p * (count - 1) - i);

    const tx = useTransform(rel, r => -r * 800);
    const ty = useTransform(rel, r => Math.pow(Math.abs(r), 1.5) * 450);
    const rot = useTransform(rel, r => -r * 25);
    const opacity = useTransform(rel, r => 1 - Math.pow(Math.min(1, Math.abs(r)), 2));
    const scale = useTransform(rel, r => 1 - Math.abs(r) * 0.2);

    return (
        <motion.div
            style={{
                x: tx,
                y: ty,
                rotate: rot,
                opacity,
                scale,
                position: 'absolute',
                top: 0,
                left: '50%',
                translateX: '-50%',
                width: 'min(480px, 92vw)', // Responsive width
                background: '#fff',
                borderRadius: 32,
                padding: 'min(45px, 6vw)',
                boxShadow: '0 30px 60px rgba(0,0,0,0.12)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                border: '1px solid #e2e8f0',
                willChange: 'transform, opacity'
            }}
        >
            <div style={{
                width: 80, height: 80, borderRadius: 24,
                background: `${item.color}10`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.5rem', marginBottom: 24
            }}>
                {item.icon}
            </div>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>{item.title}</h3>
            <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: 1.6, fontWeight: 500 }}>{item.desc}</p>
        </motion.div>
    );
}

function Advantage() {
    const sectionRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end end"]
    });

    // Inertia/Smooth scroll for the Advantage section
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <section
            ref={sectionRef}
            id="advantage"
            style={{
                height: `600vh`,
                background: '#f1f5f9',
                position: 'relative',
                marginTop: 0,
                marginBottom: 0,
            }}
        >
            <div style={{
                position: 'sticky',
                top: 0,
                height: '100svh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8% 5% 0'
            }}>
                <AdvantageHeader />

                <div style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: 1000,
                    height: 'min(500px, 60vh)',
                    marginTop: 40
                }}>
                    {ADVANTAGE.map((item, i) => (
                        <AdvantageCard
                            key={i}
                            item={item}
                            i={i}
                            progress={smoothProgress} // Using smooth progress
                            count={ADVANTAGE.length}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ══════════════════════════════════════════════
   CTA BANNER
══════════════════════════════════════════════ */
function Partners() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('retailer');
    const [ref, visible] = useInView();

    const data = {
        retailer: {
            title: 'Retailer',
            desc: 'Use our digital suite of products to upgrade your store and manage your credits, customers and payments better. Offer our assisted financial and digital commerce services to increase your income. Be the trusted banker in your area.',
            highlights: [
                { icon: '👥', text: 'Join over 15,00,000 active retailers' },
                { icon: '💰', text: 'Earn more than ₹25,000 per month' },
                { icon: '🛡️', text: 'No working capital required' }
            ],
            categories: ['Kirana Shop', 'Restaurant', 'Medical Shop', 'Fertilizer Shop', 'Apparel Shop', 'Tailoring Shop', 'Mobile Recharge Centre', 'Insurance Agency', 'Hardware Store', 'Travel Agency and more'],
            color: '#2563eb',
            image: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?q=80&w=1000&auto=format&fit=crop"
        },
        distributor: {
            title: 'Distributor',
            desc: 'Make more out of your distribution business. Onboard your network to offer Rupiksha and earn more than 18% per month on the money invested. No physical stock, staff or physical transfer of goods required. Both you and your retailers make money on every transaction.',
            highlights: [
                { icon: '🏢', text: 'Join over 1,00,000 distributors' },
                { icon: '📈', text: 'Earn more than ₹50,000 per month' },
                { icon: '🔄', text: 'Zero physical stock required' }
            ],
            categories: ['Telecom', 'Pharma', 'Retail', 'FMCG and many more'],
            color: '#10b981',
            image: "https://images.unsplash.com/photo-1600880210836-8f8ef9e09b52?q=80&w=1000&auto=format&fit=crop"
        },
        individual: {
            title: 'Individual / SHG',
            desc: 'Grab the opportunity to run your own business from your home or shop. Become a Rupiksha Digital Pradhan and offer financial services to your area. Home-based businesses can take their stores online and service more customers.',
            highlights: [
                { icon: '🏠', text: 'Run business from comfort of home' },
                { icon: '💸', text: 'Earn more than ₹15,000 per month' },
                { icon: '👩‍🏫', text: 'Ideal for Griha Udyog, SHGs, & Teachers' }
            ],
            categories: ['Griha Udyog Members', 'Self Help Groups', 'Teachers', 'Students', 'Home-based businesses'],
            color: '#f59e0b',
            image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop"
        }
    };

    const current = data[activeTab];

    return (
        <section className="rp-partners" id="partners" ref={ref}>
            <div className="section-container">
                <div className="partners-header">
                    <span className="partners-tag">Partnership Opportunities</span>
                    <h2 className="partners-title-glow">Grow with Rupiksha</h2>
                    <p className="partners-sub">Choose the role that fits your business goals and start earning today.</p>
                </div>

                <div className="partners-tabs">
                    {Object.keys(data).map(key => (
                        <button
                            key={key}
                            className={`partner-tab-btn ${activeTab === key ? 'active' : ''}`}
                            onClick={() => setActiveTab(key)}
                            style={{ '--color': data[key].color }}
                        >
                            {data[key].title}
                        </button>
                    ))}
                </div>

                <div className={`partner-content-card ${visible ? 'visible' : ''}`}>
                    <div className="partner-visual">
                        <img src={current.image} alt={current.title} className="partner-img" />
                        <div className="partner-visual-overlay" style={{ background: `linear-gradient(to top, ${current.color}cc, transparent)` }} />
                    </div>
                    <div className="partner-info">
                        <h3 style={{ color: current.color }}>{current.title}</h3>
                        <p className="partner-desc">{current.desc}</p>

                        <div className="partner-highlights">
                            {current.highlights.map((h, i) => (
                                <div key={i} className="highlight-item" style={{ background: `${current.color}08` }}>
                                    <span className="highlight-icon">{h.icon}</span>
                                    <span className="highlight-text">{h.text}</span>
                                </div>
                            ))}
                        </div>

                        <div className="partner-actions">
                            <button className="rp-btn rp-btn--lg" style={{ background: current.color, color: '#fff' }} onClick={() => navigate('/portal')}>Join Rupiksha</button>
                            <button className="rp-btn rp-btn--outline rp-btn--lg" style={{ borderColor: current.color, color: current.color }}>Income Calculator</button>
                        </div>

                        <div className="partner-categories-compact">
                            <h4>{current.title} Categories:</h4>
                            <div className="cat-grid-compact">
                                {current.categories.map((cat, idx) => (
                                    <span key={idx} className="cat-pill-compact">
                                        <span className="cat-dot" style={{ background: current.color }} />
                                        {cat}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}




/* ══════════════════════════════════════════════
   APP
══════════════════════════════════════════════ */
export default function Home() {
    return (
        <>
            <style>{CSS}</style>
            <div className="rp-root">
                <Navbar />
                <Hero />
                <Stats />
                <Services />
                <VerticalCardSlider />
                <Advantage />
                <Partners />
                <Footer />
            </div>
        </>
    );
}

/* ══════════════════════════════════════════════
   STYLES (injected – no separate CSS file needed)
══════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --blue: #2563eb;
  --blue-lt: #eff6ff;
  --green: #16a34a;
  --green-lt: #f0fdf4;
  --yellow: #ca8a04;
  --yellow-lt: #fefce8;
  --dark: #0f172a;
  --body: #334155;
  --muted: #64748b;
  --border: #e2e8f0;
  --white: #ffffff;
  --bg-light: #f8fafc;
  --radius: 20px;
  --shadow: 0 4px 24px rgba(0,0,0,0.07);
  --shadow-md: 0 8px 40px rgba(0,0,0,0.12);
}

.rp-root { font-family: 'Inter', sans-serif; color: var(--body); background: var(--white); display: flex; flex-direction: column; }

/* ── Gradient text ── */
.rp-gradient-text {
  background: linear-gradient(135deg, var(--blue) 0%, var(--green) 50%, var(--yellow) 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

/* ── Stagger items: each child fires independently via delay ── */
@keyframes cardReveal {
  from { opacity: 0; transform: translateY(40px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0)   scale(1);    }
}

/* Cards sit invisibly in their normal layout position — NO transform so they don't overlap */
.stagger-item {
  opacity: 0;
}

/* When triggered: play reveal animation with fill-mode so from/to handle the translate */
.stagger-item--visible {
  animation: cardReveal 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* ── Horizontal scroll track ── */
.hs-track::-webkit-scrollbar { display: none; }
.hs-track { -ms-overflow-style: none; scrollbar-width: none; }

/* Emoji floating animations for the service cards */
@keyframes emojiFloat0 { 0%,100% { transform: translateY(0)    rotate(0deg);   } 50% { transform: translateY(-12px) rotate(2deg);  } }
@keyframes emojiFloat1 { 0%,100% { transform: translateY(0)    rotate(0deg);   } 50% { transform: translateY(-8px)  rotate(-2deg); } }
@keyframes emojiFloat2 { 0%,100% { transform: translateY(0)    rotate(0deg);   } 50% { transform: translateY(-14px) rotate(1deg);  } }

/* ── Section heading ── */
.section-head { margin-bottom: 56px; opacity: 0; transform: translateY(30px); transition: opacity 0.6s ease, transform 0.6s ease; }
.section-head--visible { opacity: 1; transform: translateY(0); }
.section-tag { display: inline-block; background: linear-gradient(90deg,var(--blue-lt),var(--green-lt)); color: var(--blue); font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; padding: 6px 16px; border-radius: 999px; margin-bottom: 18px; border: 1px solid #c7d2fe; }
.section-title { 
  font-size: clamp(2rem, 4vw, 3rem); font-weight: 900; line-height: 1.15; 
  background: linear-gradient(135deg, #0f172a, #1e3a8a, #3b82f6, #0f172a);
  background-size: 300% 300%; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  animation: partnersDissolve 8s ease infinite;
}
.section-sub { 
  margin-top: 16px; font-size: 1.05rem; color: var(--muted); max-width: 580px; 
  margin-left: auto; margin-right: auto; line-height: 1.7; 
  background: linear-gradient(135deg, #475569, #1e3a8a, #475569);
  background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  animation: partnersDissolve 10s ease infinite;
}

/* ── Buttons ── */
.rp-btn { display: inline-flex; align-items: center; gap: 8px; border-radius: 999px; font-weight: 800; cursor: pointer; border: none; transition: all 0.25s; font-family: inherit; }
.rp-btn--primary { background: linear-gradient(135deg, var(--blue), #1d4ed8); color: #fff; box-shadow: 0 4px 20px rgba(37,99,235,0.4); }
.rp-btn--primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(37,99,235,0.5); }
.rp-btn--outline { background: transparent; color: var(--dark); border: 2px solid var(--border); }
.rp-btn--outline:hover { border-color: var(--blue); color: var(--blue); background: var(--blue-lt); }
.rp-btn--white { background: #fff; color: var(--blue); font-weight: 900; }
.rp-btn--white:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.2); }
.rp-btn--ghost { background: rgba(255,255,255,0.12); color: #fff; border: 1px solid rgba(255,255,255,0.25); }
.rp-btn--ghost:hover { background: rgba(255,255,255,0.22); }
.rp-btn--lg { padding: 16px 32px; font-size: 1rem; }
.rp-btn--sm { padding: 10px 24px; font-size: 0.8rem; }

/* ── Pill ── */
.rp-pill { background: var(--white); border: 1px solid var(--border); color: var(--body); border-radius: 999px; font-size: 11px; font-weight: 700; padding: 6px 14px; white-space: nowrap; }


/* ═══════════════════════════════════════════
   HERO
═══════════════════════════════════════════ */
.rp-hero { 
  min-height: 100vh; display: flex; align-items: center; justify-content: space-between; 
  padding: 40px 10% 0; position: relative; overflow: hidden; background: #fff; 
}
.rp-hero-bg { position: absolute; inset: 0; pointer-events: none; }
.rp-hero-bg__blob { 
  position: absolute; width: 60vw; height: 60vw; 
  filter: blur(100px); opacity: 0.15; border-radius: 50%; 
}
.rp-hero-bg__blob--1 { top: -20%; right: -20%; background: #a855f7; }
.rp-hero-bg__blob--2 { bottom: -20%; left: -10%; background: #fde047; }
.rp-hero-bg__blob--3 { top: 20%; right: 10%; background: #f97316; opacity: 0.1; }
.rp-hero-bg__blob--4 { top: 10%; left: 30%; background: #3b82f6; opacity: 0.12; width: 40vw; height: 40vw; }

.rp-hero__content { 
  flex: 1.2; max-width: 650px; position: relative; z-index: 2; margin-top: -60px; 
  display: flex; flex-direction: column; align-items: flex-start; text-align: left;
}
.rp-hero__badge { 
  color: #a855f7; font-weight: 800; font-size: 13px; text-transform: uppercase; 
  letter-spacing: 2px; margin-bottom: 20px; text-align: left; width: 100%;
}
.rp-hero__h1 { 
  font-size: clamp(3rem, 6vw, 4.8rem); font-weight: 850; line-height: 1.1; 
  color: #0f172a; letter-spacing: -2px; margin-bottom: 24px; 
}
.rp-hero__h1 span { position: relative; display: inline-block; }
.rp-hero__h1 span::after { 
  content: ''; position: absolute; bottom: 4px; left: 0; width: 100%; height: 2px; 
  background: #2563eb; opacity: 0.6;
}
.rp-hero__sub { 
  font-size: 1.15rem; color: #475569; line-height: 1.6; max-width: 480px; 
  margin-bottom: 40px; text-align: left;
}
.rp-hero__stores { display: flex; gap: 15px; margin-bottom: 25px; }
.rp-store-btn { 
  height: 48px; background: #000; border-radius: 8px; display: flex; 
  align-items: center; padding: 0 16px; gap: 10px; color: #fff; cursor: pointer;
  transition: transform 0.3s ease;
}
.rp-store-btn:hover { transform: translateY(-3px); }
.rp-store-btn svg { width: 24px; height: 24px; }
.rp-store-text { text-align: left; }
.rp-store-text small { display: block; font-size: 10px; opacity: 0.8; }
.rp-store-text b { font-size: 14px; }

.rp-hero__trust { display: flex; gap: 20px; color: #475569; font-size: 13px; font-weight: 600; }
.rp-hero__trust span { display: flex; align-items: center; gap: 6px; }

/* Character Visuals */
.rp-hero__visuals { 
  flex: 1; position: relative; display: flex; justify-content: flex-end; align-items: flex-end; 
  min-height: 650px; overflow: visible;
}
.rp-hero__char { 
  width: 130%; height: auto; max-width: 800px; z-index: 1; object-fit: contain; 
  transform-origin: bottom right;
  margin-right: -8%;
  margin-bottom: -1px; /* Ensure no gap at bottom */
}

/* Floating Cards for Monks Pay Style */
.rp-float-widget { 
  position: absolute; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); 
  padding: 18px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.06); 
  z-index: 10; border: 1px solid rgba(255, 255, 255, 0.2); 
  animation: floatAnim 4s ease-in-out infinite; 
}
.rp-float-widget--payment { bottom: 15%; left: 5%; perspective: 1000px; }
.rp-float-widget--users { top: 35%; right: 0; }

@keyframes floatAnim { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }

.rp-payment-card { width: 220px; }
.rp-payment-card h6 { font-size: 12px; color: #64748b; margin-bottom: 5px; font-weight: 700; }
.rp-payment-card h4 { font-size: 18px; color: #1e3a8a; margin-bottom: 10px; font-weight: 800; }
.rp-payment-card .meta { display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; }
.rp-payment-card .status { color: #10b981; }

.rp-users-card { display: flex; align-items: center; gap: 12px; padding: 12px 20px; }
.rp-users-avatar { display: flex; margin-left: -10px; }
.rp-users-avatar img { width: 32px; height: 32px; border-radius: 50%; border: 2px solid #fff; object-fit: cover; }
.rp-users-card b { font-size: 14px; color: #0f172a; }
.rp-users-card p { font-size: 10px; color: #64748b; margin: 0; }
.rp-mockup-phone:hover { transform: rotateY(-5deg) rotateX(5deg); }
.rp-phone-screen { padding: 25px 20px; color: #fff; }
.rp-phone-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }

/* Floating Glass Cards */
.rp-glass-card { 
  position: absolute; width: 200px; height: 130px; 
  background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(15, 23, 42, 0.1); border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.1); z-index: 10;
  display: flex; flex-direction: column; justify-content: space-between; padding: 18px;
  transition: all 0.4s ease;
}
.rp-glass-card--1 { top: 15%; right: -60px; transform: rotate(-8deg); border-left: 4px solid #1e3a8a; }
.rp-glass-card--2 { bottom: 15%; left: -60px; transform: rotate(10deg); border-right: 4px solid #2563eb; }

.rp-hero__actions { display: flex; gap: 15px; margin-top: 40px; }
.rp-stat-mini { margin-top: 60px; display: flex; align-items: center; gap: 20px; color: #0f172a; }
.rp-stat-mini b { font-size: 3rem; color: #1e3a8a; font-weight: 950; }
.rp-stat-mini p { font-size: 13px; color: #64748b; line-height: 1.4; max-width: 140px; font-weight: 500; }
.rp-float-card span { font-size: 22px; }
.rp-float-card b { display: block; font-size: 14px; font-weight: 800; color: var(--dark); }
.rp-float-card small { color: var(--muted); font-size: 11px; }
.rp-float-card--1 { top: 10px; left: 0; animation-delay: 0s; }
.rp-float-card--2 { bottom: 120px; right: -10px; animation-delay: 1.5s; }
.rp-float-card--3 { top: 60%; left: -20px; animation-delay: 3s; }
@keyframes floatPulse { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }

/* Mockup Screen */
.rp-hero__mockup { width: 100%; max-width: 320px; margin: 0 auto; }
.rp-mockup-screen { background: linear-gradient(160deg, #1e293b 0%, #0f172a 100%); border-radius: 28px; padding: 24px 20px; box-shadow: 0 30px 80px rgba(15,23,42,0.5); border: 1px solid #334155; }
.rp-mockup-bar { width: 60px; height: 5px; background: #334155; border-radius: 999px; margin: 0 auto 20px; }
.rp-mockup-bal { text-align: center; margin-bottom: 20px; }
.rp-mockup-bal small { color: #94a3b8; font-size: 11px; font-weight: 600; letter-spacing: 1px; display: block; }
.rp-mockup-bal b { color: #fff; font-size: 1.9rem; font-weight: 900; letter-spacing: -1px; }
.rp-mockup-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; margin-bottom: 20px; }
.rp-mockup-btn { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 10px 4px; text-align: center; cursor: pointer; transition: background 0.2s; animation: mockupPop 0.4s ease calc(var(--i)*0.1s) both; }
@keyframes mockupPop { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
.rp-mockup-btn:hover { background: #334155; }
.rp-mockup-btn span { display: block; font-size: 18px; }
.rp-mockup-btn small { color: #94a3b8; font-size: 9px; font-weight: 700; }
.rp-mockup-tx { background: #1e293b; border-radius: 14px; padding: 14px; border: 1px solid #334155; }
.rp-mockup-tx > span { color: #94a3b8; font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; display: block; margin-bottom: 10px; }
.rp-mockup-tx-row { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; border-bottom: 1px solid #334155; }
.rp-mockup-tx-row:last-child { border-bottom: none; }
.rp-mockup-tx-row span { color: #cbd5e1; font-size: 12px; }
.rp-mockup-tx-row b { font-size: 12px; font-weight: 800; }

@media(max-width:900px){
  .rp-hero { 
    flex-direction:column; 
    padding: 160px 5% 60px !important; 
    text-align:center; 
    min-height: auto;
    justify-content: flex-start;
  }
  .rp-hero__content { 
    margin-top: 0 !important; 
    align-items: center !important; 
    text-align: center !important;
    max-width: 100% !important;
  }
  .rp-hero__badge { 
    text-align: center !important;
    margin-bottom: 24px !important;
  }
  .rp-hero__h1 {
    font-size: clamp(2rem, 9vw, 2.6rem) !important;
    margin-bottom: 18px !important;
    line-height: 1.2;
  }
  .rp-hero__sub {
    text-align: center !important;
    margin: 0 auto 36px !important;
    font-size: 0.95rem !important;
  }
  .rp-hero__actions { justify-content:center; }
  .rp-hero__pills { justify-content:center; }
  .rp-hero__visuals { max-width: 320px; min-height: 340px; margin-top: 40px; margin-bottom: 20px; }
  .rp-float-card--1 { top:-10px; left:10px; }
  .rp-float-card--2 { right:0; bottom:80px; }
  .rp-float-card--3 { display:none; }
}

/* ═══════════════════════════════════════════
   STATS
═══════════════════════════════════════════ */
.rp-stats { background: linear-gradient(135deg, var(--blue) 0%, #1d4ed8 50%, var(--green) 100%); padding: 60px 5%; margin: 0; }
.rp-stats__inner { max-width: 1000px; margin: 0 auto; display: grid; grid-template-columns: repeat(4,1fr); gap: 24px; }
.rp-stat-card { text-align: center; color: #fff; }
.rp-stat-num { display: block; font-size: clamp(2rem, 4vw, 2.8rem); font-weight: 900; color: #fff; letter-spacing: -1px; }
.rp-stat-label { font-size: 0.85rem; font-weight: 600; color: rgba(255,255,255,0.75); margin-top: 4px; display: block; }
@media(max-width:700px){ .rp-stats__inner { grid-template-columns: repeat(2,1fr); } }

/* ═══════════════════════════════════════════
   SECTIONS / GRID
═══════════════════════════════════════════ */
.rp-section { padding: 100px 5%; max-width: 1200px; margin: 0 auto; }
.rp-section--light { background: var(--bg-light); max-width: 100%; padding: 100px 5%; }
.rp-section--light > * { max-width: 1200px; margin-left: auto; margin-right: auto; }
.rp-grid { display: grid; gap: 24px; }
.rp-grid--3 { grid-template-columns: repeat(3,1fr); }
@media(max-width:900px){ .rp-grid--3 { grid-template-columns: repeat(2,1fr); } }
@media(max-width:600px){ .rp-grid--3 { grid-template-columns: 1fr; } }

/* ═══════════════════════════════════════════
   SERVICE CARDS
═══════════════════════════════════════════ */
.rp-service-card {
  background: var(--card-bg, #f8fafc);
  border: 1.5px solid color-mix(in srgb, var(--card-color) 15%, transparent);
  border-radius: var(--radius);
  padding: 32px 28px;
  height: 100%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
}
.rp-service-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 60%, color-mix(in srgb, var(--card-color) 8%, transparent) 100%);
  pointer-events: none;
}
.rp-service-card:hover { transform: translateY(-6px); box-shadow: 0 16px 40px color-mix(in srgb, var(--card-color) 20%, transparent); border-color: color-mix(in srgb, var(--card-color) 40%, transparent); }
.rp-service-icon { font-size: 2.5rem; margin-bottom: 16px; display: block; }
.rp-service-label { 
  font-size: 1.1rem; font-weight: 800; margin-bottom: 10px;
  background: linear-gradient(135deg, #0f172a, #1e3a8a, #3b82f6, #0f172a);
  background-size: 300% 300%; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  animation: partnersDissolve 8s ease infinite;
}
.rp-service-desc { font-size: 0.9rem; color: var(--muted); line-height: 1.7; }
.rp-service-arrow { position: absolute; bottom: 24px; right: 24px; font-size: 1.2rem; color: var(--card-color); font-weight: 900; opacity: 0; transition: opacity 0.2s, transform 0.2s; }
.rp-service-card:hover .rp-service-arrow { opacity: 1; transform: translateX(4px); }

/* ═══════════════════════════════════════════
   HOW IT WORKS V3 - PARABOLA
═══════════════════════════════════════════ */
.rp-how-parabola-container { position: relative; width: 100%; display: flex; flex-direction: column; align-items: center; }

.how-step-node-v3 {
  background: transparent;
  width: 100%;
  display: flex;
  align-items: center;
}

@media(max-width: 900px) {
  .how-step-node-v3 {
    flex-direction: column !important;
    text-align: center;
    gap: 20px !important;
  }
}

.how-node-circle {
  width: 100px; height: 100px; background: #fff; border: 4px solid #fff;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.1); transition: all 0.4s;
  z-index: 5;
}
.node-num { font-size: 2.2rem; font-weight: 950; color: var(--accent); position: relative; z-index: 5; }
.node-glow {
  position: absolute; inset: -4px; border-radius: 50%; filter: blur(15px);
  opacity: 0.15; transition: opacity 0.4s;
}

.how-node-card {
  background: #fff; padding: 30px 40px; border-radius: 32px;
  border: 1px solid #f1f5f9; box-shadow: 0 15px 40px rgba(0,0,0,0.05);
  position: relative; overflow: hidden; transition: all 0.4s;
}
.how-step-node-v3:hover .how-node-card { transform: scale(1.02); box-shadow: 0 25px 60px rgba(0,0,0,0.1); border-color: var(--blue); }

.how-node-title {
  font-size: 1.4rem; font-weight: 800; margin-bottom: 8px;
  background: linear-gradient(135deg, #0f172a, #1e3a8a, #3b82f6), #0f172a;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.how-node-desc { font-size: 0.95rem; color: var(--muted); line-height: 1.6; }

.how-node-icon-bg {
  position: absolute; bottom: -10px; right: -5px; font-size: 5rem;
  opacity: 0.04; transform: rotate(-15deg);
}

@media(max-width: 900px) {
  .how-connector-svg { display: none; }
}

@media(max-width:900px){
  .how-flow-line { display: none; }
  .rp-how-grid-v2 { grid-template-columns: 1fr; gap: 60px; }
  .how-node-card { padding: 30px 24px; }
}

/* ═══════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════ */
.rp-feature-card { background: var(--white); border: 1.5px solid var(--border); border-radius: var(--radius); padding: 32px 28px; height: 100%; transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s; }
.rp-feature-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); border-color: var(--blue); }
.rp-feature-icon { display: block; font-size: 2rem; margin-bottom: 16px; }
.rp-feature-title { 
  font-size: 1rem; font-weight: 800; margin-bottom: 8px;
  background: linear-gradient(135deg, #0f172a, #1e3a8a, #3b82f6, #0f172a);
  background-size: 300% 300%; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  animation: partnersDissolve 8s ease infinite;
}
.rp-feature-desc { font-size: 0.88rem; color: var(--muted); line-height: 1.7; }

/* ═══════════════════════════════════════════
   TESTIMONIALS
═══════════════════════════════════════════ */
.rp-testi-card { background: var(--white); border: 1.5px solid var(--border); border-radius: var(--radius); padding: 32px 28px; height: 100%; transition: transform 0.3s, box-shadow 0.3s; }
.rp-testi-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-md); }
.rp-testi-stars { color: var(--yellow); font-size: 1rem; margin-bottom: 14px; letter-spacing: 2px; }
.rp-testi-text { font-size: 0.95rem; color: var(--body); line-height: 1.75; margin-bottom: 24px; font-style: italic; }
.rp-testi-author { display: flex; align-items: center; gap: 14px; }
.rp-testi-avatar { font-size: 2.2rem; width: 48px; height: 48px; background: var(--bg-light); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid var(--border); flex-shrink: 0; }
.rp-testi-author b { display: block; font-size: 0.95rem; color: var(--dark); font-weight: 800; }
.rp-testi-author small { color: var(--muted); font-size: 0.8rem; }

/* ═══════════════════════════════════════════
   PARTNERS SECTION
 ═══════════════════════════════════════════ */
.rp-partners { padding: 100px 5%; background: #fff; position: relative; }
.partners-header { text-align: center; margin-bottom: 60px; display: flex; flex-direction: column; align-items: center; }
.partners-tag { 
  display: inline-block; padding: 6px 16px; background: #f0f7ff; border: 1.5px solid #dbeafe; 
  color: #1e3a8a; font-size: 11px; font-weight: 800; border-radius: 99px; text-transform: uppercase; 
  letter-spacing: 2px; margin-bottom: 16px; box-shadow: 0 4px 15px rgba(30,58,138,0.1); 
}
.partners-title-glow {
  font-size: clamp(2.4rem, 6vw, 3.8rem); font-weight: 950; 
  background: linear-gradient(135deg, #0f172a, #1e3a8a, #3b82f6, #0f172a);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: partnersDissolve 8s ease infinite;
  margin-bottom: 16px; letter-spacing: -2px; line-height: 1.1;
}
@keyframes partnersDissolve {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.partners-sub { font-size: 1.15rem; color: #64748b; max-width: 600px; margin: 0 auto; line-height: 1.6; font-weight: 500; }

.partners-tabs { display: flex; justify-content: center; gap: 12px; margin-bottom: 48px; flex-wrap: wrap; }
.partner-tab-btn {
  padding: 14px 28px; border-radius: 16px; border: 1.5px solid #e2e8f0; background: #fff;
  font-family: inherit; font-size: 1rem; font-weight: 700; color: #64748b; cursor: pointer;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.4s, color 0.4s, border-color 0.4s, box-shadow 0.4s; position: relative; overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
}
.partner-tab-btn.active { 
  border-color: var(--color); background: var(--color); color: #fff; 
  transform: translateY(-5px) scale(1.02); 
  box-shadow: 0 15px 30px -8px color-mix(in srgb, var(--color) 40%, transparent); 
}
.partner-tab-btn.active::before {
  content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
  background: linear-gradient(120deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: btnShine 3s infinite;
}
@keyframes btnShine {
  0% { left: -100%; } 20% { left: 100%; } 100% { left: 100%; }
}
.partner-tab-btn:hover:not(.active) { 
  border-color: var(--color); color: var(--color); 
  transform: translateY(-3px); box-shadow: 0 8px 20px -6px rgba(0,0,0,0.08); 
  background: #fff;
}
.partner-tab-btn::after {
  content: ''; position: absolute; bottom: 0; left: 50%; width: 0; height: 3px;
  background: #fff; transition: width 0.3s ease, transform 0.3s ease; transform: translateX(-50%);
  border-top-left-radius: 4px; border-top-right-radius: 4px;
}
.partner-tab-btn.active::after { width: 40%; }

.partner-content-card {
  max-width: 1200px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0;
  border-radius: 40px; display: grid; grid-template-columns: 450px 1fr; gap: 0;
  box-shadow: 0 40px 80px -20px rgba(0,0,0,0.1); opacity: 0;
  transform: translateY(30px); transition: opacity 0.8s ease, transform 0.8s ease; overflow: hidden;
}
.partner-content-card.visible { opacity: 1; transform: translateY(0); }

.partner-visual { position: relative; width: 100%; height: 100%; overflow: hidden; }
.partner-img { width: 100%; height: 100%; object-fit: cover; object-position: center 15%; transition: transform 0.6s ease; }
.partner-visual:hover .partner-img { transform: scale(1.05); }
.partner-visual-overlay { position: absolute; inset: 0; mix-blend-mode: multiply; opacity: 0.3; }

.partner-info { padding: 60px; display: flex; flex-direction: column; justify-content: center; }
.partner-info h3 { font-size: 2.8rem; font-weight: 800; margin-bottom: 20px; font-family: 'Plus Jakarta Sans', sans-serif; }
.partner-desc { font-size: 1.1rem; color: #475569; line-height: 1.8; margin-bottom: 24px; }

.partner-highlights { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 32px; }
.highlight-item { 
  display: flex; align-items: center; gap: 12px; padding: 14px 18px; 
  border-radius: 16px; border: 1px solid rgba(0,0,0,0.03);
  transition: transform 0.3s;
}
.highlight-item:hover { transform: translateX(5px); }
.highlight-icon { font-size: 1.4rem; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1)); }
.highlight-text { font-size: 0.9rem; font-weight: 700; color: #1e293b; line-height: 1.3; }

.partner-actions { display: flex; gap: 16px; margin-bottom: 40px; }

.partner-categories-compact h4 { font-size: 0.85rem; font-weight: 800; color: #94a3b8; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 2px; }
.cat-grid-compact { display: flex; flex-wrap: wrap; gap: 10px; }
.cat-pill-compact {
  padding: 8px 14px; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 99px;
  font-size: 0.8rem; font-weight: 700; color: #475569; display: flex; align-items: center; gap: 8px;
}
.cat-dot { width: 6px; height: 6px; border-radius: 50%; }

@media(max-width: 1000px) {
  .partner-content-card { grid-template-columns: 1fr; border-radius: 24px; padding: 0; }
  .partner-visual { height: 220px; }
  .partner-info { padding: 30px 20px; text-align: center; align-items: center; }
  .partner-info h3 { font-size: 1.8rem; }
  .partner-desc { font-size: 0.95rem; }
  .partner-actions { flex-direction: column; width: 100%; gap: 10px; }
  .partner-actions button { width: 100%; justify-content: center; }
  .partner-highlights { grid-template-columns: 1fr; width: 100%; }
}

/* ═══════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════ */
.rp-footer { background: var(--dark); color: rgba(255,255,255,0.75); }
.rp-footer__top { display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr; gap: 48px; max-width: 1200px; margin: 0 auto; padding: 72px 5% 48px; }
.rp-footer__logo { height: 36px; object-fit: contain; filter: brightness(0) invert(1); margin-bottom: 16px; display: block; }
.rp-footer__brand p { font-size: 0.88rem; line-height: 1.7; }
.rp-footer__socials { display: flex; gap: 12px; margin-top: 20px; }
.rp-social { width: 38px; height: 38px; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1rem; text-decoration: none; transition: background 0.2s; cursor: pointer; }
.rp-social:hover { background: rgba(255,255,255,0.15); }
.rp-footer__links h5, .rp-footer__contact h5 { color: #fff; font-size: 0.85rem; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 18px; }
.rp-footer__links a, .rp-footer-link-btn { 
    display: block; font-size: 0.88rem; color: rgba(255,255,255,0.6); text-decoration: none; 
    margin-bottom: 10px; transition: color 0.2s; background: none; border: none; 
    padding: 0; cursor: pointer; text-align: left; font-family: inherit;
}
.rp-footer__links a:hover, .rp-footer-link-btn:hover { color: #fff; }
.rp-footer__contact p { font-size: 0.88rem; margin-bottom: 10px; line-height: 1.6; }
.rp-footer__bottom { border-top: 1px solid rgba(255,255,255,0.07); padding: 24px 5%; max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem; flex-wrap: wrap; gap: 8px; }
@media(max-width:900px){ .rp-footer__top { grid-template-columns: 1fr 1fr; } }
@media(max-width:600px){ .rp-footer__top { grid-template-columns: 1fr; } }

/* ─────────────────────────────────────────────
   WRITING ANIMATION (ADVANTAGE HEADER)
   — animations only fire when .--visible class is added
───────────────────────────────────────────── */
.writing-header { 
  display: flex; flex-direction: column; align-items: center; 
  opacity: 0; transform: scale(0.9); transition: none;
}
.writing-header--visible { 
  animation: headerHeroScale 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
@keyframes headerHeroScale { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }

.tag-reveal { 
  display: inline-block; padding: 4px 14px; background: #eff6ff; 
  border: 1px solid #dbeafe; color: #2563eb; font-size: 11px; font-weight: 800; border-radius: 99px; 
  text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; 
  opacity: 0; transform: translateY(-20px);
}
.tag-reveal--visible {
  animation: tagDown 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s forwards;
}

.typewriter-title {
  font-size: clamp(2rem, 4.5vw, 3rem); font-weight: 900; color: #0f172a; 
  margin-bottom: 24px; white-space: nowrap; overflow: hidden;
  width: 0; display: inline-block; letter-spacing: -1px;
  border-right: 3px solid transparent;
}
.typewriter-title--visible {
  animation: typing 2.2s steps(40, end) 0.5s forwards, blink 0.8s step-end 0.5s infinite;
}

.sub-reveal {
  font-size: 1.2rem; color: #64748b; max-width: 650px; margin: 0 auto; line-height: 1.7;
  font-weight: 500; animation: subUp 1s ease 1.5s both;
}

@keyframes tagDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes typing { from { width: 0; } to { width: 100%; } }
@keyframes blink { from, to { border-right: 3px solid transparent; } 50% { border-right: 3px solid #2563eb; } }
@keyframes subUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

`;

