import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WelcomeOverlay = ({ userName, onFinish }) => {
  const [displayText, setDisplayText] = useState('');
  const fullText = `Welcome to RuPiKsha, ${userName || 'User'}!`;
  const [isTypingDone, setIsTypingDone] = useState(false);

  useEffect(() => {
    let currentIdx = 0;
    const typingInterval = setInterval(() => {
      if (currentIdx < fullText.length) {
        setDisplayText(fullText.substring(0, currentIdx + 1));
        currentIdx++;
      } else {
        clearInterval(typingInterval);
        setIsTypingDone(true);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, [fullText]);

  useEffect(() => {
    if (isTypingDone) {
      const timeout = setTimeout(() => {
        onFinish();
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [isTypingDone, onFinish]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-[9999] bg-[#020617] flex flex-col items-center justify-center text-center p-6 overflow-hidden"
    >
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="mb-8"
        >
          <img 
            src="/favicon.png" 
            alt="Logo" 
            className="w-20 h-20 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(37,99,235,0.4)]"
          />
        </motion.div>

        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4 min-h-[1.2em]">
          {displayText}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="inline-block w-1 h-10 md:h-14 bg-blue-500 ml-2 align-middle"
          />
        </h1>

        <AnimatePresence>
          {isTypingDone && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-slate-400 text-lg md:text-xl font-medium"
            >
              Preparing your premium dashboard experience...
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Skip Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        whileHover={{ opacity: 1, scale: 1.05 }}
        onClick={onFinish}
        className="absolute bottom-12 z-50 px-6 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-white/60 text-sm font-bold tracking-widest uppercase hover:bg-white/10 hover:text-white transition-all cursor-pointer shadow-lg shadow-black/20"
      >
        Skip Intro
      </motion.button>
      
      {/* Footer Branding */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.4em]">RuPiKsha Digital Services</p>
      </div>
    </motion.div>
  );
};

export default WelcomeOverlay;
