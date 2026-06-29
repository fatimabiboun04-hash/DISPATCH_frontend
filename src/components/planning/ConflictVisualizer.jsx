import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle, X, Clock, Users, Zap, Shield,
  FileX, Lock, Coffee, Moon, UserX, ArrowRight,
} from 'lucide-react'
import { Button, Badge } from '../ui'
import { cn } from '../../utils/cn'

const CONFLICT_ICONS = {
  double_assignment: Users,
  leave_conflict: FileX,
  skill_mismatch: Shield,
  rest_period_violation: Clock,
  weekly_hours_exceeded: Zap,
  duplicate_shift: Lock,
  missing_pause: Coffee,
  consecutive_nights_exceeded: Moon,
  employee_unavailable: UserX,
}

const CONFLICT_COLORS = {
  double_assignment: 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/10',
  leave_conflict: 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/10',
  skill_mismatch: 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/10',
  rest_period_violation: 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/10',
  weekly_hours_exceeded: 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/10',
  duplicate_shift: 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/10',
  missing_pause: 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/10',
  consecutive_nights_exceeded: 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/10',
  employee_unavailable: 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/10',
}

const ConflictVisualizer = ({ conflicts = [], onDismiss, className }) => {
  if (!conflicts || conflicts.length === 0) return null

  return (
    <AnimatePresence>
      {conflicts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className={cn('space-y-3', className)}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-semibold text-red-700 dark:text-red-300">
              {conflicts.length} conflit(s) détecté(s)
            </span>
            {onDismiss && (
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-auto" onClick={onDismiss}>
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {conflicts.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="space-y-1.5"
            >
              {/* Item header */}
              {item.user && item.date && (
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {item.user.name} · {item.date}
                  {item.shift && <span className="text-slate-400"> · {item.shift.name}</span>}
                </p>
              )}

              {/* Conflicts */}
              <div className="space-y-1">
                {item.conflicts?.map((conflict, ci) => {
                  const Icon = CONFLICT_ICONS[conflict.type] || AlertTriangle
                  const colorClass = CONFLICT_COLORS[conflict.type] || 'border-slate-200 bg-slate-50'
                  const severityLabel = conflict.severity === 'error' ? 'Erreur' : 'Avertissement'
                  const severityColor = conflict.severity === 'error'
                    ? 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
                    : 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30'

                  return (
                    <div
                      key={ci}
                      className={cn(
                        'flex items-start gap-2 rounded-lg border p-2.5 text-xs',
                        colorClass
                      )}
                    >
                      <Icon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-500" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {conflict.message}
                        </p>
                        {conflict.suggestion && (
                          <p className="mt-1 flex items-start gap-1 text-2xs text-slate-500 dark:text-slate-400">
                            <ArrowRight className="mt-0.5 h-2.5 w-2.5 flex-shrink-0" />
                            {conflict.suggestion}
                          </p>
                        )}
                      </div>
                      <Badge size="sm" className={cn('text-2xs flex-shrink-0', severityColor)}>
                        {severityLabel}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ConflictVisualizer
