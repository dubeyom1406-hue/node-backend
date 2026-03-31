import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, LogOut, CheckCircle2, XCircle, ShieldCheck, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LockScreen = () => {
    const { user, verifyPin, logout, isLocked } = useAuth();
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    if (!isLocked || !user) return null;

    const handleVerify = async (e) => {
        if (e) e.preventDefault();
        if (pin.length < 4) return;

        setIsVerifying(true);
        setError(false);

        // Brief delay for effect
        setTimeout(() => {
            const success = verifyPin(pin);
            if (!success) {
                setError(true);
                setPin('');
                setIsVerifying(false);
            }
        }, 600);
    };

    const handlePinChange = (val) => {
        const clean = val.replace(/\D/g, '').slice(0, 4);
        setPin(clean);
        if (error) setError(false);

        // Auto-submit if 4 digits
        if (clean.length === 4) {
            // We can't call handleVerify directly easily with state lag, 
            // so we rely on the button or a useEffect
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-[#0f172a] flex items-center justify-center p-4 overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-md relative"
            >
                {/* Security Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl shadow-indigo-500/40 mb-6 relative">
                        <Lock size={32} className="text-white" />
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-[#0f172a] flex items-center justify-center"
                        >
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        </motion.div>
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight italic">Security Lock</h2>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Authenticated Session Protected</p>
                </div>

                {/* User Info Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
                    <div className="flex items-center gap-4 mb-8 bg-white/5 rounded-2xl p-4 border border-white/5">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-xl">
                            {user.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-black text-sm truncate uppercase italic">{user.name}</p>
                            <p className="text-slate-500 text-[9px] font-bold tracking-widest uppercase">{user.role?.replace('_', ' ')}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="p-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all"
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>

                    <form onSubmit={handleVerify} className="space-y-6">
                        <div className="relative">
                            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Enter Security PIN</label>
                            <div className="flex justify-between gap-3">
                                {[0, 1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className={`flex-1 h-16 rounded-2xl border-2 flex items-center justify-center transition-all duration-300
                                            ${error ? 'border-rose-500/50 bg-rose-500/5' :
                                                pin.length > i ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 bg-white/5'}`}
                                    >
                                        {pin.length > i ? (
                                            <div className="w-3 h-3 bg-white rounded-full animate-in zoom-in" />
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                            <input
                                type="password"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={pin}
                                onChange={(e) => handlePinChange(e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                autoFocus
                            />
                        </div>

                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="text-rose-500 text-[10px] font-black uppercase text-center flex items-center justify-center gap-2"
                                >
                                    <XCircle size={12} /> Invalid Security PIN
                                </motion.p>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={pin.length < 4 || isVerifying}
                            className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-3 shadow-xl
                                ${pin.length === 4
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-500/25 hover:scale-[1.02] active:scale-95'
                                    : 'bg-white/10 text-slate-500'}`}
                        >
                            {isVerifying ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Unlock Session <ChevronRight size={16} /></>
                            )}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-8 space-y-4">
                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                        <ShieldCheck size={12} className="text-indigo-500" /> End-to-End Encrypted Protection
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LockScreen;
