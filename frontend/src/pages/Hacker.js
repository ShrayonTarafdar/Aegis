import React, { useEffect, useState } from "react";

const Hacker = () => {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [logs, setLogs] = useState([]);

  // 1. Fetch data and simulate "interception"
  const fetchData = async () => {
    try {
      const accRes = await fetch("http://localhost:8000/hacker/accounts");
      const accData = await accRes.json();
  
      // SAFETY CHECK: Only set accounts if the data is an array
      if (Array.isArray(accData)) {
        setAccounts(accData);
      } else {
        console.error("API did not return an array:", accData);
      }
  
      // Same for transactions
      const txRes = await fetch("http://localhost:8000/admin/transactions");
      const txData = await txRes.json();
      if (Array.isArray(txData)) {
          setTransactions(txData);
      }
    } catch (err) {
      console.error("Link down...", err);
    }
  };

  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${time}] ${msg}`, ...prev].slice(0, 10));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [transactions.length]);

  return (
    <div className="container-fluid mt-4 bg-black min-vh-100 p-4">
      <div className="text-success font-monospace">
        <h2>{">"} AEGIS_SYSTEM_INFILTRATION_V2.0</h2>
        <p className="text-warning">Status: Monitoring Public Ledger (Blinded Mode Active)</p>

        <div className="row">
          {/* Left Side: Intercepted Accounts (Honeypot Data) */}
          <div className="col-md-7">
            <h5 className="border-bottom border-success pb-2">Targeted Accounts (Public View)</h5>
            <div className="row">
              {accounts.map((acc) => (
                <div className="col-md-6 mb-3" key={acc.fake_upi}>
                  <div className="border border-success p-3 bg-dark">
                    <div className="d-flex justify-content-between">
                      <small>ID: {acc.fake_upi}</small>
                      <span className="badge bg-danger text-white">FAKE</span>
                    </div>
                    <h3 className="text-warning mt-2">${acc.honeypot_balance.toFixed(2)}</h3>
                    <div className="progress bg-secondary" style={{ height: "5px" }}>
                      <div className="progress-bar bg-success" style={{ width: "40%" }}></div>
                    </div>
                    <small className="text-secondary mt-1 d-block">No link to True Identity found.</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Intercepted Transactions (Stego Images) */}
          <div className="col-md-5">
            <h5 className="border-bottom border-success pb-2">Intercepted Packets (Steganography)</h5>
            <div className="overflow-auto" style={{ maxHeight: "500px" }}>
              {transactions.reverse().map((tx) => (
                <div className="card bg-black border-secondary mb-3 text-success p-2" key={tx.id}>
                  <div className="row g-0">
                    <div className="col-4">
                      {/* Show the actual stego image */}
                      <img 
                        src={`data:image/png;base64,${tx.image_b64}`} 
                        className="img-fluid border border-success opacity-75" 
                        alt="packet" 
                      />
                    </div>
                    <div className="col-8 ps-2">
                      <small className="d-block text-warning">TX_REF: {tx.id}</small>
                      <small className="d-block">Amount: ${tx.amount}</small>
                      <small className="text-danger" style={{fontSize: '0.7rem'}}>
                        DATA_BLINDED: True UPI is hidden in pixels.
                      </small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Console Log at Bottom */}
        <div className="mt-4 p-3 bg-dark border border-success" style={{minHeight: '150px'}}>
          <h6 className="text-white">Live Terminal Output:</h6>
          <div style={{ fontSize: '0.85rem' }}>
            {logs.length === 0 && <p className="text-secondary">Scanning for network activity...</p>}
            {logs.map((log, i) => (
              <div key={i} className={log.includes('[!]') ? 'text-warning' : log.includes('[ERR]') ? 'text-danger' : 'text-success'}>
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hacker;