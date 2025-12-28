// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// const Dashboard = () => {
//   const [user, setUser] = useState(null);
//   const [balances, setBalances] = useState({
//     fake_balance: 100,
//     true_balance: 5000,
//   });
//   const navigate = useNavigate();

//   useEffect(() => {
//     const session = JSON.parse(localStorage.getItem("active_session"));
//     if (!session) {
//       navigate("/login");
//       return;
//     }
//     setUser(session);

//     // Fetch balances
//     fetch(`/balance/${session.fake_upi}`)
//       .then((res) => res.json())
//       .then((data) => setBalances(data));
//   }, []);

//   if (!user) return null;

//   return (
//     <div className="container mt-5">
//       <div className="row">
//         <div className="col-md-4">
//           <div className="card bg-primary text-white p-3 mb-3">
//             <h6>True Vault Balance</h6>
//             <h2>${balances.true_balance.toLocaleString()}</h2>
//             <small>Private to you</small>
//           </div>
//         </div>
//         <div className="col-md-4">
//           <div className="card bg-warning p-3 mb-3">
//             <h6>Public (Honeypot) Balance</h6>
//             <h2>${balances.fake_balance.toLocaleString()}</h2>
//             <small>Visible to the network: {user.fake_upi}</small>
//           </div>
//         </div>
//         <div className="col-md-4">
//           <div className="card p-3 shadow-sm border-0 bg-light">
//             <h5>Aegis Identity</h5>
//             <p className="mb-0">
//               <strong>ID:</strong> {user.fake_upi}
//             </p>
//             <p>
//               <strong>Status:</strong> Biometric Verified
//             </p>
//             <button
//               className="btn btn-outline-danger btn-sm"
//               onClick={() => {
//                 localStorage.clear();
//                 navigate("/login");
//               }}
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="mt-4 d-flex gap-3">
//         <button
//           className="btn btn-success p-3"
//           onClick={() => navigate("/pay")}
//         >
//           Make Blind Transaction
//         </button>
//         <button
//           className="btn btn-secondary p-3"
//           onClick={() => navigate("/bank")}
//         >
//           Bank Ledger (Admin)
//         </button>
//         <button
//           className="btn btn-danger p-3"
//           onClick={() => navigate("/hacker")}
//         >
//           Hacker Terminal
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [balances, setBalances] = useState({
    fake_balance: 0,
    true_balance: 0,
  });
  const navigate = useNavigate();

  // 1. Standalone fetch function
  const fetchBalances = (fakeUpi) => {
    fetch(`/balance/${fakeUpi}`)
      .then((res) => {
        if (!res.ok) throw new Error("Balance fetch failed");
        return res.json();
      })
      .then((data) => setBalances(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("active_session"));
    if (!session) {
      navigate("/login");
      return;
    }
    setUser(session);

    // 2. Initial Fetch
    fetchBalances(session.fake_upi);

    // 3. Sync Logic: Poll every 5 seconds 
    // (This ensures the dashboard updates even if a hacker makes a transaction)
    const interval = setInterval(() => fetchBalances(session.fake_upi), 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-4">
          <div className="card bg-primary text-white p-4 shadow-sm border-0 mb-3">
            <h6 className="opacity-75">True Vault Balance</h6>
            <h2 className="fw-bold">${balances.true_balance.toFixed(2)}</h2>
            <small>Encrypted Identity: Verified</small>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-warning p-4 shadow-sm border-0 mb-3">
            <h6 className="text-dark opacity-75">Honeypot Balance (Public)</h6>
            <h2 className="fw-bold text-dark">${balances.fake_balance.toFixed(2)}</h2>
            <small className="text-dark">Broadcast ID: {user.fake_upi}</small>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-4 shadow-sm border-0 bg-light mb-3">
            <h5>Aegis Identity</h5>
            <p className="mb-1 small"><strong>Status:</strong> Active</p>
            <p className="mb-3 small text-truncate"><strong>UPI:</strong> {user.fake_upi}</p>
            <button className="btn btn-outline-danger btn-sm" onClick={() => { localStorage.clear(); navigate("/login"); }}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 d-flex flex-wrap gap-3">
        <button className="btn btn-success px-4 py-3 fw-bold" onClick={() => navigate("/pay")}>
          Make Blind Transaction
        </button>
        <button className="btn btn-secondary px-4 py-3" onClick={() => navigate("/bank")}>
          View Admin Ledger
        </button>
        <button className="btn btn-danger px-4 py-3" onClick={() => navigate("/hacker")}>
          Hacker Terminal
        </button>
      </div>
    </div>
  );
};

export default Dashboard;