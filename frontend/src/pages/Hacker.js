import React, { useEffect, useState } from "react";

const Hacker = () => {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/hacker/accounts")
      .then((res) => res.json())
      .then((data) => setAccounts(data));
  }, []);

  return (
    <div className="container mt-5">
      <div className="bg-dark text-success p-4 rounded shadow">
        <h2 className="font-monospace">{">"} Aegis_Network_Infiltration...</h2>
        <p className="text-muted">Intercepting public ledger packets...</p>

        <div className="row mt-4">
          {accounts.map((acc) => (
            <div className="col-md-4 mb-3" key={acc.fake_upi}>
              <div className="card bg-black border-success text-success p-3">
                <h6>Target: {acc.fake_upi}</h6>
                <hr className="border-success" />
                <p className="mb-1">Detected Balance:</p>
                <h3 className="text-warning">${acc.honeypot_balance}</h3>
                <small className="text-danger">
                  Property: Low Priority (Honeypot Detected)
                </small>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 border border-success">
          <h5>Internal Logs:</h5>
          <p className="small mb-0 text-secondary">
            [WRN] Identities are pixel-shifted. No True UPI found in plaintext
            header.
            <br />
            [WRN] Attempting LSB brute force... Failed. Key required.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Hacker;
