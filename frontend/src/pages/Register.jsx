import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({ username: "", trueUpi: "" });
  const navigate = useNavigate();

  const handleRegister = async () => {
    // 1. Trigger REAL WebAuthn Browser Popup
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const createCredentialOptions = {
      publicKey: {
        challenge,
        rp: {
          name: "Aegis Bank",
          // Note: In deployment, the browser automatically handles the domain ID
        },
        user: {
          id: Uint8Array.from(formData.username, (c) => c.charCodeAt(0)),
          name: formData.username,
          displayName: formData.username,
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }], // ES256
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
        },
        timeout: 60000,
      },
    };

    try {
      const credential = await navigator.credentials.create(
        createCredentialOptions
      );

      const fakeUpi = `${formData.username.toLowerCase()}@aegisbank`;

      // Changed: Removed localhost URL for production deployment
      const response = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          fakeUpi,
          publicKey: btoa(
            String.fromCharCode(
              ...new Uint8Array(credential.response.attestationObject)
            )
          ),
        }),
      });

      if (response.ok) {
        localStorage.setItem("aegis_true_upi", formData.trueUpi);
        localStorage.setItem("aegis_fake_upi", fakeUpi);
        // We store a mock private key locally to simulate signing in the Login page
        localStorage.setItem(
          "aegis_priv_key",
          "AEGIS_PRIV_" + Math.random().toString(36)
        );

        alert("Biometric Identity Registered on Hardware!");
        navigate("/login");
      }
    } catch (err) {
      console.error("WebAuthn Error:", err);
      alert(
        "Registration Failed. Ensure you are using HTTPS and have a biometric sensor enabled."
      );
    }
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow-sm mx-auto" style={{ maxWidth: "400px" }}>
        <h2 className="text-center mb-4">Aegis Portal</h2>
        <p className="text-muted small text-center">
          Enroll your hardware biometric key
        </p>
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            className="form-control"
            placeholder="Choose a username"
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />
        </div>
        <div className="mb-3">
          <label className="form-label">True UPI ID</label>
          <input
            className="form-control"
            placeholder="yourname@realbank"
            onChange={(e) =>
              setFormData({ ...formData, trueUpi: e.target.value })
            }
          />
          <div className="form-text">This will be hidden in image pixels.</div>
        </div>
        <button className="btn btn-primary w-100 py-2" onClick={handleRegister}>
          Register Device
        </button>
      </div>
    </div>
  );
};

export default Register;
