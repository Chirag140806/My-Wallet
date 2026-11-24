import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({ title, message, confirmText = 'Delete', busy, onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon"><AlertTriangle size={26} /></div>
        <h3>{title}</h3>
        <p className="muted">{message}</p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel} disabled={busy}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Deleting...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
