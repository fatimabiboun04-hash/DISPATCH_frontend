import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { createTaskThunk } from '../../features/tasks/taskThunks'
import { selectTasksSubmitting, selectTasksSubmitError } from '../../features/tasks/taskSelectors'
import { clearSubmitError } from '../../features/tasks/taskSlice'
import { Modal, Input, Select, Button } from '../ui'
import { formatDate } from '../../utils/formatters'
import axiosInstance from '../../services/axiosInstance'
import { API } from '../../constants/apiRoutes'
import toast from 'react-hot-toast'

const schema = z.object({
  user_id: z.string().min(1, 'Sélectionnez un employé'),
  planning_id: z.string().min(1, 'Planning requis'),
  title: z.string().min(2, 'Le titre est requis'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  due_date: z.string().optional(),
})

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Basse' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'high', label: 'Haute' },
  { value: 'urgent', label: 'Urgente' },
]

const QuickAddTaskModal = ({
  open,
  onClose,
  date,
  employees = [],
  planningId,
  onSuccess,
}) => {
  const dispatch = useDispatch()
  const submitting = useSelector(selectTasksSubmitting)
  const submitError = useSelector(selectTasksSubmitError)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  const selectedUserId = watch('user_id')

  // Fetch plannings for the selected employee (only if no planningId provided)
  const [planningOptions, setPlanningOptions] = useState([])
  const [planningLoading, setPlanningLoading] = useState(false)

  useEffect(() => {
    if (open) {
      dispatch(clearSubmitError())
      reset({
        user_id: '',
        planning_id: planningId ? String(planningId) : '',
        title: '',
        description: '',
        priority: 'medium',
        due_date: date || '',
      })
    }
  }, [open, dispatch, reset, date, planningId])

  useEffect(() => {
    if (planningId) return
    if (!selectedUserId) {
      setPlanningOptions([])
      return
    }
    setPlanningLoading(true)
    axiosInstance.get(API.PLANNING.LIST, {
      params: { user_id: selectedUserId, per_page: 20 },
    }).then((res) => {
      const data = res.data?.data || []
      setPlanningOptions(data.map((p) => ({
        value: String(p.id),
        label: `${p.date} — ${p.shift?.name || ''}`,
      })))
    }).catch(() => {}).finally(() => setPlanningLoading(false))
  }, [selectedUserId, planningId])

  const employeeOptions = [
    { value: '', label: '— Sélectionner un employé —' },
    ...employees.map((e) => ({
      value: String(e.id),
      label: e.name,
    })),
  ]

  const onSubmit = async (formData) => {
    const payload = {
      user_id: Number(formData.user_id),
      planning_id: Number(formData.planning_id),
      title: formData.title,
      description: formData.description || undefined,
      priority: formData.priority,
      due_date: formData.due_date || date || undefined,
    }
    const result = await dispatch(createTaskThunk(payload))
    if (createTaskThunk.fulfilled.match(result)) {
      toast.success('Tâche créée')
      onSuccess?.()
      onClose()
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Ajouter une tâche"
      subtitle={date ? `Pour le ${formatDate(date, 'EEEE d MMMM yyyy')}` : ''}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Annuler
          </Button>
          <Button loading={submitting} onClick={handleSubmit(onSubmit)}>
            Créer la tâche
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {submitError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-xs text-red-600 dark:text-red-400">{submitError}</p>
          </div>
        )}

        <Select
          label="Employé"
          required
          options={employeeOptions}
          error={errors.user_id?.message}
          {...register('user_id')}
        />

        {!planningId && (
          <Select
            label="Planning"
            required
            options={[
              { value: '', label: planningLoading ? 'Chargement...' : '— Sélectionner un planning —' },
              ...planningOptions,
            ]}
            error={errors.planning_id?.message}
            {...register('planning_id')}
          />
        )}

        <Input
          label="Titre"
          required
          placeholder="Intitulé de la tâche"
          error={errors.title?.message}
          {...register('title')}
        />

        <Input
          label="Description"
          placeholder="Détails supplémentaires…"
          error={errors.description?.message}
          {...register('description')}
        />

        <Select
          label="Priorité"
          options={PRIORITY_OPTIONS}
          {...register('priority')}
        />

        <Input
          label="Date d'échéance"
          type="date"
          {...register('due_date')}
        />
      </div>
    </Modal>
  )
}

export default QuickAddTaskModal
