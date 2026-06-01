import { useState } from 'react'
import { useForm }  from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { verifyFlagThunk } from '../../features/pointage/pointageThunks'
import { Modal, Button, Switch, Input, Avatar } from '../ui'
import { formatDate, formatTime } from '../../utils/formatters'
import toast from 'react-hot-toast'

const VerifyFlagModal = ({ open, onClose, pointage }) => {
  const dispatch       = useDispatch()
  const [isValid,      setIsValid]      = useState(true)
  const [submitting,   setSubmitting]   = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const onSubmit = async (data) => {
    setSubmitting(true)
    const result = await dispatch(verifyFlagThunk({
      id:       pointage.id,
      is_valid: isValid,
      notes:    data.notes || undefined,
    }))
    setSubmitting(false)
    if (verifyFlagThunk.fulfilled.match(result)) {
      toast.success(isValid ? 'Pointage validé' : 'Pointage marqué suspect')
      reset()
      onClose()
    } else {
      toast.error('Erreur lors de la vérification')
    }
  }

  if (!pointage) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Vérifier le pointage suspect"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Annuler
          </Button>
          <Button
            variant={isValid ? 'primary' : 'danger'}
            loading={submitting}
            onClick={handleSubmit(onSubmit)}
          >
            {isValid ? '✓ Valider' : '✗ Confirmer suspect'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Pointage summary */}
        <div className="flex items-center gap-3 rounded-xl border border-surface-100
                        p-3 dark:border-dark-600">
          <Avatar
            src={pointage.user?.avatar_url}
            name={pointage.user?.name}
            size="sm"
          />
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {pointage.user?.name}
            </p>
            <p className="text-xs text-slate-400">
              {formatDate(pointage.check_in_at)} à {formatTime(pointage.check_in_at)}
            </p>
          </div>
        </div>

        {/* Flag reason */}
        {pointage.flag_reason && (
          <div className="rounded-xl border border-amber-200 bg-amber-50
                          px-3 py-2.5 dark:border-amber-800 dark:bg-amber-900/20">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">
              Raison du signalement :
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-500">
              {pointage.flag_reason}
            </p>
          </div>
        )}

        {/* GPS info */}
        {pointage.gpsLog && (
          <div className="rounded-xl bg-surface-50 px-3 py-2.5 text-xs
                          text-slate-500 dark:bg-dark-600 space-y-0.5">
            <p>Distance bureau : {pointage.gpsLog.distance_from_office}m</p>
            <p>GPS valide : {pointage.gpsLog.is_valid ? '✓ Oui' : '✗ Non'}</p>
          </div>
        )}

        {/* Decision toggle */}
        <Switch
          checked={isValid}
          onChange={setIsValid}
          label={isValid
            ? '✓ Ce pointage est légitime'
            : '✗ Ce pointage est suspect'}
        />

        {/* Notes */}
        <Input
          label="Notes (optionnel)"
          placeholder="Observations de l'administrateur…"
          {...register('notes')}
        />
      </div>
    </Modal>
  )
}

export default VerifyFlagModal