import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Percent, Image, Film, Upload, Plus, Trash2, Play, ExternalLink } from 'lucide-react';

const samplePromos = [
    { id: 1, title: 'AEPS Special Offer – March 2025', type: 'Banner', desc: 'Earn extra ₹2 per AEPS transaction this month!', active: true, expires: '31 Mar 2025' },
    { id: 2, title: 'DMT Campaign – Low Charges', type: 'Text', desc: 'Transfer money at just 0.25% this weekend.', active: true, expires: '28 Feb 2025' },
    { id: 3, title: 'BBPS Bill Payment Offer', type: 'Banner', desc: 'Cashback on every 5th BBPS transaction.', active: false, expires: '15 Jan 2025' },
];

const sampleAssets = [
    { id: 1, title: 'How to Process AEPS Withdrawal', type: 'video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumb: '🎬' },
    { id: 2, title: 'DMT Training Guide 2024', type: 'pdf', url: '#', thumb: '📄' },
    { id: 3, title: 'Rupiksha App Overview', type: 'video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumb: '🎬' },
    { id: 4, title: 'Commission Rate Card PDF', type: 'pdf', url: '#', thumb: '📄' },
];

export const PromotionsList = () => {
    const [promos, setPromos] = useState(samplePromos);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ title: '', desc: '', expires: '' });

    const addPromo = () => {
        if (!form.title) return;
        setPromos(prev => [...prev, { id: Date.now(), ...form, type: 'Text', active: true }]);
        setForm({ title: '', desc: '', expires: '' });
        setShowAdd(false);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                        <Percent size={20} className="text-amber-500" /> Promotions
                    </h1>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Manage promotional offers for your retailers</p>
                </div>
                <button onClick={() => setShowAdd(true)}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/30 transition-all">
                    <Plus size={14} /> Add Promotion
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {promos.map(p => (
                    <motion.div key={p.id} whileHover={{ y: -2 }}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3 relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1 h-full ${p.active ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                        <div className="flex justify-between items-start pl-3">
                            <div>
                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${p.active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>{p.active ? 'Active' : 'Expired'}</span>
                                <p className="text-sm font-black text-slate-800 mt-2 leading-tight">{p.title}</p>
                                <p className="text-[10px] text-slate-500 font-medium mt-1">{p.desc}</p>
                            </div>
                        </div>
                        <div className="pl-3 flex items-center justify-between">
                            <span className="text-[9px] font-bold text-slate-400">Expires: {p.expires}</span>
                            <button onClick={() => setPromos(prev => prev.filter(x => x.id !== p.id))}
                                className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-all">
                                <Trash2 size={13} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Add Modal */}
            {showAdd && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-4">
                        <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Add Promotion</h2>
                        <input className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-amber-400 text-sm font-medium text-slate-700"
                            placeholder="Promotion title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                        <textarea className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-amber-400 text-sm font-medium text-slate-700 h-24 resize-none"
                            placeholder="Description" value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} />
                        <input type="date" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-amber-400 text-sm font-medium text-slate-600"
                            value={form.expires} onChange={e => setForm(f => ({ ...f, expires: e.target.value }))} />
                        <div className="flex gap-3">
                            <button onClick={() => setShowAdd(false)} className="flex-1 border border-slate-200 text-slate-600 text-[10px] font-black uppercase py-3 rounded-xl">Cancel</button>
                            <button onClick={addPromo} className="flex-1 bg-amber-500 text-white text-[10px] font-black uppercase py-3 rounded-xl hover:bg-amber-400 shadow-lg shadow-amber-500/30 transition-all">Add</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export const PromotionAssets = () => {
    const [playing, setPlaying] = useState(null);

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                    <Film size={20} className="text-amber-500" /> Training Videos & PDF
                </h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Training materials and promotional assets</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {sampleAssets.map(a => (
                    <motion.div key={a.id} whileHover={{ y: -2 }}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 flex items-center justify-center text-5xl">
                            {a.thumb}
                        </div>
                        <div className="p-4 flex items-center justify-between">
                            <div>
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase border ${a.type === 'video' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                                    {a.type === 'video' ? '▶ Video' : '📄 PDF'}
                                </span>
                                <p className="text-xs font-black text-slate-800 mt-1">{a.title}</p>
                            </div>
                            {a.type === 'video' ? (
                                <button onClick={() => setPlaying(a)}
                                    className="p-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-400 transition-all">
                                    <Play size={14} />
                                </button>
                            ) : (
                                <a href={a.url} target="_blank" rel="noopener noreferrer"
                                    className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-amber-50 hover:text-amber-600 transition-all">
                                    <ExternalLink size={14} />
                                </a>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Video Modal */}
            {playing && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPlaying(null)}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="bg-black rounded-2xl overflow-hidden w-full max-w-2xl aspect-video" onClick={e => e.stopPropagation()}>
                        <iframe src={playing.url} title={playing.title} className="w-full h-full" allow="autoplay" />
                    </motion.div>
                </div>
            )}
        </div>
    );
};
