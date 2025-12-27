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
        rp: { name: "Aegis Bank" },
        user: {
          id: Uint8Array.from(formData.username, (c) => c.charCodeAt(0)),
          name: formData.username,
          displayName: formData.username,
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }], // ES256
        authenticatorSelection: { authenticatorAttachment: "platform" }, // Triggers FaceID/TouchID
        timeout: 60000,
      },
    };

    try {
      const credential = await navigator.credentials.create(
        createCredentialOptions
      );
      // On success, we have the public key
      const fakeUpi = `${formData.username.toLowerCase()}@aegisbank`;

      const response = await fetch("http://localhost:8000/register", {
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
        alert("Biometric Device Registered via Hardware!");
        navigate("/login");
      }
    } catch (err) {
      console.error("WebAuthn Error:", err);
      alert("Biometric prompt failed. Ensure you are on localhost/https.");
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
