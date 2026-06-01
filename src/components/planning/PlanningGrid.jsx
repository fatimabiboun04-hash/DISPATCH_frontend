import { useSelector } from 'react-redux'
import { motion }      from 'framer-motion'
import DragDropWrapper      from './DragDropWrapper'
import DroppableDayColumn   from './DroppableDayColumn'
import { Skeleton }         from '../ui'
import {
  selectPlanningByDate,
  selectPlanningLoading,
  selectHasLockedRecords,
  selectPlanningData,
} from '../../features/planning/planningSelectors'
import { cn }          from '../../utils/cn'

/**
 * PlanningGrid (updated Phase 9) — uses DnD wrappers.
 * Replaced DayColumn with DroppableDayColumn.
 * Wrapped in DragDropWrapper context.
 */
const PlanningGrid = ({
  days          = [],
  onCardClick,
  onCardDelete,
  onAddClick,
  onRefresh,
  className,
}) => {
  const planningByDate = useSelector(selectPlanningByDate)
  const allPlannings   = useSelector(selectPlanningData)
  const loading        = useSelector(selectPlanningLoading)
  const hasLocked      = useSelector(selectHasLockedRecords)

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
      <DragDropWrapper
        plannings={allPlannings}
        onRefresh={onRefresh}
      >
        <div className="grid min-w-[896px] grid-cols-7 gap-3">
          {days.map((day) => (
            <DroppableDayColumn
              key={day.date}
              day={day}
              plannings={planningByDate[day.date] || []}
              onCardClick={onCardClick}
              onCardDelete={onCardDelete}
              onAddClick={onAddClick}
              isWeekLocked={hasLocked}
            />
          ))}
        </div>
      </DragDropWrapper>
    </motion.div>
  )
}

export default PlanningGrid