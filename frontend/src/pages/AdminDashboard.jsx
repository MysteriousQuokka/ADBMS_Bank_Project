// src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { TrendingUp, Zap, Users, RefreshCw } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
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

const cardTop = (color = "rgba(59,158,255,0.3)") => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: 1,
  background: `linear-gradient(90deg,transparent,${color},transparent)`,
});

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--panel)",
        border: "1px solid var(--border2)",
        borderRadius: 8,
        padding: "10px 14px",
        fontFamily: "var(--mono)",
        fontSize: 11,
      }}
    >
      <div style={{ color: "var(--text2)", marginBottom: 6 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color, marginBottom: 3 }}>
          {p.name}: <strong>{p.value}%</strong>
        </div>
      ))}
    </div>
  );
};

function AdminDashboard() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUpdates = async () => {
    setLoading(true);
    try {
      const res = await API.get("/updates/latest-model");
      // Replace the fetchUpdates function body inside try block
      const formatted = res.data.map((item, index) => ({
        id: index,
        bank_name: item.bank_name,
        total_rows: item.total_rows,
        accuracy: Array.isArray(item.accuracy) ? item.accuracy : [],
        s3_path: item.update_s3_path,
      }));
      console.log("Update RESPONSE:", res.data);
      setUpdates(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  const handleFetchModels = async () => {
    setActionLoading("fetch");
    try {
      const res = await API.get("/updates/fetch-model");

      alert("✅ Models fetched successfully");

      console.log("FETCH RESPONSE:", res.data);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to fetch models");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAggregate = async () => {
    setActionLoading("aggregate");
    try {
      const res = await API.post("/updates/submit-update");

      alert("✅ Model aggregated successfully");

      console.log("AGGREGATION RESPONSE:", res.data);
    } catch (err) {
      console.error(err);
      alert("❌ Aggregation failed");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>
        {/* Header */}

        <div
          className="fade-up"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 28,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                fontFamily: "var(--mono)",
                color: "var(--accent2)",
              }}
            >
              ⚡ Central Admin
            </div>
            <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 6 }}>
              Approve model updates · Manage global model · Monitor federation
            </div>
          </div>
        </div>

        {/* Stats + Action Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {/* Total Updates - existing stat card */}
          <div style={{ ...card }} className="fade-up-1">
            <div style={cardTop()} />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontFamily: "var(--mono)",
                  color: "var(--text3)",
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                }}
              >
                Total Updates
              </div>
              <Users size={16} color="var(--text3)" />
            </div>
            <div
              style={{
                fontSize: 28,
                fontFamily: "var(--mono)",
                fontWeight: 700,
                color: "var(--text)",
                marginTop: 8,
              }}
            >
              {updates.length}
            </div>
          </div>

          {/* View Updates card-button */}
          <div
            style={{ ...card, cursor: "pointer" }}
            className="fade-up-2"
            onClick={fetchUpdates}
          >
            <div style={cardTop("rgba(59,158,255,0.3)")} />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontFamily: "var(--mono)",
                  color: "var(--text3)",
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                }}
              >
                View Updates
              </div>
              <RefreshCw size={16} color="var(--accent)" />
            </div>
            <div
              style={{
                fontSize: 13,
                fontFamily: "var(--mono)",
                fontWeight: 600,
                color: "var(--accent)",
                marginTop: 8,
              }}
            >
              {actionLoading === "Update" ? "Updating..." : "Refresh List"}
            </div>
          </div>

          {/* Fetch Models card-button */}
          <div
            style={{
              ...card,
              cursor: "pointer",
              opacity: actionLoading === "fetch" ? 0.6 : 1,
            }}
            className="fade-up-3"
            onClick={actionLoading === "fetch" ? undefined : handleFetchModels}
          >
            <div style={cardTop("rgba(0,229,160,0.3)")} />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontFamily: "var(--mono)",
                  color: "var(--text3)",
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                }}
              >
                Fetch Models
              </div>
              <Zap size={16} color="var(--accent2)" />
            </div>
            <div
              style={{
                fontSize: 13,
                fontFamily: "var(--mono)",
                fontWeight: 600,
                color: "var(--accent2)",
                marginTop: 8,
              }}
            >
              {actionLoading === "fetch" ? "Fetching..." : "Pull Latest"}
            </div>
          </div>

          {/* Aggregate Model card-button */}
          <div
            style={{
              ...card,
              cursor: "pointer",
              opacity: actionLoading === "aggregate" ? 0.6 : 1,
            }}
            className="fade-up-4"
            onClick={
              actionLoading === "aggregate" ? undefined : handleAggregate
            }
          >
            <div style={cardTop("rgba(255,170,0,0.3)")} />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontFamily: "var(--mono)",
                  color: "var(--text3)",
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                }}
              >
                Aggregate Model
              </div>
              <TrendingUp size={16} color="var(--warn)" />
            </div>
            <div
              style={{
                fontSize: 13,
                fontFamily: "var(--mono)",
                fontWeight: 600,
                color: "var(--warn)",
                marginTop: 8,
              }}
            >
              {actionLoading === "aggregate"
                ? "Processing..."
                : "Run Aggregation"}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: 20,
            marginBottom: 20,
          }}
        >
          {/* ── Updates Table ── */}
          <div style={{ ...card, marginBottom: 20 }} className="fade-up-1">
            <div style={cardTop()} />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 20,
              }}
            >
              <Zap size={18} color="var(--accent)" />
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                Bank Model Updates
              </span>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    border: "2px solid var(--border2)",
                    borderTopColor: "var(--accent)",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                    margin: "0 auto 12px",
                  }}
                />
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text3)",
                    fontFamily: "var(--mono)",
                  }}
                >
                  Loading updates...
                </div>
              </div>
            ) : updates.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 0",
                  color: "var(--text3)",
                  fontFamily: "var(--mono)",
                  fontSize: 12,
                }}
              >
                No updates found
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontFamily: "var(--mono)",
                    fontSize: 12,
                  }}
                >
                  <thead>
                    <tr>
                      {[
                        "Bank Name",
                        "Total Rows",
                        "Latest Accuracy",
                        "S3 Path",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: "left",
                            padding: "10px 14px",
                            color: "var(--text3)",
                            fontSize: 10,
                            textTransform: "uppercase",
                            letterSpacing: 1.2,
                            borderBottom: "1px solid var(--border)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {updates.map((u, i) => {
                      const latestAcc =
                        Array.isArray(u.accuracy) && u.accuracy.length > 0
                          ? u.accuracy[u.accuracy.length - 1]
                          : null;
                      return (
                        <tr
                          key={u.id}
                          style={{
                            borderBottom: "1px solid var(--border)",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "var(--bg3)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <td
                            style={{
                              padding: "12px 14px",
                              color: "var(--accent)",
                              fontWeight: 600,
                            }}
                          >
                            {u.bank_name || "—"}
                          </td>
                          <td
                            style={{
                              padding: "12px 14px",
                              color: "var(--text)",
                            }}
                          >
                            {u.total_rows != null
                              ? u.total_rows.toLocaleString()
                              : "—"}
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            {latestAcc != null ? (
                              <span
                                style={{
                                  color:
                                    latestAcc >= 90
                                      ? "var(--accent2)"
                                      : latestAcc >= 75
                                        ? "var(--warn)"
                                        : "var(--danger)",
                                  fontWeight: 700,
                                }}
                              >
                                {(latestAcc * 100).toFixed(2)}%
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td
                            style={{
                              padding: "12px 14px",
                              color: "var(--text2)",
                              maxWidth: 200,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <span title={u.s3_path}>{u.s3_path || "—"}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Accuracy Chart (multi-bank from real data) ── */}
          {updates.some(
            (u) => Array.isArray(u.accuracy) && u.accuracy.length > 0,
          ) && (
            <div style={{ ...card, marginBottom: 20 }} className="fade-up-2">
              <div style={cardTop("rgba(0,229,160,0.3)")} />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                <TrendingUp size={18} color="var(--accent2)" />
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  Accuracy Progression · All Banks
                </span>
              </div>

              <ResponsiveContainer width="100%" height={260}>
                <LineChart
                  data={(() => {
                    const maxLen = Math.max(
                      ...updates.map((u) => (u.accuracy || []).length),
                    );
                    return Array.from({ length: maxLen }, (_, i) => {
                      const point = { round: `R${i + 1}` };
                      updates.forEach((u) => {
                        const acc = u.accuracy || [];
                        // right-align: offset shorter arrays to the end
                        const offset = maxLen - acc.length;
                        if (i >= offset && acc[i - offset] != null) {
                          point[u.bank_name] = parseFloat(
                            (acc[i - offset] * 100).toFixed(2),
                          );
                        }
                      });
                      return point;
                    });
                  })()}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(26,40,64,0.8)"
                  />
                  <XAxis
                    dataKey="round"
                    tick={{
                      fill: "var(--text2)",
                      fontSize: 10,
                      fontFamily: "var(--mono)",
                    }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{
                      fill: "var(--text2)",
                      fontSize: 10,
                      fontFamily: "var(--mono)",
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {updates
                    .filter(
                      (u) => Array.isArray(u.accuracy) && u.accuracy.length > 0,
                    )
                    .map((u, i) => {
                      const COLORS = [
                        "#3b9eff",
                        "#00e5a0",
                        "#ffaa00",
                        "#ff4466",
                        "#a78bfa",
                        "#f97316",
                      ];
                      return (
                        <Line
                          key={u.bank_name}
                          type="monotone"
                          dataKey={u.bank_name}
                          stroke={COLORS[i % COLORS.length]}
                          strokeWidth={2.5}
                          dot={{ fill: COLORS[i % COLORS.length], r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      );
                    })}
                </LineChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  marginTop: 14,
                  flexWrap: "wrap",
                }}
              >
                {updates
                  .filter(
                    (u) => Array.isArray(u.accuracy) && u.accuracy.length > 0,
                  )
                  .map((u, i) => {
                    const COLORS = [
                      "#3b9eff",
                      "#00e5a0",
                      "#ffaa00",
                      "#ff4466",
                      "#a78bfa",
                      "#f97316",
                    ];
                    return (
                      <div
                        key={u.bank_name}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 10,
                          fontFamily: "var(--mono)",
                          color: "var(--text2)",
                        }}
                      >
                        <div
                          style={{
                            width: 12,
                            height: 2,
                            background: COLORS[i % COLORS.length],
                            borderRadius: 1,
                          }}
                        />
                        {u.bank_name}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
