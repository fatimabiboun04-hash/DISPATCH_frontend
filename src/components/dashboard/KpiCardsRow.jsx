import {
  Users, Clock, FileText, AlertTriangle,
  TrendingUp, PauseCircle, Star, Calendar,
  UserX, UserCheck, Briefcase, Lock,
  CheckCircle, Bell, Target,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import {
  selectStats, selectStatsLoading,
  selectCoveragePct, selectPresentNow,
  selectTotalEmployees, selectDelaysToday,
  selectPendingLeaves,
  selectActivePausesCount,
  selectOvertimes,
  selectAverageRating, selectTotalRated,
  selectEmployeesOnLeave,
  selectEmployeesAbsent,
  selectMissingAssignments,
  selectCompletedTasks,
  selectPendingTasks,
  selectLockedWeeks,
  selectOpenWeeks,
  selectUnreadNotifications,
  selectWeeklyWorkedHours,
} from '../../features/dashboard/dashboardSelectors'
import { StatCard } from '../ui'

const KpiCardsRow = () => {
  const loading     = useSelector(selectStatsLoading)
  const coveragePct = useSelector(selectCoveragePct)
  const presentNow  = useSelector(selectPresentNow)
  const totalEmp    = useSelector(selectTotalEmployees)
  const delays      = useSelector(selectDelaysToday)
  const pendingLeaves = useSelector(selectPendingLeaves)
  const pauseCount  = useSelector(selectActivePausesCount)
  const overtimes   = useSelector(selectOvertimes)
  const avgRating   = useSelector(selectAverageRating)
  const totalRated  = useSelector(selectTotalRated)
  const onLeave     = useSelector(selectEmployeesOnLeave)
  const absent      = useSelector(selectEmployeesAbsent)
  const missing     = useSelector(selectMissingAssignments)
  const completed   = useSelector(selectCompletedTasks)
  const pendingTasks = useSelector(selectPendingTasks)
  const locked      = useSelector(selectLockedWeeks)
  const openWks     = useSelector(selectOpenWeeks)
  const unreadNotif = useSelector(selectUnreadNotifications)
  const workedHours = useSelector(selectWeeklyWorkedHours)

  const cards = [
    {
      label: "Couverture",
      value: `${coveragePct}%`,
      sublabel: `${totalEmp} employés actifs`,
      icon: TrendingUp,
      iconBg: coveragePct >= 80
        ? 'bg-emerald-50 dark:bg-emerald-900/20'
        : 'bg-amber-50 dark:bg-amber-900/20',
      iconColor: coveragePct >= 80
        ? 'text-emerald-500 dark:text-emerald-400'
        : 'text-amber-500 dark:text-amber-400',
    },
    {
      label: "Présents",
      value: presentNow,
      sublabel: 'en cours de service',
      icon: Users,
      iconBg: 'bg-brand-50 dark:bg-brand-900/20',
      iconColor: 'text-brand-500 dark:text-brand-400',
    },
    {
      label: "Retards",
      value: delays,
      sublabel: delays === 0 ? 'Aucun' : 'aujourd\'hui',
      icon: Clock,
      iconBg: delays > 0 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: delays > 0 ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-500 dark:text-emerald-400',
    },
    {
      label: "Congés",
      value: pendingLeaves,
      sublabel: pendingLeaves === 1 ? 'demande en attente' : 'demandes en attente',
      icon: FileText,
      iconBg: pendingLeaves > 0 ? 'bg-violet-50 dark:bg-violet-900/20' : 'bg-slate-50 dark:bg-dark-600',
      iconColor: pendingLeaves > 0 ? 'text-violet-500 dark:text-violet-400' : 'text-slate-400',
    },
    {
      label: "Pauses",
      value: pauseCount,
      sublabel: 'actives',
      icon: PauseCircle,
      iconBg: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-500 dark:text-blue-400',
    },
    {
      label: "Absents",
      value: absent,
      sublabel: absent === 1 ? 'employé' : 'employés',
      icon: UserX,
      iconBg: absent > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: absent > 0 ? 'text-red-500 dark:text-red-400' : 'text-emerald-500 dark:text-emerald-400',
    },
    {
      label: "En Congé",
      value: onLeave,
      sublabel: onLeave === 1 ? 'employé' : 'employés',
      icon: UserCheck,
      iconBg: 'bg-teal-50 dark:bg-teal-900/20',
      iconColor: 'text-teal-500 dark:text-teal-400',
    },
    {
      label: "Heures Sup.",
      value: overtimes,
      sublabel: overtimes === 1 ? 'employé' : 'employés',
      icon: AlertTriangle,
      iconBg: overtimes > 0 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: overtimes > 0 ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-500 dark:text-emerald-400',
    },
    {
      label: "Assign. Manquantes",
      value: missing,
      sublabel: 'postes non pourvus',
      icon: Briefcase,
      iconBg: missing > 0 ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: missing > 0 ? 'text-orange-500 dark:text-orange-400' : 'text-emerald-500 dark:text-emerald-400',
    },
    {
      label: "Tâches Complétées",
      value: completed,
      sublabel: completed === 1 ? 'tâche' : 'tâches',
      icon: CheckCircle,
      iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: 'text-emerald-500 dark:text-emerald-400',
    },
    {
      label: "Tâches en Attente",
      value: pendingTasks,
      sublabel: pendingTasks === 1 ? 'tâche' : 'tâches',
      icon: Target,
      iconBg: pendingTasks > 0 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: pendingTasks > 0 ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-500 dark:text-emerald-400',
    },
    {
      label: "Verrouillés",
      value: locked,
      sublabel: locked === 1 ? 'planning' : 'plannings',
      icon: Lock,
      iconBg: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-500 dark:text-green-400',
    },
    {
      label: "Ouverts",
      value: openWks,
      sublabel: openWks === 1 ? 'planning' : 'plannings',
      icon: Calendar,
      iconBg: openWks > 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: openWks > 0 ? 'text-blue-500 dark:text-blue-400' : 'text-emerald-500 dark:text-emerald-400',
    },
    {
      label: "Note Moyenne",
      value: avgRating ? `${avgRating.toFixed(1)}/5` : '—',
      sublabel: `${totalRated} employé${totalRated > 1 ? 's' : ''} noté${totalRated > 1 ? 's' : ''}`,
      icon: Star,
      iconBg: avgRating >= 4 ? 'bg-emerald-50 dark:bg-emerald-900/20' : avgRating >= 3 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-slate-50 dark:bg-dark-600',
      iconColor: avgRating >= 4 ? 'text-emerald-500 dark:text-emerald-400' : avgRating >= 3 ? 'text-amber-500 dark:text-amber-400' : 'text-slate-400',
    },
    {
      label: "Notifications",
      value: unreadNotif,
      sublabel: unreadNotif === 1 ? 'non lue' : 'non lues',
      icon: Bell,
      iconBg: unreadNotif > 0 ? 'bg-rose-50 dark:bg-rose-900/20' : 'bg-slate-50 dark:bg-dark-600',
      iconColor: unreadNotif > 0 ? 'text-rose-500 dark:text-rose-400' : 'text-slate-400',
    },
    {
      label: "Heures Travaillées",
      value: `${workedHours}h`,
      sublabel: 'cette semaine',
      icon: TrendingUp,
      iconBg: 'bg-indigo-50 dark:bg-indigo-900/20',
      iconColor: 'text-indigo-500 dark:text-indigo-400',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.025 }}
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

export default KpiCardsRow
