import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm }    from 'react-hook-form'
import { z }          from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { FileDown, FileSpreadsheet } from 'lucide-react'
import { generateReportThunk } from '../../features/reports/reportThunks'
import {
  selectReportGenerating,
  selectGenerateError,
} from '../../features/reports/reportSelectors'
import { clearGenerateError } from '../../features/reports/reportSlice'
import ReportTypeCard from './ReportTypeCard'
import { Button, Input, FormField } from '../ui'
import { cn } from '../../utils/cn'
import toast from 'react-hot-toast'
import { useEffect } from 'react'

/**
 * ReportGenerator — form to request a new report generation.
 *
 * Backend POST /v1/reports validation:
 *   type:       required|in:weekly,monthly,custom
 *   start_date: required|date
 *   end_date:   required|date|after_or_equal:start_date
 *   file_type:  required|in:pdf,excel
 *
 * On submit: creates report with status 'queued', dispatches GenerateReportJob.
 * Returns 202.
 *
 * Auto-fills dates based on type:
 *   weekly  → current week (Mon → Sun)
 *   monthly → current month
 *   custom  → admin picks manually
 */

const today = format(new Date(), 'yyyy-MM-dd')

const schema = z.object({
  start_date: z.string().min(1, 'Date de début requise'),
  end_date:   z.string().min(1, 'Date de fin requise'),
}).refine(
  (d) => d.end_date >= d.start_date,
  { message: 'La date de fin doit être après la date de début', path: ['end_date'] }
)

const getDefaultDates = (type) => {
  const now = new Date()
  switch (type) {
    case 'weekly':
      return {
        start: format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
        end:   format(endOfWeek(now,   { weekStartsOn: 1 }), 'yyyy-MM-dd'),
      }
    case 'monthly':
      return {
        start: format(startOfMonth(now), 'yyyy-MM-dd'),
        end:   format(endOfMonth(now),   'yyyy-MM-dd'),
      }
    default:
      return { start: today, end: today }
  }
}

const ReportGenerator = ({ onSuccess }) => {
  const dispatch     = useDispatch()
  const generating   = useSelector(selectReportGenerating)
  const generateError= useSelector(selectGenerateError)

  const [reportType, setReportType] = useState('weekly')
  const [fileType,   setFileType]   = useState('pdf')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: (() => {
      const d = getDefaultDates('weekly')
      return { start_date: d.start, end_date: d.end }
    })(),
  })

  // Auto-fill dates when type changes
  useEffect(() => {
    const d = getDefaultDates(reportType)
    setValue('start_date', d.start)
    setValue('end_date',   d.end)
    dispatch(clearGenerateError())
  }, [reportType, setValue, dispatch])

  const startVal = watch('start_date')
  const endVal   = watch('end_date')

  const onSubmit = async (data) => {
    const result = await dispatch(generateReportThunk({
      type:       reportType,
      start_date: data.start_date,
      end_date:   data.end_date,
      file_type:  fileType,
    }))
    if (generateReportThunk.fulfilled.match(result)) {
      toast.success('Rapport en cours de génération — il sera disponible dans quelques secondes')
      onSuccess?.()
    }
  }

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-6
                    dark:border-dark-600 dark:bg-dark-700">
      <h3 className="mb-1 text-base font-bold text-slate-800 dark:text-slate-100">
        Générer un rapport
      </h3>
      <p className="mb-6 text-sm text-slate-400">
        Le rapport sera généré en arrière-plan et disponible au téléchargement
        une fois terminé.
      </p>

      {/* Type selection */}
      <div className="mb-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Type de rapport
        </p>
        <div className="grid grid-cols-3 gap-3">
          {(['weekly', 'monthly', 'custom']).map((type, i) => (
            <ReportTypeCard
              key={type}
              type={type}
              selected={reportType === type}
              onClick={() => setReportType(type)}
              index={i}
            />
          ))}
        </div>
      </div>

      {/* Date range */}
      <div className="mb-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Période
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Date de début"
            type="date"
            required
            error={errors.start_date?.message}
            disabled={reportType !== 'custom'}
            {...register('start_date')}
          />
          <Input
            label="Date de fin"
            type="date"
            required
            min={startVal}
            error={errors.end_date?.message}
            disabled={reportType !== 'custom'}
            {...register('end_date')}
          />
        </div>
        {reportType !== 'custom' && (
          <p className="mt-1.5 text-2xs text-slate-400">
            Les dates sont remplies automatiquement. Choisissez "Personnalisé" pour les modifier.
          </p>
        )}
      </div>

      {/* File type selection */}
      <div className="mb-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Format de fichier
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'pdf',   label: 'PDF',   icon: FileDown,        desc: 'Document prêt à imprimer' },
            { value: 'excel', label: 'Excel', icon: FileSpreadsheet, desc: 'Données analysables' },
          ].map(({ value, label, icon: Icon, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFileType(value)}
              className={cn(
                'flex items-center gap-3 rounded-xl border-2 p-3.5',
                'transition-all duration-150 text-left',
                fileType === value
                  ? 'border-brand-400 bg-brand-50 dark:border-brand-600 dark:bg-brand-900/15'
                  : 'border-surface-200 bg-white hover:border-surface-300 dark:border-dark-500 dark:bg-dark-700'
              )}
            >
              <div className={cn(
                'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg',
                fileType === value
                  ? 'bg-brand-100 dark:bg-brand-900/30'
                  : 'bg-surface-100 dark:bg-dark-600'
              )}>
                <Icon className={cn(
                  'h-4.5 w-4.5',
                  fileType === value ? 'text-brand-500' : 'text-slate-400'
                )} />
              </div>
              <div>
                <p className={cn(
                  'text-sm font-semibold',
                  fileType === value
                    ? 'text-brand-700 dark:text-brand-300'
                    : 'text-slate-600 dark:text-slate-300'
                )}>
                  {label}
                </p>
                <p className="text-2xs text-slate-400">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {generateError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3
                        text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20
                        dark:text-red-400">
          {generateError}
        </div>
      )}

      {/* Submit */}
      <Button
        fullWidth
        size="lg"
        loading={generating}
        onClick={handleSubmit(onSubmit)}
      >
        {generating ? 'Envoi en cours…' : 'Générer le rapport'}
      </Button>
    </div>
  )
}

export default ReportGenerator