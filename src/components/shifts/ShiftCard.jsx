import { motion }   from 'framer-motion'
import { Edit2, PowerOff, Clock, Coffee } from 'lucide-react'
import ShiftTypeBadge from './ShiftTypeBadge'
import { Switch, Tooltip, Button } from '../ui'
import { getShiftColor }  from '../../constants/shiftColors'
import { cn }             from '../../utils/cn'

/**
 * ShiftCard — displays a single shift definition.
 *
 * Shows: type badge, name, time range, break duration,
 *        calculated duration, color swatch, active toggle.
 *
 * IMPORTANT: "Delete" is actually deactivation:
 *   Backend ShiftController@destroy → is_active = false
 *   Button labeled "Désactiver" not "Supprimer"
 *   Inactive shifts shown with muted styling.
 *
 * Backend fields:
 *   name, type, start_time (HH:mm), end_time (HH:mm),
 *   break_minutes, color (nullable hex), is_active,
 *   duration_hours (computed accessor), duration_minutes (computed accessor)
 */
const ShiftCard = ({
  shift,
  index   = 0,
  onEdit,
  onDeactivate,
  onToggleActive,  // for the switch toggle (uses update endpoint)
}) => {
  const typeColor    = getShiftColor(shift.type)
  // Use custom color if set, otherwise fall back to type color
  const displayColor = shift.color || typeColor.hex
  const isInactive   = !shift.is_active

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className={cn(
        'group relative flex flex-col rounded-2xl border',
        'bg-white transition-all duration-200',
        'dark:bg-dark-700',
        isInactive
          ? 'border-surface-200 opacity-60 dark:border-dark-600'
          : 'border-surface-200 shadow-card hover:shadow-card-hover dark:border-dark-600 dark:shadow-dark-card'
      )}
    >
      {/* Color accent bar */}
      <div
        className="h-1.5 w-full rounded-t-2xl transition-colors"
        style={{ backgroundColor: isInactive ? '#94a3b8' : displayColor }}
      />

      <div className="flex flex-col gap-4 p-5">

        {/* Header: type badge + name */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1.5 min-w-0">
            <ShiftTypeBadge type={shift.type} size="sm" />
            <h3 className="text-sm font-bold text-slate-800
                           dark:text-slate-100 truncate">
              {shift.name}
            </h3>
          </div>

          {/* Color swatch */}
          <Tooltip content={shift.color ? 'Couleur personnalisée' : 'Couleur par défaut'}>
            <div
              className="h-7 w-7 flex-shrink-0 rounded-lg border-2
                         border-white shadow-sm dark:border-dark-700"
              style={{ backgroundColor: displayColor }}
            />
          </Tooltip>
        </div>

        {/* Time range */}
        <div className="flex items-center gap-2 rounded-xl
                        bg-surface-50 px-3 py-2.5 dark:bg-dark-600">
          <Clock className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {shift.start_time}
            </span>
            <span className="text-xs text-slate-400">→</span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {shift.end_time}
            </span>
          </div>
          {/* Duration */}
          {shift.duration_hours > 0 && (
            <span className="ml-auto text-xs font-medium text-brand-600
                             dark:text-brand-400">
              {shift.duration_hours}h
            </span>
          )}
        </div>

        {/* Break duration */}
        {shift.break_minutes > 0 && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Coffee className="h-3.5 w-3.5" />
            <span>Pause : {shift.break_minutes} min</span>
          </div>
        )}

        {/* Active toggle + actions */}
        <div className="flex items-center justify-between pt-1
                        border-t border-surface-100 dark:border-dark-600">
          <Switch
            checked={shift.is_active}
            onChange={(val) => onToggleActive?.(shift, val)}
            label={shift.is_active ? 'Actif' : 'Inactif'}
            size="sm"
          />

          <div className="flex items-center gap-1
                          opacity-0 group-hover:opacity-100 transition-opacity">
            <Tooltip content="Modifier">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => onEdit?.(shift)}
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
            </Tooltip>

            {shift.is_active && (
              <Tooltip content="Désactiver ce shift">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-amber-500
                             hover:bg-amber-50 hover:text-amber-600
                             dark:hover:bg-amber-900/20"
                  onClick={() => onDeactivate?.(shift)}
                >
                  <PowerOff className="h-3.5 w-3.5" />
                </Button>
              </Tooltip>
            )}
          </div>
        </div>
      </div>

      {/* Inactive overlay label */}
      {isInactive && (
        <div className="absolute inset-0 flex items-center justify-center
                        rounded-2xl bg-white/60 dark:bg-dark-700/60">
          <span className="rounded-full bg-slate-200 px-3 py-1
                           text-xs font-semibold text-slate-500
                           dark:bg-dark-500 dark:text-slate-400">
            Inactif
          </span>
        </div>
      )}
    </motion.div>
  )
}

export default ShiftCard