import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({ username: "", trueUpi: "" });
  const navigate = useNavigate();

  const handleRegister = async () => {
    // 1. Generate Fake UPI automatically
    const fakeUpi = `${formData.username.toLowerCase()}@aegisbank`;

    // 2. Mock WebAuthn Device Registration
    // In a real app, navigator.credentials.create() would go here
    const mockPublicKey = "PUB_" + Math.random().toString(36).substring(7);
    const mockPrivateKey = "PRIV_" + Math.random().toString(36).substring(7);

    const response = await fetch("http://localhost:8000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        fakeUpi,
        publicKey: mockPublicKey,
      }),
    });

    if (response.ok) {
      // Store sensitive keys locally only
      localStorage.setItem("aegis_priv_key", mockPrivateKey);
      localStorage.setItem("aegis_true_upi", formData.trueUpi);
      localStorage.setItem("aegis_fake_upi", fakeUpi);
      alert("Device Registered! Biometric keys stored locally.");
      navigate("/login");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow-sm mx-auto" style={{ maxWidth: "400px" }}>
        <h2 className="text-center mb-4">Project Aegis</h2>
        <div className="mb-3">
          <label>Username</label>
          <input
            className="form-control"
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />
        </div>
        <div className="mb-3">
          <label>True UPI ID (Hidden from public)</label>
          <input
            className="form-control"
            placeholder="user@realbank"
            onChange={(e) =>
              setFormData({ ...formData, trueUpi: e.target.value })
            }
          />
        </div>
        <button className="btn btn-primary w-100" onClick={handleRegister}>
          Register Biometric Device
        </button>
      </div>
    </div>
  );
};

export default Register;
