import { useEffect, useState }      from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion }                   from 'framer-motion'
import { FileText, Filter }         from 'lucide-react'
import { fetchLeaveHistoryThunk }   from '../../features/history/historyThunks'
import {
  selectLeaveHistory,
  selectLeaveHistoryMeta,
  selectLeaveHistoryLoading,
  selectLeaveHistoryError,
} from '../../features/history/historySelectors'
import LeaveStatusBadge from '../leave/LeaveStatusBadge'
import LeaveTypeBadge   from '../leave/LeaveTypeBadge'
import {
  Avatar, Badge, Select, Skeleton, EmptyState, ErrorState, Pagination,
} from '../ui'
import { formatDate }    from '../../utils/formatters'
import { differenceInCalendarDays, parseISO } from 'date-fns'

/**
 * LeaveHistoryView — full leave request history for admin.
 *
 * Data: GET /v1/leave-requests (admin, all statuses)
 * Supports status filter: pending|approved|rejected
 *
 * Backend: paginate(20), loads user.
 */

const STATUS_OPTIONS = [
  { value: '',         label: 'Tous les statuts' },
  { value: 'pending',  label: '⏳ En attente'    },
  { value: 'approved', label: '✅ Approuvés'     },
  { value: 'rejected', label: '❌ Refusés'       },
]

const LeaveHistoryView = () => {
  const dispatch = useDispatch()
  const list     = useSelector(selectLeaveHistory)
  const meta     = useSelector(selectLeaveHistoryMeta)
  const loading  = useSelector(selectLeaveHistoryLoading)
  const error    = useSelector(selectLeaveHistoryError)

  const [statusFilter, setStatusFilter] = useState('')

  const fetch = (page = 1) => {
    dispatch(fetchLeaveHistoryThunk({
      page,
      ...(statusFilter ? { status: statusFilter } : {}),
    }))
  }

  useEffect(() => {
    fetch()
  }, [statusFilter]) // eslint-disable-line

  if (loading && list.length === 0) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton.Block key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    )
  }

  if (error) return <ErrorState message={error} onRetry={() => fetch()} />

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-slate-400 flex-shrink-0" />
        <Select
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-44"
          size="sm"
        />
        {meta && (
          <span className="text-xs text-slate-400 ml-auto">
            {meta.total} demande{meta.total > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aucune demande de congé"
          description="Les demandes apparaîtront ici une fois créées."
          size="sm"
        />
      ) : (
        <>
          <div className="space-y-2">
            {list.map((leave, i) => {
              const days = leave.start_date && leave.end_date
                ? differenceInCalendarDays(
                    parseISO(leave.end_date),
                    parseISO(leave.start_date)
                  ) + 1
                : null

              return (
                <motion.div
                  key={leave.id}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 rounded-xl border
                             border-surface-100 bg-white px-4 py-3
                             dark:border-dark-600 dark:bg-dark-700"
                >
                  {/* Employee */}
                  {leave.user && (
                    <div className="flex items-center gap-2.5 min-w-0 w-40 flex-shrink-0">
                      <Avatar
                        src={leave.user.avatar_url}
                        name={leave.user.name}
                        size="sm"
                      />
                      <p className="truncate text-xs font-medium
                                    text-slate-700 dark:text-slate-200">
                        {leave.user.name}
                      </p>
                    </div>
                  )}

                  {/* Type */}
                  <LeaveTypeBadge type={leave.type} />

                  {/* Dates */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {formatDate(leave.start_date)} → {formatDate(leave.end_date)}
                    </p>
                    {days && (
                      <p className="text-2xs text-slate-400">{days}j</p>
                    )}
                  </div>

                  {/* Reason */}
                  <p className="hidden md:block flex-1 truncate text-xs
                                text-slate-400 max-w-48">
                    {leave.reason}
                  </p>

                  {/* Status */}
                  <LeaveStatusBadge status={leave.status} />
                </motion.div>
              )
            })}
          </div>

          {meta && meta.last_page > 1 && (
            <Pagination
              currentPage={meta.current_page}
              lastPage={meta.last_page}
              total={meta.total}
              perPage={meta.per_page}
              onPageChange={fetch}
            />
          )}
        </>
      )}
    </div>
  )
}

export default LeaveHistoryView