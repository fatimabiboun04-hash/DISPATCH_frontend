import { motion }     from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useRef } from 'react'
import { BarChart3, RefreshCw } from 'lucide-react'
import { fetchReportsThunk } from '../../features/reports/reportThunks'
import {
  selectReportList,
  selectReportMeta,
  selectReportLoading,
  selectReportError,
  selectHasInProgressReports,
  selectIsPolling,
} from '../../features/reports/reportSelectors'
import { setPolling } from '../../features/reports/reportSlice'
import ReportStatusBadge from './ReportStatusBadge'
import DownloadButton    from './DownloadButton'
import { Skeleton, EmptyState, ErrorState, Pagination, Badge, Button } from '../ui'
import { formatDate, formatRelative } from '../../utils/formatters'
import { cn } from '../../utils/cn'

/**
 * ReportHistoryList — list of generated reports with status + download.
 *
 * Polling:
 * When any report has status 'queued' or 'processing', we poll
 * GET /v1/reports every 5 seconds until all are 'completed' or 'failed'.
 *
 * Backend: paginate(15) with generator loaded.
 * Status: queued | processing | completed | failed
 */

const TYPE_LABELS = {
  weekly:  '📅 Hebdomadaire',
  monthly: '📊 Mensuel',
  custom:  '📋 Personnalisé',
}

const FILE_TYPE_STYLES = {
  pdf:   'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  excel: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
}

const ReportHistoryList = ({ onPageChange }) => {
  const dispatch    = useDispatch()
  const list        = useSelector(selectReportList)
  const meta        = useSelector(selectReportMeta)
  const loading     = useSelector(selectReportLoading)
  const error       = useSelector(selectReportError)
  const hasInProgress = useSelector(selectHasInProgressReports)
  const isPolling   = useSelector(selectIsPolling)
  const pollInterval= useRef(null)

  // Start/stop polling based on in-progress reports
  useEffect(() => {
    if (hasInProgress && !isPolling) {
      dispatch(setPolling(true))
      pollInterval.current = setInterval(() => {
        dispatch(fetchReportsThunk({}))
      }, 5000)
    } else if (!hasInProgress && isPolling) {
      dispatch(setPolling(false))
      if (pollInterval.current) {
        clearInterval(pollInterval.current)
        pollInterval.current = null
      }
    }

    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current)
        pollInterval.current = null
      }
    }
  }, [hasInProgress, isPolling, dispatch])

  const handleRefresh = () => dispatch(fetchReportsThunk({}))

  if (loading && list.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton.Block key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    )
  }

  if (error) {
    return <ErrorState message={error} onRetry={handleRefresh} />
  }

  if (list.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Aucun rapport généré"
        description="Utilisez le formulaire ci-dessus pour générer votre premier rapport."
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Rapports générés ({meta?.total || list.length})
        </p>
        <div className="flex items-center gap-2">
          {isPolling && (
            <div className="flex items-center gap-1.5 text-2xs text-brand-500">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
              Mise à jour automatique
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />}
            onClick={handleRefresh}
          >
            Actualiser
          </Button>
        </div>
      </div>

      {/* Report list */}
      <div className="space-y-3">
        {list.map((report, i) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={cn(
              'flex items-center gap-4 rounded-xl border px-4 py-3.5',
              'bg-white dark:bg-dark-700',
              report.status === 'failed'
                ? 'border-red-200 dark:border-red-800'
                : report.status === 'completed'
                  ? 'border-surface-200 dark:border-dark-600'
                  : 'border-amber-200 dark:border-amber-800'
            )}
          >
            {/* Type + file format */}
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {TYPE_LABELS[report.type] || report.type}
                </p>
                <span className={cn(
                  'rounded-md px-1.5 py-0.5 text-2xs font-bold uppercase',
                  FILE_TYPE_STYLES[report.file_type] || FILE_TYPE_STYLES.pdf
                )}>
                  {report.file_type?.toUpperCase()}
                </span>
              </div>

              {/* Date range */}
              <p className="text-xs text-slate-400">
                {formatDate(report.start_date)} → {formatDate(report.end_date)}
                {report.generator && (
                  <span className="ml-2 text-slate-300 dark:text-slate-600">
                    · Par {report.generator.name}
                  </span>
                )}
              </p>

              {/* Relative time */}
              <p className="text-2xs text-slate-400">
                {formatRelative(report.created_at)}
              </p>
            </div>

            {/* Status badge */}
            <ReportStatusBadge status={report.status} />

            {/* Download button — only shown when completed */}
            <DownloadButton report={report} />
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <Pagination
          currentPage={meta.current_page}
          lastPage={meta.last_page}
          total={meta.total}
          perPage={meta.per_page}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}

export default ReportHistoryList