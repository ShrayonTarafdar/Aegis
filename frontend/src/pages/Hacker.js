// import React, { useEffect, useState } from "react";

// const Hacker = () => {
//   const [accounts, setAccounts] = useState([]);
//   const [transactions, setTransactions] = useState([]);
//   const [logs, setLogs] = useState([]);

//   // 1. Fetch data and simulate "interception"
//   const fetchData = async () => {
//     try {
//       const accRes = await fetch("http://localhost:8000/hacker/accounts");
//       const accData = await accRes.json();
  
//       // SAFETY CHECK: Only set accounts if the data is an array
//       if (Array.isArray(accData)) {
//         setAccounts(accData);
//       } else {
//         console.error("API did not return an array:", accData);
//       }
  
//       // Same for transactions
//       const txRes = await fetch("http://localhost:8000/admin/transactions");
//       const txData = await txRes.json();
//       if (Array.isArray(txData)) {
//           setTransactions(txData);
//       }
//     } catch (err) {
//       console.error("Link down...", err);
//     }
//   };

//   const addLog = (msg) => {
//     const time = new Date().toLocaleTimeString();
//     setLogs((prev) => [`[${time}] ${msg}`, ...prev].slice(0, 10));
//   };

//   useEffect(() => {
//     fetchData();
//     const interval = setInterval(fetchData, 3000); // Poll every 3 seconds
//     return () => clearInterval(interval);
//   }, [transactions.length]);

//   return (
//     <div className="container-fluid mt-4 bg-black min-vh-100 p-4">
//       <div className="text-success font-monospace">
//         <h2>{">"} AEGIS_SYSTEM_INFILTRATION_V2.0</h2>
//         <p className="text-warning">Status: Monitoring Public Ledger (Blinded Mode Active)</p>

//         <div className="row">
//           {/* Left Side: Intercepted Accounts (Honeypot Data) */}
//           <div className="col-md-7">
//             <h5 className="border-bottom border-success pb-2">Targeted Accounts (Public View)</h5>
//             <div className="row">
//               {accounts.map((acc) => (
//                 <div className="col-md-6 mb-3" key={acc.fake_upi}>
//                   <div className="border border-success p-3 bg-dark">
//                     <div className="d-flex justify-content-between">
//                       <small>ID: {acc.fake_upi}</small>
//                       <span className="badge bg-danger text-white">FAKE</span>
//                     </div>
//                     <h3 className="text-warning mt-2">${acc.honeypot_balance.toFixed(2)}</h3>
//                     <div className="progress bg-secondary" style={{ height: "5px" }}>
//                       <div className="progress-bar bg-success" style={{ width: "40%" }}></div>
//                     </div>
//                     <small className="text-secondary mt-1 d-block">No link to True Identity found.</small>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Right Side: Intercepted Transactions (Stego Images) */}
//           <div className="col-md-5">
//             <h5 className="border-bottom border-success pb-2">Intercepted Packets (Steganography)</h5>
//             <div className="overflow-auto" style={{ maxHeight: "500px" }}>
//               {transactions.reverse().map((tx) => (
//                 <div className="card bg-black border-secondary mb-3 text-success p-2" key={tx.id}>
//                   <div className="row g-0">
//                     <div className="col-4">
//                       {/* Show the actual stego image */}
//                       <img 
//                         src={`data:image/png;base64,${tx.image_b64}`} 
//                         className="img-fluid border border-success opacity-75" 
//                         alt="packet" 
//                       />
//                     </div>
//                     <div className="col-8 ps-2">
//                       <small className="d-block text-warning">TX_REF: {tx.id}</small>
//                       <small className="d-block">Amount: ${tx.amount}</small>
//                       <small className="text-danger" style={{fontSize: '0.7rem'}}>
//                         DATA_BLINDED: True UPI is hidden in pixels.
//                       </small>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Console Log at Bottom */}
//         <div className="mt-4 p-3 bg-dark border border-success" style={{minHeight: '150px'}}>
//           <h6 className="text-white">Live Terminal Output:</h6>
//           <div style={{ fontSize: '0.85rem' }}>
//             {logs.length === 0 && <p className="text-secondary">Scanning for network activity...</p>}
//             {logs.map((log, i) => (
//               <div key={i} className={log.includes('[!]') ? 'text-warning' : log.includes('[ERR]') ? 'text-danger' : 'text-success'}>
//                 {log}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Hacker;
import React, { useEffect, useState, useRef } from "react";

const Hacker = () => {
  const [accounts, setAccounts] = useState([]);
  const [history, setHistory] = useState([]);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const fetchData = async () => {
    try {
      const accRes = await fetch("http://localhost:8000/hacker/accounts");
      const accData = await accRes.json();
      if (Array.isArray(accData)) setAccounts(accData);

      const txRes = await fetch("http://localhost:8000/hacker/transactions");
      const txData = await txRes.json();
      if (Array.isArray(txData)) setHistory(txData);
    } catch (err) { console.error("Sync Error:", err); }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const startCamera = async () => {
    try {
        setIsCameraOpen(true);
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
        alert("Camera access denied or not found");
        setIsCameraOpen(false);
    }
  };

  const capturePhoto = () => {
    const context = canvasRef.current.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, 320, 240);
    setCapturedImage(canvasRef.current.toDataURL("image/png"));
    
    const stream = videoRef.current.srcObject;
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    
    if (!capturedImage) return alert("Please complete biometric verification first.");
    if (accounts.length === 0) return alert("Account data not loaded.");
    
    setLoading(true);

    try {
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        const file = new File([blob], "verify.png", { type: "image/png" });

        const formData = new FormData();
        // 1. Ensure amount is sent as a number/float
        formData.append("amount", parseFloat(amount)); 
        formData.append("to_id", recipient);
        // 2. Ensure from_id is exactly the fake_upi from your DB
        formData.append("from_id", accounts[0]?.fake_upi); 
        formData.append("file", file);

        const res = await fetch("http://localhost:8000/hacker/transaction", { 
            method: "POST", 
            body: formData 
        });

        if (res.ok) {
            alert("✅ Payment Successful");
            setAmount(""); 
            setRecipient(""); 
            setCapturedImage(null);
            fetchData(); 
        } else {
            const errorData = await res.json();
            // 3. Better error reporting for debugging
            const msg = typeof errorData.detail === 'string' 
                ? errorData.detail 
                : JSON.stringify(errorData.detail);
            alert(`❌ Payment Failed: ${msg || "Check console for details"}`);
        }
    } catch (err) {
        console.error("Transfer Error:", err);
        alert("❌ Network Error: Connection refused.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-dark bg-primary shadow-sm mb-4">
        <div className="container">
          <span className="navbar-brand mb-0 h1 fw-bold">Aegis Pay <small className="fw-normal opacity-75 ms-2">| Secure Digital Portal</small></span>
          <div className="text-white small">
             Logged as: <span className="fw-bold">{accounts[0]?.fake_upi || "..."}</span>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="row g-4">
          <div className="col-lg-7">
            {/* Balance Card */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4 text-center text-md-start">
                <h6 className="text-muted text-uppercase fw-bold mb-1" style={{fontSize: '0.75rem'}}>Available Balance</h6>
                <h2 className="display-5 fw-bold text-dark mb-0">
                    ${accounts[0]?.honeypot_balance ? accounts[0].honeypot_balance.toFixed(2) : "0.00"}
                </h2>
              </div>
            </div>

            {/* Transfer Card */}
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0 fw-bold">Transfer Funds</h5>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleTransfer}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold">Recipient UPI ID</label>
                      <input className="form-control form-control-lg" placeholder="e.g. AEGIS-1234" required
                        value={recipient} onChange={e => setRecipient(e.target.value)} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold">Amount ($)</label>
                      <input className="form-control form-control-lg" type="number" step="0.01" placeholder="0.00" required
                        value={amount} onChange={e => setAmount(e.target.value)} />
                    </div>
                  </div>

                  <div className="border rounded-3 p-4 bg-light text-center border-dashed mt-2">
                    {!isCameraOpen && !capturedImage && (
                        <div className="py-2">
                            <button type="button" className="btn btn-outline-primary px-4" onClick={startCamera}>
                                <i className="bi bi-camera me-2"></i>Verify Identity
                            </button>
                            <p className="text-muted small mt-2 mb-0">Biometric scan required to authorize transaction</p>
                        </div>
                    )}
                    {isCameraOpen && (
                      <div className="mx-auto" style={{maxWidth: '400px'}}>
                        <video ref={videoRef} autoPlay className="w-100 rounded shadow-sm mb-3" style={{transform: 'scaleX(-1)'}}></video>
                        <button type="button" className="btn btn-primary w-100" onClick={capturePhoto}>Capture & Verify</button>
                      </div>
                    )}
                    {capturedImage && (
                      <div className="position-relative mx-auto" style={{maxWidth: '200px'}}>
                        <img src={capturedImage} className="w-100 rounded border shadow-sm" alt="verified" />
                        <span className="badge bg-success position-absolute top-0 end-0 m-2">IDENTITY VERIFIED</span>
                        <button type="button" className="btn btn-link btn-sm d-block mx-auto mt-2 text-decoration-none" onClick={() => setCapturedImage(null)}>Retake Photo</button>
                      </div>
                    )}
                    <canvas ref={canvasRef} width="320" height="240" className="d-none"></canvas>
                  </div>

                  <button type="submit" className="btn btn-primary w-100 py-3 mt-4 fw-bold" disabled={loading || !capturedImage}>
                    {loading ? "Processing Transaction..." : "Authorize & Send Payment"}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            {/* History Card - Updated to match your Backend Keys */}
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0 fw-bold">Recent Activity</h5>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush" style={{ maxHeight: "550px", overflowY: "auto" }}>
                  {history.length > 0 ? history.slice(0).reverse().map((tx) => (
                    <div key={tx.tx_id} className="list-group-item p-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <span className="fw-bold d-block text-dark">{tx.receiver_account}</span>
                            <small className="text-muted">{tx.timestamp}</small>
                        </div>
                        <div className="text-end">
                            <span className="text-danger fw-bold d-block">-${tx.amount.toFixed(2)}</span>
                            <small className="badge bg-light text-dark border" style={{fontSize: '0.6rem'}}>{tx.tx_id}</small>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="p-5 text-center text-muted">
                        <p>No transaction history found.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hacker;