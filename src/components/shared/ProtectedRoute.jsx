import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
// Sirf logged-in users access kar sakte hain
// allowedRoles = ["ADMIN", "NATIONAL", "STATE", "REGIONAL"]
export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#020817",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            border: "3px solid #6366f1",
            borderTopColor: "transparent",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px"
          }} />
          <p style={{ color: "#475569", fontFamily: "DM Sans" }}>Loading...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

// ─── PermissionGate ───────────────────────────────────────────────────────────
// Component ko sirf tab dikhao jab permission ho
// Usage: <PermissionGate module="WALLET" action="CREDIT_FUND"> ... </PermissionGate>
export function PermissionGate({ module, action, children, fallback = null }) {
  const { hasPermission } = useAuth();
  if (!hasPermission(module, action)) return fallback;
  return children;
}

// ─── RoleGate ─────────────────────────────────────────────────────────────────
// Sirf specific roles ke liye dikhao
// Usage: <RoleGate roles={["ADMIN"]}> ... </RoleGate>
export function RoleGate({ roles, children, fallback = null }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) return fallback;
  return children;
}

// ─── Unauthorized Page ────────────────────────────────────────────────────────
export function UnauthorizedPage() {
  return (
    <div style={{
      minHeight: "100vh", background: "#020817",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "DM Sans"
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🚫</div>
        <h1 style={{ color: "#e2e8f0", fontSize: 28, marginBottom: 8 }}>Access Denied</h1>
        <p style={{ color: "#475569", marginBottom: 24 }}>
          Aapke paas is page ka access nahi hai.
        </p>
        <a href="/dashboard" style={{
          background: "#6366f1", color: "white", padding: "10px 24px",
          borderRadius: 8, textDecoration: "none", fontWeight: 600
        }}>
          Dashboard pe Jao
        </a>
      </div>
    </div>
  );
}
