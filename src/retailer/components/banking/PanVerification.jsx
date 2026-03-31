import React, { useState } from 'react';
import { CreditCard, ShieldCheck, RefreshCw, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { dataService, BACKEND_URL } from '../../../services/dataService';

const PanVerification = () => {
    const [panNumber, setPanNumber] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [result, setResult] = useState(null);

    const handleVerify = async () => {
        if (!panNumber || panNumber.length !== 10) {
            alert("Please enter a valid 10-digit PAN number.");
            return;
        }

        setIsVerifying(true);
        setResult(null);
        try {
            const response = await fetch(`${BACKEND_URL}/verify-pan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pan: panNumber.toUpperCase() })
            });

            const data = await response.json();
            if (data.success) {
                setResult({
                    success: true,
                    name: data.data.nameAtPan || data.data.name,
                    status: data.data.panStatus || 'VALID',
                    type: data.data.category || 'Individual',
                    details: data.data
                });
            } else {
                setResult({
                    success: false,
                    message: data.message || "Invalid PAN Number or Verification Failed"
                });
            }
        } catch (error) {
            setResult({
                success: false,
                message: `Server Connection Failed: ${error.message}. Please try again later.`
            });
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#f8fafc] font-['Inter',sans-serif]">
            <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <CreditCard size={20} className="text-white" />
                    </div>
                    <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">PAN Verification Service</h1>
                </div>
                <div className="flex items-center space-x-2 bg-blue-50 px-4 py-1.5 rounded-full">
                    <ShieldCheck size={14} className="text-blue-600" />
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest text-[9px]">Secure ID Protocol</span>
                </div>
            </div>

            <div className="flex-1 p-8 flex items-center justify-center overflow-y-auto">
                <div className="w-full max-w-xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 p-10 relative overflow-hidden"
                    >
                        {/* Decorative Background */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
                        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50" />

                        <div className="text-center mb-10">
                            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
                                <Search size={40} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Verify PAN Identity</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Instant verification from Income Tax Records</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Permanent Account Number (PAN)</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={panNumber}
                                        onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                                        maxLength={10}
                                        placeholder="ABCDE1234F"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 text-2xl font-black outline-none focus:border-blue-600 focus:bg-white transition-all uppercase placeholder:text-slate-200"
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300">
                                        <CreditCard size={24} />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleVerify}
                                disabled={isVerifying || panNumber.length < 10}
                                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-sm shadow-xl hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 shadow-blue-500/20 flex items-center justify-center space-x-3"
                            >
                                {isVerifying ? (
                                    <>
                                        <RefreshCw size={20} className="animate-spin" />
                                        <span>Verifying Identity...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Verify PAN Details</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <AnimatePresence>
                            {result && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, mt: 0 }}
                                    animate={{ opacity: 1, height: 'auto', mt: 32 }}
                                    exit={{ opacity: 0, height: 0, mt: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className={`rounded-3xl p-8 border ${result.success ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                                        <div className="flex items-center space-x-4 mb-6">
                                            <div className={`p-3 rounded-2xl ${result.success ? 'bg-emerald-500' : 'bg-red-500'} text-white shadow-lg`}>
                                                {result.success ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                                            </div>
                                            <div>
                                                <h3 className={`text-lg font-black uppercase tracking-tighter ${result.success ? 'text-emerald-700' : 'text-red-700'}`}>
                                                    {result.success ? 'Verification Successful' : 'Verification Failed'}
                                                </h3>
                                                <p className={`text-[10px] font-bold uppercase tracking-widest ${result.success ? 'text-emerald-600/70' : 'text-red-600/70'}`}>
                                                    {result.success ? 'Identity details matched' : 'Record not found or invalid'}
                                                </p>
                                            </div>
                                        </div>

                                        {result.success ? (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-white/50 p-4 rounded-xl border border-emerald-100/50">
                                                        <p className="text-[10px] font-black text-emerald-600/50 uppercase tracking-widest mb-1">Holder Name</p>
                                                        <p className="text-sm font-black text-emerald-900 uppercase">{result.name}</p>
                                                    </div>
                                                    <div className="bg-white/50 p-4 rounded-xl border border-emerald-100/50">
                                                        <p className="text-[10px] font-black text-emerald-600/50 uppercase tracking-widest mb-1">Status</p>
                                                        <p className="text-sm font-black text-emerald-900 uppercase">{result.status}</p>
                                                    </div>
                                                    <div className="bg-white/50 p-4 rounded-xl border border-emerald-100/50">
                                                        <p className="text-[10px] font-black text-emerald-600/50 uppercase tracking-widest mb-1">Category</p>
                                                        <p className="text-sm font-black text-emerald-900 uppercase">{result.type}</p>
                                                    </div>
                                                    <div className="bg-white/50 p-4 rounded-xl border border-emerald-100/50">
                                                        <p className="text-[10px] font-black text-emerald-600/50 uppercase tracking-widest mb-1">Verified On</p>
                                                        <p className="text-sm font-black text-emerald-900 uppercase">{new Date().toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm font-bold text-red-700 uppercase tracking-tight">{result.message}</p>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <p className="text-center mt-8 text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">RuPiKsha Secure Verification Engine v2.0</p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default PanVerification;
