import { motion } from 'framer-motion'
import { AlertTriangle, UserPlus, RefreshCw } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchReplacementSuggestionThunk } from '../../features/pointage/pointageThunks'
import {
  selectReplacements,
  selectReplacementsLoading,
} from '../../features/pointage/pointageSelectors'
import { Avatar, Button, Badge } from '../ui'
import { getAvatarData } from '../../utils/avatarGenerator'
import { cn } from '../../utils/cn'

/**
 * AbsenceAlertCard — one absent employee alert row.
 *
 * Data shape from GET /v1/pointage/absent-today absent_employees[]:
 * {
 *   planning_id, user_id, user_name, user_initials,
 *   shift, shift_start, team, scheduled_start,
 *   status: 'pending' | 'delayed_absent' | 'late_absent',
 *   suggested_replacement: suggestion | null
 * }
 *
 * Per spec: "Fatima has not checked in. Replace?"
 */
const STATUS_LABELS = {
  pending:        { label: 'En attente', color: 'text-slate-500', variant: 'default' },
  delayed_absent: { label: 'Retard',     color: 'text-amber-600', variant: 'warning' },
  late_absent:    { label: 'Absent',     color: 'text-red-600',   variant: 'danger'  },
}

const AbsenceAlertCard = ({ absentEmployee, index }) => {
  const dispatch      = useDispatch()
  const replacements  = useSelector(selectReplacements)
  const loadingMap    = useSelector(selectReplacementsLoading)

  const planningId    = absentEmployee.planning_id
  const replacement   = replacements[planningId]
  const isLoading     = loadingMap[planningId] || false
  const statusConfig  = STATUS_LABELS[absentEmployee.status] || STATUS_LABELS.pending
  const { gradient }  = getAvatarData(absentEmployee.user_name)

  const handleLoadReplacement = () => {
    dispatch(fetchReplacementSuggestionThunk(planningId))
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl border border-red-200 bg-red-50 p-4
                 dark:border-red-800 dark:bg-red-900/10"
    >
      {/* Employee info row */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center
                     rounded-full text-sm font-bold text-white"
          style={{ background: gradient }}
        >
          {absentEmployee.user_initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {absentEmployee.user_name}
            </p>
            <Badge variant={statusConfig.variant} size="sm">
              {statusConfig.label}
            </Badge>
          </div>
          <p className="text-xs text-slate-500">
            {absentEmployee.shift} · {absentEmployee.shift_start}
            {absentEmployee.team && ` · ${absentEmployee.team}`}
          </p>
        </div>
        <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-500" />
      </div>

      {/* Replacement section */}
      {!replacement && (
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<UserPlus className="h-3.5 w-3.5" />}
          loading={isLoading}
          onClick={handleLoadReplacement}
          className="w-full text-xs"
        >
          Trouver un remplaçant
        </Button>
      )}

      {/* Replacement suggestion shown */}
      {replacement && replacement.suggestions?.length > 0 && (
        <div className="mt-2 rounded-lg border border-emerald-200
                        bg-emerald-50 p-3 dark:border-emerald-800
                        dark:bg-emerald-900/20">
          <p className="mb-2 text-2xs font-semibold uppercase tracking-wider text-emerald-600
                        dark:text-emerald-400">
            Remplaçant suggéré
          </p>
          {replacement.suggestions.slice(0, 2).map((s) => {
            const { gradient: sg } = getAvatarData(s.employee.name)
            return (
              <div key={s.employee.id}
                   className="flex items-center gap-2 mb-1 last:mb-0">
                <div
                  className="flex h-6 w-6 flex-shrink-0 items-center justify-center
                             rounded-full text-2xs font-bold text-white"
                  style={{ background: sg }}
                >
                  {s.employee.initials}
                </div>
                <span className="flex-1 text-xs font-medium text-emerald-700
                                 dark:text-emerald-300">
                  {s.employee.name}
                </span>
                <span className="text-2xs font-bold text-emerald-600
                                 dark:text-emerald-400">
                  {s.match_percentage}%
                </span>
              </div>
            )
          })}
        </div>
      )}

      {replacement && replacement.suggestions?.length === 0 && (
        <p className="mt-2 text-center text-xs text-slate-400">
          Aucun remplaçant disponible
        </p>
      )}
    </motion.div>
  )
}

export default AbsenceAlertCard