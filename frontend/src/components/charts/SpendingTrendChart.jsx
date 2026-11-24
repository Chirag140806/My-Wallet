import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import ChartTooltip from './ChartTooltip.jsx'
import { moneyShort } from '../../utils/format'

export default function SpendingTrendChart({ data, height = 280 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
        <XAxis dataKey="label" stroke="#64748B" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis stroke="#64748B" tickLine={false} axisLine={false} fontSize={12} tickFormatter={moneyShort} width={60} />
        <Tooltip content={<ChartTooltip />} />
        <Area type="monotone" dataKey="expense" name="Spending" stroke="#A78BFA" strokeWidth={3} fill="url(#spendFill)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
