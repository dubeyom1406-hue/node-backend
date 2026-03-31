import { useState } from "react";
import { employeeService } from "../../services/apiService";
import PermissionEditor from "../permissions/PermissionEditor";

const INDIA_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Delhi","Jammu & Kashmir","Ladakh","Puducherry"
];

export default function CreateHeaderForm({ onSuccess, onCancel }) {
  const [step, setStep] = useState(1); // 1=Basic Info, 2=Permissions
  const [createdUserId, setCreatedUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    username: "", password: "", confirmPassword: "",
    fullName: "", phone: "", email: "", address: "",
    role: "STATE", territory: "",
    photo: null,
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleStep1 = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords match nahi kar rahe!"); return;
    }
    if (!form.username || !form.password || !form.fullName || !form.territory) {
      setError("Sab required fields bharo"); return;
    }
    setLoading(true);
    try {
      const res = await employeeService.create({
        username: form.username, password: form.password,
        fullName: form.fullName, phone: form.phone,
        email: form.email, address: form.address,
        role: form.role, territory: form.territory,
      });
      setCreatedUserId(res.id || res.userId);
      setStep(2);
    } catch (err) {
      setError(err.message || "Create failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width:"100%", padding:"10px 14px", background:"#0f172a",
    border:"1px solid #1e293b", borderRadius:8, color:"#e2e8f0",
    fontSize:13, fontFamily:"DM Sans", outline:"none", boxSizing:"border-box",
    transition:"border-color 0.2s"
  };

  const labelStyle = {
    display:"block", color:"#94a3b8", fontSize:11,
    fontWeight:600, marginBottom:5, letterSpacing:0.5
  };

  return (
    <div style={{
      background:"#0a0f1e", border:"1px solid #1e293b", borderRadius:16,
      padding:"28px 24px", maxWidth:640, width:"100%",
      fontFamily:"DM Sans, sans-serif", maxHeight:"85vh", overflowY:"auto"
    }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h2 style={{ color:"#e2e8f0", fontSize:18, fontWeight:800, margin:0 }}>
            ➕ New Header User
          </h2>
          <p style={{ color:"#475569", fontSize:12, margin:"4px 0 0" }}>
            Step {step}/2 — {step === 1 ? "Basic Information" : "Set Permissions"}
          </p>
        </div>
        {/* Step indicator */}
        <div style={{ display:"flex", gap:6 }}>
          {[1,2].map(s => (
            <div key={s} style={{
              width:32, height:4, borderRadius:4,
              background: step >= s ? "#6366f1" : "#1e293b"
            }}/>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ background:"#ef444415", border:"1px solid #ef444440", borderRadius:8, padding:"10px 14px", marginBottom:16, color:"#f87171", fontSize:13 }}>
          ⚠️ {error}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleStep1}>
          {/* Role selector */}
          <div style={{ marginBottom:16 }}>
            <label style={labelStyle}>ROLE *</label>
            <div style={{ display:"flex", gap:10 }}>
              {[
                { val:"NATIONAL", label:"🌍 National", color:"#f59e0b" },
                { val:"STATE",    label:"🗺️ State",    color:"#06b6d4" },
                { val:"REGIONAL", label:"📍 Regional", color:"#10b981" },
              ].map(({ val, label, color }) => (
                <button key={val} type="button"
                  onClick={() => set("role", val)}
                  style={{
                    flex:1, padding:"10px 0", borderRadius:8, cursor:"pointer",
                    background: form.role === val ? `${color}20` : "#0f172a",
                    border: `1px solid ${form.role === val ? color : "#1e293b"}`,
                    color: form.role === val ? color : "#475569",
                    fontSize:12, fontWeight:700, fontFamily:"DM Sans",
                    transition:"all 0.15s"
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Username + Password */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
            <div>
              <label style={labelStyle}>USERNAME *</label>
              <input style={inputStyle} placeholder="username" value={form.username} onChange={e => set("username", e.target.value)} required/>
            </div>
            <div>
              <label style={labelStyle}>FULL NAME *</label>
              <input style={inputStyle} placeholder="Pura naam" value={form.fullName} onChange={e => set("fullName", e.target.value)} required/>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
            <div>
              <label style={labelStyle}>PASSWORD *</label>
              <input style={inputStyle} type="password" placeholder="Password" value={form.password} onChange={e => set("password", e.target.value)} required/>
            </div>
            <div>
              <label style={labelStyle}>CONFIRM PASSWORD *</label>
              <input style={inputStyle} type="password" placeholder="Confirm" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} required/>
            </div>
          </div>

          {/* Phone + Email */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
            <div>
              <label style={labelStyle}>PHONE</label>
              <input style={inputStyle} placeholder="9876543210" value={form.phone} onChange={e => set("phone", e.target.value)}/>
            </div>
            <div>
              <label style={labelStyle}>EMAIL</label>
              <input style={inputStyle} type="email" placeholder="email@example.com" value={form.email} onChange={e => set("email", e.target.value)}/>
            </div>
          </div>

          {/* Territory */}
          <div style={{ marginBottom:12 }}>
            <label style={labelStyle}>
              {form.role === "NATIONAL" ? "TERRITORY" : form.role === "STATE" ? "STATE *" : "REGION/CITY *"}
            </label>
            {form.role === "STATE" ? (
              <select
                style={{ ...inputStyle }}
                value={form.territory}
                onChange={e => set("territory", e.target.value)}
                required
              >
                <option value="">-- State chunein --</option>
                {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            ) : (
              <input
                style={inputStyle}
                placeholder={form.role === "NATIONAL" ? "India" : "City ya Region"}
                value={form.territory}
                onChange={e => set("territory", e.target.value)}
                required={form.role !== "NATIONAL"}
              />
            )}
          </div>

          {/* Address */}
          <div style={{ marginBottom:20 }}>
            <label style={labelStyle}>ADDRESS</label>
            <textarea
              style={{ ...inputStyle, minHeight:60, resize:"vertical" }}
              placeholder="Pura address"
              value={form.address}
              onChange={e => set("address", e.target.value)}
            />
          </div>

          <div style={{ display:"flex", gap:12 }}>
            <button type="button" onClick={onCancel} style={{
              flex:1, padding:"11px", background:"transparent",
              border:"1px solid #334155", borderRadius:8,
              color:"#64748b", cursor:"pointer", fontFamily:"DM Sans", fontSize:13
            }}>Cancel</button>
            <button type="submit" disabled={loading} style={{
              flex:2, padding:"11px",
              background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
              border:"none", borderRadius:8, color:"white",
              cursor:"pointer", fontFamily:"DM Sans", fontSize:13, fontWeight:700
            }}>
              {loading ? "Creating..." : "Next: Set Permissions →"}
            </button>
          </div>
        </form>
      )}

      {step === 2 && createdUserId && (
        <div>
          <div style={{ background:"#10b98115", border:"1px solid #10b98130", borderRadius:8, padding:"10px 14px", marginBottom:20, color:"#34d399", fontSize:13 }}>
            ✅ User create ho gaya! Ab permissions set karo.
          </div>
          <PermissionEditor userId={createdUserId} onSave={() => { if (onSuccess) onSuccess(); }}/>
          <div style={{ display:"flex", gap:12, marginTop:16 }}>
            <button onClick={onCancel} style={{
              padding:"11px 24px", background:"transparent",
              border:"1px solid #334155", borderRadius:8,
              color:"#64748b", cursor:"pointer", fontFamily:"DM Sans", fontSize:13
            }}>Skip & Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
