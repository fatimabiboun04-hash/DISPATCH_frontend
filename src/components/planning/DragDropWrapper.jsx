import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import {
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { useDispatch, useSelector } from 'react-redux'
import { updatePlanningThunk } from '../../features/planning/planningThunks'
import { clearConflictErrors } from '../../features/planning/planningSlice'
import { selectPlanningData } from '../../features/planning/planningSelectors'
import toast from 'react-hot-toast'

/**
 * DragDropWrapper — DnD context for the planning grid.
 *
 * Enables dragging PlanningCards between day columns.
 * On drop: calls PUT /v1/planning/{id} with the new date.
 *
 * Backend validates on update:
 * - No overlapping shifts (conflict detection)
 * - Not on leave
 * - Hours limit
 *
 * If conflict → 422 response → ConflictBanner shows errors.
 *
 * droppableId convention: day date string 'YYYY-MM-DD'
 * draggableId convention: planning.id (number as string)
 */
const DragDropWrapper = ({ children, onRefresh }) => {
  const dispatch    = useDispatch()
  const plannings   = useSelector(selectPlanningData)
  const [activeId, setActiveId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,  // must move 8px before drag starts (prevents accidental drags)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
    dispatch(clearConflictErrors())
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) return

    // active.id = planning.id (string)
    // over.id   = date string 'YYYY-MM-DD' (droppable day column id)
    const planningId = Number(active.id)
    const newDate    = over.id  // 'YYYY-MM-DD'

    // Find the planning record being dragged
    const planning = plannings.find((p) => p.id === planningId)
    if (!planning) return

    // Skip if dropped on same date
    if (planning.date === newDate) return

    // Skip if locked
    if (planning.is_locked) {
      toast.error('Ce planning est verrouillé')
      return
    }

    // Call update with new date
    const result = await dispatch(updatePlanningThunk({
      id:   planningId,
      data: {
        user_id:  planning.user_id,
        shift_id: planning.shift_id,
        date:     newDate,
        team_id:  planning.team_id || undefined,
        notes:    planning.notes   || undefined,
      },
    }))

    if (updatePlanningThunk.fulfilled.match(result)) {
      toast.success('Planning déplacé')
      onRefresh?.()
    }
    // Conflict errors shown by ConflictBanner via Redux state
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}
      {/* Optional drag overlay — shows dragged card ghost */}
      <DragOverlay>
        {activeId ? (
          <div className="rotate-2 rounded-xl border border-brand-300
                          bg-white p-3 opacity-90 shadow-strong
                          dark:bg-dark-700">
            <p className="text-xs font-medium text-brand-600">
              Déplacement en cours…
            </p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default DragDropWrapper