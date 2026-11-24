// status: ok | warning | exceeded | none
export default function ProgressBar({ percent = 0, status = 'ok' }) {
  return (
    <div className="progress">
      <div className={`progress-fill progress-${status}`} style={{ width: `${Math.min(percent, 100)}%` }} />
    </div>
  )
}
