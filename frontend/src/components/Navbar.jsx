// src/components/Navbar.jsx
import { useNavigate } from "react-router-dom";
import { LogOut, Shield, User } from "lucide-react";

const roleColors = {
  BANK_ADMIN:    { color: "#3b9eff", bg: "rgba(59,158,255,0.1)", label: "Bank Admin" },
  CENTRAL_ADMIN: { color: "#00e5a0", bg: "rgba(0,229,160,0.1)", label: "Central Admin" },
  AUDITOR:       { color: "#ffaa00", bg: "rgba(255,170,0,0.1)",  label: "Auditor" },
};

function Navbar() {
  const navigate  = useNavigate();
  const user      = JSON.parse(localStorage.getItem("user") || "{}");
  const roleStyle = roleColors[user?.role] || { color: "#6a8caa", bg: "rgba(106,140,170,0.1)", label: user?.role };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      display: "flex", alignItems: "center", gap: 16,
      padding: "0 24px", height: 60,
      background: "rgba(7,9,15,0.85)",
      borderBottom: "1px solid var(--border)",
      backdropFilter: "blur(12px)",
      fontFamily: "var(--mono)",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "linear-gradient(135deg,rgba(59,158,255,0.2),rgba(0,229,160,0.15))",
          border: "1px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 12px rgba(59,158,255,0.2)",
        }}>
          <Shield size={16} color="var(--accent)" />
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--accent)", letterSpacing: 1 }}>
          FedShield
        </span>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Role Badge */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "6px 12px", borderRadius: 6,
        background: roleStyle.bg, border: `1px solid ${roleStyle.color}44`,
        fontSize: 11, letterSpacing: 1,
      }}>
        <User size={12} color={roleStyle.color} />
        <span style={{ color: roleStyle.color, fontWeight: 600, textTransform: "uppercase" }}>
          {roleStyle.label}
        </span>
      </div>

      {/* Email */}
      <span style={{ fontSize: 12, color: "var(--text2)" }}>
        {user?.email || ""}
      </span>

      {/* Logout */}
      <button onClick={handleLogout} style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "7px 14px", borderRadius: 6, border: "1px solid var(--border2)",
        background: "transparent", color: "var(--text2)",
        fontSize: 12, cursor: "pointer", fontFamily: "var(--mono)",
        transition: "all 0.2s",
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--danger)"; e.currentTarget.style.color = "var(--danger)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--text2)"; }}
      >
        <LogOut size={13} /> Logout
      </button>
    </nav>
  );
}

export default Navbar;