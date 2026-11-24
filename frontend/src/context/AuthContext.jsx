import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!localStorage.getItem('token'))

  // On page refresh: if a token exists, ask Django who we are.
  useEffect(() => {
    if (!localStorage.getItem('token')) return
    api.get('/auth/profile/')
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login/', { email, password })
    localStorage.setItem('token', res.data.token)
    setUser(res.data.user)
  }, [])

  const register = useCallback(async (form) => {
    const res = await api.post('/auth/register/', form)
    localStorage.setItem('token', res.data.token)
    setUser(res.data.user)
  }, [])

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout/') } catch { /* token may already be invalid */ }
    localStorage.removeItem('token')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
