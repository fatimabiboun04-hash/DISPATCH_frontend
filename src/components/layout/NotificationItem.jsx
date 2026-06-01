import { motion } from 'framer-motion'
import { Bell, CheckCircle, Clock, AlertTriangle, Calendar } from 'lucide-react'
import { formatRelative } from '../../utils/formatters'
import { cn } from '../../utils/cn'

// Map notification type to icon and color
const TYPE_CONFIG = {
  leave_approved: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  leave_rejected: { icon: AlertTriangle, color: 'text-red-500',   bg: 'bg-red-50 dark:bg-red-900/20' },
  late_checkin:   { icon: Clock,        color: 'text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-900/20' },
  absence:        { icon: AlertTriangle, color: 'text-red-500',   bg: 'bg-red-50 dark:bg-red-900/20' },
  planning:       { icon: Calendar,     color: 'text-brand-500',  bg: 'bg-brand-50 dark:bg-brand-900/20' },
  default:        { icon: Bell,         color: 'text-slate-400',  bg: 'bg-slate-100 dark:bg-dark-500' },
}

/**
 * NotificationItem — single notification row inside the dropdown.
 */
const NotificationItem = ({ notification, onMarkRead }) => {
  const isUnread = !notification.read_at
  const type     = notification.data?.type || 'default'
  const config   = TYPE_CONFIG[type] || TYPE_CONFIG.default
  const Icon     = config.icon

  return (
    <motion.button
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={() => isUnread && onMarkRead(notification.id)}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg p-3 text-left',
        'transition-all duration-150',
        'hover:bg-surface-50 dark:hover:bg-dark-600',
        isUnread && 'bg-brand-50/50 dark:bg-brand-900/10'
      )}
    >
      {/* Icon */}
      <div className={cn(
        'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg',
        config.bg
      )}>
        <Icon className={cn('h-4 w-4', config.color)} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className={cn(
          'text-xs leading-relaxed',
          isUnread
            ? 'font-medium text-slate-800 dark:text-slate-200'
            : 'text-slate-600 dark:text-slate-400'
        )}>
          {notification.data?.message || 'Nouvelle notification'}
        </p>
        <p className="mt-0.5 text-2xs text-slate-400 dark:text-slate-600">
          {formatRelative(notification.created_at)}
        </p>
      </div>

      {/* Unread dot */}
      {isUnread && (
        <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
      )}
    </motion.button>
  )
}

export default NotificationItem