import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { rateEmployeeThunk } from '../../features/ratings/ratingThunks'
import StarRating from '../ui/StarRating'
import { Tooltip } from '../ui'
import { cn } from '../../utils/cn'
import toast from 'react-hot-toast'

const RatingToggle = ({ employeeId, currentRating, onSuccess }) => {
  const dispatch = useDispatch()
  const toggling = useSelector((s) => s.ratings.toggling[employeeId])
  const [showPulse, setShowPulse] = useState(false)
  const existingScore = currentRating?.score || 0

  const handleRate = async (score) => {
    if (toggling || score === 0) return

    setShowPulse(true)
    const result = await dispatch(rateEmployeeThunk({ employeeId, score }))
    if (rateEmployeeThunk.fulfilled.match(result)) {
      toast.success(`Noté ${score}/5`)
      onSuccess?.(result.payload.data)
    }
    setTimeout(() => setShowPulse(false), 600)
  }

  return (
    <Tooltip content="Cliquer pour noter (1-5 étoiles)">
      <div className="relative inline-flex items-center gap-0.5">
        <AnimatePresence>
          {showPulse && (
            <motion.div
              key="pulse"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 rounded-lg bg-amber-300"
            />
          )}
        </AnimatePresence>
        {toggling ? (
          <span className="h-5 w-5 animate-spin rounded-full
                           border-2 border-current border-t-transparent
                           text-slate-400" />
        ) : (
          <StarRating
            value={existingScore}
            onChange={handleRate}
            size="sm"
          />
        )}
      </div>
    </Tooltip>
  )
}

export default RatingToggle