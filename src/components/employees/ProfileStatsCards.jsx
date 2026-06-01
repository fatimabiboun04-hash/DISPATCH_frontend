import { motion } from 'framer-motion'
import { Clock, TrendingUp, Calendar, Star } from 'lucide-react'
import { HoursBar, Card } from '../ui'
import { formatHours } from '../../utils/formatters'
import { getHoursClasses } from '../../utils/hoursColor'

/**
 * ProfileStatsCards — 4 stat cards in employee profile.
 *
 * Data from GET /v1/employees/{id} + ProfileController@show (for self):
 * stats: {
 *   weekly_hours,  weekly_limit,  hours_state,  alert_message,
 *   is_overtime,   is_under_hours, monthly_hours, monthly_hours_label
 * }
 *
 * hours_state from backend: 'green' | 'orange' | 'red'
 * We map it to our threshold system.
 */
const HOURS_STATE_MAP = {
  green:  'safe',
  orange: 'warning',
  red:    'danger',
}

const ProfileStatsCards = ({ stats, currentRating }) => {
  if (!stats) return null

  const thresholdStatus = HOURS_STATE_MAP[stats.hours_state] || 'safe'
  const hoursClasses    = getHoursClasses(stats.weekly_hours)

  const cards = [
    {
      icon:     Clock,
      iconBg:   'bg-brand-50 dark:bg-brand-900/20',
      iconColor:'text-brand-500',
      label:    'Heures cette semaine',
      value:    formatHours(stats.weekly_hours, true),
      sub:      `/ ${formatHours(stats.weekly_limit, true)} limite`,
      extra: (
        <HoursBar
          hours={stats.weekly_hours}
          limit={stats.weekly_limit}
          showLabel={false}
          showAlert={stats.is_overtime || stats.is_under_hours}
          className="mt-2"
        />
      ),
    },
    {
      icon:     TrendingUp,
      iconBg:   'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor:'text-emerald-500',
      label:    'Heures ce mois',
      value:    stats.monthly_hours !== undefined
        ? formatHours(stats.monthly_hours, true)
        : '—',
      sub: 'Total mensuel',
    },
    {
      icon:     Calendar,
      iconBg:   'bg-violet-50 dark:bg-violet-900/20',
      iconColor:'text-violet-500',
      label:    'Semaine courante',
      value:    `S${stats.current_week}`,
      sub:      stats.is_overtime
        ? '⚠ Heures supplémentaires'
        : stats.is_under_hours
          ? '⚠ Quota non atteint'
          : '✓ Normal',
    },
    {
      icon:     Star,
      iconBg:   currentRating?.type === 'excellent'
        ? 'bg-amber-50 dark:bg-amber-900/20'
        : currentRating?.type === 'warning'
          ? 'bg-red-50 dark:bg-red-900/20'
          : 'bg-slate-100 dark:bg-dark-600',
      iconColor: currentRating?.type === 'excellent'
        ? 'text-amber-500'
        : currentRating?.type === 'warning'
          ? 'text-red-500'
          : 'text-slate-400',
      label: 'Note cette semaine',
      value: currentRating?.type === 'excellent'
        ? '⭐ Excellent'
        : currentRating?.type === 'warning'
          ? '🚩 Attention'
          : '— Non noté',
      sub: currentRating?.reason || '',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: i * 0.06 }}
        >
          <Card className="h-full">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">{card.label}</p>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.iconBg}`}>
                <card.icon className={`h-4 w-4 ${card.iconColor}`} />
              </div>
            </div>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-0.5">
              {card.value}
            </p>
            <p className="text-xs text-slate-400">{card.sub}</p>
            {card.extra}
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

export default ProfileStatsCards