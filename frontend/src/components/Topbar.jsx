import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, Plus, Search } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useAppData } from '../context/AppDataContext.jsx'

const TITLES = {
  '/': 'Dashboard',
  '/transactions': 'Transactions',
  '/budget': 'Budget',
  '/analytics': 'Analytics',
  '/profile': 'Profile & Settings',
}

export default function Topbar({ onMenu }) {
  const { user } = useAuth()
  const { openModal } = useAppData()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  // clear the search box when we leave the transactions page
  useEffect(() => { if (pathname !== '/transactions') setQuery('') }, [pathname])

  const search = (e) => {
    e.preventDefault()
    navigate(`/transactions?search=${encodeURIComponent(query.trim())}`)
  }

  const initials = ((user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')).toUpperCase() || 'U'

  return (
    <header className="topbar">
      <button className="icon-btn menu-btn" onClick={onMenu} aria-label="Open menu"><Menu size={22} /></button>
      <h1 className="page-title">{TITLES[pathname] || 'MyWallet'}</h1>

      <form className="top-search" onSubmit={search}>
        <Search size={17} />
        <input placeholder="Search transactions..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </form>

      <button className="btn btn-primary btn-sm add-btn" onClick={() => openModal()}>
        <Plus size={17} /> <span>Add</span>
      </button>

      <button className="avatar" title="Profile" onClick={() => navigate('/profile')}>{initials}</button>
    </header>
  )
}
