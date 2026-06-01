import { useDispatch, useSelector } from 'react-redux'
import { Shield, ShieldOff }         from 'lucide-react'
import { trustDeviceThunk, untrustDeviceThunk } from '../../features/devices/deviceThunks'
import { selectDeviceActionLoading }             from '../../features/devices/deviceSelectors'
import { Button, Tooltip }           from '../ui'
import toast                         from 'react-hot-toast'

/**
 * DeviceActions — trust / untrust buttons for a device row.
 *
 * Backend:
 *   POST /v1/devices/{id}/trust   → sets is_trusted=true, trusted_at=now()
 *   POST /v1/devices/{id}/untrust → sets is_trusted=false, trusted_at=null
 *
 * Both return: successResponse($device->load('user'))
 */
const DeviceActions = ({ device }) => {
  const dispatch     = useDispatch()
  const actionLoading= useSelector(selectDeviceActionLoading)
  const isLoading    = actionLoading[device.id] || false

  const handleTrust = async () => {
    const result = await dispatch(trustDeviceThunk(device.id))
    if (trustDeviceThunk.fulfilled.match(result)) {
      toast.success(`Appareil approuvé — ${device.name?.slice(0, 30)}`)
    } else {
      toast.error('Erreur lors de l\'approbation')
    }
  }

  const handleUntrust = async () => {
    const result = await dispatch(untrustDeviceThunk(device.id))
    if (untrustDeviceThunk.fulfilled.match(result)) {
      toast.success('Approbation révoquée')
    } else {
      toast.error('Erreur lors de la révocation')
    }
  }

  if (device.is_trusted) {
    return (
      <Tooltip content="Révoquer l'approbation de cet appareil">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ShieldOff className="h-3.5 w-3.5" />}
          loading={isLoading}
          onClick={handleUntrust}
          className="text-red-400 hover:bg-red-50 hover:text-red-600
                     dark:hover:bg-red-900/20"
        >
          Révoquer
        </Button>
      </Tooltip>
    )
  }

  return (
    <Tooltip content="Approuver cet appareil pour réduire les alertes de pointage">
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<Shield className="h-3.5 w-3.5" />}
        loading={isLoading}
        onClick={handleTrust}
        className="text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600
                   dark:hover:bg-emerald-900/20"
      >
        Approuver
      </Button>
    </Tooltip>
  )
}

export default DeviceActions