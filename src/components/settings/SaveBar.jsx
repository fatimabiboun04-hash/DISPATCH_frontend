import { motion, AnimatePresence } from 'framer-motion'
import { Save, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '../ui'
import { cn } from '../../utils/cn'

/**
 * SaveBar — sticky bottom bar shown when settings have unsaved changes.
 *
 * Per spec: "sticky bottom save bar with unsaved changes indicator"
 * Shows: unsaved changes warning + save button + reset button
 * Disappears when settings are saved or reset.
 */
const SaveBar = ({
  isDirty,
  saving,
  saveError,
  saveSuccess,
  onSave,
  onReset,
}) => (
  <AnimatePresence>
    {(isDirty || saveError || saveSuccess) && (
      <motion.div
        key="save-bar"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0  }}
        exit={{   opacity: 0, y: 24  }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed inset-x-0 bottom-0 z-30 lg:left-60"
      >
        <div className={cn(
          'mx-4 mb-4 flex items-center justify-between gap-4',
          'rounded-2xl border px-5 py-3.5 shadow-strong',
          saveSuccess
            ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/30'
            : saveError
              ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/30'
              : 'border-amber-200 bg-white dark:border-amber-800 dark:bg-dark-700'
        )}>
          {/* Status message */}
          <div className="flex items-center gap-2.5">
            {saveSuccess ? (
              <>
                <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  Paramètres enregistrés avec succès
                </p>
              </>
            ) : saveError ? (
              <>
                <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-500" />
                <p className="text-sm font-medium text-red-700 dark:text-red-300">
                  {saveError}
                </p>
              </>
            ) : (
              <>
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Vous avez des modifications non enregistrées
                </p>
              </>
            )}
          </div>

          {/* Actions */}
          {!saveSuccess && (
            <div className="flex flex-shrink-0 items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
                onClick={onReset}
                disabled={saving}
              >
                Annuler
              </Button>
              <Button
                size="sm"
                leftIcon={<Save className="h-3.5 w-3.5" />}
                loading={saving}
                onClick={onSave}
              >
                Enregistrer
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
)

export default SaveBar