import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion }    from 'framer-motion'
import { Clock, AlertTriangle, UserCheck } from 'lucide-react'
import { fetchAbsentTodayThunk } from '../../features/pointage/pointageThunks'
import {
  selectAbsentToday,
  selectAbsentLoading,
} from '../../features/pointage/pointageSelectors'
import AbsenceAlertCard from './AbsenceAlertCard'
import { Badge, Button, Skeleton, EmptyState } from '../ui'
import { cn } from '../../utils/cn'

/**
 * LivePresenceTable — admin view of today's absent employees.
 *
 * Data: GET /v1/pointage/absent-today
 * Returns: { absent_count, total_planned, absent_employees[] }
 *
 * Per spec: Admin view — Green(on time) / Yellow(late) / Red(absent)
 * With "Fatima has not checked in. Replace?" alert cards.
 */
const LivePresenceTable = () => {
  const dispatch      = useDispatch()
  const absentData    = useSelector(selectAbsentToday)
  const loading       = useSelector(selectAbsentLoading)

  useEffect(() => {
    dispatch(fetchAbsentTodayThunk())
    const interval = setInterval(() => {
      dispatch(fetchAbsentTodayThunk())
    }, 30000)
    return () => clearInterval(interval)
  }, [dispatch])

  const handleRefresh = () => dispatch(fetchAbsentTodayThunk())

  const absentCount  = absentData?.absent_count     || 0
  const totalPlanned = absentData?.total_planned    || 0
  const absentList   = absentData?.absent_employees || []

  return (
    <div className="flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Absences Aujourd'hui
          </span>
          {absentCount > 0 && (
            <Badge variant="danger">{absentCount}</Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
        >
          Actualiser
        </Button>
      </div>

      {/* Coverage summary */}
      {!loading && totalPlanned > 0 && (
        <div className="flex items-center gap-3 rounded-xl
                        border border-surface-200 px-4 py-3
                        dark:border-dark-600">
          <UserCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
          <p className="text-sm text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {totalPlanned - absentCount}
            </span>
            {' '}présent{totalPlanned - absentCount > 1 ? 's' : ''} sur{' '}
            <span className="font-semibold">{totalPlanned}</span>
            {' '}planifié{totalPlanned > 1 ? 's' : ''}
          </p>
          {absentCount === 0 && (
            <Badge variant="success" className="ml-auto">✓ Couverture complète</Badge>
          )}
        </div>
      )}

      {/* Absent employees list */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton.Block key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : absentList.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="Tous les employés sont présents"
          description="Aucune absence détectée pour aujourd'hui"
          size="sm"
        />
      ) : (
        <div className="space-y-3">
            {absentList.map((employee, i) => (
              <AbsenceAlertCard
                key={`${employee.planning_id}-${employee.user_id}`}
                absentEmployee={employee}
                index={i}
                onAssigned={handleRefresh}
              />
            ))}
        </div>
      )}
    </div>
  )
}

export default LivePresenceTable