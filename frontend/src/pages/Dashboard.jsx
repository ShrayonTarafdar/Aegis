import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, ShieldCheck, History, User } from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [balances, setBalances] = useState({
    fake_balance: 0,
    true_balance: 0,
  });
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("active_session"));
    if (!session) {
      navigate("/login");
      return;
    }
    setUser(session);

    // Fetch Balances from Bank
    fetch(`http://localhost:8000/balance/${session.fake_upi}`)
      .then((res) => res.json())
      .then((data) => setBalances(data));

    // Load local history
    const localHistory = JSON.parse(
      localStorage.getItem("aegis_tx_history") || "[]"
    );
    setHistory(localHistory);
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="container mt-4">
      <div className="row g-4">
        {/* Header Profile */}
        <div className="col-12">
          <div className="card border-0 bg-dark text-white p-4 shadow-sm">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-0">Welcome, {user.username}</h2>
                <p className="text-info mb-0">Identity: {user.fake_upi}</p>
              </div>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => {
                  localStorage.removeItem("active_session");
                  navigate("/login");
                }}
              >
                Logout Portal
              </button>
            </div>
          </div>
        </div>

        {/* Balances */}
        <div className="col-md-6">
          <div className="card h-100 border-0 shadow-sm bg-primary text-white p-4">
            <ShieldCheck size={32} className="mb-3" />
            <h6>True Vault Balance</h6>
            <h3>${balances.true_balance.toLocaleString()}</h3>
            <small className="opacity-75">Encrypted at the kernel level</small>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card h-100 border-0 shadow-sm bg-light p-4">
            <CreditCard size={32} className="mb-3 text-primary" />
            <h6>Public Honeypot Balance</h6>
            <h3>${balances.fake_balance.toLocaleString()}</h3>
            <small className="text-muted text-truncate">
              Visible on Network
            </small>
          </div>
        </div>

        {/* Local History */}
        <div className="col-md-8">
          <div className="card border-0 shadow-sm p-4">
            <h5 className="mb-4 d-flex align-items-center">
              <History size={20} className="me-2" /> Local Device History
            </h5>
            <div className="list-group list-group-flush">
              {history.length === 0 ? (
                <p className="text-muted text-center py-4">
                  No recent local transactions.
                </p>
              ) : (
                history.map((tx, idx) => (
                  <div
                    key={idx}
                    className="list-group-item d-flex justify-content-between px-0 py-3"
                  >
                    <div>
                      <p className="mb-0 fw-bold">To: {tx.to}</p>
                      <small className="text-muted">{tx.date}</small>
                    </div>
                    <div className="text-end">
                      <p className="mb-0 text-success fw-bold">-${tx.amount}</p>
                      <span className="badge bg-light text-dark border">
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Side Actions */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 bg-light mb-4">
            <button
              className="btn btn-primary w-100 mb-3 py-3 fw-bold"
              onClick={() => navigate("/pay")}
            >
              NEW BLIND PAYMENT
            </button>
            <button
              className="btn btn-outline-dark w-100 mb-2"
              onClick={() => navigate("/bank")}
            >
              Admin Ledger
            </button>
            <button
              className="btn btn-outline-danger w-100"
              onClick={() => navigate("/hacker")}
            >
              Hacker View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
