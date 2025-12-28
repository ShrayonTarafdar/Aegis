import React, { useEffect, useState } from "react";

const Bank = () => {
  const [transactions, setTransactions] = useState([]);
  const [decodedIds, setDecodedIds] = useState({});

  const fetchTxs = () => {
    fetch("/admin/transactions")
      .then((res) => res.json())
      .then((data) => setTransactions(data));
  };

  useEffect(() => {
    fetchTxs();
  }, []);

  const revealIdentity = async (txId) => {
    const res = await fetch(`http://localhost:8000/admin/decode/${txId}`);
    const data = await res.json();
    setDecodedIds((prev) => ({ ...prev, [txId]: data.true_identity }));
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">
        Bank Central Ledger <span className="badge bg-danger">Auth Only</span>
      </h2>
      <table className="table table-hover shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>Timestamp</th>
            <th>Sender (Fake ID)</th>
            <th>Proof (Stego Image)</th>
            <th>Revealed True UPI</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td>{tx.timestamp}</td>
              <td>{tx.from_fake_id}</td>
              <td>
                <img
                  src={`data:image/png;base64,${tx.image_b64}`}
                  style={{
                    width: "50px",
                    cursor: "pointer",
                    borderRadius: "4px",
                  }}
                  onClick={() => alert("This image contains hidden metadata.")}
                  alt="stego"
                />
              </td>
              <td>
                {decodedIds[tx.id] ? (
                  <span className="badge bg-success">{decodedIds[tx.id]}</span>
                ) : (
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => revealIdentity(tx.id)}
                  >
                    Decode Identity
                  </button>
                )}
              </td>
              <td>${tx.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Bank;
