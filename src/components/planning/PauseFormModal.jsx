import { useEffect } from 'react'
import { useForm }   from 'react-hook-form'
import { z }         from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch, useSelector } from 'react-redux'
import { createPauseThunk, updatePauseThunk } from '../../features/pauses/pauseThunks'
import {
  selectPauseSubmitting,
  selectPauseSubmitError,
} from '../../features/pauses/pauseSelectors'
import { clearPauseError } from '../../features/pauses/pauseSlice'
import { Modal, Input, Select, Button, FormField } from '../ui'
import toast from 'react-hot-toast'

/**
 * PauseFormModal — create / edit pause for a planning record.
 *
 * Backend validation:
 *   pause_start: required|date_format:H:i
 *   pause_end:   required|date_format:H:i|after:pause_start
 *   user_id:     required_without:team_id
 *   team_id:     required_without:user_id
 *
 * pause_start/pause_end sent as 'HH:mm' strings.
 * On edit, only pause_start and pause_end can be changed
 * (PauseService.update only accepts time window changes).
 */

const schema = z.object({
  pause_start: z.string().regex(/^\d{2}:\d{2}$/, 'Format: HH:MM'),
  pause_end:   z.string().regex(/^\d{2}:\d{2}$/, 'Format: HH:MM'),
  target_type: z.enum(['user', 'team']).optional(),
  user_id:     z.string().optional(),
  team_id:     z.string().optional(),
}).refine(
  (d) => d.pause_end > d.pause_start,
  { message: 'L\'heure de fin doit être après l\'heure de début', path: ['pause_end'] }
)

const PauseFormModal = ({
  open,
  onClose,
  planningId,
  pause       = null,     // null = create, object = edit
  users       = [],       // employees on this planning
  teams       = [],       // teams on this planning
  shiftStart  = '09:00',  // for default pre-fill
  shiftEnd    = '17:00',
  onSuccess,
}) => {
  const dispatch    = useDispatch()
  const submitting  = useSelector(selectPauseSubmitting)
  const submitError = useSelector(selectPauseSubmitError)
  const isEdit      = !!pause

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  const targetType = watch('target_type')

  useEffect(() => {
    if (open) {
      dispatch(clearPauseError())
      if (isEdit) {
        reset({
          pause_start: pause.pause_start || '12:00',
          pause_end:   pause.pause_end   || '13:00',
          target_type: pause.user_id ? 'user' : 'team',
          user_id:     pause.user_id ? String(pause.user_id) : '',
          team_id:     pause.team_id ? String(pause.team_id) : '',
        })
      } else {
        // Default: lunch break midpoint
        const [sh, sm]   = shiftStart.split(':').map(Number)
        const [eh, em]   = shiftEnd.split(':').map(Number)
        const midStart   = Math.floor((sh * 60 + sm + eh * 60 + em) / 2 / 60)
        const midStartM  = Math.floor((sh * 60 + sm + eh * 60 + em) / 2 % 60)
        const defStart   = `${String(midStart).padStart(2,'0')}:${String(midStartM).padStart(2,'0')}`
        const defEnd     = `${String(midStart + 1).padStart(2,'0')}:${String(midStartM).padStart(2,'0')}`

        reset({
          pause_start: defStart,
          pause_end:   defEnd,
          target_type: 'user',
          user_id:     users[0] ? String(users[0].id) : '',
          team_id:     '',
        })
      }
    }
  }, [open, isEdit, pause, shiftStart, shiftEnd, reset, dispatch])

  const onSubmit = async (formData) => {
    if (isEdit) {
      // Update: only time window can change
      const result = await dispatch(updatePauseThunk({
        pauseId:    pause.id,
        planningId,
        data: {
          pause_start: formData.pause_start,
          pause_end:   formData.pause_end,
        },
      }))
      if (updatePauseThunk.fulfilled.match(result)) {
        toast.success('Pause mise à jour')
        onSuccess?.()
        onClose()
      }
    } else {
      // Create: include user_id OR team_id
      const payload = {
        planning_id: planningId,
        pause_start: formData.pause_start,
        pause_end:   formData.pause_end,
        ...(formData.target_type === 'team'
          ? { team_id: Number(formData.team_id) }
          : { user_id: Number(formData.user_id) }
        ),
      }
      const result = await dispatch(createPauseThunk({ planningId, data: payload }))
      if (createPauseThunk.fulfilled.match(result)) {
        const count = Array.isArray(result.payload.data)
          ? result.payload.data.length
          : 1
        toast.success(`${count} pause(s) créée(s)`)
        onSuccess?.()
        onClose()
      }
    }
  }

  const userOptions  = users.map((u) => ({ value: String(u.id), label: u.name }))
  const teamOptions  = teams.map((t) => ({ value: String(t.id), label: t.name }))
  const targetOptions = [
    { value: 'user', label: 'Employé spécifique' },
    { value: 'team', label: 'Toute l\'équipe' },
  ]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Modifier la pause' : 'Ajouter une pause'}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Annuler
          </Button>
          <Button loading={submitting} onClick={handleSubmit(onSubmit)}>
            {isEdit ? 'Enregistrer' : 'Créer la pause'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {submitError && (
          <div className="rounded-xl bg-red-50 px-3 py-2.5 text-xs
                          text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {submitError}
          </div>
        )}

        {/* Time window */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Début pause"
            type="time"
            required
            error={errors.pause_start?.message}
            {...register('pause_start')}
          />
          <Input
            label="Fin pause"
            type="time"
            required
            error={errors.pause_end?.message}
            {...register('pause_end')}
          />
        </div>

        {/* Target — only on create */}
        {!isEdit && (
          <>
            <Select
              label="Appliquer à"
              options={targetOptions}
              {...register('target_type')}
            />
            {targetType === 'user' ? (
              <Select
                label="Employé"
                required
                placeholder="— Sélectionner —"
                options={userOptions}
                error={errors.user_id?.message}
                {...register('user_id')}
              />
            ) : (
              <Select
                label="Équipe"
                required
                placeholder="— Sélectionner —"
                options={teamOptions}
                error={errors.team_id?.message}
                {...register('team_id')}
              />
            )}
          </>
        )}

        {/* Info note */}
        <div className="rounded-xl bg-surface-50 px-3 py-2.5
                        dark:bg-dark-600">
          <p className="text-2xs text-slate-500 dark:text-slate-400">
            ℹ La pause doit être dans les horaires du shift.
            Elle n'est pas comptée dans les heures travaillées.
          </p>
        </div>
      </div>
    </Modal>
  )
}

export default PauseFormModal