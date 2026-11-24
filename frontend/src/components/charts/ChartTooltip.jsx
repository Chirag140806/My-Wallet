import { money } from '../../utils/format'

export default function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      {label && <div className="tt-label">{label}</div>}
      {payload.map((p) => (
        <div key={p.dataKey || p.name} className="tt-row">
          <span className="dot" style={{ background: p.color || p.payload?.fill }} />
          <span>{p.name}</span>
          <b>{money(p.value)}</b>
        </div>
      ))}
    </div>
  )
}
