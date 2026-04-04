// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, Briefcase, Building2, AlertCircle, CheckCircle } from "lucide-react";
import API from "../services/api";

const inp = {
  width: "100%", padding: "12px 16px 12px 44px",
  background: "var(--bg3)", border: "1px solid var(--border2)",
  borderRadius: "var(--radius)", color: "var(--text)",
  fontSize: 13, fontFamily: "var(--mono)", outline: "none",
  transition: "border-color 0.2s",
};

const ROLES = [
  { value: "BANK_ADMIN",    label: "Bank Admin",    desc: "Manage local training & uploads" },
  { value: "CENTRAL_ADMIN", label: "Central Admin", desc: "Approve updates, manage global model" },
  { value: "AUDITOR",       label: "Auditor",       desc: "Read-only audit log access" },
];

function Register() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [role,     setRole]     = useState("");
  const [bankName, setBankName] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!email || !password || !role) { setError("Please fill all fields"); return; }
    if (role === "BANK_ADMIN" && !bankName) { setError("Bank name is required for Bank Admin"); return; }
    setLoading(true); setError("");
    try {
      const res = await API.post("/auth/register", {
        email, password, role,
        bank_name: role === "BANK_ADMIN" ? bankName : null,
      });
      if (res.data.error) { setError(res.data.error); return; }
      alert("✅ Registered successfully. Please login.");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="fade-up" style={{
        width: "100%", maxWidth: 440,
        background: "var(--panel)", border: "1px solid var(--border)",
        borderRadius: 16, padding: 40, boxShadow: "var(--shadow)", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(0,229,160,0.5),transparent)" }} />

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, margin: "0 auto 14px",
            background: "rgba(0,229,160,0.1)", border: "1px solid rgba(0,229,160,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 24px rgba(0,229,160,0.1)",
          }}>
            <Shield size={22} color="var(--accent2)" />
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 20, fontWeight: 700, color: "var(--accent2)" }}>Create Account</div>
          <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 6, letterSpacing: 1 }}>FEDSHIELD PORTAL</div>
        </div>

        {error && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", marginBottom: 16,
            borderRadius: 8, background: "rgba(255,68,102,0.08)", border: "1px solid rgba(255,68,102,0.3)",
            fontSize: 12, color: "var(--danger)", fontFamily: "var(--mono)",
          }}>
            <AlertCircle size={13} /> {error}
          </div>
        )}

        {/* Email */}
        <div style={{ position: "relative", marginBottom: 14 }}>
          <Mail size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text3)" }} />
          <input placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} style={inp} />
        </div>

        {/* Password */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <Lock size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text3)" }} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={inp} />
        </div>

        {/* Role Selector */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontFamily: "var(--mono)", color: "var(--text3)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>
            Select Role
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ROLES.map(r => (
              <div key={r.value} onClick={() => setRole(r.value)} style={{
                padding: "12px 16px", borderRadius: "var(--radius)", cursor: "pointer",
                border: `1px solid ${role === r.value ? "var(--accent)" : "var(--border2)"}`,
                background: role === r.value ? "rgba(59,158,255,0.08)" : "var(--bg3)",
                transition: "all 0.18s",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <div style={{ fontSize: 13, fontFamily: "var(--mono)", fontWeight: 600, color: role === r.value ? "var(--accent)" : "var(--text)" }}>
                    {r.label}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 3 }}>{r.desc}</div>
                </div>
                {role === r.value && <CheckCircle size={16} color="var(--accent)" />}
              </div>
            ))}
          </div>
        </div>

        {/* Bank name (conditional) */}
        {role === "BANK_ADMIN" && (
          <div style={{ position: "relative", marginBottom: 16 }}>
            <Building2 size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text3)" }} />
            <input placeholder="Bank Name (e.g. Alpha, Beta)" value={bankName} onChange={e => setBankName(e.target.value)} style={inp} />
          </div>
        )}

        {/* Submit */}
        <button onClick={handleRegister} disabled={loading} style={{
          width: "100%", padding: "13px 0", marginTop: 8, marginBottom: 16,
          borderRadius: "var(--radius)", border: "none",
          background: loading ? "rgba(0,229,160,0.2)" : "var(--accent2)",
          color: "#000", fontSize: 13, fontWeight: 700, fontFamily: "var(--mono)",
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          transition: "all 0.2s",
        }}>
          {loading
            ? <><span style={{ width: 14, height: 14, border: "2px solid #000", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Creating...</>
            : "Create Account"
          }
        </button>

        <div style={{ textAlign: "center", fontSize: 12, color: "var(--text2)", fontFamily: "var(--mono)" }}>
          Already have an account?{" "}
          <span onClick={() => navigate("/")} style={{ color: "var(--accent2)", cursor: "pointer", textDecoration: "underline" }}>
            Sign in
          </span>
        </div>
      </div>
    </div>
  );
}

export default Register;