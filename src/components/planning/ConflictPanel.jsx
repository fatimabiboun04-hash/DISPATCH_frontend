import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle, Clock, Users, Zap, Shield,
  FileX, Lock, X, Eye, ArrowRight,
} from 'lucide-react'
import { Button, Badge, Tooltip } from '../ui'
import { cn } from '../../utils/cn'

const CONFLICT_ICONS = {
  double_assignment: Users,
  leave_conflict: FileX,
  skill_mismatch: Shield,
  rest_period_violation: Clock,
  weekly_hours_exceeded: Zap,
  duplicate_shift: Lock,
  overlap: Users,
}

const CONFLICT_LABELS = {
  double_assignment: 'Double assignation',
  leave_conflict: 'Congé',
  skill_mismatch: 'Compétence manquante',
  rest_period_violation: 'Repos insuffisant',
  weekly_hours_exceeded: 'Heures dépassées',
  duplicate_shift: 'Shift en double',
  overlap: 'Chevauchement',
}

const ConflictPanel = ({
  conflicts = [],
  onDismiss,
  onViewPlanning,
  onAssignAnother,
  onOverride,
  canOverride = false,
  className,
}) => {
  if (!conflicts || conflicts.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className={cn('space-y-3', className)}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/40">
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <span className="text-sm font-semibold text-red-700 dark:text-red-300">
            {conflicts.length} conflit{conflicts.length > 1 ? 's' : ''} détecté{conflicts.length > 1 ? 's' : ''}
          </span>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="ml-auto flex h-5 w-5 items-center justify-center rounded text-red-400 hover:text-red-600 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="space-y-2">
          {conflicts.map((err, idx) => {
            const msg = typeof err === 'string' ? err : err.message || ''
            const type = err.type || 'unknown'
            const severity = err.severity || 'error'
            const details = err.conflict_details || null
            const Icon = CONFLICT_ICONS[type] || AlertTriangle

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  'rounded-xl border p-3',
                  severity === 'error'
                    ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10'
                    : 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/10'
                )}
              >
                <div className="flex items-start gap-2.5">
                  <Icon className={cn(
                    'mt-0.5 h-4 w-4 flex-shrink-0',
                    severity === 'error' ? 'text-red-500' : 'text-amber-500'
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'text-xs font-semibold',
                        severity === 'error' ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'
                      )}>
                        {CONFLICT_LABELS[type] || type}
                      </span>
                      <Badge size="sm" variant={severity === 'error' ? 'danger' : 'warning'}>
                        {severity === 'error' ? 'Bloquant' : 'Avertissement'}
                      </Badge>
                    </div>

                    <p className={cn(
                      'mt-1 text-xs leading-relaxed',
                      severity === 'error' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
                    )}>
                      {msg}
                    </p>

                    {details && type === 'overlap' && (
                      <div className="mt-2 rounded-lg border border-red-200 bg-white/50 p-2.5 space-y-1 dark:border-red-700/50 dark:bg-red-900/5">
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                          {details.shift_name}
                        </p>
                        <p className="text-2xs text-slate-500">
                          {details.start_time} → {details.end_time}
                        </p>
                      </div>
                    )}

                    {details && type === 'leave_conflict' && (
                      <div className="mt-2 rounded-lg border border-red-200 bg-white/50 p-2.5 space-y-1 dark:border-red-700/50 dark:bg-red-900/5">
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-200 capitalize">
                          {details.type}
                        </p>
                        <p className="text-2xs text-slate-500">
                          {details.start_date} → {details.end_date}
                        </p>
                        {details.reason && (
                          <p className="text-2xs text-slate-400">{details.reason}</p>
                        )}
                      </div>
                    )}

                    {details && type === 'weekly_hours_exceeded' && (
                      <div className="mt-2 rounded-lg border border-amber-200 bg-white/50 p-2.5 dark:border-amber-700/50 dark:bg-amber-900/5">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-2xs">
                          <span className="text-slate-400">Actuel</span>
                          <span className="text-right font-medium text-slate-700 dark:text-slate-200">{details.current_hours}h</span>
                          <span className="text-slate-400">Assignation</span>
                          <span className="text-right font-medium text-slate-700 dark:text-slate-200">+{details.assignment_hours}h</span>
                          <span className="text-slate-400">Après</span>
                          <span className="text-right font-medium text-amber-600">{details.after_assignment}h</span>
                          <span className="text-slate-400">Limite</span>
                          <span className="text-right font-medium text-slate-700 dark:text-slate-200">{details.limit}h</span>
                          <span className="text-slate-400">Dépassement</span>
                          <span className="text-right font-medium text-red-500">+{details.difference}h</span>
                        </div>
                      </div>
                    )}

                    {details && type === 'rest_period_violation' && (
                      <div className="mt-2 rounded-lg border border-red-200 bg-white/50 p-2.5 space-y-1 dark:border-red-700/50 dark:bg-red-900/5">
                        <p className="text-2xs text-slate-500">
                          {details.rest_minutes}min de repos · {details.required_minutes}min requises
                        </p>
                        <p className="text-2xs text-slate-400">
                          Précédent: {details.prev_shift_name} jusqu'à {details.prev_shift_end}
                        </p>
                      </div>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {onViewPlanning && err.planning_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs px-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
                          leftIcon={<Eye className="h-3 w-3" />}
                          onClick={() => onViewPlanning(err.planning_id)}
                        >
                          Voir
                        </Button>
                      )}
                      {onAssignAnother && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs px-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-dark-600"
                          leftIcon={<ArrowRight className="h-3 w-3" />}
                          onClick={onAssignAnother}
                        >
                          Autre employé
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {canOverride && (
          <div className="flex justify-end pt-1">
            <Tooltip content="Forcer l'assignation malgré les conflits (réservé aux administrateurs)">
              <Button
                variant="outline"
                size="sm"
                className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20"
                leftIcon={<Lock className="h-3.5 w-3.5" />}
                onClick={onOverride}
              >
                Forcer l'assignation
              </Button>
            </Tooltip>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default ConflictPanel
