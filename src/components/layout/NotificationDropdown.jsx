import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { Bell, CheckCheck, Inbox } from 'lucide-react'
import {
  fetchNotificationsThunk,
  fetchUnreadCountThunk,
  markReadThunk,
  markAllReadThunk,
} from '../../features/notifications/notificationThunks'
import {
  selectNotifications,
  selectUnreadCount,
  selectNotifLoading,
} from '../../features/notifications/notificationSelectors'
import NotificationItem from './NotificationItem'
import { cn } from '../../utils/cn'

/**
 * NotificationDropdown
 * Bell icon + animated dropdown panel with grouped notifications.
 * Polling every 60 seconds for new notifications.
 */
const NotificationDropdown = ({ open, onToggle, onClose }) => {
  const dispatch      = useDispatch()
  const notifications = useSelector(selectNotifications)
  const unreadCount   = useSelector(selectUnreadCount)
  const loading       = useSelector(selectNotifLoading)
  const panelRef      = useRef(null)

  // Initial load
  useEffect(() => {
    dispatch(fetchUnreadCountThunk())
    dispatch(fetchNotificationsThunk())
  }, [dispatch])

  // Poll every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchUnreadCountThunk())
    }, 60_000)
    return () => clearInterval(interval)
  }, [dispatch])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose()
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  const handleMarkRead = (id) => dispatch(markReadThunk(id))

  const handleMarkAll = () => {
    dispatch(markAllReadThunk())
    dispatch(fetchNotificationsThunk())
  }

  // Group notifications by date label
  const grouped = notifications.reduce((acc, notif) => {
    const date = new Date(notif.created_at)
    const now  = new Date()
    let label
    if (date.toDateString() === now.toDateString()) {
      label = "Aujourd'hui"
    } else {
      const yesterday = new Date(now)
      yesterday.setDate(now.getDate() - 1)
      label = date.toDateString() === yesterday.toDateString()
        ? 'Hier'
        : date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
    }
    if (!acc[label]) acc[label] = []
    acc[label].push(notif)
    return acc
  }, {})

  return (
    <div ref={panelRef} className="relative">
      {/* Bell button */}
      <button
        onClick={onToggle}
        className={cn(
          'relative flex h-9 w-9 items-center justify-center rounded-lg',
          'text-slate-500 transition-all duration-150',
          'hover:bg-surface-100 hover:text-slate-700',
          'dark:text-slate-400 dark:hover:bg-dark-600 dark:hover:text-slate-200',
          open && 'bg-surface-100 text-slate-700 dark:bg-dark-600 dark:text-slate-200'
        )}
      >
        <Bell className="h-4.5 w-4.5" />
        {/* Unread badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-0.5 -top-0.5 flex h-4 w-4
                         items-center justify-center rounded-full
                         bg-red-500 text-2xs font-bold text-white"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.95, y: -8  }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-11 z-50 w-80
                       overflow-hidden rounded-xl border border-surface-200
                       bg-white shadow-strong
                       dark:border-dark-500 dark:bg-dark-700"
          >
            {/* Header */}
            <div className="flex items-center justify-between
                            border-b border-surface-100 px-4 py-3
                            dark:border-dark-600">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-brand-100 px-1.5 py-0.5
                                   text-2xs font-semibold text-brand-600
                                   dark:bg-brand-900/30 dark:text-brand-400">
                    {unreadCount} non lues
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="flex items-center gap-1 text-xs text-brand-500
                             hover:text-brand-600 dark:text-brand-400
                             transition-colors duration-150"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Tout lire
                </button>
              )}
            </div>

            {/* Notification list */}
            <div className="max-h-96 overflow-y-auto">
              {loading && notifications.length === 0 ? (
                // Skeletons
                <div className="space-y-1 p-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i}
                         className="flex items-start gap-3 rounded-lg p-3">
                      <div className="shimmer h-8 w-8 rounded-lg" />
                      <div className="flex-1 space-y-1.5">
                        <div className="shimmer h-3 w-4/5 rounded" />
                        <div className="shimmer h-2.5 w-1/3 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : Object.keys(grouped).length === 0 ? (
                // Empty state
                <div className="flex flex-col items-center justify-center
                                gap-3 py-10">
                  <div className="flex h-12 w-12 items-center justify-center
                                  rounded-xl bg-surface-100 dark:bg-dark-600">
                    <Inbox className="h-5 w-5 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-400">
                    Aucune notification
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  {Object.entries(grouped).map(([label, items]) => (
                    <div key={label}>
                      {/* Date group label */}
                      <p className="px-3 py-1.5 text-2xs font-semibold
                                    uppercase tracking-wider text-slate-400
                                    dark:text-slate-600">
                        {label}
                      </p>
                      {items.map((notif) => (
                        <NotificationItem
                          key={notif.id}
                          notification={notif}
                          onMarkRead={handleMarkRead}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-surface-100 px-4 py-2.5
                            dark:border-dark-600">
              <button
                onClick={() => {
                  dispatch(fetchNotificationsThunk())
                  onClose()
                }}
                className="w-full text-center text-xs text-brand-500
                           hover:text-brand-600 dark:text-brand-400
                           transition-colors duration-150"
              >
                Voir toutes les notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationDropdown