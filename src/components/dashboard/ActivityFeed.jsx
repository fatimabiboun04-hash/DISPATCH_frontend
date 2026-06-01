import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import {
  LogIn, LogOut, FileText, AlertTriangle, Clock,
} from 'lucide-react'
import {
  selectLiveFeed,
  selectLiveFeedLoading,
} from '../../features/dashboard/dashboardSelectors'
import { Card, Skeleton, EmptyState } from '../ui'
import { getAvatarData } from '../../utils/avatarGenerator'
import { cn } from '../../utils/cn'

/**
 * ActivityFeed — live 24h event stream.
 *
 * Data: GET /v1/dashboard/live-feed
 * Item shape: { type, user_name, user_initials, time, status, is_flagged, date_range? }
 *
 * type values: 'check_in' | 'check_out' | 'leave_request'
 * status values: 'present' | 'late' | 'absent' | 'pending'
 */

const TYPE_CONFIG = {
  check_in: {
    icon:  LogIn,
    color: 'text-emerald-500',
    bg:    'bg-emerald-50 dark:bg-emerald-900/20',
    label: 'Pointage entrée',
  },
  check_out: {
    icon:  LogOut,
    color: 'text-blue-500',
    bg:    'bg-blue-50 dark:bg-blue-900/20',
    label: 'Pointage sortie',
  },
  leave_request: {
    icon:  FileText,
    color: 'text-violet-500',
    bg:    'bg-violet-50 dark:bg-violet-900/20',
    label: 'Demande de congé',
  },
}

const STATUS_COLORS = {
  present: 'text-emerald-600 dark:text-emerald-400',
  late:    'text-amber-600 dark:text-amber-400',
  absent:  'text-red-600 dark:text-red-400',
  pending: 'text-slate-400',
}

const STATUS_LABELS = {
  present: 'À l\'heure',
  late:    'En retard',
  absent:  'Absent',
  pending: 'En attente',
}

const FeedItem = ({ item, index }) => {
  const config   = TYPE_CONFIG[item.type] || TYPE_CONFIG.check_in
  const Icon     = config.icon
  const { gradient } = getAvatarData(item.user_name)

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="flex items-start gap-3 py-2.5"
    >
      {/* User avatar */}
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center
                   rounded-full text-2xs font-bold text-white"
        style={{ background: gradient }}
      >
        {item.user_initials}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
            {item.user_name}
          </span>
          {item.is_flagged && (
            <AlertTriangle className="h-3 w-3 flex-shrink-0 text-amber-500" />
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={cn('text-2xs font-medium', config.color)}>
            {config.label}
          </span>
          {item.status && (
            <>
              <span className="text-2xs text-slate-300 dark:text-slate-600">·</span>
              <span className={cn(
                'text-2xs font-medium',
                STATUS_COLORS[item.status] || 'text-slate-400'
              )}>
                {STATUS_LABELS[item.status] || item.status}
              </span>
            </>
          )}
          {item.date_range && (
            <>
              <span className="text-2xs text-slate-300 dark:text-slate-600">·</span>
              <span className="text-2xs text-slate-400">{item.date_range}</span>
            </>
          )}
        </div>
      </div>

      {/* Time */}
      <div className="flex flex-shrink-0 items-center gap-1 text-2xs text-slate-400">
        <Clock className="h-3 w-3" />
        {item.time}
      </div>
    </motion.div>
  )
}

const ActivityFeed = () => {
  const feed    = useSelector(selectLiveFeed)
  const loading = useSelector(selectLiveFeedLoading)

  return (
    <Card className="flex flex-col h-full">
      <Card.Header>
        <div className="flex items-center gap-2">
          <Card.Title>Activité en Direct</Card.Title>
          {/* Live pulse indicator */}
          <span className="flex h-2 w-2">
            <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full
                             bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
        </div>
        <span className="text-xs text-slate-400">Dernières 24h</span>
      </Card.Header>

      <div className="flex-1 overflow-y-auto divide-y divide-surface-100
                      dark:divide-dark-600 -mx-5 px-5">
        {loading ? (
          <div className="space-y-3 py-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 py-2">
                <Skeleton.Circle size="h-8 w-8" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton.Line width="w-32" height="h-3" />
                  <Skeleton.Line width="w-48" height="h-2.5" />
                </div>
                <Skeleton.Line width="w-10" height="h-3" />
              </div>
            ))}
          </div>
        ) : feed.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="Aucune activité"
            description="Les événements apparaîtront ici en temps réel"
            size="sm"
          />
        ) : (
          <div className="divide-y divide-surface-100 dark:divide-dark-600">
            {feed.map((item, i) => (
              <FeedItem
                key={`${item.type}-${item.user_name}-${item.time}-${i}`}
                item={item}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

export default ActivityFeed