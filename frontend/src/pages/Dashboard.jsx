import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDownLeft, ArrowUpRight, Plus, PiggyBank, Wallet } from 'lucide-react'
import api, { getErrorMessage } from '../api/axios'
import { useAuth } from '../context/AuthContext.jsx'
import { useAppData } from '../context/AppDataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import StatCard from '../components/StatCard.jsx'
import Loader from '../components/Loader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import TransactionTable from '../components/TransactionTable.jsx'
import SpendingTrendChart from '../components/charts/SpendingTrendChart.jsx'
import IncomeExpenseChart from '../components/charts/IncomeExpenseChart.jsx'
import CategoryDonut from '../components/charts/CategoryDonut.jsx'
import { MONTHS, money } from '../utils/format'

export default function Dashboard() {
  const { user } = useAuth()
  const { version, openModal } = useAppData()
  const toast = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get('/dashboard/')
      .then((res) => setData(res.data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version])

  if (loading && !data) return <Loader text="Loading your dashboard..." />
  if (!data) return <EmptyState title="Could not load dashboard" text="Check that the Django server is running." />

  const b = data.budget
  const monthName = MONTHS[data.month - 1]

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h2>Hello, {user.first_name} 👋</h2>
          <p className="muted">Here is your financial overview for {monthName} {data.year}.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}><Plus size={18} /> Quick add transaction</button>
      </div>

      <div className="grid-4">
        <StatCard label="Total balance" value={money(data.total_balance)} icon={Wallet} tone="violet"
          sub={`${data.transaction_count} transactions`} />
        <StatCard label="Total income" value={money(data.total_income)} icon={ArrowDownLeft} tone="green"
          sub={`${money(data.month_income)} this month`} />
        <StatCard label="Total expenses" value={money(data.total_expense)} icon={ArrowUpRight} tone="red"
          sub={`${money(data.month_expense)} this month`} />
        <StatCard label="Monthly budget" value={b.amount ? money(b.amount) : 'Not set'} icon={PiggyBank} tone="blue"
          sub={b.amount ? `Remaining: ${money(b.remaining)}` : <Link to="/budget">Set a budget →</Link>} />
      </div>

      {b.amount && (
        <div className={`card budget-strip status-${b.status}`}>
          <div className="budget-strip-top">
            <div>
              <b>{monthName} budget</b>
              <span className="muted"> · {money(b.spent)} of {money(b.amount)} spent</span>
            </div>
            <b>{b.percent}%</b>
          </div>
          <ProgressBar percent={b.percent} status={b.status} />
          {b.status === 'warning' && <p className="alert-text warning">You have used {b.percent}% of this month's budget. Spend carefully!</p>}
          {b.status === 'exceeded' && <p className="alert-text danger">You are over budget by {money(Math.abs(b.remaining))}.</p>}
        </div>
      )}

      <div className="grid-2-1">
        <div className="card">
          <div className="card-head"><h3>Monthly spending</h3><span className="muted">Last 6 months</span></div>
          <SpendingTrendChart data={data.monthly_spending} />
        </div>
        <div className="card">
          <div className="card-head"><h3>Expense categories</h3><span className="muted">{monthName}</span></div>
          {data.category_breakdown.length === 0
            ? <EmptyState title="No expenses yet" text="Add an expense to see the breakdown." />
            : <CategoryDonut data={data.category_breakdown} />}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-head"><h3>Income vs expense</h3><span className="muted">Last 6 months</span></div>
          <IncomeExpenseChart data={data.monthly_spending} />
        </div>
        <div className="card">
          <div className="card-head"><h3>Recent transactions</h3><Link to="/transactions" className="link">View all</Link></div>
          {data.recent_transactions.length === 0
            ? <EmptyState title="No transactions yet" text="Your latest activity will show up here."
                action={<button className="btn btn-primary btn-sm" onClick={() => openModal()}>Add your first</button>} />
            : <TransactionTable transactions={data.recent_transactions} compact />}
        </div>
      </div>
    </div>
  )
}
