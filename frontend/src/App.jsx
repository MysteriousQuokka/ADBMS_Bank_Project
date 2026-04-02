import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import BankDashboard from "./pages/BankDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AuditorDashboard from "./pages/AuditorDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/bank" element={<BankDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/auditor" element={<AuditorDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;