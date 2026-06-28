import { memo } from 'react'
import { cn } from '../../utils/cn'

/**
 * StatusDot — presence indicator dot.
 *
 * Maps to Pointage.status values from backend:
 *   'present'  → 🟢 green
 *   'late'     → 🟡 yellow
 *   'absent'   → 🔴 red
 *   'on_leave' → 🔵 blue
 *   'pending'  → ⚫ dark (not checked in yet)
 *
 * Used in: PlanningCard user list, LivePresenceTable
 */

const STATUS_STYLES = {
  present:  'bg-emerald-500',
  late:     'bg-amber-500 animate-pulse',
  absent:   'bg-red-500 animate-pulse',
  on_leave: 'bg-blue-500',
  pending:  'bg-slate-400 dark:bg-slate-600',
}

const SIZES = {
  xs: 'h-1.5 w-1.5',
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
}

const StatusDot = ({ status = 'pending', size = 'sm', className }) => (
  <span className={cn(
    'inline-block flex-shrink-0 rounded-full',
    STATUS_STYLES[status] || STATUS_STYLES.pending,
    SIZES[size] || SIZES.sm,
    className
  )} />
)

export default memo(StatusDot)