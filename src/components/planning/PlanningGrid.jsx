import { useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion }      from 'framer-motion'
import DragDropWrapper      from './DragDropWrapper'
import DroppableDayColumn   from './DroppableDayColumn'
import { Skeleton, EmptyState } from '../ui'
import {
  selectPlanningByDate,
  selectPlanningLoading,
  selectHasLockedRecords,
  selectSelectedIds,
} from '../../features/planning/planningSelectors'
import { selectPausesMap } from '../../features/pauses/pauseSelectors'
import { selectActiveShifts } from '../../features/shifts/shiftSelectors'
import { setSelectedIds } from '../../features/planning/planningSlice'
import { cn }          from '../../utils/cn'
import { Clock } from 'lucide-react'

const PlanningGrid = ({
  days          = [],
  onCardClick,
  onCardDelete,
  onAddClick,
  onRefresh,
  className,
}) => {
  const dispatch        = useDispatch()
  const planningByDate  = useSelector(selectPlanningByDate)
  const loading         = useSelector(selectPlanningLoading)
  const hasLocked       = useSelector(selectHasLockedRecords)
  const selectedIds     = useSelector(selectSelectedIds)
  const pausesByPlanningId = useSelector(selectPausesMap)

  const allIds = useMemo(() => {
    const ids = []
    for (const day of days) {
      const dayPlannings = planningByDate[day.date] || []
      for (const p of dayPlannings) {
        ids.push(p.id)
      }
    }
    return ids
  }, [days, planningByDate])

  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.includes(id))
  const noneSelected = selectedIds.length === 0

  const hasAssignments = allIds.length > 0
  const shifts = useSelector(selectActiveShifts)

  const handleToggleAll = useCallback(() => {
    if (allSelected) {
      dispatch(setSelectedIds([]))
    } else {
      dispatch(setSelectedIds(allIds))
    }
  }, [dispatch, allSelected, allIds])

  if (loading) {
    return (
      <div className="grid grid-cols-7 gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton.Block className="h-16 rounded-xl" />
            <Skeleton.Block className="h-24 rounded-xl" />
            <Skeleton.Block className="h-24 rounded-xl" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn('overflow-x-auto pb-4', className)}
    >
      {allIds.length > 0 && (
        <div className="mb-2 flex items-center gap-2 px-1">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(el) => { if (el) el.indeterminate = !allSelected && !noneSelected }}
            onChange={handleToggleAll}
            className="h-4 w-4 rounded border-surface-300 text-brand-500 focus:ring-brand-500"
          />
          <span className="text-2xs text-slate-400">
            {noneSelected
              ? `Tout sélectionner (${allIds.length})`
              : `${selectedIds.length} sélectionné(s)`
            }
          </span>
        </div>
      )}
      {!hasAssignments && shifts.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="Aucun shift disponible"
          description="Créez d'abord des shifts pour pouvoir planifier des employés."
          size="sm"
        />
      ) : (
      <DragDropWrapper onRefresh={onRefresh}>
        <div className="grid min-w-[896px] grid-cols-7 gap-3">
          {days.map((day) => (
            <DroppableDayColumn
              key={day.date}
              day={day}
              plannings={planningByDate[day.date] || []}
              pausesByPlanningId={pausesByPlanningId}
              onCardClick={onCardClick}
              onCardDelete={onCardDelete}
              onAddClick={onAddClick}
              onRefresh={onRefresh}
              isWeekLocked={hasLocked}
            />
          ))}
        </div>
      </DragDropWrapper>
      )}
    </motion.div>
  )
}

export default PlanningGrid
