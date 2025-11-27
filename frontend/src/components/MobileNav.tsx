import { useState } from "react";
import { NavLink } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function MobileNav() {
const [menuOpen, setMenuOpen] = useState(false);

return (
<>
<nav className="mobile-nav">
<div className="mobile-brand">🔐 EncryptoTrack</div>

<div className="mobile-actions">
<ConnectButton showBalance={false} chainStatus="none" />

<button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
☰
</button>
</div>
</nav>

{/* Dropdown Menu */}
{menuOpen && (
<div className="mobile-menu">
<NavLink to="/" onClick={() => setMenuOpen(false)}>Home</NavLink>
<NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
<NavLink to="/report" onClick={() => setMenuOpen(false)}>Report</NavLink>
<NavLink to="/budgets" onClick={() => setMenuOpen(false)}>Budgets</NavLink>
</div>
)}
</>
);
}