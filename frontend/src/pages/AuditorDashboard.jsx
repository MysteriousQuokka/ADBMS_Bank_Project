// src/pages/AuditorDashboard.jsx
import { useEffect, useState } from "react";
import { Search, Filter, RefreshCw, ShieldCheck, Hash } from "lucide-react";
import Navbar from "../components/Navbar";
import API from "../services/api";

const card = {
  background: "var(--panel)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: 20,
  position: "relative",
  overflow: "hidden",
};

const LOG_COLORS = {
  UPLOAD: {
    color: "#3b9eff",
    bg: "rgba(59,158,255,0.1)",
    border: "rgba(59,158,255,0.3)",
  },
  APPROVE: {
    color: "#00e5a0",
    bg: "rgba(0,229,160,0.1)",
    border: "rgba(0,229,160,0.3)",
  },
  REJECT: {
    color: "#ff4466",
    bg: "rgba(255,68,102,0.1)",
    border: "rgba(255,68,102,0.3)",
  },
  AGGREGATE: {
    color: "#c084fc",
    bg: "rgba(192,132,252,0.1)",
    border: "rgba(192,132,252,0.3)",
  },
  LOGIN: {
    color: "#ffaa00",
    bg: "rgba(255,170,0,0.1)",
    border: "rgba(255,170,0,0.3)",
  },
  DEFAULT: {
    color: "#6a8caa",
    bg: "rgba(106,140,170,0.1)",
    border: "rgba(106,140,170,0.2)",
  },
};

function getLogStyle(action = "") {
  const key =
    Object.keys(LOG_COLORS).find((k) => action.toUpperCase().includes(k)) ||
    "DEFAULT";
  return LOG_COLORS[key];
}

const ACTION_STYLES = {
  USER_REGISTERED:          { color: "#3b9eff", bg: "rgba(59,158,255,0.1)",   border: "rgba(59,158,255,0.3)"  },
  MODEL_AGGREGATED:         { color: "#c084fc", bg: "rgba(192,132,252,0.1)",  border: "rgba(192,132,252,0.3)" },
  MODEL_UPDATE:             { color: "#00e5a0", bg: "rgba(0,229,160,0.1)",    border: "rgba(0,229,160,0.3)"   },
  REJECT:                   { color: "#ff4466", bg: "rgba(255,68,102,0.1)",   border: "rgba(255,68,102,0.3)"  },
  APPROVE:                  { color: "#00e5a0", bg: "rgba(0,229,160,0.1)",    border: "rgba(0,229,160,0.3)"   },
  UPLOAD:                   { color: "#3b9eff", bg: "rgba(59,158,255,0.1)",   border: "rgba(59,158,255,0.3)"  },
  LOGIN:                    { color: "#ffaa00", bg: "rgba(255,170,0,0.1)",    border: "rgba(255,170,0,0.3)"   },
  LOGOUT:                   { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",   border: "rgba(245,158,11,0.3)"  },
  DELETE:                   { color: "#ef4444", bg: "rgba(239,68,68,0.1)",    border: "rgba(239,68,68,0.3)"   },
  LATEST_MODEL_DETAILS_FETCHED: { color: "#818cf8", bg: "rgba(129,140,248,0.1)", border: "rgba(129,140,248,0.3)" },
  LATEST_BANK_DETAILS_FETCHED:  { color: "#38bdf8", bg: "rgba(56,189,248,0.1)",  border: "rgba(56,189,248,0.3)"  },
  LATEST_MODELS_FETCHED:        { color: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.3)"  },
  DEFAULT:                  { color: "#6a8caa", bg: "rgba(106,140,170,0.1)",  border: "rgba(106,140,170,0.2)" },
};

const styleFor = (action = "") => {
  const key = Object.keys(ACTION_STYLES).find(
    (k) => k !== "DEFAULT" && action.toUpperCase().includes(k)
  );
  return ACTION_STYLES[key] ?? ACTION_STYLES.DEFAULT;
};

export function AuditTimeline({ logs }) {
  const [view, setView] = useState("day");

  const groupKey = (dateStr) => {
    const d = new Date(dateStr);
    if (view === "day")
      return d.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    return (
      d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
      " · " +
      String(d.getHours()).padStart(2, "0") +
      ":00"
    );
  };

  const sorted = [...logs].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  const groups = [];
  const seen = {};
  for (const log of sorted) {
    const k = groupKey(log.created_at);
    if (!seen[k]) {
      seen[k] = [];
      groups.push({ key: k, items: seen[k] });
    }
    seen[k].push(log);
  }

  return (
    <div style={{ marginTop: 28 }}>
      {/* By day / By hour toggle only */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20, gap: 4 }}>
        {["day", "hour"].map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: "4px 10px",
              fontSize: 11,
              fontFamily: "var(--mono)",
              borderRadius: 6,
              border: "1px solid var(--border2)",
              cursor: "pointer",
              background: view === v ? "var(--bg3)" : "transparent",
              color: view === v ? "var(--text)" : "var(--text2)",
            }}
          >
            {v === "day" ? "By day" : "By hour"}
          </button>
        ))}
      </div>

      {/* Timeline groups */}
      {groups.map((g) => (
        <div key={g.key} style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: 11,
              fontFamily: "var(--mono)",
              color: "var(--text3)",
              textTransform: "uppercase",
              letterSpacing: 1.5,
              marginBottom: 12,
              paddingLeft: 88,
            }}
          >
            {g.key}
          </div>
          {g.items.map((log, i) => {
            const s = styleFor(log.action);
            return (
              <div
                key={log.log_id || i}
                style={{ display: "flex", alignItems: "flex-start" }}
              >
                <div
                  style={{
                    width: 72,
                    textAlign: "right",
                    fontSize: 11,
                    fontFamily: "var(--mono)",
                    color: "var(--text3)",
                    paddingTop: 10,
                    paddingRight: 12,
                  }}
                >
                  {new Date(log.created_at).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: 16,
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      marginTop: 10,
                      background: s.bg,
                      border: `2px solid ${s.color}`,
                      flexShrink: 0,
                    }}
                  />
                  {i < g.items.length - 1 && (
                    <div
                      style={{
                        width: 1.5,
                        flex: 1,
                        minHeight: 8,
                        background: "var(--border)",
                      }}
                    />
                  )}
                </div>
                <div
                  style={{
                    flex: 1,
                    marginLeft: 10,
                    marginBottom: 10,
                    background: "var(--bg2)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "9px 13px",
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: "var(--mono)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      padding: "2px 8px",
                      borderRadius: 20,
                      background: s.bg,
                      color: s.color,
                      border: `1px solid ${s.border}`,
                    }}
                  >
                    {log.action}
                  </span>
                  {log.details && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text2)",
                        marginTop: 5,
                        fontFamily: "var(--mono)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {log.details}
                    </div>
                  )}
                  {log.entry_hash && (
                    <div
                      style={{
                        fontSize: 10,
                        color: "var(--text3)",
                        fontFamily: "var(--mono)",
                        marginTop: 3,
                      }}
                    >
                      # {log.entry_hash.slice(0, 16)}…
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function AuditorDashboard() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("timeline"); // "timeline" | "table"

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await API.get("/audit/logs");
      setLogs(res.data);
    } catch (err) {
      console.error("Error fetching logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const actionTypes = [
    "ALL",
    ...new Set(logs.map((l) => l.action?.toUpperCase()).filter(Boolean)),
  ];
  const filtered = logs.filter((l) => {
    const matchFilter =
      filter === "ALL" || l.action?.toUpperCase().includes(filter);
    const matchSearch =
      !search ||
      l.action?.toLowerCase().includes(search.toLowerCase()) ||
      l.details?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const stats = {
    total: logs.length,
    registered: logs.filter(
      (l) => l.action?.toUpperCase() === "USER_REGISTERED",
    ).length,
    aggregated: logs.filter(
      (l) => l.action?.toUpperCase() === "MODEL_AGGREGATED",
    ).length,
    updates: logs.filter((l) => l.action?.toUpperCase() === "MODEL_UPDATE")
      .length,
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
        {/* Header */}
        <div className="fade-up" style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              fontFamily: "var(--mono)",
              color: "var(--warn)",
            }}
          >
            📋 Audit Log Viewer
          </div>
          <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 6 }}>
            Immutable hash-chained event log — read-only access
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {[
            { label: "Total Events", value: stats.total, color: "var(--text)" },
            {
              label: "User Registered",
              value: stats.registered,
              color: "var(--accent)",
            },
            {
              label: "Model Aggregated",
              value: stats.aggregated,
              color: "var(--accent2)",
            },
            {
              label: "Model Updates",
              value: stats.updates,
              color: "var(--warn)",
            },
          ].map((s, i) => (
            <div key={i} style={{ ...card }} className={`fade-up-${i + 1}`}>
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 1,
                  background: `linear-gradient(90deg,transparent,${s.color}44,transparent)`,
                }}
              />
              <div
                style={{
                  fontSize: 10,
                  fontFamily: "var(--mono)",
                  color: "var(--text3)",
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  marginBottom: 8,
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontFamily: "var(--mono)",
                  fontWeight: 700,
                  color: s.color,
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* View Toggle */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 0,
              border: "1px solid var(--border2)",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {[
              ["timeline", "⬡ Timeline"],
              ["table", "☰ All Logs"],
            ].map(([v, label]) => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                style={{
                  padding: "8px 18px",
                  fontSize: 12,
                  fontFamily: "var(--mono)",
                  border: "none",
                  cursor: "pointer",
                  background: viewMode === v ? "var(--accent)" : "transparent",
                  color: viewMode === v ? "#000" : "var(--text2)",
                  fontWeight: viewMode === v ? 700 : 400,
                  transition: "all .15s",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters & Search */}
        <div
          className="fade-up"
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text3)",
              }}
            />
            <input
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px 10px 36px",
                background: "var(--bg3)",
                border: "1px solid var(--border2)",
                borderRadius: "var(--radius)",
                color: "var(--text)",
                fontSize: 12,
                fontFamily: "var(--mono)",
                outline: "none",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {actionTypes.slice(0, 8).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "var(--radius)",
                  fontSize: 11,
                  fontFamily: "var(--mono)",
                  cursor: "pointer",
                  fontWeight: filter === type ? 700 : 400,
                  background: filter === type ? "var(--accent)" : "var(--bg3)",
                  color: filter === type ? "#000" : "var(--text2)",
                  border: `1px solid ${filter === type ? "var(--accent)" : "var(--border2)"}`,
                  transition: "all 0.15s",
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Log Table */}
        {viewMode === "table" ? (
          <div style={{ ...card }} className="fade-up">
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 1,
                background:
                  "linear-gradient(90deg,transparent,rgba(255,170,0,0.3),transparent)",
              }}
            />

            {loading ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    border: "2px solid var(--border2)",
                    borderTopColor: "var(--warn)",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                    margin: "0 auto 16px",
                  }}
                />
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text3)",
                    fontFamily: "var(--mono)",
                  }}
                >
                  Fetching audit logs...
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 0",
                  color: "var(--text3)",
                  fontFamily: "var(--mono)",
                  fontSize: 12,
                }}
              >
                {search || filter !== "ALL"
                  ? "No logs match your filter"
                  : "No audit logs yet"}
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "var(--mono)",
                      color: "var(--text3)",
                    }}
                  >
                    Showing {filtered.length} of {logs.length} entries
                  </span>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border2)" }}>
                      {["Action", "Details", "Hash", "Timestamp"].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "8px 14px",
                            textAlign: "left",
                            color: "var(--text3)",
                            fontFamily: "var(--mono)",
                            fontSize: 10,
                            textTransform: "uppercase",
                            letterSpacing: 1.5,
                            fontWeight: 500,
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((log, i) => {
                      const s = getLogStyle(log.action);
                      return (
                        <tr
                          key={log.log_id || i}
                          style={{
                            borderBottom:
                              i < filtered.length - 1
                                ? "1px solid rgba(26,40,64,0.5)"
                                : "none",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(255,255,255,0.015)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <td style={{ padding: "12px 14px" }}>
                            <span
                              style={{
                                padding: "3px 10px",
                                borderRadius: 20,
                                fontSize: 10,
                                fontWeight: 600,
                                textTransform: "uppercase",
                                background: s.bg,
                                color: s.color,
                                border: `1px solid ${s.border}`,
                                fontFamily: "var(--mono)",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {log.action}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "12px 14px",
                              fontSize: 12,
                              color: "var(--text2)",
                              fontFamily: "var(--mono)",
                              maxWidth: 300,
                            }}
                          >
                            <div
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {log.details || "—"}
                            </div>
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            {log.entry_hash ? (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 5,
                                }}
                              >
                                <Hash size={10} color="var(--text3)" />
                                <span
                                  style={{
                                    fontFamily: "var(--mono)",
                                    fontSize: 10,
                                    color: "var(--text3)",
                                  }}
                                >
                                  {log.entry_hash.slice(0, 12)}...
                                </span>
                              </div>
                            ) : (
                              <span
                                style={{
                                  fontSize: 10,
                                  color: "var(--text3)",
                                  fontFamily: "var(--mono)",
                                }}
                              >
                                —
                              </span>
                            )}
                          </td>
                          <td
                            style={{
                              padding: "12px 14px",
                              fontSize: 11,
                              color: "var(--text2)",
                              fontFamily: "var(--mono)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {log.created_at
                              ? new Date(log.created_at).toLocaleString()
                              : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </>
            )}
          </div>
        ) : (
          <AuditTimeline logs={filtered} />
        )}
      </div>
    </div>
  );
}

export default AuditorDashboard;
