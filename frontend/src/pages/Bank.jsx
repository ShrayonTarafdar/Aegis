// import React, { useEffect, useState } from "react";

// const Bank = () => {
//   const [transactions, setTransactions] = useState([]);
//   const [decodedIds, setDecodedIds] = useState({});

//   const fetchTxs = () => {
//     fetch("/admin/transactions")
//       .then((res) => res.json())
//       .then((data) => setTransactions(data));
//   };

//   useEffect(() => {
//     fetchTxs();
//   }, []);

//   const revealIdentity = async (txId) => {
//     const res = await fetch(`http://localhost:8000/admin/decode/${txId}`);
//     const data = await res.json();
//     setDecodedIds((prev) => ({ ...prev, [txId]: data.true_identity }));
//   };

//   return (
//     <div className="container mt-5">
//       <h2 className="mb-4">
//         Bank Central Ledger <span className="badge bg-danger">Auth Only</span>
//       </h2>
//       <table className="table table-hover shadow-sm">
//         <thead className="table-dark">
//           <tr>
//             <th>Timestamp</th>
//             <th>Sender (Fake ID)</th>
//             <th>Proof (Stego Image)</th>
//             <th>Revealed True UPI</th>
//             <th>Amount</th>
//           </tr>
//         </thead>
//         <tbody>
//           {transactions.map((tx) => (
//             <tr key={tx.id}>
//               <td>{tx.timestamp}</td>
//               <td>{tx.from_fake_id}</td>
//               <td>
//                 <img
//                   src={`data:image/png;base64,${tx.image_b64}`}
//                   style={{
//                     width: "50px",
//                     cursor: "pointer",
//                     borderRadius: "4px",
//                   }}
//                   onClick={() => alert("This image contains hidden metadata.")}
//                   alt="stego"
//                 />
//               </td>
//               <td>
//                 {decodedIds[tx.id] ? (
//                   <span className="badge bg-success">{decodedIds[tx.id]}</span>
//                 ) : (
//                   <button
//                     className="btn btn-sm btn-outline-primary"
//                     onClick={() => revealIdentity(tx.id)}
//                   >
//                     Decode Identity
//                   </button>
//                 )}
//               </td>
//               <td>${tx.amount}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default Bank;
import React, { useEffect, useState } from "react";

const Bank = () => {
  const [transactions, setTransactions] = useState([]);
  const [decodedIds, setDecodedIds] = useState({});
  const [loading, setLoading] = useState(true);

  // Helper for Render vs Localhost compatibility
  const API_URL = (path) => window.location.hostname === "localhost" 
    ? `http://localhost:8000${path}` 
    : path;

  const fetchTxs = async () => {
    try {
      const res = await fetch(API_URL("/admin/transactions"));
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error("Failed to fetch ledger:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTxs();
  }, []);

  const revealIdentity = async (txId) => {
    try {
      const res = await fetch(API_URL(`/admin/decode/${txId}`));
      const data = await res.json();
      setDecodedIds((prev) => ({ ...prev, [txId]: data.true_identity }));
    } catch (err) {
      alert("Error decoding image data.");
    }
  };

  if (loading) return <div className="container mt-5">Loading Ledger...</div>;

  return (
    <div className="container mt-5">
      <h2 className="mb-4 d-flex align-items-center gap-3">
        Bank Central Ledger 
        <span className="badge bg-danger fs-6">Restricted Access</span>
      </h2>
      
      <div className="table-responsive">
        <table className="table table-bordered table-hover shadow-sm bg-white">
          <thead className="table-dark">
            <tr>
              <th>Timestamp</th>
              <th>Sender (Fake ID)</th>
              <th className="text-center">Proof (Stego Image)</th>
              <th>Revealed True UPI</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <tr key={tx.id} className="align-middle">
                  <td className="small text-muted">{tx.timestamp}</td>
                  <td className="fw-bold">{tx.from_fake_id}</td>
                  <td className="text-center">
                    <img
                      src={`data:image/png;base64,${tx.image_b64}`}
                      style={{
                        width: "60px",
                        height: "40px",
                        objectFit: "cover",
                        cursor: "pointer",
                        borderRadius: "4px",
                        border: "1px solid #dee2e6"
                      }}
                      onClick={() => alert("Hidden metadata detected in LSB layers.")}
                      alt="stego proof"
                    />
                  </td>
                  <td>
                    {decodedIds[tx.id] ? (
                      <span className="badge bg-success p-2">{decodedIds[tx.id]}</span>
                    ) : (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => revealIdentity(tx.id)}
                      >
                        Scan & Decode
                      </button>
                    )}
                  </td>
                  <td className="fw-bold text-success">${parseFloat(tx.amount).toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-5 text-muted">
                  No transactions have been blinded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Bank;