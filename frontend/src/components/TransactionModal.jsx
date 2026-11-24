import { useState } from 'react'
import { X } from 'lucide-react'
import api, { getErrorMessage } from '../api/axios'
import { useToast } from '../context/ToastContext.jsx'
import { todayISO } from '../utils/format'

// One popup used for both "Add" and "Edit".
export default function TransactionModal({ transaction, categories, onClose, onSaved }) {
  const toast = useToast()
  const editing = !!transaction

  const [form, setForm] = useState({
    type: transaction?.type || 'expense',
    amount: transaction?.amount || '',
    category: transaction?.category || '',
    description: transaction?.description || '',
    date: transaction?.date || todayISO(),
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const list = categories[form.type] || []
  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const changeType = (type) => setForm((f) => ({ ...f, type, category: '' }))

  const validate = () => {
    const e = {}
    if (!form.amount || Number(form.amount) <= 0) e.amount = 'Enter an amount greater than 0.'
    if (!form.category) e.category = 'Please choose a category.'
    if (!form.date) e.date = 'Please pick a date.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/transactions/${transaction.id}/`, form)
        toast.success('Transaction updated.')
      } else {
        await api.post('/transactions/', form)
        toast.success(form.type === 'income' ? 'Income added.' : 'Expense added.')
      }
      onSaved()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{editing ? 'Edit transaction' : 'Add transaction'}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <form onSubmit={submit} noValidate>
          <div className="type-toggle">
            <button type="button" className={form.type === 'expense' ? 'active expense' : ''} onClick={() => changeType('expense')}>Expense</button>
            <button type="button" className={form.type === 'income' ? 'active income' : ''} onClick={() => changeType('income')}>Income</button>
          </div>

          <div className="field">
            <label>Amount</label>
            <input type="number" step="0.01" min="0" placeholder="0.00" value={form.amount}
              onChange={(e) => set('amount', e.target.value)} className={errors.amount ? 'invalid' : ''} autoFocus />
            {errors.amount && <span className="error-text">{errors.amount}</span>}
          </div>

          <div className="field-row">
            <div className="field">
              <label>Category</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)} className={errors.category ? 'invalid' : ''}>
                <option value="">Select category</option>
                {list.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <span className="error-text">{errors.category}</span>}
            </div>
            <div className="field">
              <label>Date</label>
              <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} className={errors.date ? 'invalid' : ''} />
              {errors.date && <span className="error-text">{errors.date}</span>}
            </div>
          </div>

          <div className="field">
            <label>Description <span className="muted">(optional)</span></label>
            <input type="text" maxLength={255} placeholder="e.g. Lunch with friends" value={form.description}
              onChange={(e) => set('description', e.target.value)} />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Save changes' : 'Add transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
