import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const images = [
  '/photo/WhatsApp Image 2026-03-30 at 12.13.08 (1).jpeg',
  '/photo/WhatsApp Image 2026-03-30 at 12.13.08 (3).jpeg',
  '/photo/WhatsApp Image 2026-03-30 at 12.13.08 (4).jpeg',
  '/photo/WhatsApp Image 2026-03-30 at 12.13.08 (5).jpeg',
  '/photo/WhatsApp Image 2026-03-30 at 12.13.08 (6).jpeg',
  '/photo/WhatsApp Image 2026-03-30 at 12.13.08 (7).jpeg',
  '/photo/WhatsApp Image 2026-03-30 at 12.13.08 (8).jpeg',
  '/photo/WhatsApp Image 2026-03-30 at 12.13.08 (9).jpeg',
  '/photo/WhatsApp Image 2026-03-30 at 12.13.08 (10).jpeg',
  '/photo/WhatsApp Image 2026-03-30 at 12.13.08 (12).jpeg',
];

const PhotoSlider = () => {
    const [index, setIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (isHovered) return;
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [isHovered]);

    const handlePrev = () => {
        setIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleNext = () => {
        setIndex((prev) => (prev + 1) % images.length);
    };

    return (
        <div 
            className="photo-slider-container" 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                position: 'relative',
                background: '#f8fafc'
            }}
        >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ 
                            opacity: { duration: 0.8 },
                            x: { type: "spring", stiffness: 100, damping: 20 } 
                        }}
                        style={{
                            width: '100%',
                            height: '100%',
                            position: 'absolute'
                        }}
                    >
                        <img
                            src={images[index]}
                            alt={`Slide ${index + 1}`}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                        {/* Dramatic Overlay */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(225deg, rgba(37,99,235,0.1) 0%, rgba(15,23,42,0.6) 100%)',
                            pointerEvents: 'none'
                        }} />
                    </motion.div>
                </AnimatePresence>

                {/* Left Arrow */}
                <button 
                    onClick={handlePrev}
                    style={{
                        position: 'absolute',
                        left: '20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#fff',
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        zIndex: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        transition: 'all 0.3s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.3)'; e.currentTarget.style.scale = '1.1'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.scale = '1'; }}
                >
                    ←
                </button>

                {/* Right Arrow */}
                <button 
                    onClick={handleNext}
                    style={{
                        position: 'absolute',
                        right: '20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#fff',
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        zIndex: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        transition: 'all 0.3s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.3)'; e.currentTarget.style.scale = '1.1'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.scale = '1'; }}
                >
                    →
                </button>

                {/* Navigation Dots */}
                <div style={{
                    position: 'absolute',
                    bottom: '30px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '12px',
                    zIndex: 20,
                    padding: '8px 16px',
                    background: 'rgba(0,0,0,0.2)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: '50px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    {images.map((_, i) => (
                        <div
                            key={i}
                            onClick={() => setIndex(i)}
                            style={{
                                width: i === index ? '30px' : '8px',
                                height: '8px',
                                borderRadius: '4px',
                                background: i === index ? '#fff' : 'rgba(255,255,255,0.4)',
                                cursor: 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        />
                    ))}
                </div>

                {/* Status Badge */}
                <div style={{
                    position: 'absolute',
                    top: '30px',
                    left: '30px',
                    zIndex: 20,
                    background: 'rgba(37,99,235,0.9)',
                    color: '#fff',
                    padding: '6px 14px',
                    borderRadius: '50px',
                    fontSize: '12px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }}>
                    Our Hub in Action
                </div>
        </div>
    );
};

export default PhotoSlider;
