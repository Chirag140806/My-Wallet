import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import ChartTooltip from './ChartTooltip.jsx'
import { colorFor, money } from '../../utils/format'

export default function CategoryDonut({ data, height = 220 }) {
  const total = data.reduce((s, d) => s + d.total, 0)
  return (
    <div className="donut">
      <div className="donut-chart" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="total" nameKey="category" innerRadius="62%" outerRadius="92%"
              paddingAngle={3} stroke="none">
              {data.map((d) => <Cell key={d.category} fill={colorFor(d.category)} />)}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-center">
          <span>Total</span>
          <b>{money(total)}</b>
        </div>
      </div>
      <ul className="legend">
        {data.map((d) => (
          <li key={d.category}>
            <span className="dot" style={{ background: colorFor(d.category) }} />
            <span className="legend-name">{d.category}</span>
            <span className="muted">{d.percent}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
