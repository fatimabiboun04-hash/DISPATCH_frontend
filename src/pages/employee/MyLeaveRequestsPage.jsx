import { useEffect }     from 'react'
import { useDispatch }   from 'react-redux'
import { motion }        from 'framer-motion'
import { fetchMyLeaveRequestsThunk } from '../../features/leave/leaveThunks'
import LeaveRequestForm  from '../../components/leave/LeaveRequestForm'
import LeaveHistoryTable from '../../components/leave/LeaveHistoryTable'

/**
 * MyLeaveRequestsPage — /employee/my-leave-requests
 *
 * Employee can:
 * 1. Submit a new leave request (LeaveRequestForm)
 * 2. View their own request history (LeaveHistoryTable)
 *
 * StoreLeaveRequest authorize() = isEmployee() only — correct.
 * Gap fix #1: POST /v1/leave-requests route added for employees.
 *
 * start_date must be after_or_equal:today (backend enforced).
 * Overlap check: cannot have two approved leave on same dates.
 */
const MyLeaveRequestsPage = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchMyLeaveRequestsThunk({}))
  }, [dispatch])

  const handleFormSuccess = () => {
    dispatch(fetchMyLeaveRequestsThunk({}))
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
        <LeaveHistoryTable />
      </motion.div>
    </div>
  )
}

export default MyLeaveRequestsPage