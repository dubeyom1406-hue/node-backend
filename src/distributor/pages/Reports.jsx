import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Calendar, Filter, FileText, IndianRupee, ArrowUpRight, ArrowDownRight, Printer } from 'lucide-react';

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

// ─── Concrete Report Components ──────────────────────────────────────────────

export const CommissionReport = () => (
    <ReportTable
        title="Commission Report"
        columns={[
            { label: 'Date/Time', key: 'date' },
            { label: 'Retailer', key: 'retailer' },
            { label: 'Service', key: 'service' },
            { label: 'Ref ID', key: 'ref' },
            { label: 'Txn Amt', key: 'amt' },
            { label: 'My Commission', key: 'comm', render: (v) => <span className="text-emerald-600 font-black">₹ {v}</span> },
            { label: 'Status', key: 'status', render: (v) => <span className="text-[9px] font-black uppercase bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full border border-emerald-100">Settled</span> }
        ]}
        data={[
            { date: '2025-02-20 14:22', retailer: 'Rahul Store', service: 'AEPS', ref: 'TXN88221', amt: '10,000', comm: '5.00' },
            { date: '2025-02-20 12:45', retailer: 'Ajay Tele', service: 'DMT', ref: 'TXN88222', amt: '2,500', comm: '2.50' },
            { date: '2025-02-19 16:10', retailer: 'Sumit Kirana', service: 'BBPS', ref: 'TXN88223', amt: '840', comm: '1.20' },
        ]}
    />
);

export const RetailerBalance = () => (
    <ReportTable
        title="Retailer Balance Report"
        columns={[
            { label: 'Retailer Name', key: 'name' },
            { label: 'Business', key: 'biz' },
            { label: 'Mobile', key: 'mobile' },
            { label: 'Wallet Balance', key: 'bal', render: (v) => <span className="font-black text-slate-800">₹ {v}</span> },
            { label: 'Last Lead', key: 'last' },
            { label: 'Status', key: 'status' }
        ]}
        data={[
            { name: 'Rahul Kumar', biz: 'Rahul General Store', mobile: '9876001122', bal: '12,450.00', last: '20 Feb', status: 'Approved' },
            { name: 'Ajay Singh', biz: 'Ajay Telecom', mobile: '9988776655', bal: '8,200.00', last: '18 Feb', status: 'Approved' },
        ]}
    />
);

export const PaymentRequest = () => (
    <ReportTable
        title="Payment Request Report"
        columns={[
            { label: 'Req Date', key: 'date' },
            { label: 'Mode', key: 'mode' },
            { label: 'Ref/UTR', key: 'utr' },
            { label: 'Bank', key: 'bank' },
            { label: 'Amount', key: 'amt', render: (v) => <span className="font-black text-slate-800">₹ {v}</span> },
            { label: 'Status', key: 'status', render: (v) => <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border ${v === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{v}</span> }
        ]}
        data={[
            { date: '20 Feb 11:30', mode: 'Bank Transfer', utr: 'UTR8872110', bank: 'ICICI', amt: '50,000', status: 'Approved' },
            { date: '18 Feb 16:45', mode: 'CDM Deposit', utr: 'REF99012', bank: 'SBI', amt: '10,000', status: 'Approved' },
        ]}
    />
);

export const PurchaseReport = () => (
    <ReportTable
        title="Purchase (Fund) Report"
        columns={[
            { label: 'Date', key: 'date' },
            { label: 'Type', key: 'type' },
            { label: 'UTR/Ref', key: 'ref' },
            { label: 'Amount', key: 'amt', render: (v) => <span className="font-black text-slate-800">₹ {v}</span> },
            { label: 'Admin Note', key: 'note' }
        ]}
        data={[
            { date: '21 Feb 10:00', type: 'Wallet Recharge', ref: 'UT991', amt: '25,000', note: 'Fund Approved' },
            { date: '15 Feb 14:00', type: 'Wallet Recharge', ref: 'UT982', amt: '50,000', note: 'Direct Credit' },
        ]}
    />
);

export const ChargeReport = () => (
    <ReportTable title="Charges & Deductions" columns={[{ label: 'Date', key: 'd' }, { label: 'Description', key: 'desc' }, { label: 'Amount', key: 'a' }]} data={[]} />
);

export const AepsReport = () => (
    <ReportTable title="AEPS Transaction Report" columns={[{ label: 'Time', key: 't' }, { label: 'Retailer', key: 'r' }, { label: 'Bank', key: 'b' }, { label: 'Amt', key: 'a' }, { label: 'Status', key: 's' }]} data={[]} />
);

export const DmtReport = () => (
    <ReportTable title="DMT Transaction Report" columns={[{ label: 'Time', key: 't' }, { label: 'Sender', key: 's' }, { label: 'Receiver', key: 'r' }, { label: 'Amt', key: 'a' }, { label: 'Status', key: 's' }]} data={[]} />
);

export const BbpsReport = () => (
    <ReportTable title="BBPS Transaction Report" columns={[{ label: 'Time', key: 't' }, { label: 'Category', key: 'c' }, { label: 'Biller', key: 'b' }, { label: 'Amt', key: 'a' }]} data={[]} />
);

export const CmsReport = () => (
    <ReportTable title="CMS Transaction Report" columns={[{ label: 'Time', key: 't' }, { label: 'Biller', key: 'b' }, { label: 'Ref', key: 'r' }, { label: 'Amt', key: 'a' }]} data={[]} />
);
