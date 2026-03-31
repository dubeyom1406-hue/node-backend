import { useState, useEffect } from "react";
import { dashboardService } from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
const fmtD = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Card({ title, icon, accent = "#6366f1", priority, children }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
      border: `1px solid ${accent}33`, borderRadius: 14,
      padding: "18px 20px", position: "relative", overflow: "hidden",
      boxShadow: `0 4px 24px ${accent}15`,
      transition: "box-shadow 0.3s, transform 0.2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 32px ${accent}30`; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 4px 24px ${accent}15`; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg, transparent, ${accent}, transparent)` }}/>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:34, height:34, borderRadius:9, background:`${accent}22`,
            border:`1px solid ${accent}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17
          }}>{icon}</div>
          <span style={{ fontSize:14, fontWeight:700, color:"#e2e8f0" }}>{title}</span>
        </div>
        {priority && (
          <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, background:"#ef444422", color:"#f87171", border:"1px solid #ef444444" }}>
            ⚡ HIGH
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function StatRow({ label, value, accent }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
      <span style={{ fontSize:12, color:"#94a3b8" }}>{label}</span>
      <span style={{ fontSize:13, fontWeight:700, color: accent || "#e2e8f0", fontVariantNumeric:"tabular-nums" }}>{value}</span>
    </div>
  );
}

function TxnGrid({ data, accent }) {
  const fields = [
    ["Today Txn", fmt(data?.todayTxn)],
    ["Today Amount", "₹" + fmt(data?.todayAmt)],
    ["Monthly Txn", fmt(data?.monthlyTxn)],
    ["Monthly Amt", "₹" + fmt(data?.monthlyAmt)],
    ["Today Comm", "₹" + fmtD(data?.todayComm)],
    ["Monthly Comm", "₹" + fmtD(data?.monthlyComm)],
  ];
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6 }}>
      {fields.map(([label, val]) => (
        <div key={label} style={{ background:"rgba(255,255,255,0.03)", borderRadius:8, padding:"8px 6px", border:"1px solid rgba(255,255,255,0.06)", textAlign:"center" }}>
          <div style={{ fontSize:10, color:"#64748b", marginBottom:3 }}>{label}</div>
          <div style={{ fontSize:12, fontWeight:700, color: accent || "#e2e8f0", fontVariantNumeric:"tabular-nums" }}>{val}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Main DashboardCards Component ───────────────────────────────────────────
export default function DashboardCards({ territory }) {
  const { user } = useAuth();
  const effectiveTerritory = territory || user?.territory || "india";

  const [stats, setStats] = useState(null);
  const [topbar, setTopbar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      const [statsData, topbarData] = await Promise.all([
        dashboardService.getStats(effectiveTerritory),
        dashboardService.getTopBarData(),
      ]);
      setStats(statsData);
      setTopbar(topbarData);
      setLastUpdated(new Date());
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Live refresh every 15 seconds (optimized for performance)
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [effectiveTerritory]);

  // Topbar data expose karo parent ko
  useEffect(() => {
    if (topbar && window.setTopbarStats) window.setTopbarStats(topbar);
  }, [topbar]);

  if (loading) return (
    <div style={{ display:"flex", justifyContent:"center", padding:60 }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:40, height:40, borderRadius:"50%", border:"3px solid #6366f1", borderTopColor:"transparent", animation:"spin 0.8s linear infinite", margin:"0 auto 12px" }}/>
        <p style={{ color:"#475569", fontSize:13 }}>Data load ho raha hai...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const s = stats || {};

  return (
    <div style={{ animation:"fadeIn 0.4s ease" }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Last updated */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <h2 style={{ color:"#e2e8f0", fontSize:16, fontWeight:700, margin:0 }}>
          📊 Dashboard — <span style={{ color:"#6366f1" }}>{effectiveTerritory.toUpperCase()}</span>
        </h2>
        {lastUpdated && (
          <span style={{ fontSize:11, color:"#475569" }}>
            🔄 Updated: {lastUpdated.toLocaleTimeString("en-IN")}
          </span>
        )}
      </div>

      {/* Row 1: KPI Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:14 }}>
        <Card title="User Details" icon="👥" accent="#06b6d4">
          <StatRow label="Total User"    value={fmt(s.users?.total)}    accent="#06b6d4"/>
          <StatRow label="Active User"   value={fmt(s.users?.active)}   accent="#4ade80"/>
          <StatRow label="Inactive User" value={fmt(s.users?.inactive)} accent="#f87171"/>
        </Card>

        <Card title="Profile KYC" icon="🪪" accent="#8b5cf6">
          <StatRow label="KYC Done"     value={fmt(s.kyc?.done)}    accent="#4ade80"/>
          <StatRow label="KYC Not Done" value={fmt(s.kyc?.notDone)} accent="#f87171"/>
          <StatRow label="KYC Pending"  value={fmt(s.kyc?.pending)} accent="#fbbf24"/>
        </Card>



        <Card title="Wallet" icon="💰" accent="#f59e0b">
          <StatRow label="Total Wallet"   value={"₹" + fmtD(s.wallet?.total)}       accent="#f59e0b"/>
          <StatRow label="Fund Request"   value={fmt(s.wallet?.fundRequest)}          accent="#06b6d4"/>
          <StatRow label="Locked Amount"  value={"₹" + fmtD(s.wallet?.locked || 0)}  accent="#94a3b8"/>
        </Card>
      </div>

      {/* Row 2: AEPS + Payout */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
        <Card title="AEPS" icon="🏦" accent="#6366f1" priority>
          <TxnGrid data={s.aeps} accent="#818cf8"/>
        </Card>
        <Card title="Payout" icon="💸" accent="#10b981">
          <TxnGrid data={s.payout} accent="#34d399"/>
        </Card>
      </div>

      {/* Row 3: CMS + DMT */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
        <Card title="CMS" icon="⚡" accent="#f59e0b">
          <TxnGrid data={s.cms} accent="#fbbf24"/>
        </Card>
        <Card title="DMT" icon="📲" accent="#ef4444" priority>
          <TxnGrid data={s.dmt} accent="#f87171"/>
        </Card>
      </div>

      {/* Row 4: Bharat Connect + Other Service */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
        <Card title="Bharat Connect" icon="🔗" accent="#06b6d4">
          <TxnGrid data={s.bharatConnect} accent="#22d3ee"/>
        </Card>
        <Card title="Other Service" icon="🛠️" accent="#8b5cf6">
          <TxnGrid data={s.otherService} accent="#a78bfa"/>
        </Card>
      </div>
    </div>
  );
}
