import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ExpensePieChart from "../components/ExpensePieChart";

export default function Report() {
  const [reportData, setReportData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [reportTotal, setReportTotal] = useState<number | null>(null);
  const [lastDecrypted, setLastDecrypted] = useState<string>("");
  const [filterRange, setFilterRange] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("reportData") || "[]");
    const total = Number(localStorage.getItem("reportTotal"));
    const last = localStorage.getItem("reportLastDecrypted") || "";

    setReportData(data);
    setReportTotal(total);
    setLastDecrypted(last);
    setFilteredData(data);
  }, []);

  const applyFilter = (range: string) => {
    setFilterRange(range);
    if (range === "all") return setFilteredData(reportData);

    const now = new Date();
    const filtered = reportData.filter((e) => {
      const entryDate = new Date(e.timestamp);
      const diff = (now.getTime() - entryDate.getTime()) / (1000 * 3600 * 24);
      if (range === "daily") return diff <= 1;
      if (range === "weekly") return diff <= 7;
      if (range === "monthly") return diff <= 30;
      return true;
    });

    setFilteredData(filtered);
  };

  if (reportData.length === 0) {
    return (
      <div className="page">
        <h2>⚠ No decrypted report available</h2>
        <button className="btn" onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="page report-page page-header">
      <h1>📊 Full Expense Report</h1>
      <p>🔐 Based on last authorized decryption</p>
      <p><b>Last Decrypted:</b> {new Date(lastDecrypted).toLocaleString()}</p>
      <p><b>Total Spending:</b> ${reportTotal}</p>

      {/* 🔥 Filter Buttons */}
      <div className="filter-container">
        <button className={`filter-btn ${filterRange === "daily" ? "active" : ""}`} onClick={() => applyFilter("daily")}>24h</button>
        <button className={`filter-btn ${filterRange === "weekly" ? "active" : ""}`} onClick={() => applyFilter("weekly")}>7D</button>
        <button className={`filter-btn ${filterRange === "monthly" ? "active" : ""}`} onClick={() => applyFilter("monthly")}>30D</button>
        <button className={`filter-btn ${filterRange === "all" ? "active" : ""}`} onClick={() => applyFilter("all")}>All</button>
      </div>

      
      <div className="report-content">
        <div className="table-container">
          <table className="expenses-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Amount ($)</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((e, i) => (
                <tr key={i}>
                  <td>{e.timestamp}</td>
                  <td>{e.category}</td>
                  <td>{e.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="chart-container">
          <ExpensePieChart expenses={filteredData} chartSize={220} />
        </div>
      </div>

      <button className="btn" onClick={() => navigate("/dashboard")}>⬅ Back</button>
    </div>
  );
}
