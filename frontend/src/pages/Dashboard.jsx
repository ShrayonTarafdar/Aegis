import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [balances, setBalances] = useState({
    fake_balance: 0,
    true_balance: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("active_session"));
    if (!session) {
      navigate("/login");
      return;
    }
    setUser(session);

    // Fetch balances
    fetch(`http://localhost:8000/balance/${session.fake_upi}`)
      .then((res) => res.json())
      .then((data) => setBalances(data));
  }, []);

  if (!user) return null;

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-4">
          <div className="card bg-primary text-white p-3 mb-3">
            <h6>True Vault Balance</h6>
            <h2>${balances.true_balance.toLocaleString()}</h2>
            <small>Private to you</small>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-warning p-3 mb-3">
            <h6>Public (Honeypot) Balance</h6>
            <h2>${balances.fake_balance.toLocaleString()}</h2>
            <small>Visible to the network: {user.fake_upi}</small>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 shadow-sm border-0 bg-light">
            <h5>Aegis Identity</h5>
            <p className="mb-0">
              <strong>ID:</strong> {user.fake_upi}
            </p>
            <p>
              <strong>Status:</strong> Biometric Verified
            </p>
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 d-flex gap-3">
        <button
          className="btn btn-success p-3"
          onClick={() => navigate("/pay")}
        >
          Make Blind Transaction
        </button>
        <button
          className="btn btn-secondary p-3"
          onClick={() => navigate("/bank")}
        >
          Bank Ledger (Admin)
        </button>
        <button
          className="btn btn-danger p-3"
          onClick={() => navigate("/hacker")}
        >
          Hacker Terminal
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
