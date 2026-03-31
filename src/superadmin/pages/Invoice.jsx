import React, { useState } from 'react';
import { IndianRupee, AlertCircle, Search as SearchIcon, CheckCircle, Download, Share2, FileText } from 'lucide-react';
import { dataService } from '../../services/dataService';

const Invoice = () => {
    const [month, setMonth] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState(false);
    const [gstData, setGstData] = useState(null);

    const months = [];
    const now = new Date();
    for (let i = -12; i <= 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
        months.push(`${d.toLocaleString('default', { month: 'long' })}-${d.getFullYear()}`);
    }

    const handleFetch = async () => {
        if (!month) { alert('Please select a month first'); return; }
        setLoading(true);
        setFetched(false);

        const user = dataService.getCurrentUser();
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const txns = await dataService.getAllTransactions(); 
            const [selMonth, selYear] = month.split('-');
            const filtered = txns.filter(t => {
                const date = new Date(t.created_at || t.timestamp);
                return date.toLocaleString('default', { month: 'long' }) === selMonth && 
                       date.getFullYear().toString() === selYear;
            });

            const commission = filtered.reduce((acc, t) => acc + (parseFloat(t.commission_amount || t.commission || 0)), 0);
            const tds = commission * 0.01;
            const gst = commission * 0.18;

            setGstData({
                businessName: user.business_name || user.name || "Administrator",
                gstinNumber: user.gstin || "NA",
                panNumber: user.pan || "NA",
                totalCommission: `₹ ${commission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                totalTDS: `₹ ${tds.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                totalGST: `₹ ${gst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                placeOfSupply: user.state || "NA",
                lastDate: "28th of next month",
                count: filtered.length
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setFetched(true);
        }
    };

    const user = dataService.getCurrentUser();
    const hasGst = user?.gstin && user.gstin !== 'NA';

    return (
        <div className="p-4 md:p-8 space-y-6 bg-[#f1f5f9] min-h-screen font-['Inter',sans-serif]">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
                <div className={fetched ? "xl:col-span-5" : "xl:col-span-6 xl:col-start-4"}>
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl p-8 relative overflow-hidden">
                        <div className="absolute top-6 right-6 flex flex-col items-end gap-1.5 opacity-20">
                            <IndianRupee size={32} className="text-cyan-500" />
                        </div>

                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-black text-cyan-600 tracking-tight">GST E-Invoice</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mt-1">Tax Management Portal</p>
                            </div>

                            {!hasGst ? (
                                <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl px-5 py-4 flex items-center gap-3 text-xs font-bold shadow-inner">
                                    <AlertCircle size={18} />
                                    GSTIN number not found in profile
                                </div>
                            ) : (
                                <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl px-5 py-4 flex items-center gap-3 text-xs font-bold shadow-inner">
                                    <CheckCircle size={18} />
                                    Active GSTIN: {user.gstin}
                                </div>
                            )}

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Invoice Month</label>
                                <select
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-black text-slate-700 outline-none focus:bg-white focus:border-cyan-500/20 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Choose Month</option>
                                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>

                            <button
                                onClick={handleFetch}
                                disabled={loading || !month}
                                className="w-full bg-slate-900 hover:bg-cyan-600 text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-[2px] shadow-2xl transition-all disabled:opacity-40 active:scale-[0.98] flex items-center justify-center gap-3"
                            >
                                {loading ? 'Processing...' : <><SearchIcon size={16} /> Fetch Details</>}
                            </button>
                        </div>
                    </div>
                </div>

                {fetched && (
                    <div className="xl:col-span-7">
                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl p-8 h-full relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl -mr-24 -mt-24"></div>
                            <div className="relative z-10 h-full flex flex-col">
                                {gstData.count === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center gap-6 py-10">
                                        <span className="text-7xl grayscale opacity-40">😔</span>
                                        <div className="text-center space-y-2">
                                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Statement Empty</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[2px]">No records found for {month}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-start justify-between mb-8 pb-6 border-b border-slate-100">
                                            <div>
                                                <h2 className="text-xl font-black text-slate-800 tracking-tight">GSTIN Detail</h2>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Generated for {month}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-rose-500 uppercase tracking-wider italic">Last Date To File</p>
                                                <p className="text-xs font-black text-slate-800 tracking-tight">{gstData.lastDate}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-x-10 gap-y-7">
                                            {[
                                                { label: 'Business Name', value: gstData.businessName },
                                                { label: 'GSTIN Number', value: gstData.gstinNumber },
                                                { label: 'Pan Number', value: gstData.panNumber },
                                                { label: 'Commission', value: gstData.totalCommission, color: 'text-orange-600' },
                                                { label: 'TDS (1%)', value: gstData.totalTDS },
                                                { label: 'GST Amount', value: gstData.totalGST, color: 'text-emerald-600' },
                                                { label: 'Place of Supply', value: gstData.placeOfSupply, span: true }
                                            ].map((item, i) => (
                                                <div key={i} className={item.span ? 'col-span-2' : ''}>
                                                    <p className="text-[10px] font-black text-cyan-600/60 uppercase tracking-widest mb-1.5">{item.label}</p>
                                                    <p className={`text-[13px] font-black ${item.color || 'text-slate-800'} tracking-tight`}>{item.value}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-auto pt-10 flex gap-4">
                                            <button className="flex-1 bg-slate-50 hover:bg-white border border-slate-200 py-4 rounded-xl text-[10px] font-black uppercase tracking-[2px] text-slate-600 transition-all flex items-center justify-center gap-2">
                                                <Download size={14} /> Download PDF
                                            </button>
                                            <button className="flex-1 bg-slate-50 hover:bg-white border border-slate-200 py-4 rounded-xl text-[10px] font-black uppercase tracking-[2px] text-slate-600 transition-all flex items-center justify-center gap-2">
                                                <Share2 size={14} /> Share Report
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── GST E-Invoice Report History Table ── */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl overflow-hidden mt-8">
                <div className="bg-slate-50/50 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-[3px] flex items-center gap-3">
                            <FileText size={18} className="text-cyan-600" />
                            GST E-Invoice Report
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 ml-7">Consolidated Monthly Summary</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/30">
                                {[
                                    'Invoice date', 'Total Invoices Count', 'Total Invoices Approved', 
                                    'Total Amount', 'Total Txn. Count', 'Total Tax Amount', 
                                    'Total CGST', 'Total SGST', 'Total IGST', 'Total Approved Amount', 
                                    'Status', 'Action'
                                ].map((h, i) => (
                                    <th key={i} className={`px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[1.5px] border-b border-slate-100 ${i > 0 ? 'text-center' : ''}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {(!gstData || gstData.count === 0) ? (
                                <tr>
                                    <td colSpan={12} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center gap-6">
                                            <span className="text-8xl grayscale opacity-30">😔</span>
                                            <div className="space-y-2">
                                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Statement Empty</h3>
                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[4px]">no data found</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                <tr className="hover:bg-cyan-50/20 transition-colors">
                                    <td className="px-6 py-5 text-[11px] font-black text-slate-700">{month}</td>
                                    <td className="px-6 py-5 text-center text-[11px] font-bold text-slate-500">1</td>
                                    <td className="px-6 py-5 text-center text-[11px] font-bold text-slate-500">1</td>
                                    <td className="px-6 py-5 text-center text-[11px] font-black text-slate-800">{gstData.totalCommission}</td>
                                    <td className="px-6 py-5 text-center text-[11px] font-bold text-slate-500">{gstData.count}</td>
                                    <td className="px-6 py-5 text-center text-[11px] font-black text-emerald-600">{gstData.totalGST}</td>
                                    <td className="px-6 py-5 text-center text-[11px] font-bold text-slate-500">₹ {(parseFloat(gstData.totalGST.replace('₹ ', '').replace(/,/g, '')) / 2).toFixed(2)}</td>
                                    <td className="px-6 py-5 text-center text-[11px] font-bold text-slate-500">₹ {(parseFloat(gstData.totalGST.replace('₹ ', '').replace(/,/g, '')) / 2).toFixed(2)}</td>
                                    <td className="px-6 py-5 text-center text-[11px] font-bold text-slate-400">0.00</td>
                                    <td className="px-6 py-5 text-center text-[11px] font-black text-slate-800">{gstData.totalCommission}</td>
                                    <td className="px-6 py-5 text-center">
                                        <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[9px] font-black uppercase rounded-lg">Approved</span>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <button className="text-cyan-600 hover:text-cyan-700 transition-colors">
                                            <Download size={16} />
                                        </button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Invoice;
