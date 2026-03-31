import React, { useState, useEffect } from 'react';
import {
    TrendingUp, TrendingDown, Users, IndianRupee, CheckCircle2, Clock,
    MoreVertical, ArrowRight, Search, Bell, Plus, Building2, ShieldCheck,
    Package, Zap, BarChart3, Calendar, Filter, RefreshCcw, Eye,
    ArrowUpRight, ArrowDownRight, Wallet, MapPin, Star, Activity,
    SlidersHorizontal, User, LayoutGrid, List, ChevronDown, Trash2, Settings
} from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmtINR = (n) => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 });
const fmtK = (n) => {
    const num = Number(n || 0);
    if (num >= 10000000) return (num / 10000000).toFixed(1) + 'Cr';
    if (num >= 100000) return (num / 100000).toFixed(1) + 'L';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

// ── New Bar Chart (Matches Image) ────────────────────────────────────────────
const BarChart = ({ data = [8, 12, 10, 6, 11], height = 120 }) => {
    const max = Math.max(...data, 1);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height }}>
                {data.map((v, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                        <div style={{
                            width: '40%',
                            height: `${(v / max) * 100}%`,
                            background: i === data.length - 1 ? '#18181b' : '#18181b', // Solid black bars
                            borderRadius: 4,
                            minHeight: 4,
                            transition: 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                        }} />
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {days.map(d => (
                    <span key={d} style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', flex: 1, textAlign: 'center' }}>{d}</span>
                ))}
            </div>
        </div>
    );
};

// ── Semi-Circle Gauge (Matches Image) ────────────────────────────────────────
const Gauge = ({ pct = 68, size = 180, stroke = 12, label = "Successful deals" }) => {
    const r = (size - stroke) / 2;
    const circ = Math.PI * r;
    const offset = circ * (1 - pct / 100);
    return (
        <div style={{ position: 'relative', width: size, height: size / 2 + 20, display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
            <svg width={size} height={size} style={{ transform: 'rotate(180deg)' }}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} strokeDasharray={`${circ} ${circ * 2}`} strokeLinecap="round" />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#6366f1" strokeWidth={stroke} strokeDasharray={`${circ} ${circ * 2}`} strokeDashoffset={offset} strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
            </svg>
            <div style={{ position: 'absolute', bottom: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: 32, fontWeight: 800, color: '#312e81', lineHeight: 1 }}>{pct}%</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', marginTop: 4 }}>{label}</span>
            </div>

        </div>
    );
};

// ── Deal Stage Card (Matches Image) ──────────────────────────────────────────
// ── Module Card (Interactive Admin Module) ──────────────────────────────────
const ModuleCard = ({ id, label, icon: Icon, onClick, desc, badge }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <div 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onClick(id)}
            style={{
                background: isHovered ? '#e0f2fe' : '#fff', // Light Blue on hover
                border: '1px solid #f1f5f9',
                borderRadius: 28, 
                padding: '32px',
                marginBottom: 16, 
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isHovered ? '0 25px 50px -12px rgba(186, 230, 253, 0.4)' : '0 1px 3px rgba(0,0,0,0.02)',
                color: '#1e1b4b', // Keep text dark for readability on light blue
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Background Accent glow */}
            {isHovered && (
                <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '120px', height: '120px', background: '#0ea5e9', borderRadius: '50%', filter: 'blur(70px)', opacity: 0.15 }} />
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ 
                    width: 56, height: 56, borderRadius: 18, 
                    background: isHovered ? '#fff' : '#f8fafc',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.3s',
                    boxShadow: isHovered ? '0 4px 10px rgba(0,0,0,0.05)' : 'none'
                }}>
                    <Icon size={24} style={{ color: isHovered ? '#0ea5e9' : '#64748b' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {badge && (
                        <span style={{ background: '#0ea5e9', color: '#fff', fontSize: 10, fontWeight: 900, padding: '4px 10px', borderRadius: 8, textTransform: 'uppercase' }}>{badge}</span>
                    )}
                    <ArrowUpRight size={20} style={{ color: isHovered ? '#0ea5e9' : '#cbd5e1', opacity: isHovered ? 1 : 0.5, transition: 'all 0.3s' }} />
                </div>
            </div>
            
            <div>
                <h4 style={{ fontSize: 19, fontWeight: 800, letterSpacing: -0.4, margin: '0 0 8px' }}>{label}</h4>
                <p style={{ fontSize: 13, color: isHovered ? '#94a3b8' : '#64748b', lineHeight: 1.6, margin: 0 }}>{desc}</p>
            </div>
        </div>
    );
};


// ── Overview Component ──────────────────────────────────────────────────────
const Overview = ({ data = {}, distributors = [], superadmins = [], onNavigate }) => {
    const [animIn, setAnimIn] = useState(false);

    useEffect(() => {
        setAnimIn(true);
    }, []);

    // ── Data Processing ──────────────────────────────────────────────────────
    const retailers = data.users || [];
    const allMembers = [...retailers, ...distributors, ...superadmins];
    
    // Process chart data (last 5 days signups)
    const getSignupData = () => {
        const counts = [0, 0, 0, 0, 0];
        const now = new Date();
        allMembers.forEach(u => {
            const created = new Date(u.createdAt || u.created_at || Date.now());
            const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays < 5) {
                counts[4 - diffDays]++;
            }
        });
        return counts;
    };

    // Calculate system metrics
    const totalBalance = allMembers.reduce((acc, u) => acc + parseFloat((u.wallet?.balance || '0').toString().replace(/,/g, '')), 0);
    const pendingKycs = allMembers.filter(u => u.profile_kyc_status === 'PENDING' || u.status === 'Pending').length;
    const approvalRate = allMembers.length > 0 ? Math.round((allMembers.filter(u => u.status === 'Approved' || u.profile_kyc_status === 'DONE').length / allMembers.length) * 100) : 0;

    // Unified Modules for Grid
    const moduleGroups = [
        {
            title: 'Operations & Approvals',
            modules: [
                { id: 'Approvals', label: 'Verify KYC', icon: ShieldCheck, desc: `Approve or reject member and AEPS KYC requests.`, badge: pendingKycs > 0 ? `${pendingKycs}` : null },
                { id: 'Loans', label: 'Loan Control', icon: IndianRupee, desc: `Manage capital lending and credit line approvals.` },
                { id: 'Wallet-Overview', label: 'Cash Desk', icon: Wallet, desc: `Monitor all system floats, credits, and fund releases.` },
                { id: 'AllMembers', label: 'Member Core', icon: Users, desc: `Full directory of all Retailers and Distributors.` },
            ]
        },
        {
            title: 'System & Intelligence',
            modules: [
                { id: 'ReportsAnalyst', label: 'Analytics', icon: Activity, desc: `Deep dive into revenue and performance metrics.` },
                { id: 'Logins', label: 'Security Logs', icon: RefreshCcw, desc: `Audit trail of all administrative login attempts.` },
                { id: 'Trash', label: 'Archive/Bin', icon: Trash2, desc: `Restore or permanently delete removed accounts.` },
            ]
        },
        {
            title: 'Platform & CMS',
            modules: [
                { id: 'Landing Content', label: 'Web Editor', icon: List, desc: `Update website sections and landing page copy.` },
                { id: 'Services', icon: Package, label: 'Service Hub', desc: `Toggle and configure B2B service availability.` },
                { id: 'OurMap', icon: MapPin, label: 'Geo Mapping', desc: `Visualize member reach across the country.` },
                { id: 'Settings', icon: Settings, label: 'Master Setup', desc: `Admin credentials and system-wide configurations.` },
            ]
        }
    ];



    const cardStyle = (delay = 0) => ({
        opacity: animIn ? 1 : 0,
        transform: animIn ? 'translateY(0)' : 'translateY(15px)',
        transition: `all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`,
    });

    return (
        <div style={{
            minHeight: '100vh',
            background: '#fcfcf7', // Matches the off-white/cream background in image
            fontFamily: "'Outfit', 'Inter', sans-serif",
            color: '#18181b',
            padding: '32px 40px',
        }}>
            {/* ── Top Header ───────────────────────────────────────────── */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 48,
                ...cardStyle(0)
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#fff', padding: '14px 24px', borderRadius: 20, border: '1px solid #f1f5f9', width: '100%', maxWidth: 480, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                    <Search size={20} style={{ color: '#94a3b8' }} />
                    <input
                        placeholder="Search customer..."
                        style={{
                            border: 'none', background: 'none', outline: 'none', width: '100%',
                            fontSize: 15, fontWeight: 500, color: '#18181b'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', fontSize: 14, fontWeight: 700, color: '#18181b', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <SlidersHorizontal size={16} /> Sort by
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', fontSize: 14, fontWeight: 700, color: '#18181b', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <Filter size={16} /> Filters
                    </button>
                    <div style={{ width: 1, height: 28, background: '#e2e8f0', margin: '0 8px' }} />
                    <button style={{ display: 'flex', alignItems: 'center', gap: 10, border: 'none', background: 'none', padding: '4px 12px', borderRadius: 12, cursor: 'pointer' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            <User size={20} color="#fff" />
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#1e1b4b' }}>Account</span>
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 28px', background: '#6366f1', borderRadius: 16, border: 'none', fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer', marginLeft: 16, boxShadow: '0 10px 20px rgba(99, 102, 241, 0.2)' }}>
                        <Plus size={18} /> Add customer
                    </button>

                </div>
            </div>

            {/* ── Metrics Row ───────────────────────────────────────────── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 0.8fr 0.6fr 1.2fr',
                gap: 48,
                paddingBottom: 72,
                alignItems: 'center',
                ...cardStyle(100)
            }}>
                {/* New Customers Bar Chart */}
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700 }}>New customers</h3>
                        <div style={{ display: 'flex', gap: 4, height: 20 }}>
                             <div style={{ width: 5, height: 20, background: '#18181b', borderRadius: 2 }} />
                             <div style={{ width: 5, height: 14, background: '#e2e8f0', borderRadius: 2, marginTop: 6 }} />
                        </div>
                    </div>
                    <BarChart data={getSignupData()} height={120} />
                </div>

                {/* Successful Deals Gauge */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Gauge pct={approvalRate} size={200} label="Account Approval Rate" />
                </div>

                {/* Tasks Count */}
                <div style={{ display: 'flex', flexDirection: 'column', padding: '0 24px' }}>
                    <h2 style={{ fontSize: 64, fontWeight: 800, lineHeight: 1, marginBottom: 16 }}>{pendingKycs}</h2>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#64748b', lineHeight: 1.4 }}>Pending <br /> Tasks</p>
                </div>

                {/* Financial Metric & Trend */}
                <div style={{ flex: 1, borderLeft: '1px solid #e2e8f0', paddingLeft: 64, display: 'flex', alignItems: 'center', gap: 48 }}>
                    <div>
                        <h2 style={{ fontSize: 64, fontWeight: 800, lineHeight: 1, marginBottom: 4 }}>₹ {fmtINR(totalBalance)}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 48, marginTop: 32 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 14, background: '#fff', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                                    <ShieldCheck size={20} style={{ color: '#6366f1' }} />
                                </div>
                                <p style={{ fontSize: 14, fontWeight: 600, color: '#64748b', lineHeight: 1.4 }}>Total System <br />Float Balance</p>
                            </div>

                            <div style={{ width: 44, height: 44, borderRadius: 14, background: '#fff', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                                <ArrowRight size={20} style={{ color: '#18181b' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Action Grid ─────────────────────────── */}
            <div style={{ ...cardStyle(200) }}>
                {moduleGroups.map((group, gIdx) => (
                    <div key={group.title} style={{ marginBottom: 64 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 40 }}>
                            <h3 style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5, textTransform: 'uppercase', color: '#94a3b8' }}>{group.title}</h3>
                            <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: 32,
                        }}>
                            {group.modules.map((mod, mIdx) => (
                                <ModuleCard key={mod.id} {...mod} onClick={onNavigate} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};

// ── Small Icons ─────────────────────────────────────────────────────────────
const ChevronUpIcon = ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
);
const ChevronDownIcon = ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
);

export default Overview;
