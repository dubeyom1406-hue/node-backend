import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import './VerticalCardSlider.css';

const SliderItem = ({ item, index, progress, count }) => {
    const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Relative position [- (count-1), (count-1)]
    const activeFloat = useTransform(progress, [0, 1], [0, count - 1]);
    const stt = useTransform(activeFloat, f => index - f);
    
    // Smooth opacity, scale and transform values based on relative position
    const opacity = useTransform(stt, [-2.5, -1, 0, 1, 2.5], [0, 1, 1, 1, 0]);
    const scale = useTransform(stt, [-3, 0, 3], [0.6, 1, 0.6]);
    
    // Spread more on desktop, less on mobile (or use Y on mobile)
    const translateX = useTransform(stt, s => s * (isMobile ? 120 : 250)); 
    const translateY = useTransform(stt, s => s * (isMobile ? 80 : 0));
    const rotateY = useTransform(stt, s => s * -12);
    
    // Stack ordering
    const zIndex = useTransform(stt, s => 100 - Math.round(Math.abs(s) * 10));

    return (
        <motion.div
            className="item"
            style={{
                opacity,
                scale,
                x: translateX,
                y: translateY,
                rotateY,
                zIndex,
                width: isMobile ? '88vw' : 'min(520px, 92vw)',   
                height: isMobile ? '45vh' : 'min(540px, 60vh)',  
                left: isMobile ? '6vw' : 'calc(50% - min(260px, 46vw))',
                background: item.mediumColor,
                borderRadius: isMobile ? 24 : 40,
                border: `2px solid ${item.color}50`,
                boxShadow: `0 40px 100px -20px ${item.color}20`,
                color: '#0f172a',
                padding: isMobile ? '24px' : '50px',
                willChange: 'transform, opacity',
            }}
        >
            <div className="item-step" style={{
                background: item.color,
                boxShadow: `0 15px 30px ${item.color}40`,
                width: isMobile ? '44px' : '84px',
                height: isMobile ? '44px' : '84px',
                fontSize: isMobile ? '1.2rem' : '2.4rem',
                borderRadius: isMobile ? '12px' : '28px',
                position: 'relative',
                zIndex: 10,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900
            }}>
                {item.step}
            </div>

            <div style={{ position: 'relative', zIndex: 10 }}>
                <h1 style={{ 
                    fontSize: isMobile ? '1.8rem' : '3.2rem', 
                    color: '#0f172a', 
                    fontWeight: 950, 
                    marginTop: isMobile ? '15px' : '30px', 
                    letterSpacing: '-1px', 
                    lineHeight: 1.1 
                }}>{item.title}</h1>
                <p style={{ 
                    fontSize: isMobile ? '0.95rem' : '1.45rem', 
                    color: '#1e293b', 
                    marginTop: isMobile ? '10px' : '20px', 
                    lineHeight: 1.6, 
                    fontWeight: 600 
                }}>{item.desc}</p>
            </div>

            <div className="item-footer" style={{ 
                color: '#0f172a', 
                marginTop: 'auto', 
                fontSize: isMobile ? '9px' : '14px', 
                fontWeight: 900, 
                opacity: 0.6, 
                letterSpacing: '2px', 
                position: 'relative', 
                zIndex: 10 
            }}>
                RUPIKSHA FINTECH PREMIUM
            </div>

            <div className="hover-light-icon" style={{
                position: 'absolute',
                bottom: isMobile ? '15px' : '30px',
                right: isMobile ? '15px' : '30px',
                fontSize: isMobile ? '4rem' : '12rem',
                lineHeight: 1,
                zIndex: 1,
                filter: 'grayscale(1) contrast(1.2)',
                opacity: 0.12
            }}>
                {item.icon}
            </div>
        </motion.div>
    );
};

const VerticalCardSlider = () => {
    const sectionRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end end"]
    });

    // More responsive physics for smoother tracking
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 250,
        damping: 40,
        restDelta: 0.0001
    });

    const items = [
        { title: "Register Now", desc: "Sign up in under 2 minutes with your mobile number. No paperwork needed.", step: "01", color: "#2563eb", mediumColor: "#bfdbfe", icon: "🚀" },
        { title: "Upload KYC", desc: "Submit your Aadhaar and PAN details securely for instant verification.", step: "02", color: "#4f46e5", mediumColor: "#ddd6fe", icon: "🔐" },
        { title: "Get Approved", desc: "Our team verifies your account and activates all financial services within hours.", step: "03", color: "#16a34a", mediumColor: "#bbf7d0", icon: "✅" },
        { title: "Add Wallet Balance", desc: "Add funds via UPI, Bank Transfer or Credit Card to start transacting.", step: "04", color: "#dc2626", mediumColor: "#fecaca", icon: "💳" },
        { title: "Start Earning", desc: "Offer digital payments to customers and earn commissions on every transaction.", step: "05", color: "#ca8a04", mediumColor: "#fef08a", icon: "💰" },
    ];

    return (
        <section ref={sectionRef} style={{ height: '450vh', background: '#f8fafc', position: 'relative', margin: 0 }}>
            <div className="slider-section-wrapper" style={{
                position: 'sticky',
                top: 0,
                height: '100vh',
                overflow: 'hidden', // Changed clip to hidden for better cross-browser compatibility
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            }}>
                <div className="section-header-slider">
                    <span className="slider-tag">Simple Process</span>
                    <h2 className="slider-main-title">How It Works</h2>
                    <p className="slider-main-desc">Follow these 5 simple steps to launch your digital banking point with Rupiksha.</p>
                </div>

                <div className="slider">
                    {items.map((item, index) => (
                        <SliderItem 
                            key={index} 
                            item={item} 
                            index={index} 
                            progress={smoothProgress} 
                            count={items.length} 
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default VerticalCardSlider;
