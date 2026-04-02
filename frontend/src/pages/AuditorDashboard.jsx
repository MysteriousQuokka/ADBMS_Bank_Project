import Navbar from "../components/Navbar";
import API from "../services/api";
import { useEffect, useState } from "react";

function AuditorDashboard() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    API.get("/audit").then(res => setLogs(res.data));
  }, []);

  return (
    <div>
      <Navbar />
      <h2>Audit Logs</h2>

      {logs.map(log => (
        <div key={log.log_id}>
          <p>{log.action}</p>
        </div>
      ))}
    </div>
  );
}

export default AuditorDashboard;