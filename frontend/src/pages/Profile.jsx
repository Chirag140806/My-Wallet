import { useState } from 'react'
import { LogOut, Save } from 'lucide-react'
import api, { getErrorMessage } from '../api/axios'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function Profile() {
  const { user, setUser, logout } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ first_name: user.first_name, last_name: user.last_name, email: user.email })
  const [pw, setPw] = useState({ current_password: '', new_password: '' })
  const [saving, setSaving] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)

  const initials = ((user.first_name?.[0] || '') + (user.last_name?.[0] || '')).toUpperCase() || 'U'
  const joined = new Date(user.date_joined).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })

  const saveProfile = async (e) => {
    e.preventDefault()
    if (!form.first_name.trim()) return toast.error('First name is required.')
    setSaving(true)
    try {
      const res = await api.patch('/auth/profile/', form)
      setUser(res.data)
      toast.success('Profile updated.')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    if (pw.new_password.length < 6) return toast.error('New password must be at least 6 characters.')
    setPwSaving(true)
    try {
      const res = await api.post('/auth/change-password/', pw)
      localStorage.setItem('token', res.data.token) // the old token was replaced
      setPw({ current_password: '', new_password: '' })
      toast.success('Password changed.')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setPwSaving(false)
    }
  }

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h2>Profile & settings</h2>
          <p className="muted">Manage your personal information.</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card profile-card">
          <div className="profile-avatar">{initials}</div>
          <h3>{user.first_name} {user.last_name}</h3>
          <p className="muted">{user.email}</p>
          <p className="muted small">Member since {joined}</p>
          <button className="btn btn-danger-outline" onClick={logout}><LogOut size={17} /> Logout</button>
        </div>

        <div className="stack">
          <div className="card">
            <div className="card-head"><h3>Personal information</h3></div>
            <form onSubmit={saveProfile} noValidate>
              <div className="field-row">
                <div className="field"><label>First name</label>
                  <input className="plain" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></div>
                <div className="field"><label>Last name</label>
                  <input className="plain" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></div>
              </div>
              <div className="field"><label>Email</label>
                <input className="plain" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <button className="btn btn-primary" disabled={saving}><Save size={17} /> {saving ? 'Saving...' : 'Save changes'}</button>
            </form>
          </div>

          <div className="card">
            <div className="card-head"><h3>Change password</h3></div>
            <form onSubmit={changePassword} noValidate>
              <div className="field"><label>Current password</label>
                <input className="plain" type="password" value={pw.current_password} onChange={(e) => setPw({ ...pw, current_password: e.target.value })} /></div>
              <div className="field"><label>New password</label>
                <input className="plain" type="password" value={pw.new_password} onChange={(e) => setPw({ ...pw, new_password: e.target.value })} /></div>
              <button className="btn btn-primary" disabled={pwSaving}>{pwSaving ? 'Updating...' : 'Update password'}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
