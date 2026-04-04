// src/pages/BankDashboard.jsx
import { useState, useEffect } from "react";
import { UploadCloud, ShieldCheck, Database, Activity, CheckCircle, XCircle, Clock } from "lucide-react";
import Navbar from "../components/Navbar";
import API from "../services/api";

const card = {
  background: "var(--panel)", border: "1px solid var(--border)",
  borderRadius: "var(--radius)", padding: 20, position: "relative", overflow: "hidden",
};

const cardTop = {
  position: "absolute", top: 0, left: 0, right: 0, height: 1,
  background: "linear-gradient(90deg,transparent,rgba(59,158,255,0.3),transparent)",
};

function StatCard({ label, value, color = "var(--text)", delta }) {
  return (
    <div style={{ ...card }} className="fade-up">
      <div style={cardTop} />
      <div style={{ fontSize: 10, fontFamily: "var(--mono)", color: "var(--text3)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontFamily: "var(--mono)", fontWeight: 700, color }}>{value}</div>
      {delta && <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--accent2)", marginTop: 4 }}>{delta}</div>}
    </div>
  );
}

function BankDashboard() {
  const [file,     setFile]     = useState(null);
  const [uploading,setUploading]= useState(false);
  const [status,   setStatus]   = useState(""); // "success" | "error" | ""
  const [message,  setMessage]  = useState("");
  const [history,  setHistory]  = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Load upload history from localStorage (replace with API if you have GET /training/history)
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("uploadHistory") || "[]");
    setHistory(saved);
  }, []);

  const handleUpload = async () => {
    if (!file) { setStatus("error"); setMessage("Please select a file first"); return; }
    setUploading(true); setStatus(""); setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      await API.post("/training/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const entry = {
        id: Date.now(), filename: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
        time: new Date().toLocaleString(), status: "uploaded",
      };
      const updated = [entry, ...history].slice(0, 10);
      setHistory(updated);
      localStorage.setItem("uploadHistory", JSON.stringify(updated));
      setStatus("success"); setMessage(`Model "${file.name}" uploaded successfully`);
      setFile(null);
      document.getElementById("fileInput").value = "";
    } catch (err) {
      setStatus("error"); setMessage(err.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>

        {/* Header */}
        <div className="fade-up" style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--mono)", color: "var(--accent)" }}>
            🏦 Bank Admin Dashboard
          </div>
          <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 6 }}>
            {user?.bank_name ? `Bank: ${user.bank_name}` : "Local training node"} — Private data never leaves this node
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
          <StatCard label="Updates Uploaded"  value={history.length}     color="var(--accent)"  className="fade-up-1" />
          <StatCard label="Raw Data Leaked"   value="0"                  color="var(--accent2)" delta="🔒 Privacy intact" className="fade-up-2" />
          <StatCard label="Encryption"        value="AES-256"            color="var(--text)"    className="fade-up-3" />
          <StatCard label="Local DB Status"   value="Online"             color="var(--accent2)" className="fade-up-4" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

          {/* Upload Panel */}
          <div style={{ ...card, gridColumn: "1" }} className="fade-up-1">
            <div style={cardTop} />
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <UploadCloud size={18} color="var(--accent)" />
              <span style={{ fontFamily: "var(--mono)", fontWeight: 600, fontSize: 14 }}>Upload Model Update</span>
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("fileInput").click()}
              style={{
                border: `2px dashed ${dragOver ? "var(--accent)" : file ? "var(--accent2)" : "var(--border2)"}`,
                borderRadius: "var(--radius)", padding: "32px 20px", textAlign: "center",
                cursor: "pointer", transition: "all 0.2s", marginBottom: 16,
                background: dragOver ? "rgba(59,158,255,0.05)" : file ? "rgba(0,229,160,0.04)" : "var(--bg3)",
              }}
            >
              <UploadCloud size={28} color={file ? "var(--accent2)" : "var(--text3)"} style={{ margin: "0 auto 12px" }} />
              {file
                ? <div><div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--accent2)", fontWeight: 600 }}>{file.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 4 }}>{(file.size / 1024).toFixed(1)} KB — Click to change</div></div>
                : <div><div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--text2)" }}>Drag & drop model blob</div>
                    <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>or click to browse (.bin, .pt, .pkl)</div></div>
              }
              <input id="fileInput" type="file" style={{ display: "none" }} accept=".bin,.pt,.pkl,.h5,.safetensors"
                onChange={e => setFile(e.target.files[0])} />
            </div>

            {/* Status Message */}
            {status && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", marginBottom: 14,
                borderRadius: 8, fontFamily: "var(--mono)", fontSize: 12,
                background: status === "success" ? "rgba(0,229,160,0.08)" : "rgba(255,68,102,0.08)",
                border: `1px solid ${status === "success" ? "rgba(0,229,160,0.3)" : "rgba(255,68,102,0.3)"}`,
                color: status === "success" ? "var(--accent2)" : "var(--danger)",
              }}>
                {status === "success" ? <CheckCircle size={13} /> : <XCircle size={13} />}
                {message}
              </div>
            )}

            <button onClick={handleUpload} disabled={uploading || !file} style={{
              width: "100%", padding: "12px 0",
              borderRadius: "var(--radius)", border: "none",
              background: !file ? "var(--bg3)" : uploading ? "rgba(59,158,255,0.3)" : "var(--accent)",
              color: !file ? "var(--text3)" : "#000",
              fontSize: 13, fontWeight: 700, fontFamily: "var(--mono)",
              cursor: (!file || uploading) ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s",
            }}>
              {uploading
                ? <><span style={{ width: 14, height: 14, border: "2px solid #000", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Encrypting & Uploading...</>
                : <><UploadCloud size={14} /> Upload Model Update</>
              }
            </button>

            {/* Privacy Note */}
            <div style={{
              marginTop: 16, padding: "10px 14px", borderRadius: 8,
              background: "rgba(0,229,160,0.05)", border: "1px solid rgba(0,229,160,0.15)",
              fontSize: 11, fontFamily: "var(--mono)", color: "var(--accent2)",
            }}>
              🔒 Only Δweight blobs are uploaded. Raw transactions never leave this node.
            </div>
          </div>

          {/* Privacy Info */}
          <div style={{ ...card }} className="fade-up-2">
            <div style={cardTop} />
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <ShieldCheck size={18} color="var(--accent2)" />
              <span style={{ fontFamily: "var(--mono)", fontWeight: 600, fontSize: 14 }}>Privacy Guarantees</span>
            </div>
            {[
              ["Raw data exported", "NEVER", "var(--accent2)"],
              ["Customer PII shared", "NEVER", "var(--accent2)"],
              ["Differential Privacy", "ε = 0.5", "var(--accent)"],
              ["Gradient Clipping", "C = 1.0", "var(--accent)"],
              ["Blob Encryption", "AES-256-GCM", "var(--accent)"],
              ["S3 Access", "Write-only", "var(--accent)"],
            ].map(([label, val, color], i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 0", borderBottom: i < 5 ? "1px solid rgba(26,40,64,0.5)" : "none",
              }}>
                <span style={{ fontSize: 12, color: "var(--text2)" }}>{label}</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: 600, color }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upload History */}
        <div style={{ ...card, marginTop: 20 }} className="fade-up-3">
          <div style={cardTop} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <Activity size={18} color="var(--accent)" />
            <span style={{ fontFamily: "var(--mono)", fontWeight: 600, fontSize: 14 }}>Upload History</span>
          </div>
          {history.length === 0
            ? <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text3)", fontFamily: "var(--mono)", fontSize: 12 }}>No uploads yet</div>
            : <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--mono)", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border2)" }}>
                    {["Filename", "Size", "Uploaded At", "Status"].map(h => (
                      <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "var(--text3)", fontWeight: 500, fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={h.id} style={{ borderBottom: i < history.length - 1 ? "1px solid rgba(26,40,64,0.5)" : "none" }}>
                      <td style={{ padding: "12px", color: "var(--text)" }}>{h.filename}</td>
                      <td style={{ padding: "12px", color: "var(--text2)" }}>{h.size}</td>
                      <td style={{ padding: "12px", color: "var(--text2)" }}>{h.time}</td>
                      <td style={{ padding: "12px" }}>
                        <span style={{
                          padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 600, textTransform: "uppercase",
                          background: "rgba(0,229,160,0.1)", color: "var(--accent2)", border: "1px solid rgba(0,229,160,0.3)",
                        }}>✓ {h.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>
      </div>
    </div>
  );
}

export default BankDashboard;