import React, { useState } from 'react';
import {
    FileText, CheckCircle2, Search, Filter, Download,
    Printer, IndianRupee, ArrowUpRight, ArrowDownLeft, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

const Reports = () => {
    const [filter, setFilter] = useState('All');

    const stats = [
        { label: 'Total Volume', value: '₹ 1,42,500', icon: IndianRupee, color: 'bg-blue-500' },
        { label: 'Successful', value: '124', icon: CheckCircle2, color: 'bg-emerald-500' },
        { label: 'Processing', value: '03', icon: Clock, color: 'bg-orange-500' },
        { label: 'Commission', value: '₹ 2,450', icon: ArrowUpRight, color: 'bg-violet-500' },
    ];

    const transactions = [
        { id: 'RPX00124', service: 'AEPS Withdrawal', customer: '9308295061', amount: '2500.00', status: 'Success', date: '31 Jan 2026, 12:30 PM' },
        { id: 'RPX00123', service: 'Quick Transfer', customer: '9876543210', amount: '5000.00', status: 'Success', date: '31 Jan 2026, 11:15 AM' },
        { id: 'RPX00122', service: 'Bill Payment', customer: '8877665544', amount: '450.00', status: 'Success', date: '31 Jan 2026, 10:05 AM' },
        { id: 'RPX00121', service: 'AEPS Withdrawal', customer: '9123456789', amount: '1000.00', status: 'Failed', date: '31 Jan 2026, 09:45 AM' },
        { id: 'RPX00120', service: 'Quick Transfer', customer: '7766554433', amount: '12000.00', status: 'Success', date: '30 Jan 2026, 05:20 PM' },
    ];

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Transaction Reports</h1>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Monitor your business performance</p>
                </div>
                <div className="flex space-x-3">
                    <button className="bg-white border-2 border-slate-100 px-6 py-2.5 rounded-xl flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all shadow-sm">
                        <Download size={16} />
                        <span>Export CSV</span>
                    </button>
                    <button className="bg-[#1e3a8a] text-white px-8 py-2.5 rounded-xl flex items-center space-x-2 text-xs font-black uppercase tracking-widest shadow-lg hover:bg-blue-900 transition-all">
                        <Printer size={16} />
                        <span>Print Report</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div key={i} whileHover={{ y: -5 }} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl flex items-center space-x-4">
                        <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <h4 className="text-xl font-black text-slate-800 tracking-tight">{stat.value}</h4>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center space-x-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 w-full max-w-md focus-within:border-blue-500 transition-all">
                        <Search size={18} className="text-slate-400" />
                        <input type="text" placeholder="Search by ID, Number or Service..." className="bg-transparent border-none focus:ring-0 text-sm font-bold w-full" />
                    </div>
                    <div className="flex items-center space-x-4 overflow-x-auto pb-2 sm:pb-0">
                        {['All', 'Success', 'Failed', 'Pending'].map(m => (
                            <button
                                key={m}
                                onClick={() => setFilter(m)}
                                className={`px-5 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${filter === m ? 'bg-blue-900 text-white shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:bg-slate-50'}`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="px-8 py-5">Txn ID</th>
                                <th className="px-8 py-5">Service</th>
                                <th className="px-8 py-5">Customer</th>
                                <th className="px-8 py-5">Date & Time</th>
                                <th className="px-8 py-5">Amount</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {transactions.map((txn, i) => (
                                <tr key={i} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-8 py-5 text-sm font-black text-slate-700 tracking-tight">{txn.id}</td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center space-x-2">
                                            <div className="bg-blue-50 p-1.5 rounded-lg"><FileText size={14} className="text-blue-600" /></div>
                                            <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{txn.service}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-xs font-bold text-slate-500 italic">{txn.customer}</td>
                                    <td className="px-8 py-5 text-[11px] font-bold text-slate-400">{txn.date}</td>
                                    <td className="px-8 py-5 text-sm font-black text-slate-900">₹ {txn.amount}</td>
                                    <td className="px-8 py-5">
                                        <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${txn.status === 'Success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                            {txn.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <button className="p-2 rounded-lg text-slate-300 hover:bg-slate-900 hover:text-white transition-all"><Printer size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <span>Showing 5 of 124 Results</span>
                    <div className="flex items-center space-x-4">
                        <button className="hover:text-blue-900 transition-colors">Previous</button>
                        <span className="bg-white px-3 py-1 rounded border border-slate-100 text-blue-900">1</span>
                        <button className="hover:text-blue-900 transition-colors">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
