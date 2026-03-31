import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Printer, Download, Calendar, Filter, FileText, CheckCircle2, ChevronRight, IndianRupee } from 'lucide-react';

const ReceiptBase = ({ title, data }) => {
    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Access and print digital transaction receipts</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center gap-2">
                        <Download size={14} /> Batch Export
                    </button>
                    <button className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-800 flex items-center gap-2">
                        <Printer size={14} /> Print Selected
                    </button>
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by ID, Status or Name..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-sm transition-all"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input type="date" className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase outline-none" />
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date/Time</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Txn ID</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amout</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Receipt</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {data.map((r, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-black text-slate-800">{r.date}</p>
                                        <p className="text-[9px] font-bold text-slate-400">{r.time}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{r.id}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-bold text-slate-600">{r.desc}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-black text-slate-800">₹ {r.amt}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase">
                                            <CheckCircle2 size={10} /> Success
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-[10px] font-black text-indigo-500 hover:text-indigo-700 uppercase tracking-widest flex items-center gap-1 ml-auto">
                                            View <Printer size={12} />
                                        </button>
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

export const SuperAdminReceipt = () => <ReceiptBase title="SuperAdmin Receipts" data={[
    { date: '21 Feb 2025', time: '11:30 AM', id: 'TXN992821', desc: 'Fund Requested ICICI', amt: '50,000' },
    { date: '19 Feb 2025', time: '04:15 PM', id: 'TXN992212', desc: 'Comm. Settlement Jan', amt: '12,450' },
]} />;

export const RetailerReceipt = () => <ReceiptBase title="Retailer Receipts" data={[
    { date: '21 Feb 2025', time: '12:10 PM', id: 'RTX772110', desc: 'Load Fund RT012', amt: '5,000' },
    { date: '20 Feb 2025', time: '02:45 PM', id: 'RTX772111', desc: 'Load Fund RT044', amt: '2,500' },
]} />;
