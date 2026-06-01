import { ChevronLeft, ChevronRight, Archive, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button, Tooltip, Badge } from '../ui'
import { cn } from '../../utils/cn'

/**
 * HistoryWeekSelector — week navigation for read-only history view.
 * Cannot navigate into the future (history only).
 * Shows lock icon since history weeks are always locked.
 */
const HistoryWeekSelector = ({
  weekLabel,
  onPrev,
  onNext,
  canGoForward = false,
  lockedCount  = 0,
  className,
}) => (
  <div className={cn('flex items-center gap-3 flex-wrap', className)}>
    {/* History badge */}
    <div className="flex items-center gap-1.5 rounded-lg bg-slate-100
                    px-3 py-1.5 dark:bg-dark-600">
      <Archive className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
        Historique
      </span>
    </div>

    {/* Navigation */}
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={onPrev}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-2 min-w-64 justify-center">
        <Lock className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
          {weekLabel}
        </span>
        {lockedCount > 0 && (
          <Badge variant="warning" size="sm">
            {lockedCount} verrouillé{lockedCount > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      <Tooltip content={!canGoForward ? 'Semaine courante atteinte' : 'Semaine suivante'}>
        <Button
          variant="secondary"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={!canGoForward}
          onClick={onNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </Tooltip>
    </div>
  </div>
)

export default HistoryWeekSelector