import React from 'react';
import { ScanFace, Fingerprint, ShieldCheck } from 'lucide-react';

const PWMoneyEKYC = () => {
    return (
        <div className="flex flex-col h-full bg-[#f8fafc] font-['Inter',sans-serif]">
            <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                        <ScanFace size={20} className="text-white" />
                    </div>
                    <h1 className="text-xl font-black text-slate-800">PW Money QMR eKYC</h1>
                </div>
            </div>

            <div className="flex flex-1 items-center justify-center p-8">
                <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl p-12 w-full max-w-2xl text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                    <div className="mb-10">
                        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShieldCheck size={48} className="text-indigo-600" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 mb-2">Customer eKYC</h2>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Aadhaar Integrated Quick Money Remix eKYC</p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 text-left mb-12">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase ml-1">Customer Mobile Number</label>
                            <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-xl font-black outline-none focus:border-indigo-600 transition-all" placeholder="Enter Mobile" />
                        </div>
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center space-x-4">
                            <Fingerprint size={32} className="text-slate-400" />
                            <div className="text-left">
                                <p className="text-xs font-black text-slate-600 uppercase">Biometric Required</p>
                                <p className="text-[10px] font-bold text-slate-400">Ensure scanner is connected before proceeding</p>
                            </div>
                        </div>
                    </div>

                    <button className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase text-sm shadow-xl hover:bg-indigo-700 transition-all shadow-indigo-500/30">
                        Initiate eKYC Process
                    </button>

                    <p className="mt-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Payworld Security Protocol Alpha</p>
                </div>
            </div>
        </div>
    );
};

export default PWMoneyEKYC;
