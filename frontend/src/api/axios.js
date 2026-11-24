import axios from 'axios'

// All requests go to the Django backend.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
})

// Attach the login token to every request automatically.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Token ${token}`
  return config
})

// If the token is no longer valid, send the user back to the login page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Turn any API error into one readable sentence.
export function getErrorMessage(error) {
  if (!error.response) return 'Cannot reach the server. Is the Django server running?'
  const data = error.response.data
  if (typeof data === 'string') return 'Something went wrong on the server.'
  if (data?.detail) return data.detail
  const first = Object.entries(data || {})[0]
  if (first) {
    const [field, msgs] = first
    const text = Array.isArray(msgs) ? msgs[0] : String(msgs)
    return field === 'non_field_errors' ? text : `${field.replace('_', ' ')}: ${text}`
  }
  return 'Something went wrong. Please try again.'
}

export default api
