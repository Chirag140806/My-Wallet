import { useEffect, useState } from 'react'
import { BarChart3, Percent, PiggyBank, Tag } from 'lucide-react'
import api, { getErrorMessage } from '../api/axios'
import { useAppData } from '../context/AppDataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import Loader from '../components/Loader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import StatCard from '../components/StatCard.jsx'
import SpendingTrendChart from '../components/charts/SpendingTrendChart.jsx'
import IncomeExpenseChart from '../components/charts/IncomeExpenseChart.jsx'
import CategoryDonut from '../components/charts/CategoryDonut.jsx'
import { colorFor, money } from '../utils/format'

export default function Analytics() {
  const { version } = useAppData()
  const toast = useToast()
  const [months, setMonths] = useState(6)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get('/analytics/', { params: { months } })
      .then((res) => setData(res.data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [months, version])

  const s = data?.summary

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h2>Analytics</h2>
          <p className="muted">Understand where your money comes from and where it goes.</p>
        </div>
        <div className="segmented">
          <button className={months === 6 ? 'active' : ''} onClick={() => setMonths(6)}>6 months</button>
          <button className={months === 12 ? 'active' : ''} onClick={() => setMonths(12)}>12 months</button>
        </div>
      </div>

      {loading && !data ? <Loader text="Crunching your numbers..." /> : data && (
        <>
          <div className="grid-4">
            <StatCard label="Net savings" value={money(s.net_savings)} icon={PiggyBank} tone={s.net_savings >= 0 ? 'green' : 'red'}
              sub={`Income ${money(s.total_income)}`} />
            <StatCard label="Savings rate" value={`${s.savings_rate}%`} icon={Percent} tone="violet" sub="Of total income" />
            <StatCard label="Avg monthly expense" value={money(s.avg_monthly_expense)} icon={BarChart3} tone="blue"
              sub={s.highest_month ? `Highest: ${s.highest_month}` : 'No expenses yet'} />
            <StatCard label="Top category" value={s.top_category || '—'} icon={Tag} tone="red" sub="Where you spend most" />
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="card-head"><h3>Monthly expense trend</h3></div>
              <SpendingTrendChart data={data.monthly} />
            </div>
            <div className="card">
              <div className="card-head"><h3>Income vs expense</h3></div>
              <IncomeExpenseChart data={data.monthly} />
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="card-head"><h3>Spending distribution</h3></div>
              {data.categories.length === 0
                ? <EmptyState title="No expense data" text="Add some expenses to see the distribution." />
                : <CategoryDonut data={data.categories} height={240} />}
            </div>
            <div className="card">
              <div className="card-head"><h3>Category-wise breakdown</h3></div>
              {data.categories.length === 0
                ? <EmptyState title="Nothing to show yet" />
                : (
                  <div className="cat-list">
                    {data.categories.map((c) => (
                      <div key={c.category} className="cat-row">
                        <div className="cat-top"><span>{c.category}</span><b>{money(c.total)}</b></div>
                        <div className="progress"><div className="progress-fill" style={{ width: `${c.percent}%`, background: colorFor(c.category) }} /></div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>

          <div className="card">
            <div className="card-head"><h3>Monthly financial summary</h3></div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Month</th><th className="right">Income</th><th className="right">Expenses</th><th className="right">Savings</th><th className="right">Budget</th></tr>
                </thead>
                <tbody>
                  {[...data.monthly].reverse().map((m) => (
                    <tr key={m.label}>
                      <td>{m.label}</td>
                      <td className="right amount income">{money(m.income)}</td>
                      <td className="right amount expense">{money(m.expense)}</td>
                      <td className={`right amount ${m.savings >= 0 ? 'income' : 'expense'}`}>{money(m.savings)}</td>
                      <td className="right muted">{m.budget ? money(m.budget) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
