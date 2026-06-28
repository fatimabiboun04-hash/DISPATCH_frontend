import { motion }    from 'framer-motion'
import { Plus, Star } from 'lucide-react'
import { Avatar, HoursBar, Badge, Button } from '../ui'
import { getHoursClasses } from '../../utils/hoursColor'
import { getAvatarData }   from '../../utils/avatarGenerator'
import { cn }              from '../../utils/cn'

/**
 * SmartSuggestionItem — one ranked employee suggestion row.
 *
 * Data shape from POST /v1/planning/suggest:
 * {
 *   employee: { id, name, initials, avatar_url },
 *   current_hours, weekly_limit, rating, match_percentage
 * }
 */
const SmartSuggestionItem = ({
  suggestion,
  onSelect,
  index  = 0,
  loading = false,
}) => {
  const { employee, current_hours, weekly_limit, rating, match_percentage } = suggestion
  const hoursClasses = getHoursClasses(current_hours)

  // Match percentage color
  const matchColor =
    match_percentage >= 80 ? 'text-emerald-600 dark:text-emerald-400'
    : match_percentage >= 60 ? 'text-amber-600 dark:text-amber-400'
    : 'text-slate-500'

  const matchBg =
    match_percentage >= 80 ? 'bg-emerald-50 dark:bg-emerald-900/20'
    : match_percentage >= 60 ? 'bg-amber-50 dark:bg-amber-900/20'
    : 'bg-slate-100 dark:bg-dark-600'

  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="flex items-center gap-3 rounded-xl border border-surface-100
                 p-3 transition-colors hover:bg-surface-50
                 dark:border-dark-600 dark:hover:bg-dark-600"
    >
      {/* Avatar */}
      <Avatar
        src={employee.avatar_url}
        name={employee.name}
        size="sm"
      />

      {/* Name + hours */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-xs font-semibold
                        text-slate-700 dark:text-slate-200">
            {employee.name}
          </p>
          {rating === 'excellent' && (
            <span className="text-xs">⭐</span>
          )}
          {rating === 'warning' && (
            <span className="text-xs">🚩</span>
          )}
        </div>
        <HoursBar
          hours={current_hours}
          limit={weekly_limit || 44}
          showLabel={false}
          className="mt-1 w-24"
        />
        <span className={cn('text-2xs font-medium', hoursClasses.text)}>
          {current_hours}h / {weekly_limit || 44}h
        </span>
      </div>

      {/* Match percentage */}
      <div className={cn(
        'flex h-9 w-9 flex-shrink-0 items-center justify-center',
        'rounded-lg text-xs font-bold',
        matchBg, matchColor
      )}>
        {match_percentage}%
      </div>

      {/* Select button */}
      <Button
        size="sm"
        variant="outline"
        className="h-8 w-8 flex-shrink-0 p-0"
        loading={loading}
        onClick={() => onSelect?.(suggestion)}
      >
        {!loading && <Plus className="h-3.5 w-3.5" />}
      </Button>
    </motion.div>
  )
}

export default SmartSuggestionItem