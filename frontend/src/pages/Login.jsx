// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// // Import the real biometric helper
// import { startAuthentication } from "@simplewebauthn/browser";

// const Login = () => {
//   const [username, setUsername] = useState("");
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleLogin = async () => {
//     if (!username) {
//       alert("Please enter your username");
//       return;
//     }

//     setLoading(true);
//     try {
//       // --- STEP 1: Get Login Options from Backend ---
//       // This tells the browser which Passkey/Credential ID to look for
//       const optionsResp = await fetch(`http://localhost:8000/webauthn/login/options?username=${username}`);
      
//       if (!optionsResp.ok) {
//         throw new Error("User not found or biometric device not registered.");
//       }
      
//       const options = await optionsResp.json();

//       // --- STEP 2: Trigger the Native Biometric Popup ---
//       // This opens the real TouchID / FaceID / Windows Hello prompt
//       const assertionResponse = await startAuthentication(options);

//       // --- STEP 3: Verify the hardware response with the Backend ---
//       const verifyResp = await fetch(`http://localhost:8000/webauthn/login/verify?username=${username}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(assertionResponse),
//       });

//       const result = await verifyResp.json();

//       if (verifyResp.ok) {
//         // Success! Store the session exactly like before
//         localStorage.setItem("active_session", JSON.stringify(result));
//         localStorage.setItem("aegis_fake_upi", result.fake_upi);
        
//         alert("Biometric Identity Verified!");
//         navigate("/dashboard");
//       } else {
//         throw new Error(result.detail || "Biometric match failed.");
//       }
//     } catch (error) {
//       console.error("Login Error:", error);
//       alert(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container mt-5">
//       <div className="card p-4 shadow-sm mx-auto" style={{ maxWidth: "400px" }}>
//         <h3 className="text-center">Biometric Portal</h3>
//         <p className="text-muted text-center small">
//           Identity hidden in pixels
//         </p>
//         <input
//           className="form-control mb-3"
//           placeholder="Username"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//         />
//         <button 
//           className="btn btn-dark w-100" 
//           onClick={handleLogin}
//           disabled={loading}
//         >
//           {loading ? "Waiting for Sensor..." : "Login with FaceID / TouchID"}
//           {/* <i className="bi bi-person-bounding-box me-2"></i>
//   {loading ? "Verifying..." : "Login with Biometrics (Face / Fingerprint)"} */}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Login;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { startAuthentication } from "@simplewebauthn/browser";

const Login = () => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Helper for Render vs Localhost compatibility
  const API_URL = (path) => window.location.hostname === "localhost" 
    ? `http://localhost:8000${path}` 
    : path;

  const handleLogin = async () => {
    if (!username) {
      alert("Please enter your username");
      return;
    }

    setLoading(true);
    try {
      // --- STEP 1: Get Login Options (GET Request) ---
      const optionsResp = await fetch(API_URL(`/webauthn/login/options?username=${username}`));
      
      if (!optionsResp.ok) {
        const err = await optionsResp.json();
        throw new Error(err.detail || "User not found.");
      }
      
      const options = await optionsResp.json();

      // --- STEP 2: Trigger Biometric Sensor ---
      const assertionResponse = await startAuthentication(options);

      // --- STEP 3: Verify (POST Request) ---
      // FIX: Send username and credential together in the BODY
      const verifyResp = await fetch(API_URL("/webauthn/login/verify"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          credential: assertionResponse, // This matches LoginVerifyBody.credential
        }),
      });

      const result = await verifyResp.json();

      if (verifyResp.ok) {
        // Store session for Dashboard use
        localStorage.setItem("active_session", JSON.stringify(result));
        localStorage.setItem("aegis_fake_upi", result.fake_upi);
        localStorage.setItem("aegis_true_upi", result.true_upi);
        
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
        <p className="text-muted text-center small">Identity hidden in pixels</p>
        <input
          className="form-control mb-3"
          placeholder="Enter Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button 
          className="btn btn-dark w-100 py-2 fw-bold" 
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <><span className="spinner-border spinner-border-sm me-2"></span>Authenticating...</>
          ) : "Login with Passkey / FaceID"}
        </button>
      </div>
    </div>
  );
};

export default Login;