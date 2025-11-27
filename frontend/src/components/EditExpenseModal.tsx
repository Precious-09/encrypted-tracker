import { useEffect, useState } from "react";

export default function EditExpenseModal({
open,
onClose,
onSave,
categories,
initialCategory,
initialAmount,
}) {
const [category, setCategory] = useState(initialCategory || "");
const [amount, setAmount] = useState(
initialAmount != null ? String(initialAmount) : ""
);

useEffect(() => {
if (open) {
setCategory(initialCategory || "");
setAmount(
initialAmount != null ? String(initialAmount) : ""
);
}
}, [open, initialCategory, initialAmount]);

if (!open) return null;

const handleSave = () => {
if (!category || !amount) return;
const num = Number(amount);
if (!num || num <= 0) return;
onSave({ category, amount: num });
};

return (
<div className="modal-backdrop" onClick={onClose}>
<div
className="modal-panel"
onClick={(e) => e.stopPropagation()}
>
<h3>Edit Expense</h3>
<p className="modal-sub">
Update the category or amount, then save your changes.
</p>

<select
className="input"
value={category}
onChange={(e) => setCategory(e.target.value)}
>
<option value="">Select Category</option>
{categories.map((c, i) => (
<option key={i} value={c}>
{c}
</option>
))}
</select>

<input
className="input"
type="number"
value={amount}
onChange={(e) => setAmount(e.target.value)}
placeholder="Amount"
/>

<div className="modal-actions">
<button className="btn-secondary" onClick={onClose}>
Cancel
</button>
<button className="btn" onClick={handleSave}>
Save
</button>
</div>
</div>
</div>
);
}