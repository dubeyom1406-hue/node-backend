import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Search, Download, Calendar,
    TrendingUp, TrendingDown, Wallet, RefreshCw,
    ChevronLeft, ChevronRight, Filter, ArrowUpRight,
    ArrowDownLeft, AlertCircle, CheckCircle2, Clock
} from 'lucide-react';
import { BACKEND_URL } from '../../services/dataService';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split('T')[0];

const fmt = (n) =>
    parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (d) => {
    if (!d) return '—';
    const dt = new Date(d);
    return `${String(dt.getDate()).padStart(2, '0')}-${String(dt.getMonth() + 1).padStart(2, '0')}-${dt.getFullYear()}`;
};

// ─── XLSX Export ─────────────────────────────────────────────────────────────
const exportXLSX = (rows, from, to) => {
    const header = ['V.Date', 'Particulars', 'Dr.', 'Cr.', 'Balance'];
    const csv = [header.join(','), ...rows.map(r =>
        [`"${fmtDate(r.created_at)}"`, `"${r.particulars || r.service || r.narration || ''}"`,
            r.dr || '0.00', r.cr || '0.00', r.balance || '0.00'].join(',')
    )].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger_${from}_to_${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
};

// ─── PDF Export ──────────────────────────────────────────────────────────────
const exportPDF = (rows, from, to, summary) => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
    <html><head><title>Consolidated Ledger</title>
    <style>
      body{font-family:Arial,sans-serif;font-size:11px;margin:20px}
      h2{margin:0;font-size:16px;color:#1e3a5f}
      .meta{color:#555;margin:4px 0 16px}
      table{width:100%;border-collapse:collapse}
      th{background:#1e3a5f;color:#fff;padding:7px 10px;text-align:left;font-size:10px;text-transform:uppercase}
      td{padding:6px 10px;border-bottom:1px solid #eee}
      tr:nth-child(even) td{background:#f8f9fa}
      .dr{color:#dc2626} .cr{color:#059669} .bal{font-weight:bold}
      .summary{display:flex;gap:30px;margin-top:16px;padding:12px;background:#f1f5f9;border-radius:6px}
      .s-item{text-align:center}
      .s-label{font-size:9px;color:#64748b;text-transform:uppercase}
      .s-val{font-size:14px;font-weight:bold;margin-top:2px}
      @media print{button{display:none}}
    </style></head><body>
    <button onclick="window.print()" style="margin-bottom:12px;padding:6px 14px;background:#1e3a5f;color:#fff;border:none;border-radius:4px;cursor:pointer">🖨 Print</button>
    <h2>Consolidated Ledger</h2>
    <p class="meta">Period: ${from} to ${to} &nbsp;|&nbsp; Generated: ${new Date().toLocaleString('en-IN')}</p>
    <div class="summary">
      <div class="s-item"><div class="s-label">Opening Balance</div><div class="s-val">₹ ${fmt(summary.opening)}</div></div>
      <div class="s-item"><div class="s-label">Total Debit</div><div class="s-val dr">₹ ${fmt(summary.totalDr)}</div></div>
      <div class="s-item"><div class="s-label">Total Credit</div><div class="s-val cr">₹ ${fmt(summary.totalCr)}</div></div>
      <div class="s-item"><div class="s-label">Closing Balance</div><div class="s-val">₹ ${fmt(summary.closing)} Cr.</div></div>
    </div>
    <br/>
    <table>
      <thead><tr><th>V.Date</th><th>Particulars</th><th>Dr.</th><th>Cr.</th><th>Balance</th></tr></thead>
      <tbody>
        ${rows.map(r => `
          <tr>
            <td>${fmtDate(r.created_at)}</td>
            <td>${r.particulars || r.service || r.narration || '—'}</td>
            <td class="dr">${r.dr || '0.00'}</td>
            <td class="cr">${r.cr || '0.00'}</td>
            <td class="bal">${r.balance || '0.00'} Cr.</td>
          </tr>`).join('')}
        <tr style="background:#f1f5f9;font-weight:bold">
          <td colspan="2">Total</td>
          <td class="dr">${fmt(summary.totalDr)}</td>
          <td class="cr">${fmt(summary.totalCr)}</td>
          <td class="bal">${fmt(summary.closing)} Cr.</td>
        </tr>
      </tbody>
    </table>
    </body></html>`);
    win.document.close();
};

// ─── Build ledger rows from transactions ─────────────────────────────────────
const buildLedger = (txns, openingBalance = 0) => {
    let runningBal = parseFloat(openingBalance);
    const rows = [];

    // Opening row
    rows.push({
        id: 'opening',
        created_at: null,
        particulars: 'To C/F Balance',
        dr: '0.00',
        cr: fmt(openingBalance),
        balance: fmt(openingBalance),
        isOpening: true
    });

    txns.forEach(t => {
        const amount = parseFloat(t.amount || 0);
        let dr = 0, cr = 0;

        // Credit or Debit logic based on service type
        const service = (t.service || '').toLowerCase();
        if (
            t.type === 'CREDIT' ||
            service.includes('add_fund') ||
            service.includes('credit') ||
            service === 'add_money' ||
            t.transaction_type === 'CREDIT'
        ) {
            cr = amount;
            runningBal += amount;
        } else {
            dr = amount;
            runningBal -= amount;
        }

        rows.push({
            ...t,
            particulars: t.service || t.narration || t.particulars || 'Transaction',
            dr: dr > 0 ? fmt(dr) : '0.00',
            cr: cr > 0 ? fmt(cr) : '0.00',
            balance: fmt(Math.abs(runningBal))
        });
    });

    return { rows, closing: runningBal };
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────
const PlansRates = () => {
    const [viewType, setViewType] = useState('CONSOLIDATED'); // CONSOLIDATED, COMMISSION
    const [fromDate, setFromDate] = useState(today());
    const [toDate, setToDate] = useState(today());
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [ledgerRows, setLedgerRows] = useState([]);
    const [summary, setSummary] = useState({ opening: 0, totalDr: 0, totalCr: 0, closing: 0 });
    const [page, setPage] = useState(1);
    const [dateError, setDateError] = useState('');
    const [hasFetched, setHasFetched] = useState(false);
    const PAGE_SIZE = 20;

    // Validate date range ≤ 30 days
    const validateDates = (f, t) => {
        const diff = (new Date(t) - new Date(f)) / (1000 * 60 * 60 * 24);
        if (diff < 0) { setDateError('End date must be after start date'); return false; }
        if (diff > 60) { setDateError('Date range cannot exceed 60 days'); return false; }
        setDateError('');
        return true;
    };

    const fetchLedger = useCallback(async () => {
        if (!validateDates(fromDate, toDate)) return;
        setLoading(true);
        setHasFetched(true);
        setPage(1);

        try {
            const token = localStorage.getItem('rupiksha_token');
            const endpoint = viewType === 'COMMISSION' ? '/all-commissions' : '/all-transactions';
            const res = await fetch(
                `${BACKEND_URL}${endpoint}?from=${fromDate}&to=${toDate}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            const txns = data.success ? (data.transactions || data.commissions || []) : [];

            // Filter by date
            const filtered = txns.filter(t => {
                const d = new Date(t.created_at).toISOString().split('T')[0];
                return d >= fromDate && d <= toDate;
            });

            // Calculate summary
            let totalDr = 0, totalCr = 0;
            const openingBalance = 0;

            filtered.forEach(t => {
                const amount = parseFloat(t.amount || t.commission_amount || 0);
                if (viewType === 'COMMISSION') {
                    totalCr += amount;
                } else {
                    const service = (t.service || '').toLowerCase();
                    if (t.type === 'CREDIT' || service.includes('add_fund') || service.includes('credit') || t.transaction_type === 'CREDIT') {
                        totalCr += amount;
                    } else {
                        totalDr += amount;
                    }
                }
            });

            const closing = openingBalance + totalCr - totalDr;
            const { rows } = buildLedger(filtered, openingBalance);
            
            setLedgerRows(rows);
            setSummary({ opening: openingBalance, totalDr, totalCr, closing });
        } catch (err) {
            console.error(err);
            setLedgerRows([]);
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate, viewType]);

    useEffect(() => {
        fetchLedger();
    }, [viewType]);

    const filteredRows = ledgerRows.filter(r =>
        !search ||
        (r.particulars || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.service || '').toLowerCase().includes(search.toLowerCase()) ||
        (fmtDate(r.created_at)).includes(search)
    );

    const totalPages = Math.ceil(filteredRows.length / PAGE_SIZE);
    const paginated = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div className="p-0 md:p-8 max-w-[1600px] mx-auto space-y-6 font-['Montserrat',sans-serif] bg-slate-50 min-h-screen animate-in fade-in duration-700">
            
            {/* PHOTO MATCHING HEADER SECTION */}
            <div className="bg-[#0f172a] rounded-none md:rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                {/* Background accents */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full -mr-64 -mt-64 blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-600/10 rounded-full -ml-32 -mb-32 blur-[80px] pointer-events-none"></div>

                <div className="relative z-10 space-y-10">
                    {/* Top Row: Title & Toggle */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-white/10 pb-10">
                        <div className="space-y-3">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md shadow-xl">
                                    <FileText size={36} className="text-blue-400" />
                                </div>
                                <div>
                                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-white flex items-center gap-3">
                                        {viewType === 'CONSOLIDATED' ? 'Consolidated' : 'Commission'} <span className="text-blue-500">Ledger</span>
                                    </h1>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2 ml-1">
                                        Real-time financial statement & transaction logs
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-sm self-start">
                            <button 
                                onClick={() => setViewType('CONSOLIDATED')}
                                className={`px-8 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${viewType === 'CONSOLIDATED' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white'}`}
                            >
                                Consolidated
                            </button>
                            <button 
                                onClick={() => setViewType('COMMISSION')}
                                className={`px-8 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${viewType === 'COMMISSION' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white'}`}
                            >
                                Commission
                            </button>
                        </div>
                    </div>

                    {/* Stats Boxes (Matching Photo Layout) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Opening Balance', val: summary.opening, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
                            { label: 'Total Debit (Dr.)', val: summary.totalDr, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
                            { label: 'Total Credit (Cr.)', val: summary.totalCr, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                            { label: 'Closing Balance', val: Math.abs(summary.closing), color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
                        ].map((s, i) => (
                            <div key={i} className={`${s.bg} ${s.border} border rounded-[2rem] p-8 space-y-2 group hover:scale-[1.02] transition-all duration-500`}>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{s.label}</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl md:text-4xl font-black tracking-tight text-white italic">₹ {fmt(s.val)}</span>
                                    {i === 3 && <span className="text-[10px] font-black text-slate-500 uppercase">{summary.closing >= 0 ? 'Cr.' : 'Dr.'}</span>}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filter Bar (Matching Photo Row) */}
                    <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 flex flex-col xl:flex-row items-end gap-6">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Calendar size={12} className="text-blue-500" /> From Date
                                </label>
                                <input
                                    type="date"
                                    value={fromDate}
                                    max={today()}
                                    onChange={e => setFromDate(e.target.value)}
                                    className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-sm font-black text-white focus:bg-white focus:text-slate-900 focus:border-blue-500 transition-all outline-none shadow-inner"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Calendar size={12} className="text-blue-500" /> To Date
                                </label>
                                <input
                                    type="date"
                                    value={toDate}
                                    max={today()}
                                    onChange={e => setToDate(e.target.value)}
                                    className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-sm font-black text-white focus:bg-white focus:text-slate-900 focus:border-blue-500 transition-all outline-none shadow-inner"
                                />
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4 w-full xl:w-auto">
                            <button
                                onClick={fetchLedger}
                                disabled={loading}
                                className="flex-1 xl:flex-none flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {loading ? <RefreshCw size={18} className="animate-spin" /> : <Search size={18} />}
                                Search Statements
                            </button>
                            
                            <div className="flex gap-2">
                                <button
                                    onClick={() => exportXLSX(filteredRows, fromDate, toDate)}
                                    className="p-4 bg-white/10 hover:bg-white hover:text-slate-900 border border-white/20 rounded-2xl transition-all shadow-xl"
                                    title="Export Excel"
                                >
                                    <Download size={20} />
                                </button>
                                <button
                                    onClick={() => exportPDF(filteredRows, fromDate, toDate, summary)}
                                    className="p-4 bg-white/10 hover:bg-white hover:text-slate-900 border border-white/20 rounded-2xl transition-all shadow-xl"
                                    title="Print Statement"
                                >
                                    <FileText size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ERROR HANDLING */}
            {dateError && (
                <div className="mx-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-bounce">
                    <AlertCircle size={20} />
                    <span className="text-xs font-black uppercase tracking-widest">{dateError}</span>
                </div>
            )}

            {/* SEARCH & TABLE SECTION */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden min-h-[500px]">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/30">
                    <div className="relative w-full md:w-96">
                        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input 
                            type="text" 
                            placeholder="Filter by particulars, service or date..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                        />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Total {filteredRows.length} Ledger Records Found
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-900 text-white">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] italic">V. Date</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] italic">Particulars / Description</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] italic text-right">Debit (Dr.)</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] italic text-right">Credit (Cr.)</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] italic text-right">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Compiling Statement...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginated.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-32 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-20">
                                            <FileText size={64} />
                                            <p className="text-xl font-black uppercase tracking-[0.2em]">No Records Found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {paginated.map((row, i) => (
                                        <motion.tr
                                            key={row.id || i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.02 }}
                                            className={`hover:bg-blue-50/50 transition-colors group ${row.isOpening ? 'bg-indigo-50/50 italic' : ''}`}
                                        >
                                            <td className="px-8 py-5">
                                                <p className="text-xs font-black text-slate-800">{row.isOpening ? fmtDate(fromDate) : fmtDate(row.created_at)}</p>
                                                {!row.isOpening && <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">{new Date(row.created_at).toLocaleTimeString()}</p>}
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2 rounded-xl border ${row.isOpening ? 'bg-indigo-100 text-indigo-600 border-indigo-200' : parseFloat(row.dr) > 0 ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                        {row.isOpening ? <Wallet size={16} /> : parseFloat(row.dr) > 0 ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-700 uppercase italic tracking-tighter">
                                                            {row.particulars || row.service || 'SYSTEM TRANSACTION'}
                                                        </p>
                                                        {row.remark && <p className="text-[9px] font-bold text-slate-400 mt-0.5">{row.remark}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <span className={`text-sm font-black ${parseFloat(row.dr) > 0 ? 'text-rose-500' : 'text-slate-300'}`}>
                                                    {parseFloat(row.dr) > 0 ? `₹ ${row.dr}` : '—'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <span className={`text-sm font-black ${parseFloat(row.cr) > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                                                    {parseFloat(row.cr) > 0 ? `₹ ${row.cr}` : '—'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-sm font-black text-[#0f172a] italic">₹ {row.balance}</span>
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Cr. Balance</span>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION (PREMIUM) */}
                {totalPages > 1 && (
                    <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <span className="p-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Records {((page - 1) * PAGE_SIZE) + 1} to {Math.min(page * PAGE_SIZE, filteredRows.length)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                             <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all disabled:opacity-20 shadow-sm"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            
                            <div className="flex gap-1.5 mx-2">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const pg = page <= 3 ? i + 1 : page + i - 2;
                                    if (pg < 1 || pg > totalPages) return null;
                                    return (
                                        <button
                                            key={pg}
                                            onClick={() => setPage(pg)}
                                            className={`w-12 h-12 flex items-center justify-center rounded-2xl text-[11px] font-black uppercase transition-all
                                                ${pg === page 
                                                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 scale-110' 
                                                    : 'bg-white border border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-600 shadow-sm'}`}
                                        >
                                            {pg}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all disabled:opacity-20 shadow-sm"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlansRates;
