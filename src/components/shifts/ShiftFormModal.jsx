import { useEffect, useState } from 'react'
import { useForm }              from 'react-hook-form'
import { z }                    from 'zod'
import { zodResolver }          from '@hookform/resolvers/zod'
import { useDispatch, useSelector } from 'react-redux'
import { createShiftThunk, updateShiftThunk } from '../../features/shifts/shiftThunks'
import {
  selectShiftsSubmitting,
  selectShiftsSubmitError,
} from '../../features/shifts/shiftSelectors'
import { clearSubmitError } from '../../features/shifts/shiftSlice'
import { Modal, Input, Select, Button, FormField, Switch } from '../ui'
import { getShiftColor }    from '../../constants/shiftColors'
import { cn }               from '../../utils/cn'
import toast                from 'react-hot-toast'

/**
 * ShiftFormModal — create / edit shift.
 *
 * Fields sent to backend (fix #12 applied — type, break_minutes, color added):
 *   name        → required string
 *   type        → required enum: day|night|conge|absence|emergency
 *   start_time  → required H:i
 *   end_time    → required H:i
 *   break_minutes → optional integer (default 0)
 *   color       → optional hex string (overrides type default)
 *   is_active   → optional boolean (default true)
 *
 * start_time/end_time: backend casts as datetime:H:i → receives 'HH:mm' strings
 */

const TYPE_OPTIONS = [
  { value: 'day',       label: '☀️  Jour'      },
  { value: 'night',     label: '🌙  Nuit'      },
  { value: 'conge',     label: '🏖️  Congé'     },
  { value: 'absence',   label: '❌  Absence'   },
  { value: 'emergency', label: '🚨  Urgence'   },
]

const schema = z.object({
  name:          z.string().min(1, 'Le nom est requis').max(255),
  type:          z.enum(
    ['day', 'night', 'conge', 'absence', 'emergency'],
    { errorMap: () => ({ message: 'Type invalide' }) }
  ),
  start_time:    z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Format requis: HH:MM'),
  end_time:      z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Format requis: HH:MM'),
  break_minutes: z
    .number({ invalid_type_error: 'Nombre requis' })
    .int()
    .min(0)
    .max(480)
    .optional()
    .default(0),
})

const ShiftFormModal = ({
  open,
  onClose,
  shift    = null,    // null = create, object = edit
  onSuccess,
}) => {
  const dispatch    = useDispatch()
  const submitting  = useSelector(selectShiftsSubmitting)
  const submitError = useSelector(selectShiftsSubmitError)
  const isEdit      = !!shift

  // Color: either user-picked hex or derived from type
  const [customColor, setCustomColor] = useState(null)
  const [isActive,    setIsActive]    = useState(true)
  const [previewType, setPreviewType] = useState('day')

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name:          '',
      type:          'day',
      start_time:    '09:00',
      end_time:      '17:00',
      break_minutes: 30,
    },
  })

  // Watch type to update color preview
  const watchedType = watch('type')

  useEffect(() => {
    setPreviewType(watchedType || 'day')
  }, [watchedType])

  // Populate form when editing or opening
  useEffect(() => {
    if (open) {
      dispatch(clearSubmitError())
      if (isEdit) {
        reset({
          name:          shift.name          || '',
          type:          shift.type          || 'day',
          start_time:    shift.start_time    || '09:00',
          end_time:      shift.end_time      || '17:00',
          break_minutes: shift.break_minutes ?? 30,
        })
        setPreviewType(shift.type || 'day')
        setCustomColor(shift.color || null)
        setIsActive(shift.is_active ?? true)
      } else {
        reset({
          name:          '',
          type:          'day',
          start_time:    '09:00',
          end_time:      '17:00',
          break_minutes: 30,
        })
        setPreviewType('day')
        setCustomColor(null)
        setIsActive(true)
      }
    }
  }, [open, isEdit, shift, reset, dispatch])

  // Compute effective color for preview
  const typeColor   = getShiftColor(previewType)
  const effectiveColor = customColor || typeColor.hex

  // Calculate duration preview
  const calcDuration = (start, end, breakMin) => {
    if (!start || !end) return null
    const [sh, sm] = start.split(':').map(Number)
    const [eh, em] = end.split(':').map(Number)
    let startMins = sh * 60 + sm
    let endMins   = eh * 60 + em
    if (endMins <= startMins) endMins += 24 * 60  // night shift
    const total = endMins - startMins - (breakMin || 0)
    if (total <= 0) return null
    const h = Math.floor(total / 60)
    const m = total % 60
    return m > 0 ? `${h}h ${m}min` : `${h}h`
  }

  const startVal    = watch('start_time')
  const endVal      = watch('end_time')
  const breakVal    = watch('break_minutes')
  const durationStr = calcDuration(startVal, endVal, breakVal)

  const onSubmit = async (formData) => {
    const payload = {
      name:          formData.name,
      type:          formData.type,
      start_time:    formData.start_time,
      end_time:      formData.end_time,
      break_minutes: formData.break_minutes ?? 0,
      color:         customColor || null,
      is_active:     isActive,
    }

    const action = isEdit
      ? updateShiftThunk({ id: shift.id, data: payload })
      : createShiftThunk(payload)

    const result = await dispatch(action)

    const fulfilled = isEdit
      ? updateShiftThunk.fulfilled.match(result)
      : createShiftThunk.fulfilled.match(result)

    if (fulfilled) {
      toast.success(isEdit ? 'Shift mis à jour' : 'Shift créé')
      onSuccess?.(result.payload)
      onClose()
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Modifier le shift' : 'Nouveau shift'}
      subtitle={isEdit ? shift.name : 'Définissez les paramètres du shift'}
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
            {isEdit ? 'Enregistrer' : 'Créer le shift'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">

        {/* API error */}
        {submitError && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm
                          text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {submitError}
          </div>
        )}

        {/* Live preview banner */}
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl p-3',
            typeColor.bg, typeColor.border, 'border'
          )}
        >
          <div
            className="h-8 w-8 flex-shrink-0 rounded-lg shadow-sm"
            style={{ backgroundColor: effectiveColor }}
          />
          <div>
            <p className={cn('text-sm font-semibold', typeColor.text)}>
              {watch('name') || 'Nouveau shift'}
            </p>
            <p className={cn('text-2xs', typeColor.text, 'opacity-70')}>
              {startVal} → {endVal}
              {durationStr && ` · ${durationStr}`}
              {(breakVal > 0) && ` (pause: ${breakVal}min)`}
            </p>
          </div>
        </div>

        {/* Name + Type row */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nom du shift"
            required
            placeholder="Ex: Matin Standard"
            error={errors.name?.message}
            {...register('name')}
          />
          <Select
            label="Type"
            required
            options={TYPE_OPTIONS}
            error={errors.type?.message}
            {...register('type')}
          />
        </div>

        {/* Time row */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Heure de début"
            type="time"
            required
            error={errors.start_time?.message}
            {...register('start_time')}
          />
          <Input
            label="Heure de fin"
            type="time"
            required
            error={errors.end_time?.message}
            {...register('end_time')}
          />
        </div>

        {/* Break + Color row */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Pause (minutes)"
            type="number"
            min="0"
            max="480"
            placeholder="30"
            error={errors.break_minutes?.message}
            {...register('break_minutes', { valueAsNumber: true })}
          />

          {/* Custom color override */}
          <FormField
            label="Couleur personnalisée"
            helper="Laissez vide pour utiliser la couleur du type"
          >
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 flex-shrink-0 rounded-lg border-2
                           border-surface-200 shadow-sm"
                style={{ backgroundColor: effectiveColor }}
              />
              <div className="flex flex-1 gap-2">
                <input
                  type="color"
                  value={customColor || typeColor.hex}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="h-10 flex-1 cursor-pointer rounded-lg border
                             border-surface-200 bg-white p-1
                             dark:border-dark-400 dark:bg-dark-700"
                />
                {customColor && (
                  <button
                    type="button"
                    onClick={() => setCustomColor(null)}
                    className="rounded-lg border border-surface-200 px-2 text-xs
                               text-slate-400 hover:text-slate-600 transition-colors
                               dark:border-dark-400 dark:hover:text-slate-300"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </FormField>
        </div>

        {/* Active toggle */}
        <div className="flex items-center justify-between rounded-xl
                        border border-surface-200 px-4 py-3
                        dark:border-dark-600">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Shift actif
            </p>
            <p className="text-xs text-slate-400">
              Les shifts inactifs n'apparaissent pas dans le planning
            </p>
          </div>
          <Switch
            checked={isActive}
            onChange={setIsActive}
          />
        </div>

        {/* Duration info */}
        {durationStr && (
          <div className="rounded-xl bg-surface-50 px-4 py-3
                          dark:bg-dark-600">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Durée effective :
              <span className="ml-1.5 font-semibold text-slate-700 dark:text-slate-200">
                {durationStr}
              </span>
              <span className="ml-1 text-slate-400">(pause déduite)</span>
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default ShiftFormModal