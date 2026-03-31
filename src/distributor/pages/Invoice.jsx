import React, { useState } from 'react';
import { IndianRupee, AlertCircle, Search as SearchIcon } from 'lucide-react';

const Invoice = () => {
    const [month, setMonth] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState(false);

    const months = [];
    for (let y = 2025; y <= 2027; y++) {
        for (let m = 0; m < 12; m++) {
            const d = new Date(y, m);
            months.push(`${d.toLocaleString('default', { month: 'long' })}-${y}`);
        }
    }

    const gstData = {
        businessName: "Anand Enterprises",
        gstinNumber: "NA",
        panNumber: "AQDPK8435E",
        totalCommission: "0",
        totalTDS: "0",
        totalGST: "0",
        placeOfSupply: "IN-BR",
        lastDate: "Feb 28th, 2027"
    };

    const handleFetch = () => {
        if (!month) { alert('Please select a month first'); return; }
        setLoading(true);
        setFetched(false);
        setTimeout(() => {
            setLoading(false);
            setFetched(true);
        }, 800);
    };

    return (
        <div className="p-4 md:p-8 space-y-6 bg-[#f1f5f9] min-h-screen">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                <div className={fetched ? "xl:col-span-5" : "xl:col-span-6 xl:col-start-4"}>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative">
                        <div className="absolute top-6 right-6 flex flex-col items-end gap-1.5">
                            <div className="w-9 h-9 bg-cyan-50 border border-cyan-200 rounded-full flex items-center justify-center text-cyan-500">
                                <IndianRupee size={18} />
                            </div>
                            <div className="w-9 h-9 bg-cyan-500 rounded-lg flex items-center justify-center text-white shadow">
                                <IndianRupee size={18} />
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-extrabold text-cyan-500 tracking-tight">GST E-Invoice</h2>
                                <p className="text-xs text-slate-400 mt-0.5">Claim Your GST E-Invoice</p>
                            </div>
                            <div className="bg-emerald-500 text-white rounded-lg px-4 py-3 flex items-center gap-2.5 text-sm font-medium">
                                <AlertCircle size={16} />
                                GSTIN number not found
                            </div>
                            <div className="space-y-2 pt-2">
                                <label className="block text-xs font-semibold text-slate-500 italic">Invoice Month</label>
                                <select
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border-b-2 border-slate-200 text-sm font-bold text-slate-700 outline-none focus:border-cyan-500 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">-- Select Month --</option>
                                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <button
                                onClick={handleFetch}
                                disabled={loading || !month}
                                className="w-full bg-[#1e293b] hover:bg-cyan-600 text-white py-3.5 rounded-xl text-sm font-bold shadow transition-all disabled:opacity-40 active:scale-95 flex items-center justify-center gap-2"
                            >
                                {loading ? 'Fetching...' : <><SearchIcon size={16} /> Fetch Invoice Details</>}
                            </button>
                        </div>
                    </div>
                </div>

                {fetched && (
                    <div className="xl:col-span-7">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-full animate-in fade-in slide-in-from-right-5 duration-500">
                            <div className="flex items-start justify-between mb-6">
                                <h2 className="text-lg font-bold text-slate-700">GSTIN Detail</h2>
                                <span className="text-xs font-semibold text-red-500 italic">
                                    Last Date To Fill: <span className="font-bold">{gstData.lastDate}</span>
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                                <div>
                                    <p className="text-xs text-blue-500 font-medium mb-1">Business Name:</p>
                                    <p className="text-sm font-bold text-slate-800">{gstData.businessName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-blue-500 font-medium mb-1">GSTIN Number:</p>
                                    <p className="text-sm font-bold text-slate-800">{gstData.gstinNumber}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-blue-500 font-medium mb-1">Pan Number:</p>
                                    <p className="text-sm font-bold text-slate-800">{gstData.panNumber}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-blue-500 font-medium mb-1">Total Commission:</p>
                                    <p className="text-sm font-bold text-orange-600">{gstData.totalCommission}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-blue-500 font-medium mb-1">Total TDS:</p>
                                    <p className="text-sm font-bold text-slate-800">{gstData.totalTDS}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-blue-500 font-medium mb-1">Total GST:</p>
                                    <p className="text-sm font-bold text-green-600">{gstData.totalGST}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-blue-500 font-medium mb-1">Place of Supply:</p>
                                    <p className="text-sm font-bold text-slate-800">{gstData.placeOfSupply}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Invoice;
