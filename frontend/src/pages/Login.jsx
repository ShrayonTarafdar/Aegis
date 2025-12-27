import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// Import the real biometric helper
import { startAuthentication } from "@simplewebauthn/browser";

const Login = () => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username) {
      alert("Please enter your username");
      return;
    }

    setLoading(true);
    try {
      // --- STEP 1: Get Login Options from Backend ---
      // This tells the browser which Passkey/Credential ID to look for
      const optionsResp = await fetch(`http://localhost:8000/webauthn/login/options?username=${username}`);
      
      if (!optionsResp.ok) {
        throw new Error("User not found or biometric device not registered.");
      }
      
      const options = await optionsResp.json();

      // --- STEP 2: Trigger the Native Biometric Popup ---
      // This opens the real TouchID / FaceID / Windows Hello prompt
      const assertionResponse = await startAuthentication(options);

      // --- STEP 3: Verify the hardware response with the Backend ---
      const verifyResp = await fetch(`http://localhost:8000/webauthn/login/verify?username=${username}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assertionResponse),
      });

      const result = await verifyResp.json();

      if (verifyResp.ok) {
        // Success! Store the session exactly like before
        localStorage.setItem("active_session", JSON.stringify(result));
        localStorage.setItem("aegis_fake_upi", result.fake_upi);
        
        alert("Biometric Identity Verified!");
        navigate("/dashboard");
      } else {
        throw new Error(result.detail || "Biometric match failed.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
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
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button 
          className="btn btn-dark w-100" 
          onClick={handleLogin}
          disabled={loading}
        >
          {/* {loading ? "Waiting for Sensor..." : "Login with FaceID / TouchID"} */}
          <i className="bi bi-person-bounding-box me-2"></i>
  {loading ? "Verifying..." : "Login with Biometrics (Face / Fingerprint)"}
        </button>
      </div>
    </div>
  );
};

export default Login;