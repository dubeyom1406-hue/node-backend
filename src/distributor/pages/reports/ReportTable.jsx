import React, { useState } from 'react';
import { Search, Download, Calendar, Printer } from 'lucide-react';

const ReportTable = ({ title, columns, data, icon: Icon }) => {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Transaction and performance analytics</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center gap-2">
                        <Download size={14} /> Export CSV
                    </button>
                    <button className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-800 flex items-center gap-2">
                        <Printer size={14} /> Print
                    </button>
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by ID, Name or Mobile..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-sm transition-all"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input type="date" className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none" />
                    </div>
                    <span className="text-slate-400 font-bold">to</span>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input type="date" className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none" />
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                {columns.map((col, i) => (
                                    <th key={i} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{col.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {data.length > 0 ? data.map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    {columns.map((col, j) => (
                                        <td key={j} className="px-6 py-4">
                                            {col.render ? col.render(row[col.key], row) : (
                                                <span className="text-xs font-bold text-slate-600">{row[col.key] || '—'}</span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center gap-6">
                                            <span className="text-7xl grayscale opacity-40">😔</span>
                                            <div className="space-y-1">
                                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Zero Records</h3>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">No transaction data available for this timeline</p>
                                            </div>
                                        </div>
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

export default ReportTable;
