import { Wallet, ShieldCheck, TrendingUp, PieChart } from 'lucide-react'

// Shared two-column layout for the Login and Register pages.
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="brand">
          <span className="brand-logo"><Wallet size={20} /></span>
          <span className="brand-name">My<b>Wallet</b></span>
        </div>
        <h2>Take control of every rupee you spend.</h2>
        <p>Track expenses, set monthly budgets and understand your money with beautiful analytics.</p>
        <ul className="hero-points">
          <li><TrendingUp size={18} /> Real-time income and expense tracking</li>
          <li><PieChart size={18} /> Category insights and spending charts</li>
          <li><ShieldCheck size={18} /> Private account, your data stays yours</li>
        </ul>
        <div className="hero-glow" />
      </div>

      <div className="auth-panel">
        <div className="auth-card">
          <h1>{title}</h1>
          <p className="muted">{subtitle}</p>
          {children}
          <div className="auth-footer">{footer}</div>
        </div>
      </div>
    </div>
  )
}
