import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, XCircle, ArrowRight } from 'lucide-react'
import { createPlanningThunk } from '../../features/planning/planningThunks'
import {
  selectPlanningSubmitting,
  selectConflictErrors,
  selectSubmitError,
  selectFieldErrors,
} from '../../features/planning/planningSelectors'
import { clearSubmitError } from '../../features/planning/planningSlice'
import { selectActiveShifts } from '../../features/shifts/shiftSelectors'
import EmployeeSelect from './EmployeeSelect'
import ShiftSelect from './ShiftSelect'
import EmployeeInfoPanel from './EmployeeInfoPanel'
import ShiftInfoPanel from './ShiftInfoPanel'
import { Modal, Select, Input, Button } from '../ui'
import { formatDate } from '../../utils/formatters'
import { cn } from '../../utils/cn'
import planningService from '../../services/planningService'
import toast from 'react-hot-toast'

const schema = z.object({
  user_id:  z.number().min(1, 'Sélectionnez un employé'),
  shift_id: z.number().min(1, 'Sélectionnez un shift'),
  team_id:  z.string().optional(),
  notes:    z.string().optional(),
})

const QuickAddPlanningModal = ({
  open,
  onClose,
  date,
  employees = [],
  teams     = [],
  defaultTeamId,
  onSuccess,
  weekNumber,
  year,
}) => {
  const dispatch       = useDispatch()
  const submitting     = useSelector(selectPlanningSubmitting)
  const conflictErrors = useSelector(selectConflictErrors)
  const submitError    = useSelector(selectSubmitError)
  const fieldErrors    = useSelector(selectFieldErrors)
  const activeShifts   = useSelector(selectActiveShifts)
  const notesRef       = useRef(null)

  const [liveConflicts, setLiveConflicts] = useState([])
  const [validating, setValidating] = useState(false)
  const debounceRef = useRef(null)

  const {
    handleSubmit,
    reset,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  const watchUserId  = watch('user_id')
  const watchShiftId = watch('shift_id')

  // Live validation when both employee and shift are selected
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!watchUserId || !watchShiftId || !date) {
      setLiveConflicts([])
      return
    }

    setValidating(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const result = await planningService.validateBatch([{
          user_id: watchUserId,
          shift_id: watchShiftId,
          date,
        }])
        setLiveConflicts(result.conflicts?.[0]?.conflicts || [])
      } catch {
        setLiveConflicts([])
      } finally {
        setValidating(false)
      }
    }, 400)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [watchUserId, watchShiftId, date])

  useEffect(() => {
    if (open) {
      dispatch(clearSubmitError())
      reset({
        user_id:  undefined,
        shift_id: undefined,
        team_id:  defaultTeamId ? String(defaultTeamId) : '',
        notes:    '',
      })
      setLiveConflicts([])
    }
  }, [open, dispatch, reset, defaultTeamId])

  const onSubmit = async (formData) => {
    const payload = {
      user_id:  Number(formData.user_id),
      shift_id: Number(formData.shift_id),
      date,
      team_id:  formData.team_id ? Number(formData.team_id) : undefined,
      notes:    formData.notes || undefined,
    }
    const result = await dispatch(createPlanningThunk(payload))
    if (createPlanningThunk.fulfilled.match(result)) {
      toast.success('Assignation créée')
      onSuccess?.()
      onClose()
    }
  }

  const hasLiveError = liveConflicts.some((c) => c.severity === 'error')
  const hasLiveWarning = liveConflicts.some((c) => c.severity === 'warning')

  const selectedShift = activeShifts.find((s) => s.id === watchShiftId)

  const teamOptions = [
    { value: '', label: '— Aucune équipe —' },
    ...teams.map((t) => ({
      value: String(t.id),
      label: t.name,
      color: t.color,
    })),
  ]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Ajouter une assignation"
      subtitle={date ? `Pour le ${formatDate(date, 'EEEE d MMMM yyyy')}` : ''}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Annuler
          </Button>
          <Button loading={submitting} onClick={handleSubmit(onSubmit)} disabled={hasLiveError}>
            Assigner
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Validation error (non-conflict 422s) */}
        {submitError && (
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-3 space-y-1
                          dark:border-yellow-800 dark:bg-yellow-900/20">
            {fieldErrors ? (
              Object.entries(fieldErrors).map(([field, msgs]) => (
                <p key={field} className="text-xs text-yellow-700 dark:text-yellow-300">
                  {Array.isArray(msgs) ? msgs.join(', ') : msgs}
                </p>
              ))
            ) : (
              <p className="text-xs text-yellow-700 dark:text-yellow-300">{submitError}</p>
            )}
          </div>
        )}

        {/* Conflict errors from server */}
        {conflictErrors.length > 0 && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3
                          dark:border-red-800 dark:bg-red-900/20">
            {conflictErrors.map((err, i) => {
              const msg = typeof err === 'string' ? err : err.message || ''
              return (
                <p key={i} className="text-xs text-red-600 dark:text-red-400">
                  {msg}
                </p>
              )
            })}
          </div>
        )}

        {/* Live validation results */}
        <AnimatePresence>
          {liveConflicts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className={cn(
                'rounded-xl border p-3 space-y-1.5',
                hasLiveError
                  ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10'
                  : 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/10'
              )}
            >
              <div className="flex items-center gap-1.5 mb-1">
                {hasLiveError ? (
                  <XCircle className="h-3.5 w-3.5 text-red-500" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                )}
                <span className={cn(
                  'text-2xs font-semibold uppercase tracking-wider',
                  hasLiveError ? 'text-red-600' : 'text-amber-600'
                )}>
                  {hasLiveError ? 'Conflits détectés' : 'Avertissements'}
                </span>
                {validating && (
                  <span className="ml-auto h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
              </div>
              {liveConflicts.map((c, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  {c.severity === 'error' ? (
                    <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <span className={cn(
                      'text-xs',
                      c.severity === 'error' ? 'text-red-600 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'
                    )}>
                      {c.message}
                    </span>
                    {c.suggestion && (
                      <p className={cn(
                        'mt-0.5 text-2xs flex items-start gap-1',
                        c.severity === 'error' ? 'text-red-500/70' : 'text-amber-600/70'
                      )}>
                        <ArrowRight className="mt-0.5 h-2.5 w-2.5 flex-shrink-0" />
                        {c.suggestion}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <EmployeeSelect
          label="Employé"
          required
          employees={employees}
          value={watchUserId}
          onChange={(id) => setValue('user_id', id, { shouldValidate: true })}
          error={errors.user_id?.message}
        />

        {/* Employee info panel */}
        <AnimatePresence>
          {watchUserId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <EmployeeInfoPanel
                employeeId={watchUserId}
                weekNumber={weekNumber}
                year={year}
                date={date}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <ShiftSelect
          label="Shift"
          required
          shifts={activeShifts}
          value={watchShiftId}
          onChange={(id) => setValue('shift_id', id, { shouldValidate: true })}
          error={errors.shift_id?.message}
        />

        {/* Shift info panel */}
        <AnimatePresence>
          {selectedShift && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <ShiftInfoPanel shift={selectedShift} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-1">
          {defaultTeamId && (() => {
            const selectedTeam = teams.find((t) => String(t.id) === String(defaultTeamId))
            return selectedTeam ? (
              <div className="flex items-center gap-1.5 px-0.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: selectedTeam.color || '#6172f3' }}
                />
                <span className="text-2xs text-slate-400">
                  Équipe pré-sélectionnée : {selectedTeam.name}
                </span>
              </div>
            ) : null
          })()}
          <Select
            label="Équipe (optionnel)"
            options={teamOptions}
            {...register('team_id')}
          />
        </div>

        <Input
          label="Notes (optionnel)"
          placeholder="Informations supplémentaires…"
          {...register('notes')}
        />
      </div>
    </Modal>
  )
}

export default QuickAddPlanningModal
