import { Badge } from '../ui'
import { cn } from '../../utils/cn'

/**
 * ReportStatusBadge — maps report status to colored badge.
 *
 * Status lifecycle from GenerateReportJob:
 *   queued      → just created, waiting in queue
 *   processing  → job running
 *   completed   → file ready for download
 *   failed      → job threw exception
 *
 * Fix #7 note: original migration enum missing 'queued'.
 * We handle all 4 values defensively.
 */
const STATUS_CONFIG = {
  queued: {
    variant: 'default',
    label:   'En attente',
    icon:    '⏳',
    pulse:   true,
  },
  processing: {
    variant: 'info',
    label:   'Génération…',
    icon:    '⚙️',
    pulse:   true,
  },
  completed: {
    variant: 'success',
    label:   'Prêt',
    icon:    '✅',
    pulse:   false,
  },
  failed: {
    variant: 'danger',
    label:   'Échec',
    icon:    '❌',
    pulse:   false,
  },
}

const ReportStatusBadge = ({ status, size = 'md' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.queued

  return (
    <Badge variant={config.variant} size={size}>
      <span className={cn(config.pulse && 'animate-pulse')}>
        {config.icon}
      </span>
      <span className="ml-1">{config.label}</span>
    </Badge>
  )
}

export default ReportStatusBadge