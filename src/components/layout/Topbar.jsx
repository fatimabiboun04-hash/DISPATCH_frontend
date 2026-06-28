import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Search, Menu, X, Users, Loader2 } from 'lucide-react'
import ThemeToggle          from './ThemeToggle'
import NotificationDropdown from './NotificationDropdown'
import UserProfileMenu      from './UserProfileMenu'
import axiosInstance from '../../services/axiosInstance'
import { API } from '../../constants/apiRoutes'

// Map route segments to readable page titles
const PAGE_TITLES = {
  dashboard:          'Tableau de Bord',
  employees:          'Employés',
  teams:              'Équipes',
  shifts:             'Shifts',
  planning:           'Planning',
  'leave-requests':   'Demandes de Congés',
  reports:            'Rapports',
  history:            'Historique',
  settings:           'Paramètres',
  devices:            'Appareils',
  'pointage-live':    'Pointage Live',
  tasks:              'Tâches',
  skills:             'Compétences',
  'my-planning':      'Mon Planning',
  'my-pointage':      'Mon Pointage',
  'my-leave-requests':'Mes Congés',
  'my-history':       'Mon Historique',
  'my-profile':       'Mon Profil',
  'my-tasks':         'Mes Tâches',
}

/**
 * Topbar — fixed top bar inside both Admin and Employee layouts.
 * Contains: page title, search, notifications, theme toggle, user menu.
 */
const Topbar = ({ onMenuToggle }) => {
  const location  = useLocation()
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen,  setUserOpen]  = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const searchRef = useRef(null)
  const debounceRef = useRef(null)

  // Close search on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false)
        setSearchQuery('')
        setSearchResults([])
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Debounced search
  const doSearch = useCallback(async (query) => {
    if (query.length < 2) {
      setSearchResults([])
      setSearchOpen(false)
      return
    }
    setSearching(true)
    try {
      const [empRes] = await Promise.allSettled([
        axiosInstance.get(API.EMPLOYEES.LIST, { params: { search: query, per_page: 5 } }),
        axiosInstance.get(API.TASKS.LIST, { params: { per_page: 5 } }),
      ])
      const employees = empRes.status === 'fulfilled' ? empRes.value.data.data ?? [] : []
      const results = [
        ...employees.map((e) => ({
          label: e.name,
          sub: e.email || '',
          to: `/admin/employees/${e.id}`,
          icon: Users,
        })),
      ]
      setSearchResults(results)
      setSearchOpen(results.length > 0)
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(searchQuery), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [searchQuery, doSearch])

  // Derive page title from last URL segment
  const segment = location.pathname.split('/').filter(Boolean).pop()
  const title   = PAGE_TITLES[segment] || 'Dispatch Live'

  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center
                       justify-between border-b border-surface-200
                       bg-white/80 px-4 backdrop-blur-md
                       dark:border-dark-600 dark:bg-dark-800/80"
            style={{ paddingLeft: 'var(--topbar-left, 1rem)' }}>

      {/* Left: hamburger (mobile) + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg
                     text-slate-500 hover:bg-surface-100
                     dark:text-slate-400 dark:hover:bg-dark-600
                     lg:hidden"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>
        <h1 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {title}
        </h1>
      </div>

      {/* Right: search + actions */}
      <div className="flex items-center gap-2">

        {/* Search — desktop */}
        <div ref={searchRef} className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5
                             -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher…"
            className="h-9 w-52 rounded-lg border border-surface-200
                       bg-surface-50 pl-9 pr-8 text-xs
                       text-slate-700 placeholder-slate-400
                       transition-all duration-200
                       focus:w-64 focus:border-brand-300 focus:outline-none
                       focus:ring-2 focus:ring-brand-500/20
                       dark:border-dark-500 dark:bg-dark-700
                       dark:text-slate-200 dark:placeholder-slate-600"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setSearchResults([]); setSearchOpen(false) }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {searchOpen && (searchResults.length > 0 || searching) && (
            <div className="absolute right-0 top-full mt-1 w-72 rounded-lg border border-surface-200 bg-white py-1 shadow-lg dark:border-dark-500 dark:bg-dark-700">
              {searching ? (
                <div className="flex items-center justify-center gap-2 px-4 py-3 text-xs text-slate-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Recherche en cours…
                </div>
              ) : (
                searchResults.map((item, i) => (
                  <Link
                    key={i}
                    to={item.to}
                    onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]) }}
                    className="flex items-center gap-3 px-4 py-2.5 text-xs hover:bg-surface-50 dark:hover:bg-dark-600"
                  >
                    <item.icon className="h-4 w-4 shrink-0 text-slate-400" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-slate-700 dark:text-slate-200">
                        {item.label}
                      </div>
                      {item.sub && (
                        <div className="truncate text-slate-400">{item.sub}</div>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-surface-200 dark:bg-dark-500 hidden md:block" />

        {/* Notifications */}
        <NotificationDropdown
          open={notifOpen}
          onToggle={() => {
            setNotifOpen((o) => !o)
            setUserOpen(false)
          }}
          onClose={() => setNotifOpen(false)}
        />

        {/* Theme toggle */}
        <ThemeToggle />

        {/* User profile menu */}
        <UserProfileMenu
          open={userOpen}
          onToggle={() => {
            setUserOpen((o) => !o)
            setNotifOpen(false)
          }}
          onClose={() => setUserOpen(false)}
        />
      </div>
    </header>
  )
}

export default Topbar