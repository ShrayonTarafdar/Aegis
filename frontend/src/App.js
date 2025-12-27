import React from "react";

function App() {
  return (
    <div className="bg-dark text-white min-vh-100 d-flex flex-column align-items-center justify-content-center">
      <header className="text-center mb-5">
        <h1 className="display-3 fw-bold text-info">PROJECT AEGIS</h1>
        <p className="lead text-secondary">The Blind Biometric Portal</p>
      </header>

      <div
        className="card bg-black border-secondary p-4 shadow-lg"
        style={{ width: "400px" }}
      >
        <div className="card-body">
          <h5 className="card-title text-center mb-4 text-uppercase tracking-widest">
            Authentication Required
          </h5>

          <div className="mb-3">
            <label className="form-label small text-secondary">
              FakeID Identifier
            </label>
            <input
              type="text"
              className="form-control bg-dark border-secondary text-white"
              placeholder="UUID-XXXX-XXXX"
            />
          </div>

          <button className="btn btn-outline-info w-100 py-2 fw-bold">
            INITIALIZE BIOMETRIC SCAN
          </button>
        </div>
      </div>

      <footer className="mt-5 small text-secondary">
        Hardware Key Status: <span className="text-success">READY</span>
      </footer>
    </div>
  );
}

export default App;
