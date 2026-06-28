import { useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, ExternalLink, X } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { clearConflictErrors } from '../../features/planning/planningSlice'
import { selectConflictErrors } from '../../features/planning/planningSelectors'
import { Button } from '../ui'
import toast from 'react-hot-toast'

const getErrorText = (err) => (typeof err === 'string' ? err : err.message || '')

const ConflictBanner = () => {
  const dispatch = useDispatch()
  const errors   = useSelector(selectConflictErrors)

  const hasPlanningRefs = errors.some(
    (e) => typeof e === 'object' && e.planning_id
  )

  const conflictingIds = errors
    .filter((e) => typeof e === 'object' && e.planning_id)
    .map((e) => e.planning_id)

  // Notify parent that a conflicting planning should be shown
  const handleViewConflict = useCallback(() => {
    if (conflictingIds.length > 0) {
      toast.success(`Conflit avec l'assignation #${conflictingIds[0]}`)
    }
  }, [conflictingIds])

  return (
    <AnimatePresence>
      {errors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: 0.2 }}
          className="rounded-xl border border-red-200 bg-red-50 p-4
                     dark:border-red-800 dark:bg-red-900/20"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center
                            rounded-lg bg-red-100 dark:bg-red-900/40">
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                Conflit de planning détecté
              </p>
              <ul className="mt-1 space-y-0.5">
                {errors.map((err, i) => (
                  <li key={i} className="text-xs text-red-600 dark:text-red-400">
                    • {getErrorText(err)}
                  </li>
                ))}
              </ul>
              {hasPlanningRefs && (
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<ExternalLink className="h-3 w-3" />}
                    onClick={handleViewConflict}
                    className="text-red-600 border-red-300 hover:bg-red-100 dark:border-red-700 dark:hover:bg-red-900/30"
                  >
                    Voir l'assignation en conflit
                  </Button>
                </div>
              )}
            </div>
            <button
              onClick={() => dispatch(clearConflictErrors())}
              className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ConflictBanner