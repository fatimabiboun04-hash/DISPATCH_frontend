import { motion } from 'framer-motion'
import { Clock, Star, Calendar, FileText, MapPin } from 'lucide-react'
import { Badge } from '../ui'
import { formatRelative, formatDate, formatTime } from '../../utils/formatters'
import { cn } from '../../utils/cn'

/**
 * ActivityTimeline — merged employee activity timeline.
 *
 * Data from GET /v1/employees/{id}/history (gap fix #2)
 * Each item shape: { type, icon, title, description, date, meta }
 *
 * type values: 'pointage' | 'rating' | 'leave' | 'planning'
 */

const TYPE_CONFIG = {
  pointage: {
    icon:   MapPin,
    color:  'text-emerald-500',
    bg:     'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  rating: {
    icon:   Star,
    color:  'text-amber-500',
    bg:     'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
  },
  leave: {
    icon:   FileText,
    color:  'text-violet-500',
    bg:     'bg-violet-50 dark:bg-violet-900/20',
    border: 'border-violet-200 dark:border-violet-800',
  },
  planning: {
    icon:   Calendar,
    color:  'text-brand-500',
    bg:     'bg-brand-50 dark:bg-brand-900/20',
    border: 'border-brand-200 dark:border-brand-800',
  },
}

const TimelineItem = ({ item, index }) => {
  const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.planning
  const Icon   = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0  }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      className="flex gap-3"
    >
      {/* Line + dot */}
      <div className="flex flex-col items-center">
        <div className={cn(
          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border',
          config.bg, config.border
        )}>
          <Icon className={cn('h-3.5 w-3.5', config.color)} />
        </div>
        {/* Vertical connector line */}
        <div className="mt-1 flex-1 w-px bg-surface-200 dark:bg-dark-500" />
      </div>

      {/* Content */}
      <div className="pb-5 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {item.title}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {item.description}
            </p>
          </div>
          <span className="flex-shrink-0 text-2xs text-slate-400 whitespace-nowrap">
            {formatRelative(item.date)}
          </span>
        </div>

        {/* Meta badges */}
        {item.meta && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {item.meta.status && (
              <Badge
                size="sm"
                variant={
                  item.meta.status === 'approved' || item.meta.status === 'present' ? 'success'
                  : item.meta.status === 'rejected' || item.meta.status === 'absent' ? 'danger'
                  : 'warning'
                }
              >
                {item.meta.status}
              </Badge>
            )}
            {item.meta.shift && (
              <Badge size="sm" variant="default">{item.meta.shift}</Badge>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

const ActivityTimeline = ({ items = [], loading }) => {
  if (loading) {
    return (
      <div className="space-y-4 py-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="h-8 w-8 rounded-full shimmer flex-shrink-0" />
            <div className="flex-1 space-y-1.5 pt-1">
              <div className="shimmer h-3.5 w-48 rounded" />
              <div className="shimmer h-3 w-64 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="py-8 text-center">
        <Clock className="mx-auto mb-2 h-8 w-8 text-slate-300" />
        <p className="text-sm text-slate-400">Aucune activité enregistrée</p>
      </div>
    )
  }

  return (
    <div className="pt-2">
      {items.map((item, i) => (
        <TimelineItem
          key={`${item.type}-${item.date}-${i}`}
          item={item}
          index={i}
        />
      ))}
    </div>
  )
}

export default ActivityTimeline