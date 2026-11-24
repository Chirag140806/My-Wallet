import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend, AreaChart, Area } from "recharts";
import { fmt } from "../utils";

export const COLORS = ["#8b5cf6", "#10b981", "#f59e0b", "#f43f5e", "#38bdf8", "#ec4899", "#84cc16", "#94a3b8"];
const tip = {
  contentStyle: { background: "#121935", border: "1px solid #2a3470", borderRadius: 12, color: "#fff" },
  cursor: { fill: "rgba(255,255,255,.04)" },
  formatter: (v) => fmt(v),
};
const axis = { stroke: "#8d97c4", fontSize: 12, tickLine: false, axisLine: false };
const Empty = () => <div className="empty small">No data yet. Add some transactions to see this chart.</div>;

export function MonthlyExpenseChart({ data }) {
  if (!data.some((d) => d.expense)) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <defs><linearGradient id="gp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a78bfa" /><stop offset="100%" stopColor="#6d28d9" /></linearGradient></defs>
        <CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} />
        <XAxis dataKey="label" {...axis} /><YAxis {...axis} width={50} />
        <Tooltip {...tip} /><Bar dataKey="expense" name="Expenses" fill="url(#gp)" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function IncomeExpenseChart({ data }) {
  if (!data.some((d) => d.income || d.expense)) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} />
        <XAxis dataKey="label" {...axis} /><YAxis {...axis} width={50} />
        <Tooltip {...tip} /><Legend />
        <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
        <Bar dataKey="expense" name="Expenses" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryChart({ data }) {
  if (!data.length) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={3} stroke="none">
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip {...tip} /><Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function TrendChart({ data }) {
  if (!data.some((d) => d.income || d.expense)) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="ge" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity=".5" /><stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" /></linearGradient>
          <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity=".45" /><stop offset="100%" stopColor="#10b981" stopOpacity="0" /></linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} />
        <XAxis dataKey="label" {...axis} /><YAxis {...axis} width={50} />
        <Tooltip {...tip} /><Legend />
        <Area type="monotone" dataKey="expense" name="Spending" stroke="#8b5cf6" strokeWidth={3} fill="url(#ge)" />
        <Area type="monotone" dataKey="savings" name="Savings" stroke="#10b981" strokeWidth={3} fill="url(#gs)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
