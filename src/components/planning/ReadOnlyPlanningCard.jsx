import { motion } from 'framer-motion'
import { Lock, Clock } from 'lucide-react'
import ShiftBadge  from './ShiftBadge'
import { Avatar, Tooltip } from '../ui'
import { getShiftColor } from '../../constants/shiftColors'
import { cn }            from '../../utils/cn'

/**
 * ReadOnlyPlanningCard — history version of PlanningCard.
 *
 * Same visual as PlanningCard but:
 * - No click-to-open drawer
 * - No delete button
 * - No drag handle
 * - Always shows lock icon
 * - Slightly muted styling
 *
 * planning shape: same as live planning (from GET /v1/planning)
 */
const ReadOnlyPlanningCard = ({ planning, index = 0 }) => {
  const shiftColor = getShiftColor(planning.shift?.type)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className={cn(
        'flex flex-col gap-2 rounded-xl border p-3',
        'select-none cursor-default',
        'opacity-90',
        shiftColor.border,
        'bg-white dark:bg-dark-700',
      )}
    >
      {/* Top: shift badge + lock */}
      <div className="flex items-center justify-between gap-1.5">
        <ShiftBadge shift={planning.shift} compact />
        <Tooltip content="Planning verrouillé — lecture seule">
          <Lock className="h-3 w-3 flex-shrink-0 text-amber-400" />
        </Tooltip>
      </div>

      {/* Team */}
      {planning.team && (
        <div className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: planning.team.color || '#6172f3' }}
          />
          <span className="truncate text-2xs text-slate-500 dark:text-slate-400">
            {planning.team.name}
          </span>
        </div>
      )}

      {/* User */}
      {planning.user && (
        <div className="flex items-center gap-2">
          <Avatar
            src={planning.user.avatar_url}
            name={planning.user.name}
            size="xs"
          />
          <span className="truncate text-2xs font-medium
                           text-slate-600 dark:text-slate-300">
            {planning.user.name.split(' ')[0]}
          </span>
        </div>
      )}

      {/* Time */}
      <div className="flex items-center gap-1 text-2xs text-slate-400">
        <Clock className="h-3 w-3" />
        <span>{planning.shift?.start_time} – {planning.shift?.end_time}</span>
      </div>

      {/* Notes */}
      {planning.notes && (
        <p className="truncate text-2xs text-slate-400 italic">
          {planning.notes}
        </p>
      )}
    </motion.div>
  )
}

export default ReadOnlyPlanningCard