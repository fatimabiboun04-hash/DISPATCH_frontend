import { motion }     from 'framer-motion'
import { User, Shield, Calendar, FileText, Star, MapPin, Settings } from 'lucide-react'
import { Avatar, Badge, Tooltip } from '../ui'
import { formatRelative, formatDateTime } from '../../utils/formatters'
import { cn } from '../../utils/cn'

/**
 * AuditTimelineItem — one audit log entry.
 *
 * Backend AuditLog fields:
 *   action, entity_type, entity_id, old_values(array), new_values(array),
 *   ip_address, user_agent, created_at, user: { id, name, email }
 *
 * entity_type is full class name: 'App\\Models\\Planning', etc.
 * We extract the short name for display.
 */

// Map entity_type class name to display label and icon
const ENTITY_CONFIG = {
  'App\\Models\\User':         { label: 'Employé',    icon: User,      color: 'text-brand-500',   bg: 'bg-brand-50 dark:bg-brand-900/20' },
  'App\\Models\\Planning':     { label: 'Planning',   icon: Calendar,  color: 'text-violet-500',  bg: 'bg-violet-50 dark:bg-violet-900/20' },
  'App\\Models\\LeaveRequest': { label: 'Congé',      icon: FileText,  color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  'App\\Models\\Report':       { label: 'Rapport',    icon: FileText,  color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
  'App\\Models\\Rating':       { label: 'Évaluation', icon: Star,      color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
  'App\\Models\\Pointage':     { label: 'Pointage',   icon: MapPin,    color: 'text-red-500',     bg: 'bg-red-50 dark:bg-red-900/20' },
  'App\\Models\\Setting':      { label: 'Paramètre',  icon: Settings,  color: 'text-slate-500',   bg: 'bg-slate-100 dark:bg-dark-600' },
}

// Map action to colored badge variant
const ACTION_VARIANTS = {
  created:     'success',
  updated:     'info',
  deleted:     'danger',
  approved:    'success',
  rejected:    'danger',
  locked:      'warning',
  week_locked: 'warning',
  generated:   'primary',
  requested:   'info',
  check_in:    'success',
  check_out:   'default',
  suspended:   'danger',
  verified:    'success',
  overridden:  'warning',
  toggled:     'info',
}

// Human-readable action labels (French)
const ACTION_LABELS = {
  created:     'Créé',
  updated:     'Modifié',
  deleted:     'Supprimé',
  approved:    'Approuvé',
  rejected:    'Refusé',
  locked:      'Verrouillé',
  week_locked: 'Semaine verrouillée',
  generated:   'Généré',
  requested:   'Demandé',
  check_in:    'Pointage entrée',
  check_out:   'Pointage sortie',
  suspended:   'Suspendu',
  verified:    'Vérifié',
  overridden:  'Débloqué',
  toggled:     'Évaluation modifiée',
}

const AuditTimelineItem = ({ log, index }) => {
  const entityConfig = ENTITY_CONFIG[log.entity_type] || {
    label:  log.entity_type?.split('\\').pop() || 'Entité',
    icon:   Shield,
    color:  'text-slate-500',
    bg:     'bg-slate-100 dark:bg-dark-600',
  }
  const EntityIcon   = entityConfig.icon
  const actionLabel  = ACTION_LABELS[log.action]  || log.action
  const actionVariant= ACTION_VARIANTS[log.action] || 'default'

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className="flex gap-3"
    >
      {/* Timeline line + icon */}
      <div className="flex flex-col items-center">
        <div className={cn(
          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
          entityConfig.bg
        )}>
          <EntityIcon className={cn('h-3.5 w-3.5', entityConfig.color)} />
        </div>
        {/* Connector line */}
        <div className="mt-1 w-px flex-1 bg-surface-200 dark:bg-dark-500 min-h-3" />
      </div>

      {/* Content */}
      <div className="pb-4 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          {/* Action summary */}
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            {/* Performer */}
            {log.user ? (
              <div className="flex items-center gap-1.5">
                <Avatar
                  src={log.user.avatar_url}
                  name={log.user.name}
                  size="xs"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate max-w-28">
                  {log.user.name}
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">Système</span>
            )}

            {/* Action badge */}
            <Badge variant={actionVariant} size="sm">
              {actionLabel}
            </Badge>

            {/* Entity label + id */}
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {entityConfig.label}
              {log.entity_id > 0 && (
                <span className="ml-1 text-slate-400">#{log.entity_id}</span>
              )}
            </span>
          </div>

          {/* Timestamp */}
          <Tooltip content={formatDateTime(log.created_at)}>
            <span className="flex-shrink-0 text-2xs text-slate-400 whitespace-nowrap cursor-help">
              {formatRelative(log.created_at)}
            </span>
          </Tooltip>
        </div>

        {/* Changed values summary (collapsed) */}
        {(log.new_values && Object.keys(log.new_values).length > 0) && (
          <div className="mt-1.5 rounded-lg bg-surface-50 px-3 py-1.5
                          dark:bg-dark-600">
            <p className="text-2xs font-mono text-slate-500 dark:text-slate-400 truncate">
              {Object.entries(log.new_values)
                .slice(0, 3)
                .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
                .join(' · ')}
            </p>
          </div>
        )}

        {/* IP + device info */}
        {log.ip_address && (
          <p className="mt-1 text-2xs text-slate-400">
            {log.ip_address}
          </p>
        )}
      </div>
    </motion.div>
  )
}

export default AuditTimelineItem