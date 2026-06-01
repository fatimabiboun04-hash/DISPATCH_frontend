import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch, useSelector } from 'react-redux'
import { Eye, EyeOff } from 'lucide-react'
import {
  createEmployeeThunk,
  updateEmployeeThunk,
} from '../../features/employees/employeeThunks'
import {
  selectEmployeeSubmitting,
  selectEmployeeSubmitError,
} from '../../features/employees/employeeSelectors'
import { clearSubmitError } from '../../features/employees/employeeSlice'
import { Modal, Input, Select, Button, FormField, SkillBadge } from '../ui'
import { cn } from '../../utils/cn'
import toast from 'react-hot-toast'

/**
 * EmployeeFormModal — create / edit employee.
 *
 * Fields match exactly what EmployeeController@store and @update accept:
 *   name, email, password (create only), role, phone, description,
 *   team_ids[], skill_ids[]
 *
 * teams and skills are passed as arrays of IDs.
 * Backend: employee.teams() sync(team_ids), employee.skills() sync(skill_ids)
 */

const createSchema = z.object({
  name:        z.string().min(2, 'Minimum 2 caractères'),
  email:       z.string().email('Email invalide'),
  password:    z.string().min(8, 'Minimum 8 caractères'),
  role:        z.enum(['employee', 'admin']),
  phone:       z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
})

const editSchema = z.object({
  name:        z.string().min(2, 'Minimum 2 caractères'),
  email:       z.string().email('Email invalide'),
  password:    z.string().min(8, 'Minimum 8 caractères').optional().or(z.literal('')),
  phone:       z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
})

const ROLE_OPTIONS = [
  { value: 'employee', label: 'Employé' },
  { value: 'admin',    label: 'Administrateur' },
]

const EmployeeFormModal = ({
  open,
  onClose,
  employee = null,   // null = create mode, object = edit mode
  teams    = [],     // available teams [{ id, name }]
  skills   = [],     // available skills [{ id, name, category }]
  onSuccess,
}) => {
  const dispatch    = useDispatch()
  const submitting  = useSelector(selectEmployeeSubmitting)
  const submitError = useSelector(selectEmployeeSubmitError)
  const isEdit      = !!employee

  const [showPw,       setShowPw]       = useState(false)
  const [selectedTeams,  setSelectedTeams]  = useState([])
  const [selectedSkills, setSelectedSkills] = useState([])

  const schema = isEdit ? editSchema : createSchema

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  // Populate form when editing
  useEffect(() => {
    if (open) {
      dispatch(clearSubmitError())
      if (isEdit) {
        reset({
          name:        employee.name        || '',
          email:       employee.email       || '',
          password:    '',
          phone:       employee.phone       || '',
          description: employee.description || '',
        })
        setSelectedTeams(employee.teams?.map((t) => t.id) || [])
        setSelectedSkills(employee.skills?.map((s) => s.id) || [])
      } else {
        reset({ name: '', email: '', password: '', role: 'employee', phone: '', description: '' })
        setSelectedTeams([])
        setSelectedSkills([])
      }
    }
  }, [open, isEdit, employee, reset, dispatch])

  const toggleTeam = (id) =>
    setSelectedTeams((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )

  const toggleSkill = (id) =>
    setSelectedSkills((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )

  const onSubmit = async (formData) => {
    const payload = {
      ...formData,
      team_ids:  selectedTeams,
      skill_ids: selectedSkills,
    }
    // Remove empty password on edit
    if (isEdit && !payload.password) delete payload.password

    const action = isEdit
      ? updateEmployeeThunk({ id: employee.id, data: payload })
      : createEmployeeThunk(payload)

    const result = await dispatch(action)

    if (
      (isEdit  && updateEmployeeThunk.fulfilled.match(result)) ||
      (!isEdit && createEmployeeThunk.fulfilled.match(result))
    ) {
      toast.success(isEdit ? 'Employé mis à jour' : 'Employé créé')
      onSuccess?.(result.payload)
      onClose()
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Modifier l\'employé' : 'Nouvel employé'}
      subtitle={isEdit ? employee.name : 'Remplissez les informations ci-dessous'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Annuler
          </Button>
          <Button
            loading={submitting}
            onClick={handleSubmit(onSubmit)}
          >
            {isEdit ? 'Enregistrer' : 'Créer l\'employé'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">

        {/* API error */}
        {submitError && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600
                          dark:bg-red-900/20 dark:text-red-400">
            {submitError}
          </div>
        )}

        {/* Name + Email */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nom complet"
            required
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Email"
            type="email"
            required
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        {/* Password + Role */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={isEdit ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
            required={!isEdit}
            type={showPw ? 'text' : 'password'}
            error={errors.password?.message}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPw
                  ? <EyeOff className="h-4 w-4" />
                  : <Eye    className="h-4 w-4" />
                }
              </button>
            }
            {...register('password')}
          />
          {!isEdit && (
            <Select
              label="Rôle"
              required
              options={ROLE_OPTIONS}
              error={errors.role?.message}
              {...register('role')}
            />
          )}
        </div>

        {/* Phone + Description */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Téléphone"
            type="tel"
            placeholder="+212 600 000 000"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Input
            label="Description / Poste"
            placeholder="Ex: Responsable Support"
            error={errors.description?.message}
            {...register('description')}
          />
        </div>

        {/* Teams */}
        {teams.length > 0 && (
          <FormField label="Équipes">
            <div className="flex flex-wrap gap-2 mt-1">
              {teams.map((team) => {
                const selected = selectedTeams.includes(team.id)
                return (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => toggleTeam(team.id)}
                    className={cn(
                      'rounded-lg border px-3 py-1.5 text-xs font-medium',
                      'transition-all duration-150',
                      selected
                        ? 'border-brand-400 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                        : 'border-surface-200 bg-white text-slate-600 hover:border-brand-300 dark:border-dark-400 dark:bg-dark-700 dark:text-slate-300'
                    )}
                  >
                    {team.name}
                    {selected && ' ✓'}
                  </button>
                )
              })}
            </div>
          </FormField>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <FormField label="Compétences">
            <div className="flex flex-wrap gap-2 mt-1">
              {skills.map((skill) => {
                const selected = selectedSkills.includes(skill.id)
                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => toggleSkill(skill.id)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium',
                      'transition-all duration-150',
                      selected
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'border-surface-200 bg-white text-slate-600 hover:border-emerald-300 dark:border-dark-400 dark:bg-dark-700'
                    )}
                  >
                    {skill.name}
                    {selected && ' ✓'}
                  </button>
                )
              })}
            </div>
          </FormField>
        )}
      </div>
    </Modal>
  )
}

export default EmployeeFormModal