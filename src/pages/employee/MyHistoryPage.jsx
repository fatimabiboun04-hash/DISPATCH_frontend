import { motion }         from 'framer-motion'
import PersonalTimeline   from '../../components/history/PersonalTimeline'

/**
 * MyHistoryPage — /employee/my-history
 *
 * Data: GET /v1/me/history (gap fix #2)
 * Merged timeline: pointages, ratings, leaves, planning assignments.
 * Sorted by date DESC.
 */
const MyHistoryPage = () => (
  <div className="flex flex-col gap-5 max-w-2xl mx-auto">
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
        Mon Historique
      </h1>
      <p className="mt-0.5 text-sm text-slate-400">
        Toutes vos activités enregistrées
      </p>
    </motion.div>

    <PersonalTimeline />
  </div>
)

export default MyHistoryPage