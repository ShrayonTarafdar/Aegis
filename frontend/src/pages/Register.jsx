// // import React, { useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // // 1. Import the biometric helper
// // import { startRegistration } from "@simplewebauthn/browser";

// // const Register = () => {
// //   const [formData, setFormData] = useState({ username: "", trueUpi: "" });
// //   const [loading, setLoading] = useState(false);
// //   const navigate = useNavigate();

// //   const handleRegister = async () => {
// //     if (!formData.username || !formData.trueUpi) {
// //       alert("Please fill in all fields");
// //       return;
// //     }

// //     setLoading(true);
// //     const fakeUpi = `${formData.username.toLowerCase()}@aegisbank`;

// //     try {
// //       // --- STEP 1: Get Registration Options from Backend ---
// //       // We send the user info to the backend to get a cryptographic challenge
// //       const optionsResponse = await fetch("http://localhost:8000/webauthn/register/options", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({
// //           username: formData.username,
// //           trueUpi: formData.trueUpi,
// //           fakeUpi: fakeUpi,
// //           publicKey: "not_needed_for_webauthn" // Backend generates this now
// //         }),
// //       });

// //       if (!optionsResponse.ok) {
// //         const error = await optionsResponse.json();
// //         throw new Error(error.detail || "Failed to get registration options");
// //       }

// //       const options = await optionsResponse.json();

// //       // --- STEP 2: Trigger Browser Biometrics (TouchID/FaceID) ---
// //       // This command opens the native system popup for the fingerprint/face scan
// //       const attestationResponse = await startRegistration(options);

// //       // --- STEP 3: Verify the Biometric Credential with Backend ---
// //       // This sends the "proof" from the hardware back to the server to save the user
// //       const verifyResponse = await fetch(
// //         `/webauthn/register/verify?username=${formData.username}`,
// //         {
// //           method: "POST",
// //           headers: { "Content-Type": "application/json" },
// //           body: JSON.stringify(attestationResponse),
// //         }
// //       );

// //       if (verifyResponse.ok) {
// //         // We no longer store Private Keys in LocalStorage (it's inside the hardware now!)
// //         // We only store info for the UI
// //         localStorage.setItem("aegis_username", formData.username);
// //         localStorage.setItem("aegis_true_upi", formData.trueUpi);
// //         localStorage.setItem("aegis_fake_upi", fakeUpi);
        
// //         alert("Biometric Device Registered Successfully!");
// //         navigate("/login");
// //       } else {
// //         throw new Error("Verification failed on server");
// //       }
// //     } catch (error) {
// //       console.error(error);
// //       alert(error.message || "Biometric registration failed. Ensure your device supports it.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="container mt-5">
// //       <div className="card p-4 shadow-sm mx-auto" style={{ maxWidth: "400px" }}>
// //         <h2 className="text-center mb-4">Project Aegis</h2>
// //         <p className="text-muted text-center small">Secure Biometric Onboarding</p>
        
// //         <div className="mb-3">
// //           <label className="form-label">Username</label>
// //           <input
// //             className="form-control"
// //             placeholder="e.g. Niyati"
// //             value={formData.username}
// //             onChange={(e) => setFormData({ ...formData, username: e.target.value })}
// //           />
// //         </div>

// //         <div className="mb-3">
// //           <label className="form-label">True UPI ID (Hidden Identity)</label>
// //           <input
// //             className="form-control"
// //             placeholder="user@realbank"
// //             value={formData.trueUpi}
// //             onChange={(e) => setFormData({ ...formData, trueUpi: e.target.value })}
// //           />
// //         </div>

// //         <button 
// //           className="btn btn-primary w-100" 
// //           onClick={handleRegister}
// //           disabled={loading}
// //         >
// //           {loading ? "Waiting for Sensor..." : "Register Biometric Device"}
// //         </button>

// //         <div className="mt-3 text-center">
// //             <small className="text-secondary">
// //                 Your private biometric data never leaves your device's secure hardware.
// //             </small>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Register;

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { startRegistration } from "@simplewebauthn/browser";

// const Register = () => {
//   const [formData, setFormData] = useState({ username: "", trueUpi: "" });
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleRegister = async () => {
//     if (!formData.username || !formData.trueUpi) {
//       alert("Please fill in all fields");
//       return;
//     }

//     setLoading(true);

//     try {
//       // Step 1: Options
//       const optionsRes = await fetch("http://localhost:8000/webauthn/register/options", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           username: formData.username,
//           trueUpi: formData.trueUpi,
//         }),
//       });

//       if (!optionsRes.ok) throw new Error("Failed to get registration options");
//       const options = await optionsRes.json();

//       // Step 2: Fingerprint/Face Scan
//       const attestation = await startRegistration(options);

//       // Step 3: Verification (Updated to send combined JSON body)
//       const verifyRes = await fetch("http://localhost:8000/webauthn/register/verify", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           username: formData.username,
//           credential: attestation,
//         }),
//       });

//       if (verifyRes.ok) {
//         const result = await verifyRes.json();
        
//         // Use the randomized server ID (e.g. AEGIS-7A2B-91C4)
//         localStorage.setItem("aegis_fake_upi", result.blinded_id);
//         localStorage.setItem("aegis_username", formData.username);
        
//         alert(`Success! Your Aegis ID is: ${result.blinded_id}`);
//         navigate("/login");
//       } else {
//         const err = await verifyRes.json();
//         throw new Error(err.detail);
//       }
//     } catch (error) {
//       alert(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };
//   // const handleRegister = async () => {
//   //   if (!formData.username || !formData.trueUpi) {
//   //     alert("Please fill in all fields");
//   //     return;
//   //   }

//   //   setLoading(true);

//   //   try {
//   //     // --- STEP 1: Get Registration Options ---
//   //     // Note: Use relative paths for Render compatibility
//   //     const optionsResponse = await fetch("http://localhost:8000/webauthn/register/options", {
//   //       method: "POST",
//   //       headers: { "Content-Type": "application/json" },
//   //       body: JSON.stringify({
//   //         username: formData.username,
//   //         trueUpi: formData.trueUpi,
//   //       }),
//   //     });

//   //     if (!optionsResponse.ok) {
//   //       const error = await optionsResponse.json();
//   //       throw new Error(error.detail || "Failed to get registration options");
//   //     }

//   //     const options = await optionsResponse.json();

//   //     // --- STEP 2: Trigger Browser Biometrics ---
//   //     const attestationResponse = await startRegistration(options);

//   //     // --- STEP 3: Verify with Backend ---
//   //     // We send a single JSON body to match the RegistrationVerifyBody schema
//   //     const verifyResponse = await fetch("http://localhost:8000/webauthn/register/verify", {
//   //       method: "POST",
//   //       headers: { "Content-Type": "application/json" },
//   //       body: JSON.stringify({
//   //         username: formData.username,
//   //         credential: attestationResponse,
//   //       }),
//   //     });

//   //     if (verifyResponse.ok) {
//   //       const result = await verifyResponse.json();

//   //       // --- IMPORTANT: Sync with Backend Randomized ID ---
//   //       // result.blinded_id contains the AEGIS-XXXX-XXXX ID generated by the server
//   //       localStorage.setItem("aegis_username", formData.username);
//   //       localStorage.setItem("aegis_true_upi", formData.trueUpi);
//   //       localStorage.setItem("aegis_fake_upi", result.blinded_id); 
        
//   //       alert(`Biometric Device Registered!\nYour Aegis ID is: ${result.blinded_id}`);
//   //       navigate("/login");
//   //     } else {
//   //       const errorData = await verifyResponse.json();
//   //       throw new Error(errorData.detail || "Verification failed on server");
//   //     }
//   //   } catch (error) {
//   //     console.error(error);
//   //     alert(error.message || "Biometric registration failed.");
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   return (
//     <div className="container mt-5">
//       <div className="card p-4 shadow-sm mx-auto" style={{ maxWidth: "400px" }}>
//         <h2 className="text-center mb-2">Aegis Pay</h2>
//         <p className="text-muted text-center small mb-4">Secure Biometric Onboarding</p>
        
//         <div className="mb-3">
//           <label className="form-label fw-bold small">Create Username</label>
//           <input
//             className="form-control"
//             placeholder="e.g. niyati"
//             value={formData.username}
//             onChange={(e) => setFormData({ ...formData, username: e.target.value })}
//           />
//         </div>

//         <div className="mb-3">
//           <label className="form-label fw-bold small">True UPI ID (Private)</label>
//           <input
//             className="form-control"
//             placeholder="user@realbank"
//             value={formData.trueUpi}
//             onChange={(e) => setFormData({ ...formData, trueUpi: e.target.value })}
//           />
//         </div>

//         <button 
//           className="btn btn-primary w-100 py-2 fw-bold" 
//           onClick={handleRegister}
//           disabled={loading}
//         >
//           {loading ? (
//             <span className="spinner-border spinner-border-sm me-2"></span>
//           ) : null}
//           {loading ? "Scan Fingerprint/Face..." : "Register Biometric Device"}
//         </button>

//         <div className="mt-3 text-center">
//             <p style={{fontSize: '0.7rem'}} className="text-secondary">
//                 Your biometric data is encrypted within your device hardware and is never sent to our servers.
//             </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Register;


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { startRegistration } from "@simplewebauthn/browser";

const Register = () => {
  const [formData, setFormData] = useState({ username: "", trueUpi: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Helper to handle API URLs
  const API_URL = (path) => window.location.hostname === "localhost" 
    ? `http://localhost:8000${path}` 
    : path;

  const handleRegister = async () => {
    if (!formData.username || !formData.trueUpi) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Options call (using the helper)
      const optionsRes = await fetch(API_URL("/webauthn/register/options"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          trueUpi: formData.trueUpi, // Matches UserRegisterSchema
        }),
      });

      if (!optionsRes.ok) {
        const err = await optionsRes.json();
        throw new Error(err.detail || "Registration options failed");
      }
      
      const options = await optionsRes.json();
      const attestation = await startRegistration(options);

      // Step 3: Verification (Updated to send combined JSON body)
      const verifyRes = await fetch(API_URL("/webauthn/register/verify"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          credential: attestation,
        }),
      });

      if (verifyRes.ok) {
        const result = await verifyRes.json();
        
        // Sync with Backend Randomized ID
        localStorage.setItem("aegis_fake_upi", result.blinded_id);
        localStorage.setItem("aegis_username", formData.username);
        localStorage.setItem("aegis_true_upi", formData.trueUpi);
        
        alert(`Success! Aegis ID: ${result.blinded_id}`);
        navigate("/login");
      } else {
        const err = await verifyRes.json();
        throw new Error(err.detail);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow-sm mx-auto" style={{ maxWidth: "400px" }}>
        <h2 className="text-center mb-4">Aegis Pay</h2>
        <div className="mb-3">
          <label className="form-label small fw-bold">Create Username</label>
          <input className="form-control" value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
        </div>
        <div className="mb-3">
          <label className="form-label small fw-bold">True UPI ID (Private)</label>
          <input className="form-control" placeholder="user@realbank" value={formData.trueUpi}
            onChange={(e) => setFormData({ ...formData, trueUpi: e.target.value })} />
        </div>
        <button className="btn btn-primary w-100 py-2 fw-bold" onClick={handleRegister} disabled={loading}>
          {loading ? "Waiting for sensor..." : "Register Biometric Device"}
        </button>
      </div>
    </div>
  );
};

export default Register;