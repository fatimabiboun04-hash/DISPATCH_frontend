import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button, Tooltip } from '../ui'
import { cn } from '../../utils/cn'

/**
 * WeekSelector — prev/next week arrows + week label.
 * Used in both Admin planning grid and History view.
 */
const WeekSelector = ({
  weekLabel,
  onPrev,
  onNext,
  onToday,
  isCurrentWeek = false,
  className,
}) => (
  <div className={cn('flex items-center gap-2', className)}>
    <Button
      variant="secondary"
      size="sm"
      className="h-8 w-8 p-0"
      onClick={onPrev}
    >
      <ChevronLeft className="h-4 w-4" />
    </Button>

    <div className="flex items-center gap-2 min-w-60 justify-center">
      <Calendar className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
        {weekLabel}
      </span>
    </div>

    <Button
      variant="secondary"
      size="sm"
      className="h-8 w-8 p-0"
      onClick={onNext}
    >
      <ChevronRight className="h-4 w-4" />
    </Button>

    {!isCurrentWeek && (
      <Tooltip content="Revenir à cette semaine">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToday}
          className="text-brand-500 dark:text-brand-400"
        >
          Aujourd'hui
        </Button>
      </Tooltip>
    )}
  </div>
)

export default WeekSelector