// Change these two lines to use another currency.
const CURRENCY = 'INR'
const LOCALE = 'en-IN'

export const money = (n) =>
  new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY, maximumFractionDigits: 2 }).format(n || 0)

export const moneyShort = (n) =>
  new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY, notation: 'compact', maximumFractionDigits: 1 }).format(n || 0)

export const fmtDate = (d) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

export const todayISO = () => {
  const d = new Date()
  const pad = (x) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

export const CATEGORY_COLORS = {
  Food: '#F59E0B', Transport: '#38BDF8', Shopping: '#EC4899', Bills: '#A78BFA',
  Health: '#34D399', Entertainment: '#F472B6', Education: '#818CF8', Travel: '#2DD4BF',
  Rent: '#FB7185', Other: '#94A3B8',
  Salary: '#10B981', Freelance: '#22D3EE', Business: '#A3E635', Investment: '#FBBF24', Gift: '#F9A8D4',
}
export const colorFor = (c) => CATEGORY_COLORS[c] || '#94A3B8'
