import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Receipt, X } from 'lucide-react'
import api, { getErrorMessage } from '../api/axios'
import { useAppData } from '../context/AppDataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import Loader from '../components/Loader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import TransactionTable from '../components/TransactionTable.jsx'

const EMPTY = { search: '', type: '', category: '', start: '', end: '' }

export default function Transactions() {
  const { categories, version, refresh, openModal } = useAppData()
  const toast = useToast()
  const [params] = useSearchParams()

  const [filters, setFilters] = useState({ ...EMPTY, search: params.get('search') || '' })
  const [debounced, setDebounced] = useState(filters)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // The search box in the top bar changes the URL: keep our filter in sync.
  useEffect(() => {
    setFilters((f) => ({ ...f, search: params.get('search') || '' }))
  }, [params])

  // Wait 300ms after typing before calling the API.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(filters), 300)
    return () => clearTimeout(t)
  }, [filters])

  useEffect(() => {
    setLoading(true)
    const query = Object.fromEntries(Object.entries(debounced).filter(([, v]) => v))
    api.get('/transactions/', { params: query })
      .then((res) => setItems(res.data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, version])

  const set = (field, value) => setFilters((f) => ({ ...f, [field]: value, ...(field === 'type' ? { category: '' } : {}) }))
  const hasFilters = Object.values(filters).some(Boolean)

  const categoryOptions = filters.type
    ? categories[filters.type] || []
    : [...new Set([...(categories.expense || []), ...(categories.income || [])])]

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/transactions/${toDelete.id}/`)
      toast.success('Transaction deleted.')
      setToDelete(null)
      refresh()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  const totalIncome = items.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const totalExpense = items.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h2>All transactions</h2>
          <p className="muted">Add, search, edit and delete your income and expenses.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}><Plus size={18} /> Add transaction</button>
      </div>

      <div className="card filters">
        <input className="plain" placeholder="Search description or category..." value={filters.search}
          onChange={(e) => set('search', e.target.value)} />
        <select value={filters.type} onChange={(e) => set('type', e.target.value)}>
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select value={filters.category} onChange={(e) => set('category', e.target.value)}>
          <option value="">All categories</option>
          {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="date-filter">
          <input type="date" value={filters.start} onChange={(e) => set('start', e.target.value)} title="From" />
          <span className="muted">to</span>
          <input type="date" value={filters.end} onChange={(e) => set('end', e.target.value)} title="To" />
        </div>
        {hasFilters && <button className="btn btn-ghost btn-sm" onClick={() => setFilters(EMPTY)}><X size={15} /> Clear</button>}
      </div>

      <div className="card">
        {loading ? <Loader text="Loading transactions..." /> : items.length === 0 ? (
          <EmptyState icon={Receipt}
            title={hasFilters ? 'No matching transactions' : 'No transactions yet'}
            text={hasFilters ? 'Try changing or clearing your filters.' : 'Add your first income or expense to get started.'}
            action={!hasFilters && <button className="btn btn-primary btn-sm" onClick={() => openModal()}>Add transaction</button>} />
        ) : (
          <>
            <div className="table-summary muted">
              {items.length} transaction{items.length !== 1 && 's'} ·{' '}
              <span className="amount income">+{totalIncome.toLocaleString('en-IN')}</span> income ·{' '}
              <span className="amount expense">−{totalExpense.toLocaleString('en-IN')}</span> expenses
            </div>
            <TransactionTable transactions={items} onEdit={openModal} onDelete={setToDelete} />
          </>
        )}
      </div>

      {toDelete && (
        <ConfirmDialog title="Delete this transaction?"
          message={`${toDelete.category} · ${toDelete.description || 'No description'} will be permanently removed.`}
          busy={deleting} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
      )}
    </div>
  )
}
