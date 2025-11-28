import { useState } from "react";
import Modal from "../components/Modal";
import useExpenses from "../hooks/useExpenses";
import useFhevmSetup from "../hooks/useFhevmSetup";
import { CATEGORIES } from "../utils/categories";
import { useAccount, useChainId } from "wagmi";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
const navigate = useNavigate();
const { isConnected } = useAccount();
const chainId = useChainId();

const { isInitialized, isInitializing } = useFhevmSetup();
const { expenses, decryptedTotal, addExpense, deleteExpense, decryptTotal } = useExpenses();

const [category, setCategory] = useState("");
const [amount, setAmount] = useState("");
const [modalMessage, setModalMessage] = useState("");
const [showModal, setShowModal] = useState(false);

const [isAdding, setIsAdding] = useState(false);
const [isDecrypting, setIsDecrypting] = useState(false);
const [isDeletingIndex, setIsDeletingIndex] = useState<number | null>(null);

// 🧠 Safer modal messaging
const showMessage = (msg: any) => {
const safeMessage = typeof msg === "string" ? msg : "⚠ An error occurred";
setModalMessage(safeMessage);
setShowModal(true);
};

// Wallet + Network Validation
if (!isConnected)
return <div className="warning-box">🔌 Connect wallet to continue</div>;

if (chainId !== 11155111)
return <div className="warning-box">⚠ Switch to Sepolia network</div>;

return (
<div className="page dashboard-page">
<header className="page-header">
<h1>Secure On-Chain Expense Management</h1>
<p className="sub">Encrypted expense tracking with private decryption</p>
</header>

{/* Show initializing state */}
{!isInitialized && (
<div className="warning-box">⏳ Initializing privacy engine…</div>
)}

<section className="cards-row">
{/* ➕ Add Expense */}
<div className="home-card">
<h3>Add Expense</h3>
<select
className="input"
value={category}
onChange={(e) => setCategory(e.target.value)}
disabled={isAdding || isInitializing || !isInitialized}
>
<option value="">Select Category</option>
{CATEGORIES.map((c, i) => (
<option key={i}>{c}</option>
))}
</select>

<input
className="input"
type="number"
value={amount}
onChange={(e) => setAmount(e.target.value)}
placeholder="Amount"
disabled={isAdding || isInitializing || !isInitialized}
/>

<button
className="btn"
disabled={isAdding || !isInitialized}
onClick={async () => {
if (!category || !amount) return showMessage("Enter category and amount");

setIsAdding(true);
await addExpense(category, +amount, showMessage);
setIsAdding(false);
setCategory("");
setAmount("");
}}
>
{isAdding ? "📝 Saving…" : "Add Expense"}
</button>
</div>

{/* 📜 Expense History */}
<div className="home-card">
<h3>Expense History</h3>
{expenses.length === 0 ? (
<p>No expenses yet.</p>
) : (
<ul className="history-list">
{expenses.map((e) => (
<li key={e.index} className="history-row">
<span className="history-title">{e.category}</span>
<span className="history-encrypted">Encrypted</span>
<button
className="pill-btn danger"
disabled={isDeletingIndex === e.index}
onClick={async () => {
setIsDeletingIndex(e.index);
await deleteExpense(e.index, showMessage);
setIsDeletingIndex(null);
}}
>
{isDeletingIndex === e.index ? "Deleting…" : "Delete"}
</button>
</li>
))}
</ul>
)}
</div>

{/* 🔓 Decrypt */}
<div className="home-card">
<h3>Total Spending</h3>
<div className="big-amount">
{decryptedTotal !== null ? `$${decryptedTotal}` : "— —"}
</div>
<button
className="btn"
disabled={isDecrypting || isInitializing || expenses.length === 0 || !isInitialized}
onClick={async () => {
setIsDecrypting(true);
await decryptTotal(showMessage);
setIsDecrypting(false);
}}
>
{isDecrypting ? "🔓 Decrypting…" : "Decrypt Total"}
</button>
</div>
</section>

{/* 💬 Modal */}
<Modal show={showModal} message={modalMessage} onClose={() => setShowModal(false)}>
{decryptedTotal !== null && (
<button
className="modal-btn"
onClick={() => {
navigate("/report", { state: { decryptedTotal } });
setShowModal(false);
}}
>
📊 View Report
</button>
)}
</Modal>
</div>
);
}