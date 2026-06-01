import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion }                   from 'framer-motion'
import { AlertTriangle, Shield }    from 'lucide-react'
import { fetchFlaggedThunk } from '../../features/pointage/pointageThunks'
import {
  selectFlaggedPointages,
  selectFlaggedMeta,
  selectFlaggedLoading,
} from '../../features/pointage/pointageSelectors'
import VerifyFlagModal from './VerifyFlagModal'
import { Avatar, Badge, Button, Skeleton, EmptyState, Pagination } from '../ui'
import { formatDate, formatTime } from '../../utils/formatters'

/**
 * FlaggedPointagesList — admin list of unverified suspicious pointages.
 *
 * Data: GET /v1/pointages/flagged (admin only, fix #1 applied)
 * Returns: paginatedResponse (paginate 20)
 *   with user, planning.shift, gpsLog loaded
 *
 * Only shows: is_flagged=true AND verified_by=null
 */
const FlaggedPointagesList = () => {
  const dispatch  = useDispatch()
  const flagged   = useSelector(selectFlaggedPointages)
  const meta      = useSelector(selectFlaggedMeta)
  const loading   = useSelector(selectFlaggedLoading)

  const [verifyTarget, setVerifyTarget] = useState(null)

  useEffect(() => {
    dispatch(fetchFlaggedThunk({}))
  }, [dispatch])

  const handlePageChange = (page) => {
    dispatch(fetchFlaggedThunk({ page }))
  }

  if (loading && flagged.length === 0) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton.Block key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    )
  }

  if (flagged.length === 0) {
    return (
      <EmptyState
        icon={Shield}
        title="Aucun pointage suspect"
        description="Tous les pointages ont été vérifiés ou aucune anomalie n'a été détectée"
      />
    )
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {flagged.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-4 rounded-xl border
                       border-amber-200 bg-amber-50 px-4 py-3
                       dark:border-amber-800 dark:bg-amber-900/10"
          >
            <Avatar
              src={p.user?.avatar_url}
              name={p.user?.name}
              size="sm"
            />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {p.user?.name}
              </p>
              <p className="text-xs text-slate-500">
                {formatDate(p.check_in_at)} · {formatTime(p.check_in_at)}
                {p.planning?.shift && ` · ${p.planning.shift.name}`}
              </p>
              {p.flag_reason && (
                <p className="text-2xs text-amber-600 dark:text-amber-400 mt-0.5">
                  ⚠ {p.flag_reason}
                </p>
              )}
            </div>

            {p.gpsLog && !p.gpsLog.is_valid && (
              <Badge variant="danger" size="sm">GPS invalide</Badge>
            )}

            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Shield className="h-3.5 w-3.5" />}
              onClick={() => setVerifyTarget(p)}
            >
              Vérifier
            </Button>
          </motion.div>
        ))}

        {meta && meta.last_page > 1 && (
          <Pagination
            currentPage={meta.current_page}
            lastPage={meta.last_page}
            total={meta.total}
            perPage={meta.per_page}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      <VerifyFlagModal
        open={!!verifyTarget}
        onClose={() => setVerifyTarget(null)}
        pointage={verifyTarget}
      />
    </>
  )
}

export default FlaggedPointagesList