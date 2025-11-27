import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import MobileNav from "./components/MobileNav";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Report from "./pages/Report";
import Budgets from "./pages/Budgets";

export default function App() {
return (
<div className="app-shell">
<Sidebar />

<div className="main-content">
<MobileNav />

<Routes>
<Route path="/" element={<Home />} />
<Route path="/dashboard" element={<Dashboard />} />
<Route path="/report" element={<Report />} />
<Route path="/budgets" element={<Budgets />} />
</Routes>
</div>
</div>
);
}