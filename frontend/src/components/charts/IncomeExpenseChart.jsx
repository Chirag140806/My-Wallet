import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import ChartTooltip from './ChartTooltip.jsx'
import { moneyShort } from '../../utils/format'

export default function IncomeExpenseChart({ data, height = 280 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} barGap={6}>
        <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
        <XAxis dataKey="label" stroke="#64748B" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis stroke="#64748B" tickLine={false} axisLine={false} fontSize={12} tickFormatter={moneyShort} width={60} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(124,58,237,0.08)' }} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: '#94A3B8' }} />
        <Bar dataKey="income" name="Income" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={26} />
        <Bar dataKey="expense" name="Expense" fill="#F87171" radius={[6, 6, 0, 0]} maxBarSize={26} />
      </BarChart>
    </ResponsiveContainer>
  )
}
