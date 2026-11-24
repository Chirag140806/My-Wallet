import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api from '../api/axios'
import TransactionModal from '../components/TransactionModal.jsx'

/*
  Shared data for the logged-in area:
  - the category lists (loaded once from Django)
  - the "add / edit transaction" popup, which can be opened from any page
  - `version`: a number that goes up after every save, so pages reload their data
*/
const AppDataContext = createContext(null)
export const useAppData = () => useContext(AppDataContext)

export function AppDataProvider({ children }) {
  const [categories, setCategories] = useState({ income: [], expense: [] })
  const [version, setVersion] = useState(0)
  const [modal, setModal] = useState({ open: false, transaction: null })

  useEffect(() => {
    api.get('/categories/').then((res) => setCategories(res.data)).catch(() => {})
  }, [])

  const openModal = useCallback((transaction = null) => setModal({ open: true, transaction }), [])
  const closeModal = useCallback(() => setModal({ open: false, transaction: null }), [])
  const refresh = useCallback(() => setVersion((v) => v + 1), [])

  return (
    <AppDataContext.Provider value={{ categories, version, refresh, openModal }}>
      {children}
      {modal.open && (
        <TransactionModal
          transaction={modal.transaction}
          categories={categories}
          onClose={closeModal}
          onSaved={() => { closeModal(); refresh() }}
        />
      )}
    </AppDataContext.Provider>
  )
}
