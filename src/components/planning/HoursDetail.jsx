import { HoursBar, Badge } from '../ui'
import { cn } from '../../utils/cn'

const HoursDetail = ({
  currentHours = 0,
  assignmentHours = 0,
  limit = 44,
  compact = false,
  className,
}) => {
  const afterAssignment = currentHours + assignmentHours
  const difference = afterAssignment - limit
  const exceedsLimit = difference > 0

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <HoursBar hours={currentHours} limit={limit} compact className="flex-1" />
        {assignmentHours > 0 && (
          <span className="text-2xs text-slate-400">
            +{assignmentHours}h
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Heures hebdomadaires
        </span>
        {exceedsLimit && (
          <Badge variant="danger" size="sm">
            +{difference}h dépassement
          </Badge>
        )}
        {!exceedsLimit && afterAssignment > 0 && (
          <Badge variant="success" size="sm">
            {limit - afterAssignment}h restant
          </Badge>
        )}
      </div>

      <HoursBar
        hours={currentHours}
        limit={limit}
        showAlert
      />

      {assignmentHours > 0 && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 space-y-1.5 dark:border-dark-500 dark:bg-dark-600">
          <p className="text-2xs font-medium text-slate-500 dark:text-slate-400">
            Impact de cette assignation
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <span className="text-slate-400">Actuel</span>
            <span className="text-right font-medium text-slate-700 dark:text-slate-200">{currentHours}h</span>
            <span className="text-slate-400">Cette assignation</span>
            <span className="text-right font-medium text-slate-700 dark:text-slate-200">+{assignmentHours}h</span>
            <span className="text-slate-400">Après</span>
            <span className={cn(
              'text-right font-medium',
              exceedsLimit ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'
            )}>
              {afterAssignment}h
            </span>
            <span className="text-slate-400">Limite</span>
            <span className="text-right font-medium text-slate-700 dark:text-slate-200">{limit}h</span>
          </div>
          {exceedsLimit && (
            <p className="text-2xs font-medium text-red-500">
              Dépassement de {difference}h par rapport à la limite de {limit}h
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default HoursDetail
