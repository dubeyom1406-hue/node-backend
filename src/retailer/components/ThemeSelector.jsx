import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check, X } from 'lucide-react';

const ThemeSelector = () => {
    const { primaryColor, changeColor } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const themes = [
        { name: 'Royal Blue', color: '#2563eb' },
        { name: 'Emerald', color: '#10b981' },
        { name: 'Violet', color: '#7c3aed' },
        { name: 'Crimson', color: '#e11d48' },
        { name: 'Amber', color: '#f59e0b' },
        { name: 'Slate', color: '#475569' },
        { name: 'Indigo', color: '#4f46e5' },
        { name: 'Rose', color: '#f43f5e' },
    ];

    return (
        <div className="relative">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 rounded-full border border-slate-200 hover:bg-slate-100 transition-colors group shadow-sm bg-white"
            >
                <Palette size={18} style={{ color: primaryColor }} className="transition-colors duration-500" />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 15, scale: 0.95, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, y: 15, scale: 0.95, filter: 'blur(10px)' }}
                            className="absolute right-0 mt-4 w-72 bg-white/90 backdrop-blur-2xl rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/50 p-6 z-50 overflow-hidden"
                            style={{ fontOverfill: 'auto' }}
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-20" />
                            
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase">Brand Theme</h3>
                                    <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">Customize UI Accents</p>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-800 transition-colors p-1">
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="grid grid-cols-4 gap-4 mb-6">
                                {themes.map((theme) => (
                                    <motion.button
                                        key={theme.color}
                                        whileHover={{ scale: 1.2, rotate: 5 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => {
                                            changeColor(theme.color);
                                            // Optional: Keep open to let user try colors
                                        }}
                                        className="relative group"
                                    >
                                        <div 
                                            className={`w-10 h-10 rounded-[14px] cursor-pointer transition-all duration-300 border-2 ${primaryColor === theme.color ? 'border-indigo-100 scale-110 shadow-lg' : 'border-transparent shadow-sm'}`}
                                            style={{ backgroundColor: theme.color }}
                                        >
                                            {primaryColor === theme.color && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Check size={14} className="text-white drop-shadow-md" strokeWidth={4} />
                                                </div>
                                            )}
                                        </div>
                                        {/* Tooltip */}
                                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold uppercase tracking-widest z-10">
                                            {theme.name}
                                        </div>
                                    </motion.button>
                                ))}
                            </div>

                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Custom Hex Code</p>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="color" 
                                        value={primaryColor}
                                        onChange={(e) => changeColor(e.target.value)}
                                        className="w-8 h-8 rounded-lg overflow-hidden cursor-pointer border-0 p-0 bg-transparent"
                                    />
                                    <input 
                                        type="text" 
                                        value={primaryColor.toUpperCase()}
                                        onChange={(e) => changeColor(e.target.value)}
                                        className="flex-1 bg-transparent border-0 text-xs font-black text-slate-700 focus:ring-0 p-0"
                                    />
                                </div>
                            </div>

                            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 italic">Saved automatically</span>
                                <button
                                    onClick={() => changeColor('#2563eb')}
                                    className="text-[9px] font-black text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest"
                                >
                                    Reset Default
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ThemeSelector;
