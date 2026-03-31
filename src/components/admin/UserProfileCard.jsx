import { useState, useEffect } from "react";
import { employeeService, locationService } from "../../services/apiService";
import PermissionEditor from "../permissions/PermissionEditor";

const ROLE_CONFIG = {
  ADMIN:    { label:"Admin",    color:"#8b5cf6", emoji:"👑" },
  NATIONAL: { label:"National", color:"#f59e0b", emoji:"🌍" },
  STATE:    { label:"State",    color:"#06b6d4", emoji:"🗺️" },
  REGIONAL: { label:"Regional", color:"#10b981", emoji:"📍" },
};

function MiniMap({ lat, lng }) {
  if (!lat || !lng) return (
    <div style={{ height:120, background:"#0f172a", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"#334155", fontSize:12 }}>
      📍 Location not available
    </div>
  );
  // OpenStreetMap embed (no API key needed)
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.05},${lat-0.05},${lng+0.05},${lat+0.05}&layer=mapnik&marker=${lat},${lng}`;
  return (
    <iframe
      src={mapUrl}
      style={{ width:"100%", height:140, borderRadius:8, border:"1px solid #1e293b" }}
      title="User Location"
    />
  );
}

export function UserProfileCard({ userId, compact = false, onEdit }) {
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [togglingStatus, setTogglingStatus] = useState(false);

  const fetchUser = async () => {
    try {
      const [userData, locData] = await Promise.all([
        employeeService.getById(userId),
        locationService.getUserLocation(userId).catch(() => null),
      ]);
      setUser(userData);
      setLocation(locData);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    const interval = setInterval(() => {
      locationService.getUserLocation(userId).then(setLocation).catch(() => {});
    }, 30000); // location refresh every 30s
    return () => clearInterval(interval);
  }, [userId]);

  const toggleStatus = async () => {
    setTogglingStatus(true);
    try {
      await employeeService.toggleStatus(userId);
      setUser(u => ({ ...u, status: u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }));
    } catch (err) { alert(err.message); }
    finally { setTogglingStatus(false); }
  };

  if (loading) return (
    <div style={{ background:"#1e293b", borderRadius:12, padding:20, textAlign:"center", color:"#475569", fontSize:13 }}>
      Loading...
    </div>
  );
  if (!user) return null;

  const roleConf = ROLE_CONFIG[user.role] || ROLE_CONFIG.REGIONAL;
  const isActive = user.status === "ACTIVE";

  return (
    <div style={{
      background:"linear-gradient(135deg,#1e293b,#0f172a)",
      border:`1px solid ${roleConf.color}33`,
      borderRadius:14, overflow:"hidden",
      boxShadow:`0 4px 20px ${roleConf.color}15`,
      fontFamily:"DM Sans, sans-serif",
      transition:"transform 0.2s",
    }}>
      {/* Top color strip */}
      <div style={{ height:3, background:`linear-gradient(90deg, ${roleConf.color}, transparent)` }}/>

      <div style={{ padding:"16px 18px" }}>
        {/* Header row */}
        <div style={{ display:"flex", gap:14, alignItems:"flex-start", marginBottom:14 }}>
          {/* Avatar */}
          <div style={{
            width:52, height:52, borderRadius:12, flexShrink:0,
            background:`${roleConf.color}20`,
            border:`2px solid ${roleConf.color}44`,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:22
          }}>
            {user.photoUrl ? <img src={user.photoUrl} style={{ width:"100%", borderRadius:10 }} alt=""/> : roleConf.emoji}
          </div>

          {/* Name + Role */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:14, fontWeight:700, color:"#e2e8f0", marginBottom:3 }}>{user.fullName}</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              <span style={{
                fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20,
                background:`${roleConf.color}20`, color:roleConf.color,
                border:`1px solid ${roleConf.color}44`
              }}>{roleConf.label} Header</span>
              <span style={{
                fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20,
                background: isActive ? "#10b98120" : "#ef444420",
                color: isActive ? "#4ade80" : "#f87171",
                border: `1px solid ${isActive ? "#10b98140" : "#ef444440"}`
              }}>{isActive ? "● Active" : "● Inactive"}</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display:"flex", gap:6 }}>
            <button
              onClick={toggleStatus}
              disabled={togglingStatus}
              title={isActive ? "Deactivate" : "Activate"}
              style={{
                width:30, height:30, borderRadius:8, cursor:"pointer",
                background: isActive ? "#ef444420" : "#10b98120",
                border:`1px solid ${isActive ? "#ef444440" : "#10b98140"}`,
                color: isActive ? "#f87171" : "#4ade80", fontSize:14
              }}>
              {isActive ? "🚫" : "✅"}
            </button>
            {onEdit && (
              <button onClick={() => onEdit(user)} title="Edit" style={{
                width:30, height:30, borderRadius:8, cursor:"pointer",
                background:"#6366f120", border:"1px solid #6366f140", color:"#818cf8", fontSize:14
              }}>✏️</button>
            )}
            <button onClick={() => setExpanded(!expanded)} title="Details" style={{
              width:30, height:30, borderRadius:8, cursor:"pointer",
              background:"#1e293b", border:"1px solid #334155", color:"#94a3b8", fontSize:12
            }}>{expanded ? "▲" : "▼"}</button>
          </div>
        </div>

        {/* Quick info */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:12 }}>
          {[
            { icon:"📍", val:user.territory },
            { icon:"📞", val:user.phone || "—" },
            { icon:"✉️", val:user.email || "—" },
            { icon:"🕐", val:user.lastLogin ? new Date(user.lastLogin).toLocaleString("en-IN") : "Never" },
          ].map(({ icon, val }) => (
            <div key={icon} style={{ display:"flex", gap:6, alignItems:"center" }}>
              <span style={{ fontSize:12 }}>{icon}</span>
              <span style={{ fontSize:11, color:"#64748b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{val}</span>
            </div>
          ))}
        </div>

        {/* Stats mini */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6, marginBottom:expanded ? 14 : 0 }}>
          {[
            { label:"Total Users",    val:user.totalUsers || 0,    color:roleConf.color },
            { label:"Total Txns",     val:user.totalTxns || 0,     color:"#10b981" },
            { label:"Network Wallet", val:"₹" + (user.networkWallet || 0).toLocaleString("en-IN"), color:"#f59e0b" },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ background:"rgba(255,255,255,0.03)", borderRadius:8, padding:"8px 10px", textAlign:"center" }}>
              <div style={{ fontSize:12, fontWeight:700, color }}>{val}</div>
              <div style={{ fontSize:10, color:"#475569", marginTop:2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div style={{ borderTop:"1px solid #1e293b", paddingTop:14, marginTop:4 }}>
            {/* Address */}
            {user.address && (
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:11, color:"#475569", marginBottom:4 }}>📍 Address</div>
                <div style={{ fontSize:12, color:"#94a3b8" }}>{user.address}</div>
              </div>
            )}

            {/* Live Location Map */}
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11, color:"#475569", marginBottom:6 }}>
                🗺️ Live Location
                {location && <span style={{ color:"#4ade80", marginLeft:6 }}>● Live</span>}
              </div>
              <MiniMap lat={location?.latitude} lng={location?.longitude}/>
              {location && (
                <div style={{ fontSize:10, color:"#334155", marginTop:4 }}>
                  {location.latitude?.toFixed(4)}, {location.longitude?.toFixed(4)} · {location.timestamp ? new Date(location.timestamp).toLocaleTimeString("en-IN") : ""}
                </div>
              )}
            </div>

            {/* Permissions (readonly view) */}
            <div>
              <div style={{ fontSize:11, color:"#475569", marginBottom:8 }}>🔐 Permissions</div>
              <PermissionEditor userId={userId} readonly/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ManageHeaders — list of all header users ─────────────────────────────────
export function ManageHeaders() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState("ALL");

  const fetchEmployees = async () => {
    try {
      const data = await employeeService.getAll();
      setEmployees(data || []);
    } catch (err) { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const filtered = filter === "ALL" ? employees : employees.filter(e => e.role === filter);

  return (
    <div style={{ fontFamily:"DM Sans, sans-serif" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h2 style={{ color:"#e2e8f0", fontSize:18, fontWeight:800, margin:0 }}>
          👔 Manage Header Users
        </h2>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            padding:"9px 18px", background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
            border:"none", borderRadius:9, color:"white", cursor:"pointer",
            fontFamily:"DM Sans", fontSize:13, fontWeight:700
          }}>
          ➕ Add New
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {[
          { val:"ALL",      label:"All",      color:"#6366f1" },
          { val:"NATIONAL", label:"National", color:"#f59e0b" },
          { val:"STATE",    label:"State",    color:"#06b6d4" },
          { val:"REGIONAL", label:"Regional", color:"#10b981" },
        ].map(({ val, label, color }) => (
          <button key={val} onClick={() => setFilter(val)} style={{
            padding:"6px 14px", borderRadius:8, cursor:"pointer", fontFamily:"DM Sans",
            fontSize:12, fontWeight:600, border:`1px solid ${filter === val ? color : "#1e293b"}`,
            background: filter === val ? `${color}20` : "transparent",
            color: filter === val ? color : "#475569", transition:"all 0.15s"
          }}>{label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:"center", padding:40, color:"#475569" }}>Loading...</div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(380px,1fr))", gap:16 }}>
          {filtered.map(emp => (
            <UserProfileCard key={emp.id} userId={emp.id} onEdit={() => {}}/>
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn:"1/-1", textAlign:"center", padding:60, color:"#334155" }}>
              Koi {filter !== "ALL" ? filter.toLowerCase() : ""} header user nahi mila
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,0.7)",
          display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:20
        }}>
          <div style={{ width:"100%", maxWidth:660 }}>
            <CreateHeaderForm
              onSuccess={() => { setShowCreate(false); fetchEmployees(); }}
              onCancel={() => setShowCreate(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Need to import this at the top of the file
import CreateHeaderForm from "./CreateHeaderForm";
