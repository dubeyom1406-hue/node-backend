import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Calendar, ArrowUpCircle, ArrowDownCircle, ScrollText, Filter, IndianRupee } from 'lucide-react';

const LedgerTable = ({ title, showRetailerSelector = false }) => {
    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Detailed financial ledger and transaction logs</p>
                </div>
                <button className="bg-slate-900 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2">
                    <Download size={16} /> Download PDF Statement
                </button>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-5">
                <div className="flex flex-wrap items-center gap-4">
                    {showRetailerSelector && (
                        <div className="min-w-[200px] flex-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Select Retailer</label>
                            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-indigo-400">
                                <option>All Retailers</option>
                                <option>Rahul Store (RT01)</option>
                                <option>Ajay Telecom (RT02)</option>
                            </select>
                        </div>
                    )}
                    <div className="min-w-[150px] flex-1 md:flex-none">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">From Date</label>
                        <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none" />
                    </div>
                    <div className="min-w-[150px] flex-1 md:flex-none">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">To Date</label>
                        <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none" />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Quick Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input type="text" placeholder="Search by description or ID..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date/Time</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Credit</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Debit</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {[
                                { date: '21 Feb 11:45', desc: 'Comm. for AEPS RT092', type: 'COMM', cr: '2.40', dr: '0.00', bal: '12,450.40' },
                                { date: '20 Feb 16:22', desc: 'Fund Requested ICICI', type: 'FUND', cr: '50,000', dr: '0.00', bal: '12,448.00' },
                                { date: '20 Feb 09:10', desc: 'DMT Settle RT012', type: 'DMT', cr: '0.00', dr: '2,500', bal: '12,448.00' },
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 text-xs font-bold text-slate-500 whitespace-nowrap">{row.date}</td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-black text-slate-700">{row.desc}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">TXN9928221</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase">{row.type}</span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-black text-emerald-600">₹ {row.cr}</td>
                                    <td className="px-6 py-4 text-xs font-black text-rose-500">₹ {row.dr}</td>
                                    <td className="px-6 py-4 text-xs font-black text-slate-800">₹ {row.bal}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export const MyLedger = () => <LedgerTable title="My Ledger" />;
export const RetailerLedger = () => <LedgerTable title="Retailer Ledger" showRetailerSelector={true} />;
export const AccountsCommission = () => <LedgerTable title="Commission Reports" />;
