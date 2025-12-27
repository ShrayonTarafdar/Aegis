import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";

const CHALLENGE_OBJECTS = [
  "Pen",
  "Mobile Phone",
  "Key",
  "Water Bottle",
  "Wallet",
];

const Payment = () => {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [step, setStep] = useState(1);
  const [targetObject] = useState(
    CHALLENGE_OBJECTS[Math.floor(Math.random() * CHALLENGE_OBJECTS.length)]
  );
  const [loading, setLoading] = useState(false);

  const webcamRef = useRef(null);
  const navigate = useNavigate();

  const handlePayment = async () => {
    setLoading(true);
    const imageSrc = webcamRef.current.getScreenshot();
    const blob = await fetch(imageSrc).then((res) => res.blob());

    const session = JSON.parse(localStorage.getItem("active_session"));
    const trueUpi = localStorage.getItem("aegis_true_upi");

    const formData = new FormData();
    formData.append("file", blob, "identity_proof.png");
    formData.append("amount", amount);
    formData.append("to_fake_id", recipient);
    formData.append("from_fake_id", session.fake_upi);
    formData.append("true_upi", trueUpi);
    formData.append("required_object", targetObject);

    try {
      const res = await fetch("http://localhost:8000/transaction", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        // Save Transaction Locally
        const localHistory = JSON.parse(
          localStorage.getItem("aegis_tx_history") || "[]"
        );
        localHistory.unshift({
          to: recipient,
          amount: amount,
          date: new Date().toLocaleString(),
          status: "Verified by AI",
        });
        localStorage.setItem("aegis_tx_history", JSON.stringify(localHistory));

        alert("Transaction Blinded & Verified by Gemini!");
        navigate("/dashboard");
      } else {
        alert("Security Error: " + data.detail);
      }
    } catch (err) {
      alert("Connection Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div
        className="card shadow-lg mx-auto"
        style={{ maxWidth: "500px", borderRadius: "15px" }}
      >
        <div className="card-header bg-primary text-white text-center py-3">
          <h4 className="mb-0">Secure Blind Payment</h4>
        </div>
        <div className="card-body p-4">
          {step === 1 ? (
            <>
              <div className="mb-3">
                <label className="form-label">Recipient's Fake UPI</label>
                <input
                  className="form-control"
                  placeholder="bob@aegisbank"
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="form-label">Amount ($)</label>
                <input
                  className="form-control"
                  type="number"
                  placeholder="0.00"
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <button
                className="btn btn-primary w-100 py-2"
                onClick={() => setStep(2)}
              >
                Proceed to Proof of Life
              </button>
            </>
          ) : (
            <div className="text-center">
              <h5 className="text-danger mb-3 font-monospace">
                ACTION REQUIRED: Hold up a {targetObject.toUpperCase()}
              </h5>
              <div className="rounded overflow-hidden border mb-3">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/png"
                  className="w-100"
                />
              </div>
              <button
                className="btn btn-success w-100 py-2"
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? "AI is Verifying..." : "Confirm & Encrypt"}
              </button>
              <button
                className="btn btn-link btn-sm mt-2"
                onClick={() => setStep(1)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment;
