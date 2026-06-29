import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle, Calendar, Star,
  ChevronDown, ChevronUp, Lock,
} from 'lucide-react'
import axiosInstance from '../../services/axiosInstance'
import { API } from '../../constants/apiRoutes'
import { Badge, SkillBadge, Avatar } from '../ui'
import { cn } from '../../utils/cn'

const EmployeeInfoPanel = ({ employeeId, weekNumber, year, date }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!employeeId) {
      setData(null)
      return
    }
    let cancelled = false
    setLoading(true)
    axiosInstance.get(API.PLANNING.EMPLOYEE_INFO(employeeId), {
      params: { week_number: weekNumber, year },
    }).then((res) => {
      if (!cancelled) {
        setData(res.data.data)
        setLoading(false)
      }
    }).catch(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [employeeId, weekNumber, year])

  if (!employeeId) return null

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-surface-50 p-3 dark:bg-dark-600">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        <span className="text-xs text-slate-400">Chargement des informations...</span>
      </div>
    )
  }

  if (!data) return null

  const { weekly_hours, rating, skills, teams, assignments, leave, employee } = data
  const hoursPct = Math.min(100, (weekly_hours.current / weekly_hours.limit) * 100)
  const hoursColor = weekly_hours.is_overtime
    ? 'text-red-500'
    : weekly_hours.current > weekly_hours.limit * 0.85
      ? 'text-amber-500'
      : 'text-emerald-500'

  const hasAssignmentToday = assignments?.some((a) => a.date === date)

  return (
    <div className="rounded-xl border border-surface-200 bg-white dark:border-dark-500 dark:bg-dark-700">
      {/* Header */}
      <div className="flex items-center gap-3 p-3">
        <Avatar src={employee.avatar_url} name={employee.name} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
            {employee.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {rating && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                <span className="text-2xs font-medium text-slate-500">{rating.score}/5</span>
              </div>
            )}
            {teams?.slice(0, 1).map((t) => (
              <span key={t.id} className="inline-flex items-center gap-1 text-2xs text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: t.color }} />
                {t.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Hours bar */}
      <div className="px-3 pb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-2xs font-medium text-slate-400">Heures</span>
          <span className={cn('text-xs font-bold', hoursColor)}>
            {weekly_hours.current}h / {weekly_hours.limit}h
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-100 dark:bg-dark-600">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300',
              weekly_hours.is_overtime ? 'bg-red-500' : hoursPct > 85 ? 'bg-amber-500' : 'bg-emerald-500'
            )}
            style={{ width: `${hoursPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-2xs text-slate-400">
            Restant: {weekly_hours.remaining}h
          </span>
          {weekly_hours.is_overtime && (
            <Badge variant="danger" size="sm">Heures supp.</Badge>
          )}
          {weekly_hours.is_under_hours && (
            <Badge variant="warning" size="sm">Quota non atteint</Badge>
          )}
        </div>
      </div>

      {/* Toggle details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between border-t border-surface-100 px-3 py-2 text-2xs text-slate-400 hover:text-slate-600 dark:border-dark-500"
      >
        <span>Détails</span>
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-surface-100 dark:border-dark-500"
          >
            <div className="space-y-3 p-3">
              {/* Skills */}
              {skills?.length > 0 && (
                <div>
                  <p className="mb-1 text-2xs font-medium text-slate-400">Compétences</p>
                  <div className="flex flex-wrap gap-1">
                    {skills.map((s) => (
                      <SkillBadge key={s.id} name={s.name} />
                    ))}
                  </div>
                </div>
              )}

              {/* Leave */}
              {leave?.length > 0 && (
                <div className="rounded-lg bg-amber-50 p-2 dark:bg-amber-900/10">
                  <div className="flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                    <span className="text-2xs font-medium text-amber-600 dark:text-amber-400">
                      Congés cette semaine
                    </span>
                  </div>
                  {leave.map((l) => (
                    <p key={l.id} className="text-2xs text-amber-600 dark:text-amber-400">
                      {l.type}: {l.start_date} → {l.end_date}
                      {l.reason && ` (${l.reason})`}
                    </p>
                  ))}
                </div>
              )}

              {/* Todays assignments */}
              {assignments?.length > 0 && (
                <div>
                  <p className="mb-1 text-2xs font-medium text-slate-400">
                    Assignations cette semaine
                  </p>
                  <div className="space-y-1">
                    {assignments.map((a) => (
                      <div
                        key={a.id}
                        className={cn(
                          'flex items-center justify-between rounded-lg px-2 py-1.5 text-2xs',
                          a.date === date
                            ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/10 dark:text-brand-300'
                            : 'bg-surface-50 text-slate-500 dark:bg-dark-600'
                        )}
                      >
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          <span>{a.date}</span>
                          <span className="font-medium">{a.shift_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {a.is_locked && <Lock className="h-2.5 w-2.5" />}
                          <span className="text-slate-400">{a.start_time}–{a.end_time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default EmployeeInfoPanel
