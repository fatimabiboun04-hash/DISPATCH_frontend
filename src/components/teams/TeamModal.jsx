import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch, useSelector } from 'react-redux'
import { createTeamThunk, updateTeamThunk } from '../../features/teams/teamThunks'
import {
  selectTeamSubmitting,
  selectTeamSubmitError,
} from '../../features/teams/teamSelectors'
import { clearSubmitError } from '../../features/teams/teamSlice'
import { Modal, Input, Button, FormField } from '../ui'
import toast from 'react-hot-toast'

/**
 * TeamModal — create / edit team.
 *
 * Fields match TeamController@store / @update exactly:
 *   name (required), description (optional), color (optional), leader_id (optional)
 *
 * Color: native color input renders a hex picker.
 * Leader: dropdown of employees passed as prop.
 */

const schema = z.object({
  name:        z.string().min(1, 'Le nom est requis').max(255),
  description: z.string().optional().or(z.literal('')),
  color:       z.string().optional(),
  leader_id:   z.string().optional().or(z.literal('')),
})

const TeamModal = ({
  open,
  onClose,
  team      = null,   // null = create, object = edit
  employees = [],     // for leader dropdown [{ id, name }]
  onSuccess,
}) => {
  const dispatch    = useDispatch()
  const submitting  = useSelector(selectTeamSubmitting)
  const submitError = useSelector(selectTeamSubmitError)
  const isEdit      = !!team

  // Default color for new teams
  const [color, setColor] = useState('#6172f3')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (open) {
      dispatch(clearSubmitError())
      if (isEdit) {
        reset({
          name:        team.name        || '',
          description: team.description || '',
          color:       team.color       || '#6172f3',
          leader_id:   team.leader_id   ? String(team.leader_id) : '',
        })
        setColor(team.color || '#6172f3')
      } else {
        reset({ name: '', description: '', color: '#6172f3', leader_id: '' })
        setColor('#6172f3')
      }
    }
  }, [open, isEdit, team, reset, dispatch])

  const onSubmit = async (formData) => {
    const payload = {
      name:        formData.name,
      description: formData.description || null,
      color:       color,
      leader_id:   formData.leader_id ? Number(formData.leader_id) : null,
    }

    const action = isEdit
      ? updateTeamThunk({ id: team.id, data: payload })
      : createTeamThunk(payload)

    const result = await dispatch(action)

    const fulfilled = isEdit
      ? updateTeamThunk.fulfilled.match(result)
      : createTeamThunk.fulfilled.match(result)

    if (fulfilled) {
      toast.success(isEdit ? 'Équipe mise à jour' : 'Équipe créée')
      onSuccess?.(result.payload)
      onClose()
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Modifier l\'équipe' : 'Nouvelle équipe'}
      subtitle={isEdit ? team.name : 'Créez une nouvelle équipe'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Annuler
          </Button>
          <Button
            loading={submitting}
            onClick={handleSubmit(onSubmit)}
          >
            {isEdit ? 'Enregistrer' : 'Créer l\'équipe'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">

        {/* API error */}
        {submitError && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm
                          text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {submitError}
          </div>
        )}

        {/* Name */}
        <Input
          label="Nom de l'équipe"
          required
          placeholder="Ex: Équipe Support"
          error={errors.name?.message}
          {...register('name')}
        />

        {/* Description */}
        <Input
          label="Description"
          placeholder="Description optionnelle"
          error={errors.description?.message}
          {...register('description')}
        />

        {/* Color + Leader row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Color picker */}
          <FormField label="Couleur de l'équipe">
            <div className="flex items-center gap-3">
              {/* Color swatch preview */}
              <div
                className="h-10 w-10 flex-shrink-0 rounded-lg border-2
                           border-surface-200 shadow-sm transition-colors"
                style={{ backgroundColor: color }}
              />
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-full cursor-pointer rounded-lg border
                           border-surface-200 bg-white p-1
                           dark:border-dark-400 dark:bg-dark-700"
              />
            </div>
          </FormField>

          {/* Leader dropdown */}
          {employees.length > 0 && (
            <div>
              <label className="mb-1.5 block text-xs font-medium
                                text-slate-700 dark:text-slate-300">
                Responsable (optionnel)
              </label>
              <select
                {...register('leader_id')}
                className="h-10 w-full appearance-none rounded-lg border
                           border-surface-200 bg-white px-3 text-sm
                           text-slate-700 outline-none transition-all
                           focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20
                           dark:border-dark-400 dark:bg-dark-700 dark:text-slate-200"
              >
                <option value="">— Aucun responsable —</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={String(emp.id)}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default TeamModal