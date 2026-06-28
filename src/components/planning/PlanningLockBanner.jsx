import { motion, AnimatePresence } from 'framer-motion'
import { Lock } from 'lucide-react'
import { useSelector } from 'react-redux'
import { selectHasLockedRecords, selectLockedCount } from '../../features/planning/planningSelectors'
import { cn } from '../../utils/cn'

/**
 * PlanningLockBanner — shown when viewed week has locked planning records.
 *
 * Backend fix #8: is_locked enforced in controller — locked records
 * cannot be modified via update/delete. This banner makes that visible.
 *
 * Admin can use "Override" which calls POST /v1/planning/override-lock
 * with the specific planning_id.
 */
const PlanningLockBanner = ({ className }) => {
  const hasLocked  = useSelector(selectHasLockedRecords)
  const count      = useSelector(selectLockedCount)

  return (
    <AnimatePresence>
      {hasLocked && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'flex items-center gap-3 rounded-xl border px-4 py-3',
            'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20',
            className
          )}
        >
          <Lock className="h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Planning verrouillé
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              {count} assignation{count > 1 ? 's' : ''} verrouillée{count > 1 ? 's' : ''}.
              Les modifications sont bloquées jusqu'au déblocage.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PlanningLockBanner