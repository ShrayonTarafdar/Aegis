import React, { useEffect, useState } from "react";

const Hacker = () => {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    // Changed: Removed localhost URL for production deployment
    fetch("/hacker/accounts")
      .then((res) => res.json())
      .then((data) => setAccounts(data))
      .catch((err) => console.error("Hacker interception failed:", err));
  }, []);

  return (
    <div className="container mt-5">
      <div className="bg-dark text-success p-4 rounded shadow">
        <h2 className="font-monospace text-uppercase text-center border-bottom border-success pb-3 mb-4">
          {">"} Aegis_Network_Infiltration...
        </h2>
        <p className="text-muted small mb-4">
          Targeting public ledger packets at layer 7...
        </p>

        <div className="row mt-4">
          {accounts.map((acc) => (
            <div className="col-md-4 mb-3" key={acc.fake_upi}>
              <div className="card bg-black border-success text-success p-3 h-100">
                <h6 className="small text-muted">TARGET NODE:</h6>
                <div className="text-truncate fw-bold mb-2">{acc.fake_upi}</div>
                <hr className="border-success" />
                <p className="mb-1 small opacity-75">DETECTED LIQUIDITY:</p>
                <h3 className="text-warning mb-0">${acc.honeypot_balance}</h3>
                <div className="mt-auto pt-3">
                  <small className="text-danger fw-bold blinking">
                    [!] LOW PRIORITY HONEYPOT
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 border border-success bg-black">
          <h5 className="small text-uppercase">System Logs:</h5>
          <p
            className="small mb-0 text-secondary font-monospace"
            style={{ fontSize: "11px" }}
          >
            [WRN] Identities are pixel-shifted. No True UPI found in plaintext
            headers.
            <br />
            [WRN] Attempting LSB brute force decryption... FAILED.
            <br />
            [WRN] Steganography key required for identity unmasking.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Hacker;
