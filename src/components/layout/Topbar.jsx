import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import ThemeToggle          from './ThemeToggle'
import NotificationDropdown from './NotificationDropdown'
import UserProfileMenu      from './UserProfileMenu'
import GlobalSearch         from './GlobalSearch'

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

        {/* Global Search */}
        <GlobalSearch />

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