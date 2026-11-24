import { Link } from "react-router-dom";
import { fmt, prettyDate } from "../utils";

export function StatCard({ icon: Icon, label, value, tone = "purple", sub }) {
  return (
    <div className="card stat">
      <span className={`stat-icon ${tone}`}><Icon size={22} /></span>
      <div><small>{label}</small><h2>{value}</h2>{sub && <em>{sub}</em>}</div>
    </div>
  );
}

export function Card({ title, action, children, className = "" }) {
  return (
    <section className={`card ${className}`}>
      {(title || action) && <div className="card-head"><h3>{title}</h3>{action}</div>}
      {children}
    </section>
  );
}

export function ProgressBar({ percent }) {
  const tone = percent >= 100 ? "danger" : percent >= 80 ? "warn" : "ok";
  return <div className="progress"><div className={tone} style={{ width: `${Math.min(percent, 100)}%` }} /></div>;
}

export function TransactionRow({ t }) {
  return (
    <div className="tx-row">
      <span className={`dot ${t.type}`}>{t.category[0]}</span>
      <div className="grow"><b>{t.title}</b><small>{t.category} · {prettyDate(t.date)}</small></div>
      <b className={t.type}>{t.type === "income" ? "+" : "-"}{fmt(t.amount)}</b>
    </div>
  );
}

export const AddLink = ({ children = "Add transaction" }) => <Link to="/transactions/new" className="btn">{children}</Link>;
