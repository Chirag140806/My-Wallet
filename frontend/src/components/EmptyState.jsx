import { Inbox } from 'lucide-react'

export default function EmptyState({ title, text, action, icon: Icon = Inbox }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><Icon size={28} /></div>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  )
}
