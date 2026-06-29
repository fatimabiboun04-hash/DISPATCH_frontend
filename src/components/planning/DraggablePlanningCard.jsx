import { useDraggable } from '@dnd-kit/core'
import { CSS }          from '@dnd-kit/utilities'
import PlanningCard     from './PlanningCard'
import { cn }           from '../../utils/cn'

/**
 * DraggablePlanningCard — wraps PlanningCard with @dnd-kit draggable.
 * draggableId = planning.id (converted to string for dnd-kit)
 */
const DraggablePlanningCard = ({ planning, pauses = [], onClick, onDelete, onRefresh, index }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: String(planning.id) })

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'touch-none',          // required for mobile drag
        isDragging && 'opacity-40 z-10'
      )}
    >
      <PlanningCard
        planning={planning}
        pauses={pauses}
        onClick={onClick}
        onDelete={onDelete}
        onRefresh={onRefresh}
        index={index}
        animate={!isDragging}
      />
    </div>
  )
}

export default DraggablePlanningCard