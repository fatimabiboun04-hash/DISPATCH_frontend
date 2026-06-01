import { useMemo }  from 'react'
import { Calendar } from 'lucide-react'
import TimelineItem from './TimelineItem'
import { EmptyState } from '../ui'
import { getShiftColor } from '../../constants/shiftColors'

/**
 * TimelineView — vertical timeline of planning items for one day.
 *
 * Data from GET /v1/me/planning (plain array):
 *   [{ id, date, shift: { name, type, start_time, end_time }, week_number, year }]
 *
 * State determination based on current time vs shift times:
 *   ACTIVE:   current time is between start and end
 *   ENDED:    end time has passed
 *   UPCOMING: start time is in the future
 *
 * Pauses from GET /v1/pauses/planning/{planningId} are shown below.
 */
const determineState = (startTime, endTime) => {
  const now    = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()

  const [sh, sm] = (startTime || '00:00').split(':').map(Number)
  const [eh, em] = (endTime   || '23:59').split(':').map(Number)

  const startMin = sh * 60 + sm
  const endMin   = eh * 60 + em

  if (nowMin >= startMin && nowMin < endMin) return 'ACTIVE'
  if (nowMin >= endMin)                      return 'ENDED'
  return 'UPCOMING'
}

const TimelineView = ({ plannings = [], pauses = [], selectedDate }) => {
  const items = useMemo(() => {
    if (!plannings.length) return []

    const timeline = []

    plannings.forEach((p) => {
      const shift  = p.shift
      if (!shift)  return

      const state  = determineState(shift.start_time, shift.end_time)
      const config = getShiftColor(shift.type)

      timeline.push({
        key:       `planning-${p.id}`,
        startTime: shift.start_time,
        endTime:   shift.end_time,
        label:     shift.name,
        state,
        type:      'shift',
        color:     config,
      })
    })

    // Inject pauses into timeline
    pauses.forEach((pause) => {
      const state = determineState(pause.pause_start, pause.pause_end)
      timeline.push({
        key:       `pause-${pause.id}`,
        startTime: pause.pause_start,
        endTime:   pause.pause_end,
        label:     'Pause',
        state:     'BREAK',
        type:      'pause',
      })
    })

    // Sort by start time
    return timeline.sort((a, b) => {
      const [ah, am] = (a.startTime || '00:00').split(':').map(Number)
      const [bh, bm] = (b.startTime || '00:00').split(':').map(Number)
      return (ah * 60 + am) - (bh * 60 + bm)
    })
  }, [plannings, pauses])

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="Aucun planning pour ce jour"
        description="Vous n'avez pas d'assignation pour cette journée."
        size="sm"
      />
    )
  }

  return (
    <div className="pt-2">
      {items.map((item, i) => (
        <TimelineItem
          key={item.key}
          startTime={item.startTime}
          endTime={item.endTime}
          label={item.label}
          state={item.state}
          index={i}
        />
      ))}
    </div>
  )
}

export default TimelineView