import { useEffect }         from 'react'
import { useForm }           from 'react-hook-form'
import { z }                 from 'zod'
import { zodResolver }       from '@hookform/resolvers/zod'
import { useDispatch, useSelector } from 'react-redux'
import { submitLeaveRequestThunk }  from '../../features/leave/leaveThunks'
import {
  selectLeaveSubmitting,
  selectLeaveSubmitError,
} from '../../features/leave/leaveSelectors'
import { clearSubmitError }  from '../../features/leave/leaveSlice'
import { Input, Select, Button, FormField } from '../ui'
import LeaveCalendarPreview  from './LeaveCalendarPreview'
import toast                 from 'react-hot-toast'
import { format }            from 'date-fns'

/**
 * LeaveRequestForm — employee submits a new leave request.
 *
 * Backend StoreLeaveRequest rules:
 *   start_date: required, date, after_or_equal:today
 *   end_date:   required, date, after_or_equal:start_date
 *   reason:     required, string, max:1000
 *   type:       required, in:annual,sick,emergency,unpaid
 *
 * 422 overlap error: 'You already have approved leave in this date range'
 *
 * StoreLeaveRequest authorize() = isEmployee() only — correct, in employee space.
 * Gap fix #1: POST /v1/leave-requests route added for employees.
 */

const today = format(new Date(), 'yyyy-MM-dd')

const schema = z.object({
  start_date: z.string()
    .min(1, 'Date de début requise')
    .refine((d) => d >= today, { message: 'La date doit être aujourd\'hui ou dans le futur' }),
  end_date: z.string().min(1, 'Date de fin requise'),
  type: z.enum(['annual', 'sick', 'emergency', 'unpaid'], {
    errorMap: () => ({ message: 'Type de congé requis' }),
  }),
  reason: z.string().min(5, 'La raison doit contenir au moins 5 caractères').max(1000),
}).refine(
  (d) => d.end_date >= d.start_date,
  { message: 'La date de fin doit être après la date de début', path: ['end_date'] }
)

const TYPE_OPTIONS = [
  { value: 'annual',    label: '🏖️  Congé annuel'  },
  { value: 'sick',      label: '🤒  Maladie'        },
  { value: 'emergency', label: '🚨  Urgence'         },
  { value: 'unpaid',    label: '💰  Sans solde'      },
]

const LeaveRequestForm = ({ onSuccess }) => {
  const dispatch    = useDispatch()
  const submitting  = useSelector(selectLeaveSubmitting)
  const submitError = useSelector(selectLeaveSubmitError)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      start_date: today,
      end_date:   today,
      type:       'annual',
      reason:     '',
    },
  })

  const watchedStart = watch('start_date')
  const watchedEnd   = watch('end_date')

  useEffect(() => {
    dispatch(clearSubmitError())
  }, [dispatch])

  const onSubmit = async (data) => {
    const result = await dispatch(submitLeaveRequestThunk(data))
    if (submitLeaveRequestThunk.fulfilled.match(result)) {
      toast.success('Demande de congé soumise avec succès')
      reset({
        start_date: today,
        end_date:   today,
        type:       'annual',
        reason:     '',
      })
      onSuccess?.()
    }
  }

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-5
                    dark:border-dark-600 dark:bg-dark-700">
      <h3 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-100">
        Nouvelle demande de congé
      </h3>

      <div className="space-y-4">
        {/* API / overlap error */}
        {submitError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3
                          text-sm text-red-600 dark:border-red-800
                          dark:bg-red-900/20 dark:text-red-400">
            {submitError === 'You already have approved leave in this date range'
              ? 'Vous avez déjà un congé approuvé sur cette période.'
              : submitError
            }
          </div>
        )}

        {/* Date range row */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Date de début"
            type="date"
            required
            min={today}
            error={errors.start_date?.message}
            {...register('start_date')}
          />
          <Input
            label="Date de fin"
            type="date"
            required
            min={watchedStart || today}
            error={errors.end_date?.message}
            {...register('end_date')}
          />
        </div>

        {/* Calendar preview */}
        <LeaveCalendarPreview
          startDate={watchedStart}
          endDate={watchedEnd}
        />

        {/* Type */}
        <Select
          label="Type de congé"
          required
          options={TYPE_OPTIONS}
          error={errors.type?.message}
          {...register('type')}
        />

        {/* Reason */}
        <FormField
          label="Motif"
          required
          error={errors.reason?.message}
        >
          <textarea
            {...register('reason')}
            rows={3}
            placeholder="Décrivez la raison de votre demande de congé…"
            className="w-full resize-none rounded-xl border border-surface-200
                       bg-white px-3 py-2.5 text-sm text-slate-700
                       placeholder-slate-400 outline-none transition-all
                       focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20
                       dark:border-dark-400 dark:bg-dark-700 dark:text-slate-200"
          />
        </FormField>

        <Button
          fullWidth
          loading={submitting}
          type="button"
          onClick={handleSubmit(onSubmit)}
        >
          Soumettre la demande
        </Button>
      </div>
    </div>
  )
}

export default LeaveRequestForm