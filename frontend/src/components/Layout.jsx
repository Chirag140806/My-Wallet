import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import { AppDataProvider } from '../context/AppDataContext.jsx'

export default function Layout() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => setOpen(false), [pathname])

  return (
    <AppDataProvider>
      <div className="app-shell">
        <Sidebar open={open} onClose={() => setOpen(false)} />
        <div className="main">
          <Topbar onMenu={() => setOpen(true)} />
          <main className="content page-fade" key={pathname}>
            <Outlet />
          </main>
        </div>
      </div>
    </AppDataProvider>
  )
}
