import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import AuthShell from './AuthShell.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { getErrorMessage } from '../api/axios'

export default function Login() {
  const { user, login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/" replace />

  const validate = () => {
    const e = {}
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address.'
    if (!form.password) e.password = 'Password is required.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setBusy(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to see your finances."
      footer={<>New to MyWallet? <Link to="/register">Create an account</Link></>}
    >
      <form onSubmit={submit} noValidate>
        <div className="field">
          <label>Email</label>
          <div className="input-icon">
            <Mail size={18} />
            <input type="email" placeholder="you@example.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} className={errors.email ? 'invalid' : ''} />
          </div>
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="field">
          <label>Password</label>
          <div className="input-icon">
            <Lock size={18} />
            <input type={show ? 'text' : 'password'} placeholder="Your password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} className={errors.password ? 'invalid' : ''} />
            <button type="button" className="eye" onClick={() => setShow(!show)} aria-label="Show password">
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <span className="error-text">{errors.password}</span>}
        </div>

        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Logging in...' : 'Log in'}</button>
      </form>
    </AuthShell>
  )
}
