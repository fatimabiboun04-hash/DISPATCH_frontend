import { motion }    from 'framer-motion'
import { Plus, Star, CheckCircle, AlertTriangle, Clock } from 'lucide-react'
import { Avatar, Badge, Button, Tooltip, StarRating } from '../ui'
import HoursDetail from './HoursDetail'
import { cn }              from '../../utils/cn'

const REASON_ICONS = {
  'Excellent':               { icon: Star,             color: 'text-emerald-500' },
  'Very Good':               { icon: Star,             color: 'text-emerald-400' },
  'Good':                    { icon: Star,             color: 'text-amber-500' },
  'Average':                 { icon: Star,             color: 'text-amber-400' },
  'Needs Improvement':       { icon: Star,             color: 'text-red-500' },
  'All required skills matched': { icon: CheckCircle,  color: 'text-emerald-500' },
  'Same team':                   { icon: CheckCircle,  color: 'text-brand-500' },
  'Balanced workload':           { icon: CheckCircle,  color: 'text-emerald-500' },
}

const defaultReasonIcon = { icon: Clock, color: 'text-slate-400' }

const ReasonBadge = ({ text }) => {
  const label = text.split(' (')[0]  // extract label before "(x/5)"
  const meta = REASON_ICONS[label] || defaultReasonIcon
  const Icon = meta.icon
  const isPositive = text.startsWith('Excellent') || text.startsWith('Very Good') || text.startsWith('All') || text.startsWith('Same') || text.startsWith('Balanced') || text.startsWith('Good') || text.startsWith('Low') || text.startsWith('Ideal') || text.startsWith('No previous')
  const isNegative = text.startsWith('Needs Improvement') || text.startsWith('Rest period violation') || text.startsWith('High') || text.startsWith('Heavy') || text.startsWith('Average')
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-medium border',
      isPositive ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300' :
      isNegative ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300' :
      'bg-slate-50 border-slate-200 text-slate-600 dark:bg-dark-600 dark:border-dark-400 dark:text-slate-300'
    )}>
      <Icon className="h-2.5 w-2.5" />
      {text}
    </span>
  )
}

const SmartSuggestionItem = ({
  suggestion,
  onSelect,
  index  = 0,
  loading = false,
}) => {
  const { employee, current_hours, weekly_limit, rating, match_percentage, score_breakdown, reasons } = suggestion

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
      className="rounded-xl border border-surface-100 p-3 transition-colors hover:bg-surface-50 dark:border-dark-600 dark:hover:bg-dark-600"
    >
      {/* Row 1: Avatar + info + match + add */}
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <Avatar src={employee.avatar_url} name={employee.name} size="sm" />
          {rating && (
            <span className="absolute -bottom-1.5 left-0 z-10">
              <StarRating value={rating} readonly size="sm" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
            {employee.name}
          </p>
          <HoursDetail currentHours={current_hours} assignmentHours={0} limit={weekly_limit || 44} compact className="mt-0.5" />
        </div>

        <div className={cn('flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold', matchBg, matchColor)}>
          {match_percentage}%
        </div>

        <Button size="sm" variant="outline" className="h-8 w-8 flex-shrink-0 p-0" loading={loading} onClick={() => onSelect?.(suggestion)}>
          {!loading && <Plus className="h-3.5 w-3.5" />}
        </Button>
      </div>

      {/* Row 2: Reasons */}
      {reasons?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {reasons.map((r, i) => <ReasonBadge key={i} text={r} />)}
          {score_breakdown && (
            <Tooltip
              content={
                <div className="space-y-1 text-2xs">
                  <p>Notation: {score_breakdown.rating ?? 0}</p>
                  <p>Heures: {score_breakdown.hours_proximity ?? 0}</p>
                  <p>Compétences: {score_breakdown.skill_match ?? 0}</p>
                  <p>Charge: {score_breakdown.workload_balance ?? 0}</p>
                  <p>Repos: {score_breakdown.rest_period ?? 0}</p>
                  <p>Équipe: {score_breakdown.team_compatibility ?? 0}</p>
                  <p>Jours consécutifs: {score_breakdown.consecutive_days ?? 0}</p>
                  <p>Nuits consécutives: {score_breakdown.night_shift_consecutive ?? 0}</p>
                  <p>Fréquence remplacement: {score_breakdown.replacement_frequency ?? 0}</p>
                </div>
              }
            >
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-2xs text-slate-400 cursor-help dark:border-dark-400 dark:bg-dark-600">
                Détails
              </span>
            </Tooltip>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default SmartSuggestionItem