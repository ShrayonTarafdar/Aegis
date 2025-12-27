import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // 1. Fetch challenge from relative path
      const res = await fetch(`/challenge/${username}`);
      const data = await res.json();

      if (res.ok) {
        // 2. Simulate biometric "Signature" using local private key
        const privKey = localStorage.getItem("aegis_priv_key");
        if (!privKey) {
          alert("No biometric device found for this user!");
          return;
        }

        const mockSignature = "SIGNED_" + btoa(data.challenge + privKey);

        // 3. Post login to relative path
        const loginRes = await fetch(
          `/login?username=${username}&signature=${mockSignature}`,
          {
            method: "POST",
          }
        );

        if (loginRes.ok) {
          const userData = await loginRes.json();
          localStorage.setItem("active_session", JSON.stringify(userData));
          navigate("/dashboard");
        } else {
          alert("Biometric verification failed.");
        }
      } else {
        alert("User not found in Aegis Database.");
      }
    } catch (err) {
      console.error("Login sequence failed:", err);
      alert("Network Error: Could not reach the Aegis Portal.");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow-sm mx-auto" style={{ maxWidth: "400px" }}>
        <h3 className="text-center">Aegis Login</h3>
        <p className="text-muted text-center small">
          Identity verified by hardware, hidden by pixels
        </p>
        <div className="mb-3">
          <input
            className="form-control"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <button className="btn btn-dark w-100 py-2" onClick={handleLogin}>
          Authenticate via FaceID
        </button>
      </div>
    </div>
  );
};

export default Login;
