import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import {
  TrendingUp, Target, Users, Clock, Calendar,
} from 'lucide-react'
import {
  selectProductivity, selectUtilization, selectAbsenceRate,
  selectAvgPauseMinutes, selectOnTimePercentage, selectPlanningQuality,
  selectStatsLoading,
} from '../../features/dashboard/dashboardSelectors'
import { StatCard } from '../ui'

const KpiEngineRow = () => {
  const loading    = useSelector(selectStatsLoading)
  const prod       = useSelector(selectProductivity)
  const util       = useSelector(selectUtilization)
  const absence    = useSelector(selectAbsenceRate)
  const avgPause   = useSelector(selectAvgPauseMinutes)
  const onTime     = useSelector(selectOnTimePercentage)
  const quality    = useSelector(selectPlanningQuality)
  const qualityScore = quality?.score ?? 0
  const qualityGrade = quality?.grade ?? '—'

  const cards = [
    {
      label: 'Productivité',
      value: `${prod}%`,
      sublabel: 'tâches complétées',
      icon: TrendingUp,
      iconBg: prod >= 70 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-amber-50 dark:bg-amber-900/20',
      iconColor: prod >= 70 ? 'text-emerald-500' : 'text-amber-500',
    },
    {
      label: 'Utilisation',
      value: `${util}%`,
      sublabel: 'travaillées / planifiées',
      icon: Target,
      iconBg: util >= 80 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-amber-50 dark:bg-amber-900/20',
      iconColor: util >= 80 ? 'text-emerald-500' : 'text-amber-500',
    },
    {
      label: 'Taux d\'Absence',
      value: `${absence}%`,
      sublabel: 'aujourd\'hui',
      icon: Users,
      iconBg: absence <= 10 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20',
      iconColor: absence <= 10 ? 'text-emerald-500' : 'text-red-500',
    },
    {
      label: 'Pause Moyenne',
      value: `${avgPause} min`,
      sublabel: 'cette semaine',
      icon: Clock,
      iconBg: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-500',
    },
    {
      label: 'À l\'Heure',
      value: `${onTime}%`,
      sublabel: 'pointages aujourd\'hui',
      icon: Calendar,
      iconBg: onTime >= 90 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-amber-50 dark:bg-amber-900/20',
      iconColor: onTime >= 90 ? 'text-emerald-500' : 'text-amber-500',
    },
    {
      label: 'Qualité Planning',
      value: `${qualityScore}/100`,
      sublabel: `Note ${qualityGrade}`,
      icon: TrendingUp,
      iconBg: qualityScore >= 75 ? 'bg-emerald-50 dark:bg-emerald-900/20'
            : qualityScore >= 60 ? 'bg-amber-50 dark:bg-amber-900/20'
            : 'bg-red-50 dark:bg-red-900/20',
      iconColor: qualityScore >= 75 ? 'text-emerald-500'
               : qualityScore >= 60 ? 'text-amber-500'
               : 'text-red-500',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.04 }}
        >
          <StatCard
            loading={loading}
            label={card.label}
            value={card.value}
            sublabel={card.sublabel}
            icon={card.icon}
            iconBg={card.iconBg}
            iconColor={card.iconColor}
          />
        </motion.div>
      ))}
    </div>
  )
}

export default KpiEngineRow
