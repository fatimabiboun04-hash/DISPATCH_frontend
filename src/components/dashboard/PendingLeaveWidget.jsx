import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FileText, ArrowRight } from 'lucide-react'
import {
  selectPendingLeaves,
  selectStatsLoading,
} from '../../features/dashboard/dashboardSelectors'
import { Card, Badge, Button, Skeleton } from '../ui'

/**
 * PendingLeaveWidget — quick preview of pending leave count.
 * Full management is in /admin/leave-requests (Phase 12).
 *
 * Data: stats.pending_leaves from GET /v1/dashboard/stats
 */
const PendingLeaveWidget = () => {
  const pending = useSelector(selectPendingLeaves)
  const loading = useSelector(selectStatsLoading)
  const navigate = useNavigate()

  return (
    <Card>
      <Card.Header>
        <div className="flex items-center gap-2">
          <Card.Title>Demandes de Congés</Card.Title>
          {pending > 0 && (
            <Badge variant="warning" dot>{pending} en attente</Badge>
          )}
        </div>
      </Card.Header>

      {loading ? (
        <Skeleton.Block className="h-20 rounded-xl" />
      ) : (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="flex h-16 w-16 items-center justify-center
                          rounded-2xl bg-violet-50 dark:bg-violet-900/20">
            <FileText className="h-8 w-8 text-violet-500" />
          </div>

          {pending === 0 ? (
            <p className="text-sm text-slate-400">
              Aucune demande en attente
            </p>
          ) : (
            <>
              <p className="text-center text-sm text-slate-600 dark:text-slate-300">
                <span className="text-2xl font-bold text-violet-600
                                 dark:text-violet-400">
                  {pending}
                </span>{' '}
                {pending === 1 ? 'demande nécessite' : 'demandes nécessitent'} votre approbation
              </p>
              <Button
                variant="outline"
                size="sm"
                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                onClick={() => navigate('/admin/leave-requests')}
              >
                Gérer les congés
              </Button>
            </>
          )}
        </div>
      )}
    </Card>
  )
}

export default PendingLeaveWidget