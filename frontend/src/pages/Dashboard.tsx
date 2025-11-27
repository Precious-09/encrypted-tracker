import { useState } from "react";
import Modal from "../components/Modal";
import useExpenses from "../hooks/useExpenses";
import useFhevmSetup from "../hooks/useFhevmSetup";
import { CATEGORIES } from "../utils/categories";
import { useAccount, useChainId } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { isInitialized } = useFhevmSetup();
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const navigate = useNavigate();

  const { expenses, decryptedTotal, addExpense, deleteExpense, decryptTotal } = useExpenses();

  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showReportButton, setShowReportButton] = useState(false);

  const [isAdding, setIsAdding] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isDeletingIndex, setIsDeletingIndex] = useState<number | null>(null);

  const showMessage = (msg: string, allowReport = false) => {
    setModalMessage(msg);
    setShowReportButton(allowReport);
    setShowModal(true);
  };

  const handleAddExpense = async () => {
    if (!category || !amount) return showMessage("Enter category and amount");
    if (+amount <= 0) return showMessage("Amount must be greater than 0");
    setIsAdding(true);
    await addExpense(category, +amount, showMessage);
    setIsAdding(false);
    setCategory("");
    setAmount("");
  };

 const handleDecrypt = async () => {
  setIsDecrypting(true);
  try {
    await decryptTotal((msg) => showMessage(msg, true));
  } catch {
    showMessage("⚠ Decryption cancelled", false);
  } finally {
    setIsDecrypting(false);
  }
};


  const handleDelete = async (index: number) => {
    setIsDeletingIndex(index);
    await deleteExpense(index, showMessage);
    setIsDeletingIndex(null);
  };

  return (
    <div className="page dashboard-page">
      {/* Wallet Connection */}
      {!isConnected && (
        <div className="warning-box">
          <h3>🔌 Connect Wallet to Continue</h3>
                  </div>
      )}

      {/* Network Warning */}
      {isConnected && chainId !== 11155111 && (
        <div className="warning-box">
          <h3>⚠ Wrong Network</h3>
          <button
            className="btn"
            onClick={() =>
              window.ethereum?.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: "0xaa36a7" }],
              })
            }
          >
            Switch to Sepolia
          </button>
        </div>
      )}

      <header className="page-header">
        <h1>Secure On-Chain Expense Management</h1>
        <p className="sub">Decrypt insights and manage expenses without compromising privacy</p>
      </header>

      <section className="cards-row">
        {/* Add Expense */}
        <div className="home-card">
          <h3>Add Expense</h3>
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)} disabled={isAdding || isDecrypting}>
            <option value="">Select Category</option>
            {CATEGORIES.map((c, i) => (
              <option key={i}>{c}</option>
            ))}
          </select>
          <input className="input" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" disabled={isAdding || isDecrypting} />
          <button className="btn" onClick={handleAddExpense} disabled={!isConnected || !isInitialized || isAdding}>
            {isAdding ? "📝 Adding..." : "Add Expense"}
          </button>
        </div>

        {/* Expense History */}
        <div className="home-card">
          <h3>Expense History</h3>
          {expenses.length === 0 ? (
            <p>No expenses saved.</p>
          ) : (
            <ul className="history-list">
              {expenses.map((e) => (
                <li key={e.index} className="history-row">
                  <div className="history-main">
                    <span className="history-title">{e.category}</span>
                    <span className="history-encrypted">Encrypted</span>
                  </div>
                  <div className="history-actions">
                    <button className="pill-btn danger" onClick={() => handleDelete(e.index)} disabled={isDeletingIndex === e.index}>
                      {isDeletingIndex === e.index ? "Deleting.." : "Delete"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Total Spending */}
        <div className="home-card">
          <h3>Total Spending</h3>
          <div className="big-amount">{decryptedTotal != null ? `$${decryptedTotal}` : "— —"}</div>
          <button
            className="btn"
            onClick={handleDecrypt}
            disabled={!isConnected || !isInitialized || expenses.length === 0 || isDecrypting}
            >
            {!isInitialized
                ? "⏳ Initializing…" 
                : isDecrypting
                ? "🔓 Decrypting..."
                : "Decrypt Total"}
            </button>

        </div>
      </section>

     
      <Modal show={showModal} message={modalMessage} onClose={() => setShowModal(false)}>
        {showReportButton && decryptedTotal !== null ? (
          <button
            className="modal-btn"
            onClick={() => {
              navigate("/report", { state: { decryptedTotal } });
              setShowModal(false);
            }}
          >
            📊 View Report
          </button>
        ) : null}
      </Modal>
    </div>
  );
}
