// SEARCH: "PKL_UPLOAD_SECTION" to find the commented pkl upload feature and uncomment it.

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import Navbar from "../components/Navbar";
import API from "../services/api";
import { useRef } from "react";

async function fetchBankDetails(bankName) {
  const res = await API.get(
    `/bank_details/model-details?bank_name=${encodeURIComponent(bankName)}`,
  );
  return res.data; // ✅ Correct
}

// ─── Small reusable components ────────────────────────────────────────────────
function StatCard({ label, value, sub, accent }) {
  return (
    <div
      style={{
        background: "var(--bg2)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "22px 26px",
        borderLeft: `4px solid ${accent}`,
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <span
        style={{
          fontSize: 12,
          color: "var(--text2)",
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 28, fontWeight: 700, color: "var(--text)" }}>
        {value}
      </span>
      {sub && (
        <span style={{ fontSize: 12, color: "var(--text2)" }}>{sub}</span>
      )}
    </div>
  );
}

function AccuracyChart({ data }) {
  const chartData = data.map((row, i) => ({
    round: `R${i + 1}`,
    accuracy: parseFloat((row.accuracy * 100).toFixed(2)),
  }));

  const latest = chartData.at(-1)?.accuracy ?? null;

  return (
    <div
      style={{
        background: "var(--bg2)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "22px 26px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <span style={{ fontWeight: 600, color: "var(--text)", fontSize: 15 }}>
          Accuracy Over Rounds
        </span>
        {latest !== null && (
          <span
            style={{
              background: "rgba(59,158,255,0.1)",
              color: "var(--accent)",
              borderRadius: 20,
              padding: "3px 12px",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Latest: {latest}%
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="round"
            tick={{ fill: "var(--muted)", fontSize: 12 }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "var(--muted)", fontSize: 12 }}
            unit="%"
          />
          <Tooltip
            contentStyle={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: "var(--text)",
            }}
            formatter={(v) => [`${v}%`, "Accuracy"]}
          />
          <ReferenceLine
            y={80}
            stroke="var(--accent)"
            strokeDasharray="4 4"
            label={{ value: "80%", fill: "var(--accent)", fontSize: 11 }}
          />
          <Line
            type="monotone"
            dataKey="accuracy"
            stroke="var(--accent)"
            strokeWidth={2.5}
            dot={{ fill: "var(--accent)", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function RoundsTable({ data }) {
  return (
    <div
      style={{
        background: "var(--bg2)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "18px 24px",
          borderBottom: "1px solid var(--border)",
          fontWeight: 600,
          color: "var(--text)",
          fontSize: 15,
        }}
      >
        Round History
      </div>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
        >
          <thead>
            <tr style={{ background: "var(--panel)" }}>
              {["Round", "Total Rows", "Accuracy", "S3 Path"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 18px",
                    textAlign: "left",
                    color: "var(--text2)",
                    fontWeight: 600,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    fontSize: 11,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                style={{
                  borderTop: "1px solid var(--border)",
                  background: i % 2 === 0 ? "transparent" : "var(--bg3)",
                }}
              >
                <td
                  style={{
                    padding: "10px 18px",
                    color: "var(--text)",
                    fontWeight: 600,
                  }}
                >
                  #{i + 1}
                </td>
                <td style={{ padding: "10px 18px", color: "var(--text2)" }}>
                  {row.total_rows?.toLocaleString() ?? "—"}
                </td>
                <td style={{ padding: "10px 18px" }}>
                  <span
                    style={{
                      color:
                        row.accuracy >= 0.8
                          ? "#22c55e"
                          : row.accuracy >= 0.6
                            ? "#f59e0b"
                            : "#ef4444",
                      fontWeight: 600,
                    }}
                  >
                    {(row.accuracy * 100).toFixed(2)}%
                  </span>
                </td>
                <td
                  style={{
                    padding: "10px 18px",
                    color: "var(--text2)",
                    fontFamily: "monospace",
                    fontSize: 11,
                    maxWidth: 200,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {row.update_s3_path ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PklUpload({ bankName, token }) {
  const fileRef = useRef(null);
  const [status, setStatus] = useState(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".pkl")) {
      setStatus({ ok: false, msg: "Only .pkl files are accepted." });
      return;
    }
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("bank_name", bankName);
    try {
      const res = await fetch(`${API_BASE}/bank_details/upload-model`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const json = await res.json();
      setStatus({
        ok: res.ok,
        msg: res.ok ? "Upload successful!" : json?.message || "Upload failed.",
      });
    } catch (e) {
      setStatus({ ok: false, msg: e.message });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      style={{
        marginTop: 24,
        background: "var(--bg2)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "22px 26px",
      }}
    >
      <p
        style={{
          fontWeight: 600,
          color: "var(--text)",
          marginBottom: 14,
          fontSize: 15,
        }}
      >
        Upload Model (.pkl)
      </p>
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pkl"
          style={{ color: "var(--text2)", fontSize: 13 }}
        />
        <button
          onClick={handleUpload}
          disabled={uploading}
          style={{
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "9px 20px",
            cursor: uploading ? "not-allowed" : "pointer",
            fontWeight: 600,
            fontSize: 13,
            opacity: uploading ? 0.6 : 1,
          }}
        >
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </div>
      {status && (
        <p
          style={{
            marginTop: 10,
            fontSize: 12,
            color: status.ok ? "#22c55e" : "#ef4444",
          }}
        >
          {status.msg}
        </p>
      )}
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function BankDashboard() {
  // Adjust these based on how your auth context/localStorage stores bank info
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const bankName = user?.bank_name || "My Bank";
  const token = user?.access_token || "";

  console.log("USER:", user);
  console.log("BANK NAME:", bankName);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchBankDetails(bankName)
      .then((res) => {
        setData(Array.isArray(res) ? res : []);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [bankName, token]);

  // Derived stats
  const latest = data.at(-1) ?? null;
  const totalRounds = data.length;
  const bestAccuracy = data.length
    ? Math.max(...data.map((d) => d.accuracy))
    : null;
  const totalRows = latest?.total_rows ?? null;

  return (
    <div style={{ minHeight: "100vh", fontFamily: "var(--sans)" }}>
      {/* ── Navbar ── */}
      <Navbar />

      {/* ── Page Body ── */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            {/* <span
              style={{
                fontSize: 11,
                color: "var(--text2)",
                fontFamily: "var(--mono)",
                letterSpacing: 2,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Logged in as
            </span> */}
            <span
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "var(--accent)",
                fontFamily: "var(--mono)",
                letterSpacing: 3,
                textTransform: "uppercase",
                borderBottom: "2px solid var(--accent)",
                paddingBottom: 4,
              }}
            >
              🏦 {bankName}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "var(--text)",
                  margin: 0,
                }}
              >
                Model Training Overview
              </h1>
              <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 4 }}>
                Aggregated statistics across all federated rounds.
              </p>
            </div>
            <button
              onClick={() => {
                setLoading(true);
                fetchBankDetails(bankName, token)
                  .then((res) => {
                    setData(Array.isArray(res) ? res : []);
                    setError(null);
                  })
                  .catch((err) => setError(err.message))
                  .finally(() => setLoading(false));
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border2)",
                background: "transparent",
                color: "var(--text2)",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "var(--mono)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.color = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border2)";
                e.currentTarget.style.color = "var(--text2)";
              }}
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Loading / Error states */}
        {loading && (
          <p
            style={{ color: "var(--text2)", textAlign: "center", padding: 60 }}
          >
            Loading data…
          </p>
        )}
        {error && (
          <div
            style={{
              background: "#ef444415",
              border: "1px solid #ef4444",
              borderRadius: 10,
              padding: "16px 20px",
              color: "#ef4444",
              fontSize: 13,
              marginBottom: 24,
            }}
          >
            ⚠ {error}
          </div>
        )}

        {!loading && !error && data.length === 0 && (
          <p
            style={{ color: "var(--text2)", textAlign: "center", padding: 60 }}
          >
            No training records found for <strong>{bankName}</strong>.
          </p>
        )}

        {!loading && data.length > 0 && (
          <>
            {/* ── Stat Cards ── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 16,
                marginBottom: 24,
              }}
            >
              <StatCard
                label="Total Rounds"
                value={totalRounds}
                sub="Federated training rounds completed"
                accent="#6366f1"
              />
              <StatCard
                label="Latest Row Count"
                value={totalRows?.toLocaleString() ?? "—"}
                sub="Records in most recent update"
                accent="#06b6d4"
              />
              <StatCard
                label="Latest Accuracy"
                value={latest ? `${(latest.accuracy * 100).toFixed(2)}%` : "—"}
                sub="From most recent round"
                accent="#22c55e"
              />
              <StatCard
                label="Best Accuracy"
                value={
                  bestAccuracy !== null
                    ? `${(bestAccuracy * 100).toFixed(2)}%`
                    : "—"
                }
                sub="Peak across all rounds"
                accent="#f59e0b"
              />
            </div>

            {/* ── Accuracy Chart ── */}
            <div style={{ marginBottom: 24 }}>
              <AccuracyChart data={data} />
            </div>

            {/* ── Round History Table ── */}
            <RoundsTable data={data} />

            {/* ── Latest S3 Path ── */}
            {latest?.update_s3_path && (
              <div
                style={{
                  marginTop: 20,
                  background: "var(--bg2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "14px 20px",
                  fontSize: 12,
                  color: "var(--text2)",
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <span style={{ color: "var(--accent)" }}>📦</span>
                <span>Latest model path:</span>
                <code style={{ color: "var(--text2)", wordBreak: "break-all" }}>
                  {latest.update_s3_path}
                </code>
              </div>
            )}
          </>
        )}

        {/* <PklUpload bankName={bankName} token={token} /> */}
        
      </main>
    </div>
  );
}
