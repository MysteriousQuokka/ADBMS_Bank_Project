// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login           from "./pages/Login";
import Register        from "./pages/Register";
import BankDashboard   from "./pages/BankDashboard";
import AdminDashboard  from "./pages/AdminDashboard";
import AuditorDashboard from "./pages/AuditorDashboard";

function ProtectedRoute({ children, requiredRole }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!user?.user_id) return <Navigate to="/" replace />;

  if (requiredRole && user.role !== requiredRole)
    return <Navigate to="/" replace />;

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/bank"    element={<ProtectedRoute requiredRole="BANK_ADMIN">    <BankDashboard />    </ProtectedRoute>} />
        <Route path="/admin"   element={<ProtectedRoute requiredRole="CENTRAL_ADMIN"> <AdminDashboard />   </ProtectedRoute>} />
        <Route path="/auditor" element={<ProtectedRoute requiredRole="AUDITOR">       <AuditorDashboard /> </ProtectedRoute>} />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;