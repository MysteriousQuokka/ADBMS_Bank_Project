import Navbar from "../components/Navbar";
import API from "../services/api";
import { useEffect, useState } from "react";

function AdminDashboard() {
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    API.get("/updates").then(res => setUpdates(res.data));
  }, []);

  return (
    <div>
      <Navbar />
      <h2>Central Admin</h2>

      {updates.map(u => (
        <div key={u.id}>
          <p>{u.version}</p>
          <button>Approve</button>
        </div>
      ))}
    </div>
  );
}

export default AdminDashboard;