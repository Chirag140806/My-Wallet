export default function StatCard({ label, value, sub, icon: Icon, tone = 'violet' }) {
  return (
    <div className={`card stat-card tone-${tone}`}>
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        <span className="stat-icon"><Icon size={20} /></span>
      </div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}
