import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Search, Menu } from 'lucide-react'
import ThemeToggle          from './ThemeToggle'
import NotificationDropdown from './NotificationDropdown'
import UserProfileMenu      from './UserProfileMenu'

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
  'my-planning':      'Mon Planning',
  'my-pointage':      'Mon Pointage',
  'my-leave-requests':'Mes Congés',
  'my-history':       'Mon Historique',
  'my-profile':       'Mon Profil',
}

/**
 * Topbar — fixed top bar inside both Admin and Employee layouts.
 * Contains: page title, search, notifications, theme toggle, user menu.
 */
const Topbar = ({ onMenuToggle }) => {
  const location  = useLocation()
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen,  setUserOpen]  = useState(false)

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
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5
                             -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher…"
            className="h-9 w-52 rounded-lg border border-surface-200
                       bg-surface-50 pl-9 pr-3 text-xs
                       text-slate-700 placeholder-slate-400
                       transition-all duration-200
                       focus:w-64 focus:border-brand-300 focus:outline-none
                       focus:ring-2 focus:ring-brand-500/20
                       dark:border-dark-500 dark:bg-dark-700
                       dark:text-slate-200 dark:placeholder-slate-600"
          />
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