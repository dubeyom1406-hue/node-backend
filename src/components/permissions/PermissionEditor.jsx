import { useState, useEffect } from "react";
import { PERMISSIONS } from "../../context/PermissionContext";
import { permissionService } from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";

export default function PermissionEditor({ userId, onSave, readonly = false }) {
  const { user: currentUser } = useAuth();
  // perms = { "MEMBERS.ADD_MEMBER": true, "KYC.AEPS_KYC": false, ... }
  const [perms, setPerms] = useState({});
  const [originalPerms, setOriginalPerms] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!userId) return;
    permissionService.getByUserId(userId).then((data) => {
      // data = [{ module: "MEMBERS", action: "ADD_MEMBER", allowed: true }, ...]
      const mapped = {};
      (data || []).forEach((p) => {
        mapped[`${p.module}.${p.action}`] = p.allowed;
      });
      setPerms(mapped);
      setOriginalPerms(mapped);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [userId]);

  const toggle = (key) => {
    if (readonly) return;
    setPerms((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  // "Check All" for a module
  const toggleAll = (moduleKey) => {
    if (readonly) return;
    const actions = Object.keys(PERMISSIONS[moduleKey].actions);
    const allKeys = actions.map((a) => `${moduleKey}.${a}`);
    const allChecked = allKeys.every((k) => perms[k]);
    const updated = { ...perms };
    allKeys.forEach((k) => { updated[k] = !allChecked; });
    setPerms(updated);
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Convert back to array format for API
      const permArray = Object.entries(perms).map(([key, allowed]) => {
        const [module, ...actionParts] = key.split(".");
        return { module, action: actionParts.join("."), allowed };
      });
      await permissionService.update(userId, permArray);
      setOriginalPerms(perms);
      setSaved(true);
      if (onSave) onSave(permArray);
    } catch (err) {
      alert("Save failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = JSON.stringify(perms) !== JSON.stringify(originalPerms);

  if (loading) return (
    <div style={{ padding:40, textAlign:"center", color:"#475569" }}>Loading permissions...</div>
  );

  return (
    <div style={{ fontFamily:"DM Sans, sans-serif" }}>
      {Object.entries(PERMISSIONS).map(([moduleKey, moduleData]) => {
        const actions = Object.entries(moduleData.actions).filter(([a]) => a !== "CHECK_ALL");
        const allActionKeys = actions.map(([a]) => `${moduleKey}.${a}`);
        const allChecked = allActionKeys.every((k) => perms[k]);
        const someChecked = allActionKeys.some((k) => perms[k]);

        return (
          <div key={moduleKey} style={{
            background:"rgba(255,255,255,0.02)",
            border:"1px solid #1e293b",
            borderRadius:12, padding:"16px 20px", marginBottom:12
          }}>
            {/* Module Header */}
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <label style={{
                display:"flex", alignItems:"center", gap:8,
                cursor: readonly ? "default" : "pointer"
              }}>
                <input
                  type="checkbox"
                  checked={allChecked}
                  ref={el => { if (el) el.indeterminate = !allChecked && someChecked; }}
                  onChange={() => toggleAll(moduleKey)}
                  disabled={readonly}
                  style={{ width:16, height:16, accentColor:"#6366f1" }}
                />
                <span style={{ fontSize:12, fontWeight:700, color:"#94a3b8", letterSpacing:1, textTransform:"uppercase" }}>
                  {moduleData.label}
                </span>
              </label>
            </div>

            {/* Actions */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
              {actions.map(([actionKey, actionLabel]) => {
                const key = `${moduleKey}.${actionKey}`;
                const checked = !!perms[key];
                return (
                  <label key={actionKey} style={{
                    display:"flex", alignItems:"center", gap:6,
                    cursor: readonly ? "default" : "pointer",
                    background: checked ? "#6366f115" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${checked ? "#6366f140" : "#1e293b"}`,
                    borderRadius:8, padding:"6px 12px",
                    transition:"all 0.15s"
                  }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(key)}
                      disabled={readonly}
                      style={{ width:13, height:13, accentColor:"#6366f1" }}
                    />
                    <span style={{ fontSize:12, color: checked ? "#a5b4fc" : "#64748b", fontWeight: checked ? 600 : 400 }}>
                      {actionLabel}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Save Button */}
      {!readonly && (
        <div style={{ display:"flex", justifyContent:"flex-end", gap:12, marginTop:20 }}>
          <button
            onClick={() => { setPerms(originalPerms); setSaved(false); }}
            style={{
              padding:"10px 20px", background:"transparent",
              border:"1px solid #334155", borderRadius:8,
              color:"#64748b", cursor:"pointer", fontFamily:"DM Sans", fontSize:13
            }}
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            style={{
              padding:"10px 24px",
              background: hasChanges ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#1e293b",
              border:"none", borderRadius:8,
              color: hasChanges ? "white" : "#475569",
              cursor: hasChanges ? "pointer" : "not-allowed",
              fontFamily:"DM Sans", fontSize:13, fontWeight:700,
              transition:"all 0.2s"
            }}
          >
            {saving ? "Saving..." : saved ? "✅ Saved!" : "Save Permissions"}
          </button>
        </div>
      )}
    </div>
  );
}
