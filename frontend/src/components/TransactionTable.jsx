import { Pencil, Trash2 } from 'lucide-react'
import { colorFor, fmtDate, money } from '../utils/format'

// `onEdit` / `onDelete` are optional: if missing, the action buttons are hidden.
export default function TransactionTable({ transactions, onEdit, onDelete, compact = false }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Description</th>
            <th>Date</th>
            <th className="right">Amount</th>
            {!compact && (onEdit || onDelete) && <th className="right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td>
                <span className="chip">
                  <span className="dot" style={{ background: colorFor(t.category) }} />
                  {t.category}
                </span>
              </td>
              <td className="desc">{t.description || <span className="muted">—</span>}</td>
              <td className="muted nowrap">{fmtDate(t.date)}</td>
              <td className={`right amount ${t.type}`}>
                {t.type === 'income' ? '+' : '−'}{money(t.amount)}
              </td>
              {!compact && (onEdit || onDelete) && (
                <td className="right nowrap">
                  {onEdit && <button className="icon-btn" title="Edit" onClick={() => onEdit(t)}><Pencil size={16} /></button>}
                  {onDelete && <button className="icon-btn danger" title="Delete" onClick={() => onDelete(t)}><Trash2 size={16} /></button>}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
