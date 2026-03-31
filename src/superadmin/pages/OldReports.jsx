import React, { useState } from 'react';
import { History, Download, Search, Calendar } from 'lucide-react';

const years = ['2023-24', '2022-23', '2021-22', '2020-21'];
const reportTypes = ['Purchase Report', 'Commission Report', 'Retailer Balance', 'AEPS Report', 'DMT Report'];

const genRows = (yr) => Array.from({ length: 12 }, (_, i) => ({
    month: new Date(0, i).toLocaleString('default', { month: 'long' }),
    year: yr,
    txns: Math.floor(Math.random() * 500 + 50),
    amount: (Math.random() * 500000 + 10000).toFixed(2),
    commission: (Math.random() * 10000 + 500).toFixed(2),
    status: i < 2 ? 'Processing' : 'Available',
}));

const OldReports = () => {
    const [selectedYear, setSelectedYear] = useState(years[0]);
    const [selectedReport, setSelectedReport] = useState(reportTypes[0]);
    const [rows] = useState(() => Object.fromEntries(years.map(y => [y, genRows(y)])));

    const filtered = rows[selectedYear] || [];

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                    <History size={20} className="text-amber-500" /> Old Financial Year Reports
                </h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Historical reports from previous financial years</p>
            </div>

            {/* Selectors */}
            <div className="flex flex-wrap gap-3">
                <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Financial Year</p>
                    <div className="flex gap-2">
                        {years.map(y => (
                            <button key={y} onClick={() => setSelectedYear(y)}
                                className={`px-3 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl border transition-all ${selectedYear === y ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-500 border-slate-200 hover:border-amber-300'}`}>
                                FY {y}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Report Type</p>
                    <select value={selectedReport} onChange={e => setSelectedReport(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-black outline-none focus:border-amber-400 text-slate-700 appearance-none">
                        {reportTypes.map(r => <option key={r}>{r}</option>)}
                    </select>
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Transactions', value: filtered.reduce((s, r) => s + r.txns, 0).toLocaleString('en-IN') },
                    { label: 'Total Amount', value: `₹ ${filtered.reduce((s, r) => s + parseFloat(r.amount), 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` },
                    { label: 'Total Commission', value: `₹ ${filtered.reduce((s, r) => s + parseFloat(r.commission), 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` },
                ].map((c, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{c.label}</p>
                        <p className="text-xl font-black text-amber-600 mt-1">{c.value}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-50 flex justify-between items-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedReport} — FY {selectedYear}</p>
                    <button className="flex items-center gap-2 text-[9px] font-black text-amber-600 uppercase tracking-widest hover:text-amber-800">
                        <Download size={12} /> Download All
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead><tr className="bg-slate-50 border-b border-slate-100">
                            {['Month', 'Year', 'Transactions', 'Amount (₹)', 'Commission (₹)', 'Status', 'Download'].map(h => (
                                <th key={h} className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">{h}</th>
                            ))}
                        </tr></thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.map((r, i) => (
                                <tr key={i} className="hover:bg-amber-50/30 transition-colors">
                                    <td className="px-5 py-3.5 text-xs font-black text-slate-700">{r.month}</td>
                                    <td className="px-5 py-3.5 text-xs font-bold text-slate-500">FY {r.year}</td>
                                    <td className="px-5 py-3.5 text-xs font-bold text-slate-600">{r.txns.toLocaleString('en-IN')}</td>
                                    <td className="px-5 py-3.5 text-xs font-black text-slate-800">{parseFloat(r.amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                    <td className="px-5 py-3.5 text-xs font-black text-emerald-600">{parseFloat(r.commission).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                    <td className="px-5 py-3.5">
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase
                                            ${r.status === 'Available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{r.status}</span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        {r.status === 'Available' && (
                                            <button className="text-[9px] font-black text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                                <Download size={11} /> PDF
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OldReports;
