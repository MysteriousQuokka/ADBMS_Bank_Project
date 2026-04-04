// src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, TrendingUp, Zap, Users, RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Navbar from "../components/Navbar";
import API from "../services/api";

const card = {
  background: "var(--panel)", border: "1px solid var(--border)",
  borderRadius: "var(--radius)", padding: 20, position: "relative", overflow: "hidden",
};

const cardTop = (color = "rgba(59,158,255,0.3)") => ({
  position: "absolute", top: 0, left: 0, right: 0, height: 1,
  background: `linear-gradient(90deg,transparent,${color},transparent)`,
});

const accuracyData = [
  { round: "R20", fed: 94.2, bankA: 91.0, bankB: 88.1 },
  { round: "R22", fed: 95.1, bankA: 91.5, bankB: 88.9 },
  { round: "R24", fed: 96.2, bankA: 92.2, bankB: 89.8 },
  { round: "R26", fed: 97.1, bankA: 93.0, bankB: 91.0 },
  { round: "R27", fed: 97.2, bankA: 93.5, bankB: 91.5 },
  { round: "R28", fed: 97.8, bankA: 94.4, bankB: 92.1 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--panel)", border: "1px solid var(--border2)",
      borderRadius: 8, padding: "10px 14px", fontFamily: "var(--mono)", fontSize: 11,
    }}>
      <div style={{ color: "var(--text2)", marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, marginBottom: 3 }}>
          {p.name}: <strong>{p.value}%</strong>
        </div>
      ))}
    </div>
  );
};

function AdminDashboard() {
  const [updates,   setUpdates]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [actionId,  setActionId]  = useState(null);

  const fetchUpdates = async () => {
    setLoading(true);
    try {
      const res = await API.get("/updates");
      setUpdates(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUpdates(); }, []);

  const handleApprove = async (id) => {
    setActionId(id);
    try {
      await API.post(`/updates/${id}/approve`);
      setUpdates(prev => prev.map(u => u.id === id ? { ...u, status: "approved" } : u));
    } catch (err) {
      alert(err.response?.data?.detail || "Approval failed");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id) => {
    setActionId(id);
    try {
      await API.post(`/updates/${id}/reject`);
      setUpdates(prev => prev.map(u => u.id === id ? { ...u, status: "rejected" } : u));
    } catch (err) {
      alert(err.response?.data?.detail || "Rejection failed");
    } finally {
      setActionId(null);
    }
  };

  const pending  = updates.filter(u => !u.status || u.status === "pending").length;
  const approved = updates.filter(u => u.status === "approved").length;
  const rejected = updates.filter(u => u.status === "rejected").length;

  const statusPill = (status) => {
    const map = {
      approved: { color: "var(--accent2)", bg: "rgba(0,229,160,0.1)", border: "rgba(0,229,160,0.3)", label: "Approved" },
      rejected: { color: "var(--danger)",  bg: "rgba(255,68,102,0.1)",  border: "rgba(255,68,102,0.3)", label: "Rejected" },
      pending:  { color: "var(--warn)",    bg: "rgba(255,170,0,0.1)",    border: "rgba(255,170,0,0.3)", label: "Pending" },
    };
    const s = map[status] || map.pending;
    return (
      <span style={{
        padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 600, textTransform: "uppercase",
        background: s.bg, color: s.color, border: `1px solid ${s.border}`,
        fontFamily: "var(--mono)",
      }}>{s.label}</span>
    );
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>

        {/* Header */}
        <div className="fade-up" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--mono)", color: "var(--accent2)" }}>⚡ Central Admin</div>
            <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 6 }}>Approve model updates · Manage global model · Monitor federation</div>
          </div>
          <button onClick={fetchUpdates} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
            borderRadius: "var(--radius)", border: "1px solid var(--border2)",
            background: "transparent", color: "var(--text2)", fontSize: 12, fontFamily: "var(--mono)", cursor: "pointer",
          }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Total Updates", value: updates.length, color: "var(--text)",    icon: <Users size={16} color="var(--text3)" /> },
            { label: "Pending",       value: pending,         color: "var(--warn)",    icon: <Clock size={16} color="var(--warn)" /> },
            { label: "Approved",      value: approved,        color: "var(--accent2)", icon: <CheckCircle size={16} color="var(--accent2)" /> },
            { label: "Rejected",      value: rejected,        color: "var(--danger)",  icon: <XCircle size={16} color="var(--danger)" /> },
            { label: "Global Accuracy", value: "97.8%",       color: "var(--accent)",  icon: <TrendingUp size={16} color="var(--accent)" /> },
          ].map((s, i) => (
            <div key={i} style={{ ...card }} className={`fade-up-${i + 1}`}>
              <div style={cardTop()} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontSize: 10, fontFamily: "var(--mono)", color: "var(--text3)", textTransform: "uppercase", letterSpacing: 1.5 }}>{s.label}</div>
                {s.icon}
              </div>
              <div style={{ fontSize: 28, fontFamily: "var(--mono)", fontWeight: 700, color: s.color, marginTop: 8 }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20, marginBottom: 20 }}>

          {/* Updates Table */}
          <div style={{ ...card }} className="fade-up-1">
            <div style={cardTop()} />
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <Zap size={18} color="var(--accent)" />
              <span style={{ fontFamily: "var(--mono)", fontWeight: 600, fontSize: 14 }}>Model Update Approvals</span>
              {pending > 0 && (
                <span style={{ marginLeft: "auto", background: "var(--danger)", color: "#fff", fontSize: 10, padding: "2px 8px", borderRadius: 20, fontFamily: "var(--mono)" }}>{pending} pending</span>
              )}
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ width: 24, height: 24, border: "2px solid var(--border2)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 12px" }} />
                <div style={{ fontSize: 12, color: "var(--text3)", fontFamily: "var(--mono)" }}>Loading updates...</div>
              </div>
            ) : updates.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text3)", fontFamily: "var(--mono)", fontSize: 12 }}>No updates found</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {updates.map(u => (
                  <div key={u.id} style={{
                    padding: "14px 16px", borderRadius: "var(--radius)",
                    background: "var(--bg3)", border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", gap: 14,
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                        {u.version || `Update #${u.id}`}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 3 }}>
                        {u.bank_name || u.bank_id || "Bank"} · {u.created_at ? new Date(u.created_at).toLocaleString() : "—"}
                      </div>
                    </div>
                    {statusPill(u.status || "pending")}
                    {(!u.status || u.status === "pending") && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => handleApprove(u.id)} disabled={actionId === u.id} style={{
                          padding: "6px 14px", borderRadius: 6, border: "1px solid rgba(0,229,160,0.4)",
                          background: "rgba(0,229,160,0.08)", color: "var(--accent2)",
                          fontSize: 11, fontFamily: "var(--mono)", fontWeight: 600, cursor: "pointer",
                        }}>Approve</button>
                        <button onClick={() => handleReject(u.id)} disabled={actionId === u.id} style={{
                          padding: "6px 14px", borderRadius: 6, border: "1px solid rgba(255,68,102,0.3)",
                          background: "rgba(255,68,102,0.06)", color: "var(--danger)",
                          fontSize: 11, fontFamily: "var(--mono)", fontWeight: 600, cursor: "pointer",
                        }}>Reject</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Accuracy Chart */}
          <div style={{ ...card }} className="fade-up-2">
            <div style={cardTop("rgba(0,229,160,0.3)")} />
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <TrendingUp size={18} color="var(--accent2)" />
              <span style={{ fontFamily: "var(--mono)", fontWeight: 600, fontSize: 14 }}>Federated vs Single-Bank</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,40,64,0.8)" />
                <XAxis dataKey="round" tick={{ fill: "var(--text2)", fontSize: 10, fontFamily: "var(--mono)" }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
                <YAxis domain={[87, 100]} tick={{ fill: "var(--text2)", fontSize: 10, fontFamily: "var(--mono)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="fed"   name="Global (Fed)" stroke="#3b9eff" strokeWidth={2.5} dot={{ fill: "#3b9eff", r: 3 }} />
                <Line type="monotone" dataKey="bankA" name="Bank Alpha"   stroke="#00e5a0" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                <Line type="monotone" dataKey="bankB" name="Bank Beta"    stroke="#ffaa00" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 14, marginTop: 12, flexWrap: "wrap" }}>
              {[["Global (Fed)", "#3b9eff"], ["Bank Alpha", "#00e5a0"], ["Bank Beta", "#ffaa00"]].map(([l, c]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontFamily: "var(--mono)", color: "var(--text2)" }}>
                  <div style={{ width: 12, height: 2, background: c, borderRadius: 1 }} /> {l}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;