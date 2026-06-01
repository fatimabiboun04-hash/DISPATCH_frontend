import { useMemo } from 'react'
import { Calendar } from 'lucide-react'
import { formatDate } from '../../utils/formatters'
import { differenceInCalendarDays, parseISO, isValid } from 'date-fns'

/**
 * LeaveCalendarPreview — visual date range preview inside the request form.
 * Shows: start date → end date, number of working days.
 */
const LeaveCalendarPreview = ({ startDate, endDate }) => {
  const dayCount = useMemo(() => {
    if (!startDate || !endDate) return null
    const s = typeof startDate === 'string' ? parseISO(startDate) : startDate
    const e = typeof endDate   === 'string' ? parseISO(endDate)   : endDate
    if (!isValid(s) || !isValid(e)) return null
    return differenceInCalendarDays(e, s) + 1
  }, [startDate, endDate])

  if (!startDate || !endDate) return null

  return (
    <div className="flex items-center gap-3 rounded-xl border border-brand-100
                    bg-brand-50 px-4 py-3 dark:border-brand-900/30
                    dark:bg-brand-900/10">
      <Calendar className="h-4 w-4 flex-shrink-0 text-brand-500" />
      <div className="flex flex-1 items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-brand-700 dark:text-brand-300">
          {formatDate(startDate)}
        </span>
        <span className="text-brand-400">→</span>
        <span className="text-sm font-medium text-brand-700 dark:text-brand-300">
          {formatDate(endDate)}
        </span>
        {dayCount !== null && (
          <span className="ml-auto text-xs font-semibold text-brand-600
                           dark:text-brand-400">
            {dayCount} jour{dayCount > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  )
}

export default LeaveCalendarPreview