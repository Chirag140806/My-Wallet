import { useEffect, useState } from 'react'
import { AlertTriangle, ChevronLeft, ChevronRight, CheckCircle2, Save } from 'lucide-react'
import api, { getErrorMessage } from '../api/axios'
import { useAppData } from '../context/AppDataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import Loader from '../components/Loader.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import { MONTHS, money } from '../utils/format'

export default function Budget() {
  const { version } = useAppData()
  const toast = useToast()
  const now = new Date()
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() })
  const [data, setData] = useState(null)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    setLoading(true)
    api.get('/budgets/', { params: period })
      .then((res) => { setData(res.data); setAmount(res.data.amount ?? '') })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, version, reload])

  const move = (delta) => {
    const idx = period.year * 12 + (period.month - 1) + delta
    setPeriod({ year: Math.floor(idx / 12), month: (idx % 12) + 1 })
  }

  const save = async (e) => {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) return toast.error('Enter a budget greater than 0.')
    setSaving(true)
    try {
      await api.post('/budgets/', { ...period, amount })
      toast.success(data?.amount ? 'Budget updated.' : 'Budget saved.')
      setReload((r) => r + 1)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h2>Monthly budget</h2>
          <p className="muted">Set a spending limit and stay on track.</p>
        </div>
        <div className="month-picker">
          <button className="icon-btn" onClick={() => move(-1)} aria-label="Previous month"><ChevronLeft size={18} /></button>
          <span>{MONTHS[period.month - 1]} {period.year}</span>
          <button className="icon-btn" onClick={() => move(1)} aria-label="Next month"><ChevronRight size={18} /></button>
        </div>
      </div>

      {loading && !data ? <Loader /> : data && (
        <div className="grid-2">
          <div className={`card budget-card status-${data.status}`}>
            <div className="card-head"><h3>Budget status</h3></div>

            {data.status === 'none' ? (
              <p className="muted">No budget set for this month yet. Use the form to create one.</p>
            ) : (
              <>
                <div className="budget-numbers">
                  <div><span className="muted">Spent</span><b className="expense">{money(data.spent)}</b></div>
                  <div><span className="muted">Budget</span><b>{money(data.amount)}</b></div>
                  <div><span className="muted">{data.remaining >= 0 ? 'Remaining' : 'Over by'}</span>
                    <b className={data.remaining >= 0 ? 'income' : 'expense'}>{money(Math.abs(data.remaining))}</b></div>
                </div>
                <ProgressBar percent={data.percent} status={data.status} />
                <div className="progress-label muted">{data.percent}% used</div>

                {data.status === 'ok' && <div className="alert alert-ok"><CheckCircle2 size={18} /> You are within your budget. Great job!</div>}
                {data.status === 'warning' && <div className="alert alert-warning"><AlertTriangle size={18} /> Warning: you have used {data.percent}% of your budget.</div>}
                {data.status === 'exceeded' && <div className="alert alert-danger"><AlertTriangle size={18} /> Budget exceeded by {money(Math.abs(data.remaining))}.</div>}
              </>
            )}
          </div>

          <div className="card">
            <div className="card-head"><h3>{data.amount ? 'Update budget' : 'Set budget'}</h3></div>
            <form onSubmit={save} noValidate>
              <div className="field">
                <label>Budget for {MONTHS[period.month - 1]} {period.year}</label>
                <input type="number" min="0" step="0.01" placeholder="e.g. 25000" value={amount}
                  onChange={(e) => setAmount(e.target.value)} />
              </div>
              <button className="btn btn-primary" disabled={saving}><Save size={17} /> {saving ? 'Saving...' : data.amount ? 'Update budget' : 'Save budget'}</button>
            </form>
          </div>

          <div className="card span-2">
            <div className="card-head"><h3>Last 6 months</h3></div>
            <div className="history">
              {data.history.map((h) => (
                <div key={h.label} className="history-row">
                  <span className="history-month">{h.label}</span>
                  <div className="history-bar"><ProgressBar percent={h.percent} status={h.status} /></div>
                  <span className="history-amount muted">
                    {h.amount ? `${money(h.spent)} / ${money(h.amount)}` : `${money(h.spent)} spent · no budget`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
