import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { fetchMyPointagesThunk } from '../../features/pointage/pointageThunks'
import {
  selectTodayPointage,
  selectMyPointagesLoading,
  selectMyPointagesError,
  selectLastAction,
} from '../../features/pointage/pointageSelectors'
import PointageActions    from '../../components/pointage/PointageActions'
import CurrentStatusCard  from '../../components/pointage/CurrentStatusCard'
import TodaySummaryCard   from '../../components/pointage/TodaySummaryCard'
import PointageHistoryList from '../../components/pointage/PointageHistoryList'
import SelfPauseButton   from '../../components/pointage/SelfPauseButton'
import { Skeleton, ErrorState } from '../../components/ui'

const MyPointagePage = () => {
  const dispatch      = useDispatch()
  const todayPointage = useSelector(selectTodayPointage)
  const lastAction    = useSelector(selectLastAction)
  const loading       = useSelector(selectMyPointagesLoading)
  const error         = useSelector(selectMyPointagesError)

  const fetch = () => dispatch(fetchMyPointagesThunk({}))

  useEffect(() => {
    fetch()
  }, [dispatch])

  const handleSuccess = () => {
    fetch()
  }

  if (error) {
    return (
      <div className="flex flex-col gap-5 max-w-lg mx-auto">
        <ErrorState message={error} onRetry={fetch} />
      </div>
    )
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

      {loading ? (
        <div className="space-y-4">
          <Skeleton.Card />
          <Skeleton.Block className="h-28 w-full rounded-xl" />
          <Skeleton.Block className="h-40 w-full rounded-xl" />
        </div>
      ) : (
        <>
          {/* Current status */}
          {todayPointage && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <CurrentStatusCard todayPointage={todayPointage} />
            </motion.div>
          )}

          {/* Check-in / Check-out action */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <PointageActions onSuccess={handleSuccess} />
          </motion.div>

          {/* Self-pause button */}
          {todayPointage && todayPointage.status === 'checked_in' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
            >
              <SelfPauseButton onToggle={handleSuccess} />
            </motion.div>
          )}

          {/* Today summary */}
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
        </>
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