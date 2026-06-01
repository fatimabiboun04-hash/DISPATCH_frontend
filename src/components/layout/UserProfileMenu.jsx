import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LogOut, User, Settings, ChevronDown } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { getAvatarData } from '../../utils/avatarGenerator'
import { ROLES } from '../../constants/roles'
import { cn } from '../../utils/cn'

/**
 * UserProfileMenu — avatar + name + dropdown with profile/settings/logout.
 */
const UserProfileMenu = ({ open, onToggle, onClose }) => {
  const { user, logout, isAdmin } = useAuth()
  const navigate                  = useNavigate()
  const menuRef                   = useRef(null)
  const { initials, gradient }    = getAvatarData(user?.name || '')

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose()
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  const handleLogout = async () => {
    onClose()
    await logout()
  }

  const goTo = (path) => {
    navigate(path)
    onClose()
  }

  return (
    <div ref={menuRef} className="relative">
      {/* Trigger */}
      <button
        onClick={onToggle}
        className={cn(
          'flex items-center gap-2 rounded-lg px-2 py-1.5',
          'transition-all duration-150',
          'hover:bg-surface-100 dark:hover:bg-dark-600',
          open && 'bg-surface-100 dark:bg-dark-600'
        )}
      >
        {/* Avatar */}
        {user?.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.name}
            className="h-7 w-7 rounded-full object-cover ring-2 ring-surface-200
                       dark:ring-dark-500"
          />
        ) : (
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full
                       text-2xs font-bold text-white ring-2 ring-surface-200
                       dark:ring-dark-500"
            style={{ background: gradient }}
          >
            {initials}
          </div>
        )}

        {/* Name — hidden on mobile */}
        <div className="hidden flex-col items-start md:flex">
          <span className="max-w-28 truncate text-xs font-medium
                           text-slate-700 dark:text-slate-200">
            {user?.name}
          </span>
          <span className="text-2xs capitalize text-slate-400 dark:text-slate-500">
            {user?.role === ROLES.ADMIN ? 'Administrateur' : 'Employé'}
          </span>
        </div>

        <ChevronDown className={cn(
          'hidden h-3.5 w-3.5 text-slate-400 transition-transform duration-200 md:block',
          open && 'rotate-180'
        )} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="user-menu"
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.95, y: -8  }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-11 z-50 w-52 overflow-hidden
                       rounded-xl border border-surface-200 bg-white shadow-strong
                       dark:border-dark-500 dark:bg-dark-700"
          >
            {/* User info */}
            <div className="border-b border-surface-100 px-4 py-3
                            dark:border-dark-600">
              <p className="truncate text-xs font-semibold
                            text-slate-800 dark:text-slate-100">
                {user?.name}
              </p>
              <p className="truncate text-2xs text-slate-400 dark:text-slate-500">
                {user?.email}
              </p>
            </div>

            {/* Menu items */}
            <div className="p-1.5">
              <button
                onClick={() => goTo(
                  isAdmin ? '/admin/settings' : '/employee/my-profile'
                )}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2
                           text-xs text-slate-700 transition-colors duration-150
                           hover:bg-surface-50 dark:text-slate-300
                           dark:hover:bg-dark-600"
              >
                <User className="h-3.5 w-3.5 text-slate-400" />
                Mon profil
              </button>

              {isAdmin && (
                <button
                  onClick={() => goTo('/admin/settings')}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2
                             text-xs text-slate-700 transition-colors duration-150
                             hover:bg-surface-50 dark:text-slate-300
                             dark:hover:bg-dark-600"
                >
                  <Settings className="h-3.5 w-3.5 text-slate-400" />
                  Paramètres
                </button>
              )}
            </div>

            {/* Logout */}
            <div className="border-t border-surface-100 p-1.5 dark:border-dark-600">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2
                           text-xs text-red-500 transition-colors duration-150
                           hover:bg-red-50 dark:hover:bg-red-900/10"
              >
                <LogOut className="h-3.5 w-3.5" />
                Se déconnecter
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default UserProfileMenu