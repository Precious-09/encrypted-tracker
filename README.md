EncryptedExpenseTracker – Privacy-Preserving Expense Tracker using ZAMA FHE
---

A fully encrypted expense management system built on Fully Homomorphic Encryption (FHE) using ZAMA's FHEVM SDK. Users securely add and delete expenses, all amounts remain encrypted on-chain. Even the contract cannot view individual values.


🌟 Features
---

🔒 Complete expense privacy using euint32

🧮 Encrypted total aggregation using FHE.add and FHE.sub

🗑️ Soft delete system with encrypted recalculation

🪪 User-specific encryption via msg.sender mapping

⚛️ React + TypeScript + Vite frontend

🔗 Wallet integration

📱 Fully responsive UI


📁 Project Structure
---

```
my-app/
├── frontend/
|   |
|   |──fhevm-sdk/
│   ├── src/
|   |   |──App.tsx                # Main Application
│   │   ├── components/           # UI Components
│   │   ├── pages/                # Home, Dashboard, Reports
│   │   ├── hooks/                # useExpenses.ts, useFhevmSetup.ts
│   │   ├── lib/                  # fhevm.js (FHE setup)
│   │   └── utils/                # ABI, categories.ts
|   |   
|   |
│   └── vite.config.ts
│
├── hardhat/
│   ├── contracts/
│   │   ├── EncryptedExpenseTracker.sol
│   │   └── MockExpenseTracker.sol
│   ├── deploy/
│   │   └── deploy.js
│   ├── test/
│   │   └── EncryptedExpenseTracker.test.cjs
│   └── hardhat.config.js
│
├── package.json
└── README.md
```


System Architecture
---

```
┌──────────────────────── FRONTEND ─────────────────────────┐
│ React + TypeScript + Vite                                 │
│ Wallet Integration: Wagmi + RainbowKit                     │
│ Visualization: Chart.js (Pie Chart), LocalStorage caching  │
│                                                           │
│ ┌──────────────┐   ┌──────────────┐   ┌─────────────────┐ │
│ │ Dashboard    │   │ Report       │   │ useExpenses Hook│ │
│ │ (Add/Load)   │   │ (Decrypt)    │   │ FHE Logic       │ │
│ └──────────────┘   └──────────────┘   └─────────────────┘ │
│                                                           │
│ LocalStorage                                               │
│ • reportData                                               │
│ • reportTotal                                              │
│ • reportLastDecrypted                                      │
└───────────────────────────────┬────────────────────────────┘
                                │
                                ▼
┌──────────────────────── BLOCKCHAIN ───────────────────────┐
│ Network: Sepolia Testnet + ZAMA FHEVM                     │
│ Smart Contract: EncryptedExpenseTracker.sol               │
│                                                           │
│ • addExpense()        → Encrypted storage (FHE.fromExternal)
│ • deleteExpense()     → Soft delete & encrypted recalculation
│ • getExpenseCount()                                       
│ • getEncryptedGlobalTotal() (bytes32 encrypted handle)     │
│                                                           │
│ 🔐 Encrypted data format: 0x00000... (FHE encrypted)       │
└───────────────────────────────┬────────────────────────────┘
                                │
                                ▼
┌───────────────────────────── RELAYER (Optional) ──────────┐
│ ZAMA Decryption Relayer                                    │
│ • Public decryption via user permissions                   │
│ • Decryption via `decryptValue()` on frontend              │
└────────────────────────────────────────────────────────────┘
```



Data Flow Diagram
---
``` 
┌───────────────────────────────────────┐
│            Frontend (React)          │
│ • Wallet connection                  │
│ • Encrypts amount before sending     │
└───────────────────────┬──────────────┘
                        │
┌───────────────────────▼──────────────┐
│   Smart Contract – EncryptedExpense   │
│ • Adds encrypted values using FHE    │
│ • Soft deletes and recalculates      │
└───────────────────────┬──────────────┘
                        │
┌───────────────────────▼──────────────┐
│     ZAMA FHEVM & Relayer Network     │
│ • Executes encrypted operations      │
└───────────────────────────────────────┘
```
Decryption Workflow (Session-Based)
---
| Stage | Action                                                                    |
| ----: | ------------------------------------------------------------------------- |
|   1️⃣ | User adds expense → stored on-chain as encrypted data                     |
|   2️⃣ | User clicks **"Decrypt Total"** in Dashboard                              |
|   3️⃣ | Wallet asks for signature                                    |
|   4️⃣ | `decryptedTotal` + `decryptedExpenses` saved locally                      |
|   5️⃣ | User opens Report page → **no extra signature required**                  |
|   6️⃣ | Data cleared automatically when **wallet disconnects or network changes** |


LocalStorage Keys Used
---
```
reportData
reportTotal
reportLastDecrypted
```

📊 Report Page – Final UI Behavior
---
| Feature             | Description                                                   |
| ------------------- | ------------------------------------------------------------- |
| 📆 Date Filters     | 24h / 7d / 30d / All-time                                     |
| 📜 Scrollable Table | Fixed height, adaptive columns                                |
| 🥧 Pie Chart        | Responsive, displays category distribution                    |
| 📁 Export Ready     | Decrypted data persists for export                            |
| 🔒 Privacy          | Only last authorized decrypted data is shown                  |
| 🧠 Smart Logic      | Decryption happens only once per session via `decryptTotal()` |
 

Smart Decryption Logic (in decryptTotal())
---
```// Only decrypt if user is authorized & data exists
await decryptTotal((msg) => showMessage(msg, true));

// Cached result for report page
localStorage.setItem("reportData", JSON.stringify(decryptedExpenses));
localStorage.setItem("reportTotal", String(total));
localStorage.setItem("reportLastDecrypted", new Date().toISOString());
```

Testing
---
We have two comprehensive test files covering different aspects:

MockExpenseTracker.test.cjs - Basic Functionality Tests
Tests core contract functionality
```
npx hardhat test
```
Basic Functionality Tests:

``` 
✔ Should deploy correctly
✔ Should add expense correctly (mock FHE) (86ms)
✔ Should delete correctly (57ms)


3 passing (293ms)

```

Getting Started
---

Prerequisites

```
Node.js (v18 or higher)
npm or yarn
Git
```

Installation

```
Clone the repository
git clone <repository-url>
cd frontend
npm install
``` 

Set up environment variables Create a .env file in the root directory:

```
VITE_RPC_URL=""
VITE_NETWORK_CHAIN_ID=11155111
VITE_CONTRACT_ADDRESS=0x94E67fCEd9b80933FF51C8a3EE86F896c13ECCA1
```

Start the development server
```
npm run dev
```

The app will be available at http://localhost:5173 and accessible from your local network at http://192.168.x.x:5173 for mobile testing.

Project Dependencies

Core Technologies:

React 19 - Frontend framework
TypeScript - Type safety
Vite - Build tool
RainbowKit - Wallet connection
Wagmi - Ethereum integration


FHE Stack:

@fhevm/solidity - FHE smart contract library
@fhevm/hardhat-plugin - FHE development tools
@zama-fhe/relayer-sdk - FHE relayer integration

🔐 Security
---
All expense amounts stored in encrypted FHE format

No plaintext on-chain

Separate user expense mappings for isolation

Soft delete avoids leaking previous values

🏆 Key Achievements
---
✔️ Fully integrated ZAMA FHE
✔️ Functional encrypted addition and subtraction
✔️ Real-time frontend expense handling
✔️ Mobile responsive React interface
✔️ Full Hardhat + Vite working setup

📌 Future Improvements
---
🔁 Full FHE decryption on frontend via relayer

📊 Expense visualization using encrypted values

📈 Performance optimization tests

🙏 Acknowledgements
---
ZAMA – FHEVM & relayer technology

Hardhat & Vite – Development environment

Chris Dorodanu’s GitHub Repo 

React ecosystem – Frontend UI and interaction

🔥 "Privacy is not a feature — it’s the foundation.