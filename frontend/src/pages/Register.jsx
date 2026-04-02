import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [bankName, setBankName] = useState("");

  const navigate = useNavigate();

  // const handleRegister = async () => {
  //   try {
  //     await API.post("/auth/register", {
  //       email,
  //       password,
  //       role,
  //       bank_name: role === "BANK_ADMIN" ? bankName : null
  //     });

  //     alert("Registered successfully. Please login.");
  //     navigate("/");

  //   } catch (err) {
  //     alert("User already exists or error occurred");
  //   }
  // };

  const handleRegister = async () => {
  try {
    const res = await API.post("/auth/register", {
      email,
      password,
      role,
      bank_name: role === "BANK_ADMIN" ? bankName : null
    });

    if (res.data.error) {
      alert(res.data.error);
      return;
    }

    alert("Registered successfully. Please login.");
    navigate("/");

  } catch (err) {
    alert(err.response?.data?.detail || "Something went wrong");
  }
};

  return (
    <div>
      <h2>Register</h2>

      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} />

      <select onChange={e => setRole(e.target.value)}>
        <option>Select Role</option>
        <option value="BANK_ADMIN">Bank Admin</option>
        <option value="CENTRAL_ADMIN">Central Admin</option>
        <option value="AUDITOR">Auditor</option>
      </select>

      {role === "BANK_ADMIN" && (
        <input placeholder="Bank Name" onChange={e => setBankName(e.target.value)} />
      )}

      <button onClick={handleRegister}>Register</button>
    </div>
  );
}

export default Register;