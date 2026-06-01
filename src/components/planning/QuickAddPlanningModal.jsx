import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { createPlanningThunk } from '../../features/planning/planningThunks'
import {
  selectPlanningSubmitting,
  selectConflictErrors,
} from '../../features/planning/planningSelectors'
import { clearSubmitError } from '../../features/planning/planningSlice'
import { selectActiveShifts } from '../../features/shifts/shiftSelectors'
import { Modal, Select, Input, Button, Badge } from '../ui'
import { formatDate } from '../../utils/formatters'
import toast from 'react-hot-toast'

/**
 * QuickAddPlanningModal — minimal form to create a planning assignment.
 *
 * Pre-fills the date from the day column that was clicked.
 * Body sent to POST /v1/planning: { user_id, shift_id, date, team_id?, notes? }
 *
 * Conflict detection: 422 with { errors: { planning: [...] } }
 * Shown in ConflictBanner — cleared on close.
 */

const schema = z.object({
  user_id:  z.string().min(1, 'Sélectionnez un employé'),
  shift_id: z.string().min(1, 'Sélectionnez un shift'),
  team_id:  z.string().optional(),
  notes:    z.string().optional(),
})

const QuickAddPlanningModal = ({
  open,
  onClose,
  date,         // pre-filled date string 'YYYY-MM-DD'
  employees = [],
  teams     = [],
  onSuccess,
}) => {
  const dispatch       = useDispatch()
  const submitting     = useSelector(selectPlanningSubmitting)
  const conflictErrors = useSelector(selectConflictErrors)
  const activeShifts   = useSelector(selectActiveShifts)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (open) {
      dispatch(clearSubmitError())
      reset({ user_id: '', shift_id: '', team_id: '', notes: '' })
    }
  }, [open, dispatch, reset])

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
    // Conflict errors shown via ConflictBanner — no need to handle here
  }

  const shiftOptions = activeShifts.map((s) => ({
    value: String(s.id),
    label: `${s.name} (${s.start_time}–${s.end_time})`,
  }))

  const employeeOptions = employees.map((e) => ({
    value: String(e.id),
    label: e.name,
  }))

  const teamOptions = [
    { value: '', label: '— Aucune équipe —' },
    ...teams.map((t) => ({ value: String(t.id), label: t.name })),
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
          <Button loading={submitting} onClick={handleSubmit(onSubmit)}>
            Assigner
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Conflict errors */}
        {conflictErrors.length > 0 && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3
                          dark:border-red-800 dark:bg-red-900/20">
            {conflictErrors.map((err, i) => (
              <p key={i} className="text-xs text-red-600 dark:text-red-400">
                ⚠ {err}
              </p>
            ))}
          </div>
        )}

        <Select
          label="Employé"
          required
          placeholder="— Sélectionnez un employé —"
          options={employeeOptions}
          error={errors.user_id?.message}
          {...register('user_id')}
        />

        <Select
          label="Shift"
          required
          placeholder="— Sélectionnez un shift —"
          options={shiftOptions}
          error={errors.shift_id?.message}
          {...register('shift_id')}
        />

        <Select
          label="Équipe (optionnel)"
          options={teamOptions}
          {...register('team_id')}
        />

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