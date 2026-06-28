import { motion } from 'framer-motion'
import { Users, ThumbsUp, Clock } from 'lucide-react'
import { Avatar, Badge } from '../ui'

/**
 * ReplacementSuggestions — shows suggested employees after leave approval
 * that removed planning entries.
 *
 * Each suggestion: { employee: { id, name, initials, avatar },
 *                    current_hours, weekly_limit, rating, match_percentage }
 */
const ReplacementSuggestions = ({
  suggestions = [],
  planningRemoved = 0,
  employeeName = '',
  onDismiss,
}) => {
  if (suggestions.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden"
    >
      <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-4
                      dark:border-brand-900/30 dark:bg-brand-900/10">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-brand-500" />
            <span className="text-xs font-semibold text-brand-700 dark:text-brand-300">
              Remplacements suggérés
            </span>
            <Badge variant="primary" size="sm" className="ml-1">
              IA
            </Badge>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-2xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Ignorer
            </button>
          )}
        </div>

        {/* Info */}
        <p className="mb-3 text-2xs text-slate-500 dark:text-slate-400">
          {planningRemoved} assignation{planningRemoved > 1 ? 's' : ''} retirée{planningRemoved > 1 ? 's' : ''}
          {employeeName ? ` pour ${employeeName}` : ''}.
          Ces employés sont disponibles pour remplacer :
        </p>

        {/* Suggestion list */}
        <div className="space-y-2">
          {suggestions.map((s, i) => (
            <motion.div
              key={s.employee?.id || i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 rounded-xl border border-brand-100
                         bg-white px-3 py-2.5 dark:border-brand-900/20 dark:bg-dark-700"
            >
              <Avatar
                src={s.employee?.avatar_url}
                name={s.employee?.name}
                size="sm"
                ring
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                    {s.employee?.name}
                  </p>
                  <Badge
                    variant={s.match_percentage >= 80 ? 'success' : s.match_percentage >= 60 ? 'warning' : 'default'}
                    size="sm"
                  >
                    {s.match_percentage}%
                  </Badge>
                </div>
                <div className="mt-0.5 flex items-center gap-3 text-2xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {s.current_hours ?? 0}h / {s.weekly_limit ?? 44}h
                  </span>
                  {s.rating && (
                    <span>{s.rating === 'excellent' ? '⭐' : '🚩'}</span>
                  )}
                </div>
              </div>
              {s.match_percentage >= 80 && (
                <ThumbsUp className="h-4 w-4 flex-shrink-0 text-emerald-400" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default ReplacementSuggestions
