import { NavLink } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Sidebar() {
return (
<aside className="sidebar">
<div className="brand">
<div className="logo">🔐</div>
<div className="brand-text">EncryptoTrack</div>
</div>

<nav className="nav">
<NavLink
to="/"
className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
>
<span className="dot" /> Home
</NavLink>

<NavLink
to="/dashboard"
className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
>
<span className="dot" /> Dashboard
</NavLink>

<NavLink
to="/report"
className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
>
<span className="dot" /> Report
</NavLink>

<NavLink
to="/budgets"
className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
>
<span className="dot" /> Budgets
</NavLink>
</nav>

<div className="sidebar-footer">
<div className="wallet-box">
<ConnectButton showBalance={false} chainStatus="none" />
</div>
</div>
</aside>
);
}