import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    // 1. Fetch challenge and public key from server
    const res = await fetch(`http://localhost:8000/challenge/${username}`);
    const data = await res.json();

    if (res.ok) {
      // 2. Simulate biometric "Signature" using local private key
      const privKey = localStorage.getItem("aegis_priv_key");
      if (!privKey) {
        alert("No biometric device found for this user!");
        return;
      }

      // In reality, this is handled by the browser's hardware-bound API
      const mockSignature = "SIGNED_" + btoa(data.challenge + privKey);

      const loginRes = await fetch(
        `http://localhost:8000/login?username=${username}&signature=${mockSignature}`,
        {
          method: "POST",
        }
      );

      if (loginRes.ok) {
        const userData = await loginRes.json();
        localStorage.setItem("active_session", JSON.stringify(userData));
        navigate("/dashboard");
      }
    } else {
      alert("User not found");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow-sm mx-auto" style={{ maxWidth: "400px" }}>
        <h3 className="text-center">Biometric Portal</h3>
        <p className="text-muted text-center small">
          Identity hidden in pixels
        </p>
        <input
          className="form-control mb-3"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <button className="btn btn-dark w-100" onClick={handleLogin}>
          Login with FaceID
        </button>
      </div>
    </div>
  );
};

export default Login;
