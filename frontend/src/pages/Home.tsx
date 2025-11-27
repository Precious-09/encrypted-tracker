import { Link } from "react-router-dom";

export default function Home() {
return (
<div className="page home-page">
<header className="hero">
<div className="home-header">
<h1>Encrypted Expense Tracker</h1>
<p className="sub">Privately manage your expenses using cutting-edge homomorphic encryption</p>
</div>
</header>

<section className="cards-row">

<div className="home-cards">
{/* TRACKER CARD */}
<div className="home-card">
<div className="card-icon tracker-icon">📊</div>
<h3>Tracker</h3>
<p>Add and categorize encrypted expenses.</p>
<a href="/dashboard">Go to Tracker →</a>
</div>

{/* REPORT CARD */}
<div className="home-card">
<div className="card-icon report-icon">📜</div>
<h3>Report</h3>
<p>View your private expense reports here.</p>
<a href="/report">View Report →</a>
</div>

{/* BUDGET CARD */}
<div className="home-card">
<div className="card-icon budget-icon">💰</div>
<h3>Budgets</h3>
<p>Set budgets and track encrypted spending.</p>
<a href="/budgets">Manage Budgets →</a>
</div>
</div>
</section>

<section>
<section className="encryption-section">
<div className="encryption-box">
<div className="enc-box">
<h4>FHE-Powered Privacy</h4>
<p>Expenses stay encrypted even while being processed.</p>
</div>

<div className="enc-box">
<h4>Viewable Only After Decryption</h4>
<p>Results are visible only when you choose to decrypt.</p>
</div>
</div>
</section>
</section>
</div>
);
}

