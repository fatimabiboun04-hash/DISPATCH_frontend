import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { PauseCircle, Coffee } from 'lucide-react'
import {
  selectActivePauses,
  selectActivePausesCount,
  selectActivePausesLoading,
} from '../../features/dashboard/dashboardSelectors'
import { Card, Avatar, Badge, Skeleton, EmptyState } from '../ui'
import { cn } from '../../utils/cn'

/**
 * ActivePausesWidget
 *
 * Data: GET /v1/dashboard/active-pauses
 * Shape: { count: number, pauses: [{ user, team, planning: { shift }, pause_start, pause_end }] }
 *
 * Note: pause_start / pause_end stored as datetime (fix #3 applied),
 *       format them as H:i for display.
 */
const ActivePausesWidget = () => {
  const data    = useSelector(selectActivePauses)
  const count   = useSelector(selectActivePausesCount)
  const loading = useSelector(selectActivePausesLoading)
  const pauses  = data?.pauses || []

  // Format time from full datetime or H:i string
  const formatPauseTime = (val) => {
    if (!val) return '—'
    // Handles both 'HH:mm' and full ISO datetime
    const parts = val.toString().split('T')
    const timePart = parts.length > 1 ? parts[1] : parts[0]
    return timePart.substring(0, 5)
  }

  return (
    <Card className="flex flex-col h-full">
      <Card.Header>
        <div className="flex items-center gap-2">
          <Card.Title>Pauses Actives</Card.Title>
          {count > 0 && (
            <Badge variant="warning" size="sm">{count}</Badge>
          )}
        </div>
        <span className="text-xs text-slate-400">En ce moment</span>
      </Card.Header>

      <div className="flex-1 overflow-y-auto space-y-2">
        {loading ? (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg
                                     border border-surface-100 p-3 dark:border-dark-600">
                <Skeleton.Circle size="h-8 w-8" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton.Line width="w-28" height="h-3" />
                  <Skeleton.Line width="w-20" height="h-2.5" />
                </div>
                <Skeleton.Line width="w-16" height="h-3" />
              </div>
            ))}
          </>
        ) : pauses.length === 0 ? (
          <EmptyState
            icon={Coffee}
            title="Aucune pause en cours"
            description="Les pauses actives s'affichent ici"
            size="sm"
          />
        ) : (
          pauses.map((pause, i) => (
            <motion.div
              key={`${pause.user?.id}-${pause.pause_start}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              className="flex items-center gap-3 rounded-xl border border-surface-100
                         bg-amber-50/50 p-3 dark:border-dark-600 dark:bg-amber-900/5"
            >
              {/* Avatar */}
              <Avatar
                src={pause.user?.avatar_url}
                name={pause.user?.name || '?'}
                size="sm"
              />

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">
                  {pause.user?.name || 'Employé'}
                </p>
                <p className="text-2xs text-slate-400">
                  {pause.team?.name || '—'}
                </p>
              </div>

              {/* Time window */}
              <div className="flex flex-shrink-0 items-center gap-1
                              rounded-lg bg-amber-100 px-2 py-1
                              dark:bg-amber-900/30">
                <PauseCircle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                <span className="text-2xs font-medium text-amber-700 dark:text-amber-300">
                  {formatPauseTime(pause.pause_start)} – {formatPauseTime(pause.pause_end)}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </Card>
  )
}

export default ActivePausesWidget