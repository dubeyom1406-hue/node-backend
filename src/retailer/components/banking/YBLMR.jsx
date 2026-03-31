import React from 'react';
import { Landmark, ShieldCheck } from 'lucide-react';

const YBLMR = () => {
    return (
        <div className="flex flex-col h-full bg-[#f1f5f9] font-['Inter',sans-serif]">
            <div className="bg-white px-8 py-6 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="bg-[#003a70] p-3 rounded-xl">
                        <Landmark size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-[#003a70]">YBL Money Transfer</h1>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Powered by YES BANK LTD</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full border border-emerald-100">
                    <ShieldCheck size={16} />
                    <span className="text-xs font-bold uppercase tracking-tight">NPCI Verified Channel</span>
                </div>
            </div>

            <div className="flex-1 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                        <h2 className="text-lg font-black text-slate-700 mb-6 flex items-center space-x-2">
                            <div className="w-1.5 h-6 bg-[#003a70] rounded-full" />
                            <span>Customer Login</span>
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Mobile Number</label>
                                <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-lg font-black focus:border-[#003a70] outline-none transition-colors" placeholder="00000 00000" />
                            </div>
                            <button className="w-full bg-[#003a70] text-white py-4 rounded-xl font-black uppercase text-sm shadow-lg hover:bg-[#002d56] transition-all">Submit Mobile</button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-[#003a70] text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
                            <h3 className="text-xl font-black mb-2">Notice</h3>
                            <p className="text-blue-100 text-sm font-bold opacity-80 leading-relaxed">Please ensure you enter the correct mobile number of the customer. Remittance limits are as per RBI guidelines.</p>
                        </div>
                        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Transaction Success Rate</p>
                            <div className="text-3xl font-black text-emerald-500 mt-2">99.8%</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default YBLMR;
