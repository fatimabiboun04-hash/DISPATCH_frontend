import { Coffee } from 'lucide-react'
import { cn }     from '../../utils/cn'

/**
 * EmployeePauseList — simple pause display under the timeline.
 *
 * Per spec: "Under the timeline, display a simple list"
 * Display only — no edit/delete for employees.
 *
 * pauses: [{ pause_start, pause_end, duration_minutes }]
 * pause_start/pause_end come as 'HH:mm' strings (datetime:H:i cast — fix #3)
 */
const EmployeePauseList = ({ pauses = [] }) => {
  if (pauses.length === 0) return null

  return (
    <div className="rounded-xl border border-surface-200 bg-surface-50 p-4
                    dark:border-dark-600 dark:bg-dark-800">
      <div className="flex items-center gap-2 mb-3">
        <Coffee className="h-3.5 w-3.5 text-amber-500" />
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Pauses
        </p>
      </div>
      <div className="space-y-2">
        {pauses.map((pause, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg
                       bg-white px-3 py-2
                       dark:bg-dark-700"
          >
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {pause.pause_start} – {pause.pause_end}
            </span>
            {pause.duration_minutes > 0 && (
              <span className="text-2xs text-slate-400">
                {pause.duration_minutes}min
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="mt-2 text-2xs text-slate-400">
        ℹ Les pauses ne sont pas comptées dans les heures travaillées
      </p>
    </div>
  )
}

export default EmployeePauseList