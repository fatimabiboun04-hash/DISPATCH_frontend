import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lock, Zap, RefreshCw, CheckCircle, Save, BarChart3,
} from 'lucide-react'
import {
  lockCurrentWeekThunk,
  generateNextWeekThunk,
} from '../../features/planning/planningThunks'
import {
  selectLockLoading,
  selectGenerateLoading,
  selectGenerateResult,
  selectGenerateErrors,
} from '../../features/planning/planningSelectors'
import { clearGenerateResult } from '../../features/planning/planningSlice'
import WeekSelector  from './WeekSelector'
import TemplateModal from './TemplateModal'
import { Button, ConfirmDialog } from '../ui'
import toast         from 'react-hot-toast'
import { cn }        from '../../utils/cn'

/**
 * PlanningToolbar — top action bar for the planning page.
 *
 * Contains:
 * - WeekSelector (prev/next/today)
 * - Lock Current Week button → POST /v1/planning/lock-current-week
 * - Generate Next Week button → POST /v1/planning/generate-next-week
 * - Refresh button
 *
 * "Generate Next Week" is the Friday workflow:
 * Backend automatically locks current week then creates next week assignments.
 */
const PlanningToolbar = ({
  weekLabel,
  onPrev,
  onNext,
  onToday,
  isCurrentWeek,
  onRefresh,
  weekNumber,
  year,
  onStatsToggle,
  statsOpen,
  className,
}) => {
  const dispatch         = useDispatch()
  const lockLoading      = useSelector(selectLockLoading)
  const generateLoading  = useSelector(selectGenerateLoading)
  const generateResult   = useSelector(selectGenerateResult)
  const generateErrors   = useSelector(selectGenerateErrors)

  const [lockConfirmOpen,     setLockConfirmOpen]     = useState(false)
  const [generateConfirmOpen, setGenerateConfirmOpen] = useState(false)
  const [templateOpen,        setTemplateOpen]        = useState(false)

  const handleLockConfirm = async () => {
    const result = await dispatch(lockCurrentWeekThunk())
    setLockConfirmOpen(false)
    if (lockCurrentWeekThunk.fulfilled.match(result)) {
      toast.success(
        `Semaine verrouillée — ${result.payload.locked_count} assignation(s)`
      )
      onRefresh?.()
    } else {
      toast.error('Erreur lors du verrouillage')
    }
  }

  const handleGenerateConfirm = async () => {
    const result = await dispatch(generateNextWeekThunk())
    setGenerateConfirmOpen(false)
    if (generateNextWeekThunk.fulfilled.match(result)) {
      const { generated_count, week_number } = result.payload
      toast.success(
        `${generated_count} assignation(s) générée(s) pour la semaine ${week_number}`
      )
      onRefresh?.()
    } else {
      toast.error('Erreur lors de la génération')
    }
  }

  return (
    <>
      <div className={cn(
        'flex flex-wrap items-center justify-between gap-3',
        className
      )}>
        {/* Week navigation */}
        <WeekSelector
          weekLabel={weekLabel}
          onPrev={onPrev}
          onNext={onNext}
          onToday={onToday}
          isCurrentWeek={isCurrentWeek}
        />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            onClick={onRefresh}
          >
            Actualiser
          </Button>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<BarChart3 className="h-3.5 w-3.5" />}
            onClick={onStatsToggle}
          >
            {statsOpen ? 'Masquer stats' : 'Statistiques'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Save className="h-3.5 w-3.5" />}
            onClick={() => setTemplateOpen(true)}
          >
            Templates
          </Button>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Lock className="h-3.5 w-3.5" />}
            loading={lockLoading}
            onClick={() => setLockConfirmOpen(true)}
          >
            Verrouiller semaine
          </Button>

          <Button
            size="sm"
            leftIcon={<Zap className="h-4 w-4" />}
            loading={generateLoading}
            onClick={() => setGenerateConfirmOpen(true)}
          >
            Générer semaine suivante
          </Button>
        </div>
      </div>

      {/* Template modal */}
      {templateOpen && (
        <TemplateModal
          open={templateOpen}
          onClose={() => setTemplateOpen(false)}
          weekNumber={weekNumber}
          year={year}
          onTemplateLoaded={onRefresh}
        />
      )}

      {/* Generate result banner */}
      <AnimatePresence>
        {generateResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-3 rounded-xl border border-emerald-200
                       bg-emerald-50 px-4 py-3 dark:border-emerald-800
                       dark:bg-emerald-900/20"
          >
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                Planning généré : {generateResult.generated_count} assignation(s)
                pour la semaine {generateResult.week_number}
              </p>
              {generateErrors.length > 0 && (
                <div className="mt-1 space-y-0.5">
                  {generateErrors.map((err, i) => (
                    <p key={i} className="text-xs text-amber-600 dark:text-amber-400">
                      ⚠ {err}
                    </p>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => dispatch(clearGenerateResult())}
              className="text-emerald-500 hover:text-emerald-700 text-xs"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lock confirmation */}
      <ConfirmDialog
        open={lockConfirmOpen}
        onClose={() => setLockConfirmOpen(false)}
        onConfirm={handleLockConfirm}
        loading={lockLoading}
        variant="warning"
        title="Verrouiller la semaine courante"
        description="Le planning de la semaine courante sera verrouillé. Les modifications ne seront plus possibles sans déblocage explicite. Continuer ?"
        confirmLabel="Verrouiller"
      />

      {/* Generate confirmation */}
      <ConfirmDialog
        open={generateConfirmOpen}
        onClose={() => setGenerateConfirmOpen(false)}
        onConfirm={handleGenerateConfirm}
        loading={generateLoading}
        variant="warning"
        title="Générer le planning de la semaine suivante"
        description="Le système va verrouiller la semaine courante et générer automatiquement les assignations pour la semaine suivante (employés disponibles, < 44h, non en congé). Continuer ?"
        confirmLabel="Générer"
      />
    </>
  )
}

export default PlanningToolbar