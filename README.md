# Project Aegis: The Blind Biometric Portal

> **"A bank that doesn't know who you are, but knows exactly what you signed."**  
> Identity is hidden in pixels; security is enforced by hardware.

Project Aegis is a next-generation decentralized banking simulation that solves the privacy paradox. Traditional banking exposes your True UPI ID and exact balance to the network. Aegis uses **Hardware-bound Biometrics (TouchID)** and **Image Steganography** to decouple your digital identity from your financial transactions.

Live Website: https://aegis-pay-x2f3.onrender.com/
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
## 🔄 System Flow & Screenshots

Project Aegis operates on a "Zero-Knowledge" architecture regarding the public ledger. Below is the step-by-step lifecycle of a user from registration to an audited transaction.

### Phase 1: Identity Decoupling (Registration)
1.  **Identity Entry:** The user provides a **Username** and their **True UPI ID** (e.g., `shray@icici`).
2.  **The Shadow Creation:** The system automatically generates a **Fake UPI ID** (e.g., `shray@aegisbank`).
3.  **Database Dual-Entry:**
    *   The server creates an entry in the `Accounts` database.
    *   **The Reality:** The True UPI is linked to a solid balance (e.g., **$5,000**).
    *   **The Decoy:** The Fake UPI is linked to a "Honeypot" balance (e.g., **$100**). This is the only balance visible to the public network.
4.  **Hardware Binding:**
    *   The server sends a unique challenge string.
    *   A browser-level **TouchID/FaceID** prompt appears.
    *   **WebAuthn** generates a Public/Private key pair. 
    *   The **Public Key** is stored on the server; the **Private Key** is locked in the user's device hardware.
5.  **Local Persistence:** The Fake and True UPI IDs are stored in the browser's `localStorage` to facilitate "blind" signatures later.

### Phase 2: Cryptographic Authentication (Login)
1.  **Identity Verification:** The user enters their username. The server retrieves the stored **Public Key** and issues a new cryptographic challenge.
2.  **Hardware Signature:** The user is prompted for **TouchID**. The device uses the local **Private Key** to sign the challenge.
3.  **Session Establishment:** The server verifies the signature against the Public Key. If they match, a secure session cookie is set. No passwords are ever transmitted or stored.

### Phase 3: The "Blind" Dashboard
1.  **Decoy Retrieval:** The Dashboard fetches the balance for the **Fake UPI ID** from the server. The user sees their $5,000 "True Vault," but the system is actually ready to report the $100 "Honeypot" to any external observers.
2.  **Local Privacy:** Prior transaction history is pulled from `localStorage`. This ensures that even if the bank's database is breached, a user’s specific spending habits remain private on their own device.

### Phase 4: Blinding the Transaction (Payment)
1.  **Liveness Challenge:** The user initiates a transfer. They are asked to capture a "Proof-of-Life" photo (e.g., holding a specific object or a face scan). This prevents Man-in-the-Middle (MITM) attacks and replay attacks.
2.  **Image Steganography (The Core Step):**
    *   The system takes the captured image.
    *   It retrieves the **True UPI ID** from local storage.
    *   The **Stego Engine** converts the True UPI into bits and hides them within the **Least Significant Bits (LSB)** of the image pixels.
    *   The resulting image looks identical to the original but now contains the "Secret Identity" of the sender.
3.  **Ledger Submission:** The transaction is sent to the server. The ledger records: `Fake_ID_A` sent `$X` to `Fake_ID_B` with the `Stego_Image` as the proof. **The server's transaction table never contains the True UPI.**

### Phase 5: Authority Audit (Bank Portal)
1.  **Ledger Access:** The Bank Admin views the `Transactions` table.
2.  **Unblinding:** The Bank uses the known **Steganography Key** to scan the pixels of the "Proof-of-Life" image.
3.  **Identity Recovery:** The engine extracts the hidden bits and reconstructs the **True UPI**. The Bank can now verify exactly who sent the money for legal or auditing purposes without having that identity "exposed" in the database rows.

### Phase 6: Attacker Deception (Hacker Portal)
1.  **Data Interception:** A hacker accesses the public ledger.
2.  **Misdirection:** The hacker sees transactions between `FakeID_1` and `FakeID_2`. 
3.  **Honeypot Trap:** When the hacker checks the balance of the sender, the system dynamically returns the **Honeypot Balance ($100)** from the accounts table. 
4.  **The Result:** The hacker believes they have intercepted a low-value transaction between anonymous users, while the actual $5,000 "True Vault" remains invisible and untouched.

---

