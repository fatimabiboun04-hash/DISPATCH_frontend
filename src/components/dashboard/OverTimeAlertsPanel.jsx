import { useSelector } from 'react-redux'
import { AlertTriangle } from 'lucide-react'
import { selectStats, selectStatsLoading } from '../../features/dashboard/dashboardSelectors'
import { Card, Badge, Skeleton } from '../ui'

/**
 * OverTimeAlertsPanel
 *
 * Shows count of flagged pointages awaiting review.
 * Overtime per-employee details are available in the Employees module (Phase 5).
 *
 * Data: stats.flagged_pointages from GET /v1/dashboard/stats
 */
const OverTimeAlertsPanel = () => {
  const stats   = useSelector(selectStats)
  const loading = useSelector(selectStatsLoading)
  const flagged = stats?.flagged_pointages ?? 0
  const delays  = stats?.delays_today      ?? 0
  const pending = stats?.pending_leaves    ?? 0

  const alerts = [
    {
      key:     'flagged',
      label:   'Pointages suspects',
      value:   flagged,
      variant: flagged > 0 ? 'danger'  : 'success',
      icon:    '🚩',
    },
    {
      key:     'delays',
      label:   'Retards aujourd\'hui',
      value:   delays,
      variant: delays  > 0 ? 'warning' : 'success',
      icon:    '⏱️',
    },
    {
      key:     'pending',
      label:   'Congés en attente',
      value:   pending,
      variant: pending > 0 ? 'info'    : 'success',
      icon:    '📋',
    },
  ]

  return (
    <Card>
      <Card.Header>
        <div className="flex items-center gap-2">
          <Card.Title>Alertes du Jour</Card.Title>
          {(flagged + delays + pending) > 0 && (
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          )}
        </div>
      </Card.Header>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton.Block key={i} className="h-12 rounded-xl" />
          ))
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.key}
              className="flex items-center justify-between rounded-xl
                         border border-surface-100 px-4 py-3
                         dark:border-dark-600"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">{alert.icon}</span>
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  {alert.label}
                </span>
              </div>
              <Badge variant={alert.variant}>
                {alert.value}
              </Badge>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}

export default OverTimeAlertsPanel