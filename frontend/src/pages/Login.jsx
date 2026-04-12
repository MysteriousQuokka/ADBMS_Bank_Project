// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import API from "../services/api";

const inp = {
  width: "100%", padding: "12px 16px 12px 44px",
  background: "var(--bg3)", border: "1px solid var(--border2)",
  borderRadius: "var(--radius)", color: "var(--text)",
  fontSize: 13, fontFamily: "var(--mono)", outline: "none",
  transition: "border-color 0.2s",
};


function Input({ icon: Icon, placeholder, type = "text", value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative", marginBottom: 14 }}>
      <div style={{
        position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
        color: focused ? "var(--accent)" : "var(--text3)", transition: "color 0.2s",
      }}>
        <Icon size={15} />
      </div>
      <input
        type={type} placeholder={placeholder} value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ ...inp, borderColor: focused ? "var(--accent)" : "var(--border2)" }}
      />
    </div>
  );
}

function Login() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) { setError("Please fill all fields"); return; }
    setLoading(true); setError("");
    try {
      const res = await API.post("/auth/login", { email, password });
      
      console.log("LOGIN RESPONSE:", res.data);  // 👈 ADD THIS
      console.log("LOGIN mail and password:", email, password);  

        localStorage.setItem("user", JSON.stringify({ ...res.data, email, bank_name: res.data.bank_name }));
      
      const { role } = res.data;

      console.log("ROLE:", role);

      localStorage.setItem("user", JSON.stringify(res.data));
    //   if (role === "BANK_ADMIN")    navigate("/bank");
      if (role === "BANK_ADMIN") {
            console.log("Navigating to /bank");
            navigate("/bank", { state: { bankName: response.bank_name } });
    }
      if (role === "CENTRAL_ADMIN") navigate("/admin");
      if (role === "AUDITOR")       navigate("/auditor");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") handleLogin(); };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div className="fade-up" style={{
        width: "100%", maxWidth: 400,
        background: "var(--panel)", border: "1px solid var(--border)",
        borderRadius: 16, padding: 40, boxShadow: "var(--shadow)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Top glow */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg,transparent,rgba(59,158,255,0.5),transparent)",
        }} />

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, margin: "0 auto 16px",
            background: "linear-gradient(135deg,rgba(59,158,255,0.15),rgba(0,229,160,0.1))",
            border: "1px solid rgba(59,158,255,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 24px rgba(59,158,255,0.15)",
          }}>
            <Shield size={24} color="var(--accent)" />
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 22, fontWeight: 700, color: "var(--accent)" }}>
            FedShield
          </div>
          <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 6, letterSpacing: 1 }}>
            FEDERATED FRAUD DETECTION
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 14px", marginBottom: 16, borderRadius: 8,
            background: "rgba(255,68,102,0.08)", border: "1px solid rgba(255,68,102,0.3)",
            fontSize: 12, color: "var(--danger)", fontFamily: "var(--mono)",
          }}>
            <AlertCircle size={13} /> {error}
          </div>
        )}

        {/* Fields */}
        <Input icon={Mail}    placeholder="Email address" value={email}    onChange={e => setEmail(e.target.value)} />
        <Input icon={Lock}    placeholder="Password"      type="password"  value={password} onChange={e => setPassword(e.target.value)} onKey={handleKey} />

        {/* Login Button */}
        <button onClick={handleLogin} disabled={loading} style={{
          width: "100%", padding: "13px 0", marginTop: 8, marginBottom: 16,
          borderRadius: "var(--radius)", border: "none",
          background: loading ? "rgba(59,158,255,0.3)" : "var(--accent)",
          color: loading ? "var(--text2)" : "#000",
          fontSize: 13, fontWeight: 700, fontFamily: "var(--mono)",
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          transition: "all 0.2s",
          letterSpacing: 0.5,
        }}>
          {loading
            ? <><span style={{ width: 14, height: 14, border: "2px solid #000", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Signing in...</>
            : <><ArrowRight size={14} /> Sign In</>
          }
        </button>

        {/* Register link */}
        <div style={{ textAlign: "center", fontSize: 12, color: "var(--text2)", fontFamily: "var(--mono)" }}>
          No account?{" "}
          <span onClick={() => navigate("/register")} style={{
            color: "var(--accent)", cursor: "pointer", textDecoration: "underline",
          }}>
            Register here
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;