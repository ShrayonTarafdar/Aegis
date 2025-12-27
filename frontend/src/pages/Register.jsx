import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// 1. Import the biometric helper
import { startRegistration } from "@simplewebauthn/browser";

const Register = () => {
  const [formData, setFormData] = useState({ username: "", trueUpi: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!formData.username || !formData.trueUpi) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    const fakeUpi = `${formData.username.toLowerCase()}@aegisbank`;

    try {
      // --- STEP 1: Get Registration Options from Backend ---
      // We send the user info to the backend to get a cryptographic challenge
      const optionsResponse = await fetch("http://localhost:8000/webauthn/register/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          trueUpi: formData.trueUpi,
          fakeUpi: fakeUpi,
          publicKey: "not_needed_for_webauthn" // Backend generates this now
        }),
      });

      if (!optionsResponse.ok) {
        const error = await optionsResponse.json();
        throw new Error(error.detail || "Failed to get registration options");
      }

      const options = await optionsResponse.json();

      // --- STEP 2: Trigger Browser Biometrics (TouchID/FaceID) ---
      // This command opens the native system popup for the fingerprint/face scan
      const attestationResponse = await startRegistration(options);

      // --- STEP 3: Verify the Biometric Credential with Backend ---
      // This sends the "proof" from the hardware back to the server to save the user
      const verifyResponse = await fetch(
        `http://localhost:8000/webauthn/register/verify?username=${formData.username}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(attestationResponse),
        }
      );

      if (verifyResponse.ok) {
        // We no longer store Private Keys in LocalStorage (it's inside the hardware now!)
        // We only store info for the UI
        localStorage.setItem("aegis_username", formData.username);
        localStorage.setItem("aegis_true_upi", formData.trueUpi);
        localStorage.setItem("aegis_fake_upi", fakeUpi);
        
        alert("Biometric Device Registered Successfully!");
        navigate("/login");
      } else {
        throw new Error("Verification failed on server");
      }
    } catch (error) {
      console.error(error);
      alert(error.message || "Biometric registration failed. Ensure your device supports it.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow-sm mx-auto" style={{ maxWidth: "400px" }}>
        <h2 className="text-center mb-4">Project Aegis</h2>
        <p className="text-muted text-center small">Secure Biometric Onboarding</p>
        
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            className="form-control"
            placeholder="e.g. Niyati"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">True UPI ID (Hidden Identity)</label>
          <input
            className="form-control"
            placeholder="user@realbank"
            value={formData.trueUpi}
            onChange={(e) => setFormData({ ...formData, trueUpi: e.target.value })}
          />
        </div>

        <button 
          className="btn btn-primary w-100" 
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? "Waiting for Sensor..." : "Register Biometric Device"}
        </button>

        <div className="mt-3 text-center">
            <small className="text-secondary">
                Your private biometric data never leaves your device's secure hardware.
            </small>
        </div>
      </div>
    </div>
  );
};

export default Register;