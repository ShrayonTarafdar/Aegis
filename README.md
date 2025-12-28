# Project Aegis: The Blind Biometric Portal

> **"A bank that doesn't know who you are, but knows exactly what you signed."**  
> Identity is hidden in pixels; security is enforced by hardware.

Project Aegis is a next-generation decentralized banking simulation that solves the privacy paradox. Traditional banking exposes your True UPI ID and exact balance to the network. Aegis uses **Hardware-bound Biometrics (TouchID)** and **Image Steganography** to decouple your digital identity from your financial transactions.

---

## 🛡️ Core Innovation

### 1. Identity Splitting
During registration, the system splits the user into two personas:
*   **True Identity:** The user's real name and True UPI ID (e.g., `satoshi@hdfc`). This is **never** stored in the transaction ledger.
*   **Fake Persona:** A system-generated shadow ID (e.g., `satoshi@aegisbank`) used for all public interactions.

### 2. Dual-Layer Security
*   **Hardware Layer:** Uses WebAuthn (TouchID) to create a public/private key pair. The private key never leaves the user's device.
*   **Pixel Layer (Steganography):** The True UPI is encrypted and hidden inside the Least Significant Bits (LSB) of a "Proof-of-Life" photo taken during every transaction.

### 3. The Honeypot Strategy
Aegis maintains two balances:
*   **True Vault:** The user's actual wealth, visible only to them via biometric authentication.
*   **Honeypot Balance:** A decoy balance visible to hackers and the public network.

---

## 🚀 The 6 Portals

1.  **Registration:** Bind your physical device to a username. Generates a hardware-bound key pair and creates your shadow identity.
2.  **Login:** Passwordless authentication using TouchID. Verification happens via a cryptographic challenge-response signed by the device hardware.
3.  **Dashboard:** Access your True Vault. View local transaction history stored exclusively on your device.
4.  **Payment Portal:** Send money using a camera capture. Your True UPI is steganographically embedded into the photo before being sent to the ledger.
5.  **Bank Page:** The authority view. While the ledger only shows fake IDs, the Bank uses a master Steganography Key to decode images and verify the True UPI of the sender.
6.  **Hacker Page:** A live terminal showing the public ledger. Attackers see decoy balances and shadow IDs, rendering stolen data useless.

---

## 🛠️ Tech Stack

*   **Frontend:** React.js, Bootstrap 5
*   **Backend:** FastAPI
*   **Database:** SQLite
*   **Steganography:** Python Pillow (LSB Algorithm).
*   **Authentication:** WebAuthn / TouchID 
*   **Deployment:** Docker 

---


## ⚙️ Installation & Setup

### Prerequisites
*   Python 3.11+
*   Node.js 18+
*   A webcam (for the Steganography Proof-of-Life)
*   A touch interface for TouchId
  
### Local Development

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-repo/aegis-portal.git
    cd aegis-portal
    ```

2.  **Setup Backend:**
    ```bash
    cd backend
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000
    ```

3.  **Setup Frontend:**
    ```bash
    cd frontend
    npm install
    npm start
    ```

4.  **Access the Portal:**
    Open `http://localhost:3000`

Note : This would not work as webauthn requires HTTPS for establishment. Hence we first deploy the model to render and then show.

---

## 🔒 Security Requirements

For the **TouchID** and **Camera** to work, the browser requires a **Secure Context**:
*   **Local:** Use `http://localhost:3000`.
*   **Production:** Must be deployed on **HTTPS** (e.g., Render, Vercel, or AWS).
  
---

## 📝 Steganography Logic
Aegis uses the **LSB (Least Significant Bit)** method. 
*   **Encoding:** The system takes the ASCII value of the `true_upi`, converts it to bits, and modifies the last bit of the Red channel in each pixel of the transaction photo.
*   **Decoding:** The Bank portal reads these bits to reconstruct the string. Because the change is only 1/255th of a color's intensity, the "encryption" is invisible to the human eye and standard image filters.

---

## 👥 Contributors
*   **Niyati Gupta**
*   **Shrayon Tarafdar**
*   **Devikrishna RB**

---
## Screenshots
