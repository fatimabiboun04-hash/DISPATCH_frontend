import { motion } from 'framer-motion'
import SettingsForm from '../../components/settings/SettingsForm'

/**
 * SettingsPage — /admin/settings
 *
 * Manages system configuration via batch PUT /v1/settings.
 *
 * Settings are grouped by the backend's `group` field:
 *   gps:      office_location { lat, lng, radius_meters }
 *   planning: friday_lock_hour { time }
 *   pointage: check_in_grace_minutes { minutes }
 *
 * CRITICAL: value is always a JSON object (never scalar).
 * SaveBar sticky at bottom — shows when isDirty=true.
 */
const SettingsPage = () => (
  <div className="flex flex-col gap-5">

    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
        Paramètres
      </h1>
      <p className="mt-0.5 text-sm text-slate-400">
        Configuration du système et des règles métier
      </p>
    </motion.div>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.05 }}
    >
      <SettingsForm />
    </motion.div>
  </div>
)

export default SettingsPage