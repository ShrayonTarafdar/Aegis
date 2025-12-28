import React, { useState, useRef } from "react";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";

const Payment = () => {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [step, setStep] = useState(1); // 1: Details, 2: Photo
  const webcamRef = useRef(null);
  const navigate = useNavigate();
  const handlePayment = async () => {
    if (!amount || !recipient) return alert("Please fill details");
    
    const imageSrc = webcamRef.current.getScreenshot();
    const session = JSON.parse(localStorage.getItem("active_session"));
    // Ensure this matches what you saved during registration/login
    const trueUpi = localStorage.getItem("aegis_true_upi") || "anonymous@realbank";

    const blob = await fetch(imageSrc).then((res) => res.blob());

    const formData = new FormData();
    formData.append("file", blob, "capture.png");
    formData.append("amount", parseFloat(amount));
    formData.append("to_fake_id", recipient);
    formData.append("from_fake_id", session.fake_upi);
    formData.append("true_upi", trueUpi);

    try {
        const res = await fetch("http://localhost:8000/transaction", {
            method: "POST",
            body: formData,
        });

        if (res.ok) {
            alert("Transaction Blinded & Sent!");
            navigate("/dashboard"); // Now Dashboard useEffect will fetch fresh data
        } else {
            const err = await res.json();
            alert("Error: " + err.detail);
        }
    } catch (e) {
        alert("Server connection failed");
    }
};
  // const handlePayment = async () => {
  //   const imageSrc = webcamRef.current.getScreenshot();
  //   const session = JSON.parse(localStorage.getItem("active_session"));
  //   const trueUpi = localStorage.getItem("aegis_true_upi");

  //   // Convert base64 to blob for upload
  //   const blob = await fetch(imageSrc).then((res) => res.blob());

  //   const formData = new FormData();
  //   formData.append("file", blob, "capture.png");
  //   formData.append("amount", amount);
  //   formData.append("to_fake_id", recipient);
  //   formData.append("from_fake_id", session.fake_upi);
  //   formData.append("true_upi", trueUpi);

  //   const res = await fetch("/transaction", {
  //     method: "POST",
  //     body: formData,
  //   });

  //   if (res.ok) {
  //     alert("Transaction Blinded & Sent!");
  //     navigate("/dashboard");
  //   }
  // };

  return (
    <div className="container mt-5">
      <div className="card shadow-lg mx-auto" style={{ maxWidth: "500px" }}>
        <div className="card-header bg-dark text-white">
          Secure Payment Portal
        </div>
        <div className="card-body">
          {step === 1 ? (
            <>
              <input
                className="form-control mb-3"
                placeholder="Recipient Fake UPI (e.g. bob@aegisbank)"
                onChange={(e) => setRecipient(e.target.value)}
              />
              <input
                className="form-control mb-3"
                type="number"
                placeholder="Amount ($)"
                onChange={(e) => setAmount(e.target.value)}
              />
              <button
                className="btn btn-primary w-100"
                onClick={() => setStep(2)}
              >
                Next: Proof of Life
              </button>
            </>
          ) : (
            <div className="text-center">
              <p className="text-danger small">
                Hold up a random object to verify liveness
              </p>
              <Webcam
                height={300}
                ref={webcamRef}
                screenshotFormat="image/png"
                className="w-100 mb-3"
              />
              <button className="btn btn-success w-100" onClick={handlePayment}>
                Confirm & Encrypt Transaction
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment;
