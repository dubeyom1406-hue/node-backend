import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BACKEND_URL } from '../../services/dataService';
import { sharedDataService } from '../../services/sharedDataService';

// ─── Utility ─────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toLocaleString('en-IN');
const fmtCur = (n) =>
    Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const REFRESH_INTERVAL = 5000; // 5 seconds

const SERVICE_CONFIG = {
    AEPS: { label: 'AEPS Banking', icon: '🏦', accent: '#4f46e5', priority: true },
    PAYOUT: { label: 'Payout', icon: '💸', accent: '#059669' },
    CMS: { label: 'CMS Collections', icon: '⚡', accent: '#d97706' },
    DMT: { label: 'Money Transfer (DMT)', icon: '📲', accent: '#dc2626', priority: true },
    BHARAT_CONNECT: { label: 'Bharat Connect', icon: '🔗', accent: '#0284c7' },
    OTHER: { label: 'Other Services', icon: '🛠️', accent: '#7c3aed' },
};

const TXN_STATUS_ICON = { SUCCESS: '✅', PENDING: '⏳', FAILED: '❌', PROCESSING: '🔄' };
const TXN_STATUS_COLOR = { SUCCESS: '#16a34a', PENDING: '#d97706', FAILED: '#ef4444', PROCESSING: '#0284c7' };

// ─── Empty state for dashboard data ──────────────────────────────────────────
const emptyData = () => ({
    serverTime: null,
    charges: 0, commission: 0, wallet: 0,
    users: { total: 0, active: 0, pending: 0, inactive: 0 },
    kyc: { done: 0, notDone: 0, pending: 0 },

    walletStats: { total: 0, fundRequest: 0, locked: 0 },
    aeps: { todayTxn: 0, todayAmt: 0, monthlyTxn: 0, monthlyAmt: 0, todayComm: 0, monthlyComm: 0 },
    payout: { todayTxn: 0, todayAmt: 0, monthlyTxn: 0, monthlyAmt: 0, todayComm: 0, monthlyComm: 0 },
    cms: { todayTxn: 0, todayAmt: 0, monthlyTxn: 0, monthlyAmt: 0, todayComm: 0, monthlyComm: 0 },
    dmt: { todayTxn: 0, todayAmt: 0, monthlyTxn: 0, monthlyAmt: 0, todayComm: 0, monthlyComm: 0 },
    bharatConnect: { todayTxn: 0, todayAmt: 0, monthlyTxn: 0, monthlyAmt: 0, todayComm: 0, monthlyComm: 0 },
    otherService: { todayTxn: 0, todayAmt: 0, monthlyTxn: 0, monthlyAmt: 0, todayComm: 0, monthlyComm: 0 },
    recentTransactions: [],
});

// ─── Sub-components ───────────────────────────────────────────────────────────

function LivePulse({ connected }) {
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
            <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: connected ? '#4ade80' : '#f87171',
                boxShadow: connected ? '0 0 10px #4ade80' : '0 0 8px #f87171',
                animation: 'pulse 1.4s ease-in-out infinite',
                display: 'inline-block'
            }} />
            <span style={{ color: connected ? '#4ade80' : '#f87171' }}>
                {connected ? 'LIVE' : 'OFFLINE'}
            </span>
        </span>
    );
}

function KpiCard({ title, icon, accent = '#6366f1', children }) {
    const [hov, setHov] = useState(false);
    return (
        <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(12px)',
                border: `1px solid ${accent}30`,
                borderTop: `3px solid ${accent}`,
                borderRadius: 16,
                padding: '18px 20px',
                boxShadow: hov
                    ? `0 12px 40px ${accent}25`
                    : `0 4px 24px rgba(0,0,0,0.06)`,
                transform: hov ? 'translateY(-3px)' : 'translateY(0)',
                transition: 'all 0.25s ease',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: `${accent}15`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, border: `1px solid ${accent}30`
                }}>{icon}</div>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', letterSpacing: 0.3 }}>{title}</span>
            </div>
            {children}
        </div>
    );
}

function StatRow({ label, value, accent }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: accent || '#334155', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
        </div>
    );
}

function ServiceCard({ serviceKey, data }) {
    const cfg = SERVICE_CONFIG[serviceKey] || { label: serviceKey, icon: '📊', accent: '#6366f1' };
    const { todayTxn = 0, todayAmt = 0, monthlyTxn = 0, monthlyAmt = 0, todayComm = 0, monthlyComm = 0 } = data || {};
    const [hov, setHov] = useState(false);

    return (
        <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${cfg.accent}25`,
                borderLeft: `4px solid ${cfg.accent}`,
                borderRadius: 14,
                padding: '16px 18px',
                boxShadow: hov ? `0 8px 30px ${cfg.accent}20` : '0 4px 16px rgba(0,0,0,0.04)',
                transform: hov ? 'translateY(-2px)' : 'none',
                transition: 'all 0.2s ease',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{cfg.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{cfg.label}</span>
                </div>
                {cfg.priority && (
                    <span style={{
                        fontSize: 9, fontWeight: 800, padding: '2px 8px',
                        borderRadius: 20, background: '#fee2e2', color: '#ef4444',
                        border: '1px solid #fca5a5', letterSpacing: 0.5
                    }}>⚡ PRIORITY</span>
                )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                {[
                    ['Today Txn', fmt(todayTxn)],
                    ['Today Amt', `₹${fmt(todayAmt)}`],
                    ['Today Comm', `₹${fmtCur(todayComm)}`],
                    ['Monthly Txn', fmt(monthlyTxn)],
                    ['Monthly Amt', `₹${fmt(monthlyAmt)}`],
                    ['Monthly Comm', `₹${fmtCur(monthlyComm)}`],
                ].map(([label, val]) => (
                    <div key={label} style={{
                        background: `${cfg.accent}08`, borderRadius: 8,
                        padding: '8px 6px', textAlign: 'center',
                        border: `1px solid ${cfg.accent}15`
                    }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#64748b', marginBottom: 2 }}>{label}</div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: cfg.accent, fontVariantNumeric: 'tabular-nums' }}>{val}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ActivityFeed({ transactions, localUsers }) {
    const allTxns = [...(transactions || [])];

    if (allTxns.length === 0) {
        return (
            <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>No transactions recorded yet.</div>
                <div style={{ fontSize: 11, marginTop: 4 }}>Transactions will appear here in real-time as retailers perform operations.</div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
            {allTxns.map((txn, i) => {
                const status = (txn.status || 'PENDING').toUpperCase();
                const statusColor = TXN_STATUS_COLOR[status] || '#64748b';
                const statusIcon = TXN_STATUS_ICON[status] || '❓';
                return (
                    <div key={txn.id || i} style={{
                        minWidth: 190, flexShrink: 0,
                        background: 'rgba(255,255,255,0.9)',
                        border: `1px solid ${statusColor}25`,
                        borderTop: `3px solid ${statusColor}`,
                        borderRadius: 12, padding: '12px 14px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        animation: 'fadeSlideIn 0.3s ease'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 800, color: '#334155' }}>{txn.type || 'TXN'}</span>
                            <span style={{ fontSize: 11, fontWeight: 800, color: statusColor }}>{statusIcon} {status}</span>
                        </div>
                        <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4, fontWeight: 600 }}>
                            {txn.userName || txn.user_id || 'Unknown'}
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', fontFamily: 'monospace', marginBottom: 4 }}>
                            ₹{fmt(txn.amount)}
                        </div>
                        {txn.operator && (
                            <div style={{ fontSize: 10, color: '#94a3b8' }}>{txn.operator} · {txn.number}</div>
                        )}
                        <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 4 }}>
                            {txn.created_at ? new Date(txn.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function MetricChange({ current, previous }) {
    if (previous === null || previous === undefined || previous === current) return null;
    const diff = current - previous;
    const up = diff > 0;
    return (
        <span style={{ fontSize: 10, fontWeight: 700, color: up ? '#16a34a' : '#ef4444', marginLeft: 4 }}>
            {up ? '▲' : '▼'}{Math.abs(diff).toLocaleString('en-IN')}
        </span>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const LiveDashboard = ({ data: parentData, distributors: parentDists, superadmins: parentSAs }) => {
    const [liveData, setLiveData] = useState(emptyData());
    const [prevData, setPrevData] = useState(null);
    const [connected, setConnected] = useState(false);
    const [lastFetch, setLastFetch] = useState(null);
    const [time, setTime] = useState(new Date());
    const [tick, setTick] = useState(0);
    const prevRef = useRef(null);

    // Merge local storage users for richer stats when server is empty
    const localRetailers = parentData?.users || [];
    const localDists = parentDists || [];
    const localSAs = parentSAs || [];
    const allLocalUsers = [...localRetailers, ...localDists, ...localSAs];

    const fetchDashboard = useCallback(async () => {
        try {
            const url = `${BACKEND_URL}/dashboard/live`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const json = await res.json();

            setPrevData(prevRef.current);
            prevRef.current = json;

            // Merge with local data to ensure real registered users are counted
            const localActive = allLocalUsers.filter(u => u?.status === 'Approved').length;
            const localPending = allLocalUsers.filter(u => u?.status === 'Pending').length;
            const localWallet = allLocalUsers.reduce((sum, u) => {
                const b = parseFloat((u?.wallet?.balance || '0').toString().replace(/,/g, ''));
                return sum + (isNaN(b) ? 0 : b);
            }, 0);

            // Prefer real registered data from localStorage when server in-memory is empty
            const merged = {
                ...json,
                users: {
                    total: Math.max(json.users?.total || 0, allLocalUsers.length),
                    active: Math.max(json.users?.active || 0, localActive),
                    pending: Math.max(json.users?.pending || 0, localPending),
                    inactive: json.users?.inactive || 0,
                },
                wallet: Math.max(json.wallet || 0, localWallet),
                walletStats: {
                    ...json.walletStats,
                    total: Math.max(json.walletStats?.total || 0, localWallet),
                },
            };
            setLiveData(merged);
            setConnected(true);
            setLastFetch(new Date());
        } catch (err) {
            setConnected(false);
            // Gracefully fall back to local data
            const localActive = allLocalUsers.filter(u => u?.status === 'Approved').length;
            const localPending = allLocalUsers.filter(u => u?.status === 'Pending').length;
            const localWallet = allLocalUsers.reduce((sum, u) => {
                const b = parseFloat((u?.wallet?.balance || '0').toString().replace(/,/g, ''));
                return sum + (isNaN(b) ? 0 : b);
            }, 0);
            setLiveData(prev => ({
                ...prev,
                users: {
                    total: allLocalUsers.length || prev.users.total,
                    active: localActive || prev.users.active,
                    pending: localPending || prev.users.pending,
                    inactive: prev.users.inactive,
                },
                wallet: localWallet || prev.wallet,
                walletStats: { ...prev.walletStats, total: localWallet || prev.walletStats.total },
            }));
        }
    }, [allLocalUsers.length]);

    useEffect(() => {
        fetchDashboard();
        const pollInterval = setInterval(() => {
            fetchDashboard();
            setTick(t => t + 1);
        }, REFRESH_INTERVAL);
        const clockInterval = setInterval(() => setTime(new Date()), 1000);
        return () => {
            clearInterval(pollInterval);
            clearInterval(clockInterval);
        };
    }, [fetchDashboard]);

    const timeStr = time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = time.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(145deg, #f0fdf4 0%, #eff6ff 50%, #fefce8 100%)',
            fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
            color: '#334155',
            padding: '24px',
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');
                @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
                @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
                @keyframes fadeSlideIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
                @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
                .live-grid { display: grid; gap: 16px; animation: fadeIn 0.4s ease; }
            `}</style>

            {/* ── Topbar ── */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.8)',
                borderRadius: 18, padding: '14px 20px', marginBottom: 22,
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                position: 'sticky', top: 0, zIndex: 50,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'linear-gradient(135deg, #6366f1, #0ea5e9)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
                    }}>🏛️</div>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 900, color: '#0f172a', letterSpacing: 0.5 }}>RUPIKSHA ADMIN</div>
                        <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Live Operations Control</div>
                    </div>
                    <div style={{ width: 1, height: 30, background: '#e2e8f0', margin: '0 8px' }} />
                    <LivePulse connected={connected} />
                    {lastFetch && (
                        <span style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>
                            Updated {lastFetch.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    {[
                        { label: 'Charges', value: `₹${fmtCur(liveData.charges)}`, color: '#ea580c', bg: '#fff7ed' },
                        { label: 'Commission', value: `₹${fmtCur(liveData.commission)}`, color: '#059669', bg: '#f0fdf4' },
                        { label: 'Wallet Float', value: `₹${fmtCur(liveData.wallet)}`, color: '#4f46e5', bg: '#eef2ff' },
                    ].map(({ label, value, color, bg }) => (
                        <div key={label} style={{
                            background: bg, border: `1px solid ${color}30`,
                            borderRadius: 10, padding: '6px 14px',
                            display: 'flex', flexDirection: 'column', alignItems: 'flex-end'
                        }}>
                            <span style={{ fontSize: 9, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
                            <span style={{ fontSize: 13, fontWeight: 900, color, fontVariantNumeric: 'tabular-nums', fontFamily: 'JetBrains Mono, monospace' }}>{value}</span>
                        </div>
                    ))}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '6px 14px', textAlign: 'right' }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#1e293b', fontFamily: 'JetBrains Mono, monospace' }}>{timeStr}</div>
                        <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>{dateStr}</div>
                    </div>
                </div>
            </div>

            {/* ── KPI Cards Row ── */}
            <div className="live-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 16 }}>
                <KpiCard title="User Network" icon="👥" accent="#0ea5e9">
                    <StatRow label="Total Registered" value={fmt(liveData.users.total)} accent="#0ea5e9" />
                    <StatRow label="Active / Approved" value={fmt(liveData.users.active)} accent="#10b981" />
                    <StatRow label="Pending Approval" value={fmt(liveData.users.pending)} accent="#f59e0b" />
                    <StatRow label="Inactive" value={fmt(liveData.users.inactive)} accent="#ef4444" />
                </KpiCard>

                <KpiCard title="Profile KYC" icon="🪪" accent="#8b5cf6">
                    <StatRow label="KYC Done" value={fmt(liveData.kyc.done)} accent="#10b981" />
                    <StatRow label="KYC Not Done" value={fmt(liveData.kyc.notDone)} accent="#ef4444" />
                    <StatRow label="KYC Pending" value={fmt(liveData.kyc.pending)} accent="#f59e0b" />
                </KpiCard>



                <KpiCard title="Wallet Overview" icon="💰" accent="#f59e0b">
                    <StatRow label="Total Float" value={`₹${fmtCur(liveData.walletStats.total)}`} accent="#f59e0b" />
                    <StatRow label="Fund Requests" value={fmt(liveData.walletStats.fundRequest)} accent="#0ea5e9" />
                    <StatRow label="Locked Amount" value={`₹${fmtCur(liveData.walletStats.locked)}`} accent="#64748b" />
                </KpiCard>
            </div>

            {/* ── Network Summary ── */}
            <div className="live-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 16 }}>
                {[
                    { label: 'Super Distributors', count: localSAs.length, approved: localSAs.filter(u => u?.status === 'Approved').length, icon: '👑', color: '#6366f1' },
                    { label: 'Distributors', count: localDists.length, approved: localDists.filter(u => u?.status === 'Approved').length, icon: '🏪', color: '#f59e0b' },
                    { label: 'Retailers', count: localRetailers.length, approved: localRetailers.filter(u => u?.status === 'Approved').length, icon: '🛒', color: '#10b981' },
                ].map(({ label, count, approved, icon, color }) => (
                    <div key={label} style={{
                        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
                        borderRadius: 14, padding: '18px 20px',
                        border: `1px solid ${color}25`, borderLeft: `4px solid ${color}`,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
                            <div style={{ fontSize: 28, fontWeight: 900, color, letterSpacing: -1 }}>{count}</div>
                            <div style={{ fontSize: 11, color: '#10b981', fontWeight: 700, marginTop: 2 }}>✓ {approved} Approved</div>
                        </div>
                        <div style={{
                            fontSize: 36, width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: `${color}12`, borderRadius: 14, border: `1px solid ${color}25`
                        }}>{icon}</div>
                    </div>
                ))}
            </div>

            {/* ── Service Transaction Grid ── */}
            <div className="live-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: 16 }}>
                <ServiceCard serviceKey="AEPS" data={liveData.aeps} />
                <ServiceCard serviceKey="PAYOUT" data={liveData.payout} />
                <ServiceCard serviceKey="CMS" data={liveData.cms} />
                <ServiceCard serviceKey="DMT" data={liveData.dmt} />
                <ServiceCard serviceKey="BHARAT_CONNECT" data={liveData.bharatConnect} />
                <ServiceCard serviceKey="OTHER" data={liveData.otherService} />
            </div>

            {/* ── Live Activity Feed ── */}
            <div style={{
                background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(99,102,241,0.15)', borderRadius: 16,
                padding: '18px 20px', marginBottom: 16,
                boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 20 }}>📡</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Live Activity Feed</span>
                        <LivePulse connected={connected} />
                    </div>
                    <span style={{
                        fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                        background: '#eef2ff', color: '#4f46e5', border: '1px solid #c7d2fe'
                    }}>
                        {liveData.recentTransactions.length} Recent
                    </span>
                </div>
                <ActivityFeed transactions={liveData.recentTransactions} localUsers={allLocalUsers} />
            </div>

            {/* ── Footer ── */}
            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 11, fontWeight: 600 }}>
                <span style={{ background: connected ? '#dcfce7' : '#fee2e2', color: connected ? '#16a34a' : '#ef4444', padding: '4px 12px', borderRadius: 20, border: `1px solid ${connected ? '#86efac' : '#fca5a5'}` }}>
                    {connected ? `🟢 Connected — Auto-refresh every ${REFRESH_INTERVAL / 1000}s` : '🔴 Server Offline — Showing cached data'}
                </span>
                <span style={{ marginLeft: 12 }}>Tick #{tick}</span>
            </div>
        </div>
    );
};

export default LiveDashboard;
