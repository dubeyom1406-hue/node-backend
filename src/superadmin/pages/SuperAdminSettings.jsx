import React, { useState } from 'react';
import {
    Save, RefreshCcw, Zap, IndianRupee,
    Settings as SettingsIcon, Shield,
    Bell, CreditCard, Monitor, Globe,
    Smartphone, Database, Lock, Mail
} from 'lucide-react';
import { motion } from 'framer-motion';
import { dataService } from '../../services/dataService';
import { playApplause, speak } from '../../services/speechService';

const SuperAdminSettings = () => {
    const [data, setData] = useState(dataService.getData());
    const [status, setStatus] = useState(null);

    const handleSave = () => {
        dataService.saveData(data);
        playApplause(8, 0.55);
        speak('सेटिंग्स सफलतापूर्वक सेव हो गई हैं।', 'hi-IN');
        setStatus({ type: 'success', message: 'Settings saved successfully!' });
        setTimeout(() => setStatus(null), 3000);
    };

    const handleReset = () => {
        if (window.confirm('Reset all to default?')) {
            dataService.resetData();
            setData(dataService.getData());
            playApplause(6, 0.45);
            speak('सिस्टम डिफॉल्ट पर रिसेट हो गया।', 'hi-IN');
            setStatus({ type: 'success', message: 'Reset to defaults.' });
            setTimeout(() => setStatus(null), 3000);
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-20">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Platform Settings</h1>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Global Configuration & Controls</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={handleReset} className="p-3 text-slate-400 hover:bg-slate-100 rounded-2xl transition-all"><RefreshCcw size={20} /></button>
                    <button onClick={handleSave} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 hover:scale-105 transition-all">
                        <Save size={16} /> Save Changes
                    </button>
                </div>
            </div>

            {status && (
                <div className={`p-4 rounded-2xl font-bold text-sm uppercase tracking-wide flex items-center gap-3 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                    {status.type === 'success' ? <Shield size={18} /> : <AlertTriangle size={18} />}
                    {status.message}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Service Controls */}
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b bg-slate-50/50 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 flex items-center gap-3">
                            <Zap size={20} className="text-blue-500" />
                            Active Services
                        </h3>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Toggle</span>
                    </div>
                    <div className="p-8 space-y-4">
                        {[
                            { id: 'aeps_active', label: 'AEPS Withdrawal', desc: 'Aadhaar Enabled Payment System' },
                            { id: 'cms_active', label: 'CMS Collection', desc: 'EMI & Bill Collections' },
                            { id: 'dmt_active', label: 'Money Transfer', desc: 'Domestic Money Transfer' },
                            { id: 'recharge_active', label: 'Utility & Recharge', desc: 'Mobile, DTH & Electricity' }
                        ].map((s) => (
                            <div key={s.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-200 transition-all group">
                                <div>
                                    <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{s.label}</p>
                                    <p className="text-[10px] text-slate-400 font-bold">{s.desc}</p>
                                </div>
                                <button className="w-14 h-7 bg-emerald-500 rounded-full relative p-1 transition-all active:scale-90">
                                    <div className="w-5 h-5 bg-white rounded-full shadow-lg ml-auto" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Platform Metadata */}
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b bg-slate-50/50 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 flex items-center gap-3">
                            <Globe size={20} className="text-emerald-500" />
                            Platform Info
                        </h3>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand Identity</span>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">App Title</label>
                                <input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all" defaultValue="RUPIKSHA FINTECH" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Color</label>
                                <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                    <div className="w-6 h-6 rounded-lg bg-indigo-600 shadow-lg" />
                                    <span className="text-xs font-mono font-bold text-slate-600">#4F46E5</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Support Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input type="text" className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all" defaultValue="support@rupiksha.com" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">API Endpoint</label>
                            <div className="relative">
                                <Database className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input type="text" className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-mono font-bold text-slate-500 outline-none focus:ring-2 focus:ring-emerald-500 transition-all" defaultValue="https://api.paisa-world.in/v2" disabled />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Commission Settings */}
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden lg:col-span-2">
                    <div className="p-8 border-b bg-slate-50/50 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 flex items-center gap-3">
                            <IndianRupee size={20} className="text-amber-500" />
                            Commission Structure
                        </h3>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rate Management</span>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'AEPS Withdrawal', rate: '0.25%', color: 'text-blue-600', bg: 'bg-blue-50' },
                            { label: 'DMT Transfer', rate: '0.15%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { label: 'CMS EMI Pay', rate: '0.10%', color: 'text-purple-600', bg: 'bg-purple-50' },
                            { label: 'Utility Bill', rate: '0.50%', color: 'text-amber-600', bg: 'bg-amber-50' }
                        ].map((c, i) => (
                            <div key={i} className={`${c.bg} p-6 rounded-[2rem] border border-slate-100 flex flex-col items-center justify-center space-y-3`}>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{c.label}</span>
                                <input type="text" className={`bg-white border-0 rounded-xl p-3 w-24 text-center text-xl font-black ${c.color} shadow-sm outline-none focus:ring-2 focus:ring-current`} defaultValue={c.rate} />
                                <span className="text-[8px] font-bold text-slate-400 uppercase">Live Rate</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminSettings;
