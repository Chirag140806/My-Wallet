export const CURRENCY = "$"; // change to "₹", "€" ... if you like
export const fmt = (n) => CURRENCY + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const EXPENSE_CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Education", "Other"];
export const INCOME_CATEGORIES = ["Salary", "Freelance", "Business", "Gift", "Other"];

const pad = (n) => String(n).padStart(2, "0");
export const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
export const currentMonth = () => today().slice(0, 7);
export const monthName = (m) => new Date(m + "-01T00:00:00").toLocaleString("en", { month: "long", year: "numeric" });
export const prettyDate = (d) => new Date(d + "T00:00:00").toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });

export function totals(list) {
  let income = 0, expense = 0;
  list.forEach((t) => (t.type === "income" ? (income += Number(t.amount)) : (expense += Number(t.amount))));
  return { income, expense, balance: income - expense };
}

// Income & expense for each of the last n months (real data from transactions)
export function monthlySeries(list, n = 6) {
  const now = new Date();
  const rows = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    rows.push({ key: `${d.getFullYear()}-${pad(d.getMonth() + 1)}`, label: d.toLocaleString("en", { month: "short" }), income: 0, expense: 0 });
  }
  list.forEach((t) => {
    const row = rows.find((r) => r.key === t.date.slice(0, 7));
    if (row) row[t.type] += Number(t.amount);
  });
  return rows.map((r) => ({ ...r, savings: r.income - r.expense }));
}

export function categoryTotals(list) {
  const map = {};
  list.filter((t) => t.type === "expense").forEach((t) => (map[t.category] = (map[t.category] || 0) + Number(t.amount)));
  return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}
