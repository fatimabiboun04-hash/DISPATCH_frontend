import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { fetchMyPointagesThunk } from '../../features/pointage/pointageThunks'
import {
  selectTodayPointage,
  selectMyPointagesLoading,
  selectLastAction,
} from '../../features/pointage/pointageSelectors'
import PointageActions    from '../../components/pointage/PointageActions'
import CurrentStatusCard  from '../../components/pointage/CurrentStatusCard'
import TodaySummaryCard   from '../../components/pointage/TodaySummaryCard'
import PointageHistoryList from '../../components/pointage/PointageHistoryList'

/**
 * MyPointagePage — /employee/my-pointage
 *
 * Layout:
 *   Current status card (shows check-in state)
 *   Check-in / Check-out big button ("Je suis présent")
 *   Today summary card (times, hours, pauses)
 *   Pointage history list (paginated)
 *
 * NOTE: CheckInRequest authorize() = isEmployee() only.
 * This page is in the employee space so this is correct.
 */
const MyPointagePage = () => {
  const dispatch      = useDispatch()
  const todayPointage = useSelector(selectTodayPointage)
  const lastAction    = useSelector(selectLastAction)

  useEffect(() => {
    dispatch(fetchMyPointagesThunk({}))
  }, [dispatch])

  const handleSuccess = () => {
    dispatch(fetchMyPointagesThunk({}))
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg mx-auto">

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Mon Pointage
        </h1>
        <p className="mt-0.5 text-sm text-slate-400">
          Enregistrez votre présence et consultez votre historique
        </p>
      </motion.div>

      {/* Current status */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <CurrentStatusCard todayPointage={todayPointage} />
      </motion.div>

      {/* Check-in / Check-out action */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <PointageActions onSuccess={handleSuccess} />
      </motion.div>

      {/* Today summary — shown after check-in or check-out */}
      {todayPointage && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <TodaySummaryCard
            todayPointage={todayPointage}
            checkOutResult={
              lastAction?.type === 'check_out' ? lastAction.result : null
            }
          />
        </motion.div>
      )}

      {/* History */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <PointageHistoryList />
      </motion.div>
    </div>
  )
}

export default MyPointagePage