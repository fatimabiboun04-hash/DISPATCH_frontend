import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { clearConflictErrors } from '../../features/planning/planningSlice'
import { selectConflictErrors } from '../../features/planning/planningSelectors'

/**
 * ConflictBanner — floating panel showing conflict/validation errors.
 *
 * Shown when a planning create/update returns 422 with:
 *   { errors: { planning: ['Employee already assigned...'] } }
 *
 * This is the backend's conflict detection result from PlanningService::validateAssignment()
 */
const ConflictBanner = () => {
  const dispatch = useDispatch()
  const errors   = useSelector(selectConflictErrors)

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
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                Conflit de planning détecté
              </p>
              <ul className="mt-1 space-y-0.5">
                {errors.map((err, i) => (
                  <li key={i} className="text-xs text-red-600 dark:text-red-400">
                    • {err}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => dispatch(clearConflictErrors())}
              className="text-red-400 hover:text-red-600 transition-colors"
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