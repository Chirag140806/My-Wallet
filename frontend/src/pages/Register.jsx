import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import AuthShell from './AuthShell.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { getErrorMessage } from '../api/axios'

export default function Register() {
  const { user, register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/" replace />

  const set = (f, v) => setForm({ ...form, [f]: v })

  const validate = () => {
    const e = {}
    if (!form.first_name.trim()) e.first_name = 'First name is required.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address.'
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters.'
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setBusy(true)
    try {
      const { confirm, ...payload } = form
      await register(payload)
      toast.success('Account created. Welcome to MyWallet!')
      navigate('/')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start tracking your money in under a minute."
      footer={<>Already have an account? <Link to="/login">Log in</Link></>}
    >
      <form onSubmit={submit} noValidate>
        <div className="field-row">
          <div className="field">
            <label>First name</label>
            <div className="input-icon">
              <User size={18} />
              <input value={form.first_name} onChange={(e) => set('first_name', e.target.value)} className={errors.first_name ? 'invalid' : ''} />
            </div>
            {errors.first_name && <span className="error-text">{errors.first_name}</span>}
          </div>
          <div className="field">
            <label>Last name</label>
            <input className="plain" value={form.last_name} onChange={(e) => set('last_name', e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label>Email</label>
          <div className="input-icon">
            <Mail size={18} />
            <input type="email" placeholder="you@example.com" value={form.email}
              onChange={(e) => set('email', e.target.value)} className={errors.email ? 'invalid' : ''} />
          </div>
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="field">
          <label>Password</label>
          <div className="input-icon">
            <Lock size={18} />
            <input type={show ? 'text' : 'password'} placeholder="At least 6 characters" value={form.password}
              onChange={(e) => set('password', e.target.value)} className={errors.password ? 'invalid' : ''} />
            <button type="button" className="eye" onClick={() => setShow(!show)} aria-label="Show password">
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <span className="error-text">{errors.password}</span>}
        </div>

        <div className="field">
          <label>Confirm password</label>
          <div className="input-icon">
            <Lock size={18} />
            <input type={show ? 'text' : 'password'} value={form.confirm}
              onChange={(e) => set('confirm', e.target.value)} className={errors.confirm ? 'invalid' : ''} />
          </div>
          {errors.confirm && <span className="error-text">{errors.confirm}</span>}
        </div>

        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Creating account...' : 'Create account'}</button>
      </form>
    </AuthShell>
  )
}
