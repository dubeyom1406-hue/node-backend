import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Calendar, Filter, FileText, IndianRupee, ArrowUpRight, ArrowDownRight, Printer, RefreshCw } from 'lucide-react';
import { dataService, BACKEND_URL } from '../../services/dataService';

const ReportTable = ({ title, columns, data, icon: Icon }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Memoize filtered data to prevent unnecessary recalculations
    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        return data.filter(row => 
            columns.some(col => 
                String(row[col.key] || '').toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [data, searchTerm, columns]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = useMemo(() => {
        const startIdx = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIdx, startIdx + itemsPerPage);
    }, [filteredData, currentPage]);

    return (
        <div className="space-y-6">

            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by ID, Name or Mobile..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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
                            {paginatedData.length > 0 ? paginatedData.map((row, i) => (
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
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="text-6xl animate-bounce">😔</div>
                                            <div>
                                                <p className="text-lg font-black text-slate-800 uppercase italic tracking-tight">No Sales/Records Found</p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Try adjusting your filters or date range</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-50 bg-slate-50/50">
                        <div className="text-[10px] font-bold text-slate-500">Page {currentPage} of {totalPages} • {filteredData.length} records</div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold disabled:opacity-50 hover:bg-slate-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold disabled:opacity-50 hover:bg-slate-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Concrete Report Components ──────────────────────────────────────────────

export const CommissionReport = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fromDate, setFromDate] = useState(today());
    const [toDate, setToDate] = useState(today());

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('rupiksha_token');
            const res = await fetch(`${BACKEND_URL}/all-commissions?from=${fromDate}&to=${toDate}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) {
                setData(json.commissions || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [fromDate, toDate]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white border-2 border-slate-100 rounded-3xl p-4 flex flex-wrap items-center gap-4 shadow-sm">
                <div className="flex-1 min-w-[240px] relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search Merchant or Service..." 
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[12px] font-black uppercase text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all" 
                    />
                </div>
                <div className="flex items-center bg-slate-50 p-1 rounded-2xl border border-slate-100">
                    <input 
                        type="date" 
                        value={fromDate} 
                        onChange={e => setFromDate(e.target.value)}
                        className="bg-transparent text-[11px] font-black uppercase px-3 py-2 outline-none text-slate-700 transition-all cursor-pointer"
                    />
                    <span className="text-slate-300 px-1">—</span>
                    <input 
                        type="date" 
                        value={toDate} 
                        onChange={e => setToDate(e.target.value)}
                        className="bg-transparent text-[11px] font-black uppercase px-3 py-2 outline-none text-slate-700 transition-all cursor-pointer"
                    />
                </div>
                <button 
                    onClick={fetchData}
                    className="bg-[#0f172a] hover:bg-blue-600 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center gap-2"
                >
                    {loading ? <RefreshCw className="animate-spin" size={14} /> : 'Fetch Commissions'}
                </button>
            </div>

            <ReportTable
                title=""
                columns={[
                    { label: 'Date/Time', key: 'created_at', render: (v) => <span className="text-[10px] font-bold text-slate-500">{new Date(v).toLocaleString()}</span> },
                    { label: 'Transact ID', key: 'id', render: (v) => <span className="text-[10px] font-black text-slate-800 uppercase italic">#TXN{v}</span> },
                    { label: 'Merchant', key: 'merchant_name', render: (v, row) => (
                        <div>
                            <p className="text-[11px] font-black text-slate-800 uppercase italic leading-none">{v || row.username}</p>
                            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{row.role}</p>
                        </div>
                    )},
                    { label: 'Service', key: 'service', render: (v) => <span className="text-[10px] font-black uppercase bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg border border-blue-100">{v}</span> },
                    { label: 'Txn Value', key: 'amount', render: (v) => <span className="text-xs font-black text-slate-800 tracking-tight">₹ {parseFloat(v || 0).toLocaleString('en-IN')}</span> },
                    { label: 'Commission', key: 'commission_amount', render: (v) => <span className="text-sm font-black text-emerald-600 tracking-tighter italic">₹ {parseFloat(v || 0).toLocaleString('en-IN')}</span> },
                    { label: 'Status', key: 'status', render: (v) => <span className="text-[9px] font-black uppercase bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">Settled</span> }
                ]}
                data={data}
            />
        </div>
    );
};

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


const today = () => new Date().toISOString().split('T')[0];

export const DailyLedger = () => {
    const [userId, setUserId] = useState('');
    const [date, setDate] = useState(today());
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tableSearch, setTableSearch] = useState('');

    const handleFetchSales = async (e) => {
        if (e) e.preventDefault();
        if (!userId) { alert("Please enter User ID"); return; }
        setLoading(true);
        try {
            const data = await dataService.fetchSales(userId, date);
            setSales(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setSales([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredSales = sales.filter(row => {
        if (!tableSearch) return true;
        const s = tableSearch.toLowerCase();
        return (row.description || '').toLowerCase().includes(s) || 
               (row.type || '').toLowerCase().includes(s) || 
               String(row.id || '').includes(s);
    });

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            {/* Dark Header Bar */}
            <div className="bg-[#1e293b] rounded-2xl px-6 py-4 flex items-center">
                <h2 className="text-lg font-black text-white tracking-tight">
                    <span className="text-blue-400 italic">Daily</span> Ledger
                </h2>
            </div>

            {/* Controls Row */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
                {/* User ID Input */}
                <div className="flex flex-wrap items-end gap-4">
                    <div className="min-w-[200px] flex-1">
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-0.5">User ID / Mobile</label>
                        <input
                            type="text"
                            value={userId}
                            onChange={e => setUserId(e.target.value)}
                            placeholder="Enter username or mobile..."
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div className="min-w-[180px]">
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-0.5">Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer transition-all"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleFetchSales}
                        disabled={loading}
                        className="bg-[#1e293b] hover:bg-blue-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow transition-all disabled:opacity-50 active:scale-95"
                    >
                        {loading ? 'Loading...' : 'Search'}
                    </button>
                </div>
            </div>

            {/* Export + Table Search */}
            <div className="flex flex-wrap items-center gap-3">
                <button className="bg-[#1e293b] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow">
                    Xlsx <Download size={14} />
                </button>
                <button className="bg-[#1e293b] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow">
                    PDF <Download size={14} />
                </button>
                <div className="flex-1 max-w-[240px]">
                    <input
                        type="text"
                        value={tableSearch}
                        onChange={e => setTableSearch(e.target.value)}
                        placeholder="Search"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all"
                    />
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="px-5 py-3.5 text-xs font-bold text-slate-500">Txn Date</th>
                                <th className="px-5 py-3.5 text-xs font-bold text-slate-500">Ref. Txn ID</th>
                                <th className="px-5 py-3.5 text-xs font-bold text-slate-500">Particulars</th>
                                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 text-right">Dr.</th>
                                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 text-right">Cr.</th>
                                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 text-right">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {/* Opening Balance */}
                            <tr className="bg-slate-50/50">
                                <td className="px-5 py-3"></td>
                                <td className="px-5 py-3"></td>
                                <td className="px-5 py-3 text-sm font-bold text-slate-600">Opening Balance</td>
                                <td className="px-5 py-3 text-sm text-slate-400 text-right">-</td>
                                <td className="px-5 py-3 text-sm text-slate-400 text-right">-</td>
                                <td className="px-5 py-3 text-sm font-bold text-slate-700 text-right">
                                    ₹ {filteredSales.length > 0 ? parseFloat(filteredSales[0].balance_after - filteredSales[0].amount).toLocaleString('en-IN') : '0.00'}
                                </td>
                            </tr>

                            {filteredSales.length > 0 ? filteredSales.map((row, i) => (
                                <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-5 py-3.5 text-xs text-slate-500">{new Date(row.created_at || Date.now()).toLocaleString()}</td>
                                    <td className="px-5 py-3.5 text-xs font-bold text-slate-700">#TXN{row.id}</td>
                                    <td className="px-5 py-3.5">
                                        <p className="text-sm font-bold text-slate-700 leading-tight">{row.description || 'Service Transaction'}</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">{row.type}</p>
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <span className="text-sm font-bold text-rose-600">
                                            {row.type?.toLowerCase().includes('credit') ? '-' : `₹ ${parseFloat(row.amount || 0).toLocaleString('en-IN')}`}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <span className="text-sm font-bold text-emerald-600">
                                            {row.type?.toLowerCase().includes('credit') ? `₹ ${parseFloat(row.amount || 0).toLocaleString('en-IN')}` : '-'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-sm font-bold text-slate-700 text-right">
                                        ₹ {parseFloat(row.balance_after || 0).toLocaleString('en-IN')}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-6">
                                            <span className="text-7xl filter grayscale opacity-40">😔</span>
                                            <div className="space-y-1">
                                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Statement Empty</h3>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[2px]">No transactions recorded for this period</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {/* Closing Balance */}
                            <tr className="bg-slate-50/50">
                                <td className="px-5 py-3"></td>
                                <td className="px-5 py-3"></td>
                                <td className="px-5 py-3 text-sm font-bold text-slate-600">Closing Balance</td>
                                <td className="px-5 py-3 text-sm text-slate-400 text-right">-</td>
                                <td className="px-5 py-3 text-sm text-slate-400 text-right">-</td>
                                <td className="px-5 py-3 text-sm font-bold text-blue-600 text-right">
                                    ₹ {filteredSales.length > 0 ? parseFloat(filteredSales[filteredSales.length - 1].balance_after).toLocaleString('en-IN') : '0.00'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
