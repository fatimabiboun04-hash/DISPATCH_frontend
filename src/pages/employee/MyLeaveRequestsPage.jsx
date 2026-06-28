import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion }        from 'framer-motion'
import { fetchMyLeaveRequestsThunk } from '../../features/leave/leaveThunks'
import { selectMyLeaveList } from '../../features/leave/leaveSelectors'
import LeaveRequestForm  from '../../components/leave/LeaveRequestForm'
import LeaveHistoryTable from '../../components/leave/LeaveHistoryTable'
import { Skeleton, ErrorState } from '../../components/ui'

const MyLeaveRequestsPage = () => {
  const dispatch = useDispatch()
  const leaveList = useSelector(selectMyLeaveList)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = async () => {
    setLoading(true)
    setError(null)
    const result = await dispatch(fetchMyLeaveRequestsThunk({}))
    if (fetchMyLeaveRequestsThunk.rejected.match(result)) {
      setError('Impossible de charger les congés')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetch()
  }, [dispatch])

  const handleFormSuccess = () => {
    fetch()
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Mes Congés
        </h1>
        <p className="mt-0.5 text-sm text-slate-400">
          Soumettez et suivez vos demandes de congé
        </p>
      </motion.div>

      {error ? (
        <ErrorState message={error} onRetry={fetch} />
      ) : (
        <>
          {/* Submission form */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <LeaveRequestForm onSuccess={handleFormSuccess} />
          </motion.div>

          {/* History */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {loading ? (
              <div className="space-y-3">
                <Skeleton.Block className="h-10 w-full rounded-xl" />
                <Skeleton.Block className="h-10 w-full rounded-xl" />
                <Skeleton.Block className="h-10 w-full rounded-xl" />
              </div>
            ) : (
              <LeaveHistoryTable />
            )}
          </motion.div>
        </>
      )}
    </div>
  )
}

export default MyLeaveRequestsPage