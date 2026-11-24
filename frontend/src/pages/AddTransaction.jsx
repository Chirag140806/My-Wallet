import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useData } from "../data";
import { useToast } from "../toast";
import { Card } from "../components/Bits";
import { today, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "../utils";

const blank = { type: "expense", title: "", amount: "", category: "Food", date: today(), description: "" };

// Used for both "Add" (/transactions/new) and "Edit" (/transactions/:id/edit)
export default function AddTransaction() {
  const { id } = useParams();
  const { transactions, saveTransaction } = useData();
  const toast = useToast();
  const nav = useNavigate();
  const existing = id ? transactions.find((t) => String(t.id) === id) : null;
  const [f, setF] = useState(blank);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => { setF(existing || blank); }, [existing?.id]); // eslint-disable-line
  const cats = f.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const setType = (type) => setF({ ...f, type, category: (type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES)[0] });

  if (id && !existing) return <Card><div className="empty">Transaction not found.</div></Card>;

  const submit = async (e) => {
    e.preventDefault();
    const v = {};
    if (!f.title.trim()) v.title = "Title is required";
    if (!(Number(f.amount) > 0)) v.amount = "Enter an amount greater than 0";
    if (!f.date) v.date = "Please pick a date";
    setErrors(v);
    if (Object.keys(v).length) return;
    setBusy(true);
    try {
      await saveTransaction({ type: f.type, title: f.title.trim(), amount: Number(f.amount).toFixed(2), category: f.category, date: f.date, description: f.description.trim() }, id);
      toast(id ? "Transaction updated." : "Transaction added.");
      nav("/transactions");
    } catch (err) { toast(err.message, "error"); }
    finally { setBusy(false); }
  };

  return (
    <>
      <div className="page-head"><div><h1>{id ? "Edit Transaction" : "Add Transaction"}</h1><p className="muted">Record your income or expense</p></div></div>
      <form className="card form" onSubmit={submit} noValidate>
        <div className="type-toggle">
          <button type="button" className={f.type === "expense" ? "on expense" : ""} onClick={() => setType("expense")}>Expense</button>
          <button type="button" className={f.type === "income" ? "on income" : ""} onClick={() => setType("income")}>Income</button>
        </div>
        <div className="form-grid">
          <label>Title<input value={f.title} onChange={set("title")} placeholder="e.g. Grocery shopping" className={errors.title ? "bad" : ""} />{errors.title && <span className="err">{errors.title}</span>}</label>
          <label>Amount<input type="number" step="0.01" min="0" value={f.amount} onChange={set("amount")} placeholder="0.00" className={errors.amount ? "bad" : ""} />{errors.amount && <span className="err">{errors.amount}</span>}</label>
          <label>Category<select value={f.category} onChange={set("category")}>{cats.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label>Date<input type="date" value={f.date} onChange={set("date")} className={errors.date ? "bad" : ""} />{errors.date && <span className="err">{errors.date}</span>}</label>
        </div>
        <label>Description (optional)<textarea rows="3" value={f.description} onChange={set("description")} placeholder="Add a note..." /></label>
        <div className="row">
          <button className="btn" disabled={busy}>{busy ? "Saving..." : id ? "Save changes" : "Add transaction"}</button>
          <button type="button" className="btn ghost" onClick={() => nav(-1)}>Cancel</button>
        </div>
      </form>
    </>
  );
}
