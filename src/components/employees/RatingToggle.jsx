import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Star } from 'lucide-react'
import { toggleRatingThunk } from '../../features/ratings/ratingThunks'
import { Tooltip } from '../ui'
import { cn } from '../../utils/cn'

/**
 * RatingToggle — interactive ⭐ / 🚩 button for employee rows.
 *
 * Backend logic (RatingController@toggle):
 *   - No rating this week → click → creates ⭐ Excellent
 *   - ⭐ exists this week → click same → escalates to 🚩 Warning
 *   - 🚩 exists → click → resets to ⭐ Excellent
 *
 * currentRating: { has_rating, type: 'excellent'|'warning'|null, icon }
 */
const RatingToggle = ({ employeeId, currentRating, onSuccess }) => {
  const dispatch = useDispatch()
  const toggling = useSelector((s) => s.ratings.toggling[employeeId])
  const [showPulse, setShowPulse] = useState(false)

  const hasRating    = currentRating?.has_rating
  const ratingType   = currentRating?.type
  const isExcellent  = ratingType === 'excellent'
  const isWarning    = ratingType === 'warning'

  const handleToggle = async (e) => {
    e.stopPropagation()
    if (toggling) return

    setShowPulse(true)
    const result = await dispatch(toggleRatingThunk({ employeeId, reason: null }))
    if (toggleRatingThunk.fulfilled.match(result)) {
      onSuccess?.(result.payload.data)
    }
    setTimeout(() => setShowPulse(false), 600)
  }

  const tooltipText = !hasRating
    ? 'Cliquer pour noter ⭐ Excellent'
    : isExcellent
      ? 'Excellent — cliquer pour escalader en 🚩 Attention'
      : 'Attention — cliquer pour réinitialiser en ⭐ Excellent'

  return (
    <Tooltip content={tooltipText}>
      <button
        onClick={handleToggle}
        disabled={toggling}
        className={cn(
          'relative flex items-center justify-center rounded-lg',
          'h-8 w-8 transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1',
          toggling && 'opacity-50 cursor-not-allowed',
          !hasRating && 'hover:bg-slate-100 dark:hover:bg-dark-600',
          isExcellent && 'hover:bg-amber-50 dark:hover:bg-amber-900/20',
          isWarning   && 'hover:bg-red-50 dark:hover:bg-red-900/20'
        )}
      >
        {/* Pulse animation on click */}
        <AnimatePresence>
          {showPulse && (
            <motion.div
              key="pulse"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className={cn(
                'absolute inset-0 rounded-lg',
                isExcellent ? 'bg-amber-300' : isWarning ? 'bg-red-300' : 'bg-brand-300'
              )}
            />
          )}
        </AnimatePresence>

        {/* Icon */}
        {toggling ? (
          <span className="h-4 w-4 animate-spin rounded-full
                           border-2 border-current border-t-transparent
                           text-slate-400" />
        ) : !hasRating ? (
          <Star className="h-4 w-4 text-slate-300 hover:text-amber-400
                           transition-colors dark:text-slate-600" />
        ) : (
          <motion.span
            key={ratingType}
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            className="text-base leading-none"
          >
            {isExcellent ? '⭐' : '🚩'}
          </motion.span>
        )}
      </button>
    </Tooltip>
  )
}

export default RatingToggle