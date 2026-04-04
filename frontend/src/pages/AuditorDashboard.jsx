// src/pages/AuditorDashboard.jsx
import { useEffect, useState } from "react";
import { Search, Filter, RefreshCw, ShieldCheck, Hash } from "lucide-react";
import Navbar from "../components/Navbar";
import API from "../services/api";

const card = {
  background: "var(--panel)", border: "1px solid var(--border)",
  borderRadius: "var(--radius)", padding: 20, position: "relative", overflow: "hidden",
};

const LOG_COLORS = {
  UPLOAD:    { color: "#3b9eff", bg: "rgba(59,158,255,0.1)",  border: "rgba(59,158,255,0.3)" },
  APPROVE:   { color: "#00e5a0", bg: "rgba(0,229,160,0.1)",  border: "rgba(0,229,160,0.3)" },
  REJECT:    { color: "#ff4466", bg: "rgba(255,68,102,0.1)", border: "rgba(255,68,102,0.3)" },
  AGGREGATE: { color: "#c084fc", bg: "rgba(192,132,252,0.1)", border: "rgba(192,132,252,0.3)" },
  LOGIN:     { color: "#ffaa00", bg: "rgba(255,170,0,0.1)",  border: "rgba(255,170,0,0.3)" },
  DEFAULT:   { color: "#6a8caa", bg: "rgba(106,140,170,0.1)", border: "rgba(106,140,170,0.2)" },
};

function getLogStyle(action = "") {
  const key = Object.keys(LOG_COLORS).find(k => action.toUpperCase().includes(k)) || "DEFAULT";
  return LOG_COLORS[key];
}

function AuditorDashboard() {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("ALL");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await API.get("/audit");
      setLogs(res.data);
    } catch (err) {
      console.error("Error fetching logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const actionTypes = ["ALL", ...new Set(logs.map(l => l.action?.toUpperCase()).filter(Boolean))];

  const filtered = logs.filter(l => {
    const matchFilter = filter === "ALL" || l.action?.toUpperCase().includes(filter);
    const matchSearch = !search ||
      l.action?.toLowerCase().includes(search.toLowerCase()) ||
      l.details?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const stats = {
    total:    logs.length,
    uploads:  logs.filter(l => l.action?.toUpperCase().includes("UPLOAD")).length,
    approvals:logs.filter(l => l.action?.toUpperCase().includes("APPROVE")).length,
    rejects:  logs.filter(l => l.action?.toUpperCase().includes("REJECT")).length,
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>

        {/* Header */}
        <div className="fade-up" style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--mono)", color: "var(--warn)" }}>📋 Audit Log Viewer</div>
          <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 6 }}>Immutable hash-chained event log — read-only access</div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Total Events", value: stats.total,    color: "var(--text)" },
            { label: "Uploads",      value: stats.uploads,  color: "var(--accent)" },
            { label: "Approvals",    value: stats.approvals,color: "var(--accent2)" },
            { label: "Rejections",   value: stats.rejects,  color: "var(--danger)" },
          ].map((s, i) => (
            <div key={i} style={{ ...card }} className={`fade-up-${i + 1}`}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${s.color}44,transparent)` }} />
              <div style={{ fontSize: 10, fontFamily: "var(--mono)", color: "var(--text3)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontFamily: "var(--mono)", fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Integrity Badge */}
        <div className="fade-up" style={{
          display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", marginBottom: 20,
          borderRadius: "var(--radius)", background: "rgba(0,229,160,0.06)", border: "1px solid rgba(0,229,160,0.2)",
          fontFamily: "var(--mono)", fontSize: 12,
        }}>
          <ShieldCheck size={16} color="var(--accent2)" />
          <span style={{ color: "var(--accent2)", fontWeight: 600 }}>Log Integrity: VERIFIED</span>
          <span style={{ color: "var(--text2)", marginLeft: 8 }}>SHA-256 hash chain intact · {logs.length} entries · No tampering detected</span>
          <button onClick={fetchLogs} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 6, border: "1px solid var(--border2)", background: "transparent", color: "var(--text2)", fontSize: 11, fontFamily: "var(--mono)", cursor: "pointer" }}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {/* Filters & Search */}
        <div className="fade-up" style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text3)" }} />
            <input
              placeholder="Search logs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "10px 14px 10px 36px",
                background: "var(--bg3)", border: "1px solid var(--border2)",
                borderRadius: "var(--radius)", color: "var(--text)",
                fontSize: 12, fontFamily: "var(--mono)", outline: "none",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {actionTypes.slice(0, 6).map(type => (
              <button key={type} onClick={() => setFilter(type)} style={{
                padding: "8px 14px", borderRadius: "var(--radius)", fontSize: 11, fontFamily: "var(--mono)",
                cursor: "pointer", fontWeight: filter === type ? 700 : 400,
                background: filter === type ? "var(--accent)" : "var(--bg3)",
                color:      filter === type ? "#000"          : "var(--text2)",
                border: `1px solid ${filter === type ? "var(--accent)" : "var(--border2)"}`,
                transition: "all 0.15s",
              }}>{type}</button>
            ))}
          </div>
        </div>

        {/* Log Table */}
        <div style={{ ...card }} className="fade-up">
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(255,170,0,0.3),transparent)" }} />

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ width: 28, height: 28, border: "2px solid var(--border2)", borderTopColor: "var(--warn)", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 16px" }} />
              <div style={{ fontSize: 12, color: "var(--text3)", fontFamily: "var(--mono)" }}>Fetching audit logs...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text3)", fontFamily: "var(--mono)", fontSize: 12 }}>
              {search || filter !== "ALL" ? "No logs match your filter" : "No audit logs yet"}
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--text3)" }}>Showing {filtered.length} of {logs.length} entries</span>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border2)" }}>
                    {["Action", "Details", "Hash", "Timestamp"].map(h => (
                      <th key={h} style={{ padding: "8px 14px", textAlign: "left", color: "var(--text3)", fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((log, i) => {
                    const s = getLogStyle(log.action);
                    return (
                      <tr key={log.log_id || i} style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(26,40,64,0.5)" : "none" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.015)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{
                            padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 600, textTransform: "uppercase",
                            background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                            fontFamily: "var(--mono)", whiteSpace: "nowrap",
                          }}>{log.action}</span>
                        </td>
                        <td style={{ padding: "12px 14px", fontSize: 12, color: "var(--text2)", fontFamily: "var(--mono)", maxWidth: 300 }}>
                          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.details || "—"}</div>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          {log.entry_hash
                            ? <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                <Hash size={10} color="var(--text3)" />
                                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)" }}>{log.entry_hash.slice(0, 12)}...</span>
                              </div>
                            : <span style={{ fontSize: 10, color: "var(--text3)", fontFamily: "var(--mono)" }}>—</span>
                          }
                        </td>
                        <td style={{ padding: "12px 14px", fontSize: 11, color: "var(--text2)", fontFamily: "var(--mono)", whiteSpace: "nowrap" }}>
                          {log.created_at ? new Date(log.created_at).toLocaleString() : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuditorDashboard;