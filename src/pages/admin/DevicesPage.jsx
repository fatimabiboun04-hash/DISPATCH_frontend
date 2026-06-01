import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion }                   from 'framer-motion'
import { Shield, RefreshCw }        from 'lucide-react'
import { fetchDevicesThunk }        from '../../features/devices/deviceThunks'
import {
  selectDeviceList,
  selectDeviceMeta,
  selectDeviceLoading,
} from '../../features/devices/deviceSelectors'
import DeviceTable from '../../components/devices/DeviceTable'
import { Button, Badge } from '../../components/ui'

/**
 * DevicesPage — /admin/devices
 *
 * Lists all registered devices from employee check-ins.
 * Admin can trust/untrust devices.
 *
 * Backend:
 *   GET  /v1/devices          → paginate(20) with user
 *   POST /v1/devices/{id}/trust
 *   POST /v1/devices/{id}/untrust
 *
 * Device fields: id, user_id, fingerprint, name (user-agent),
 *   is_trusted, trusted_at, last_used_at
 *
 * NOTE: No browser/os/ip columns — only fingerprint + name.
 * Trusted devices reduce false positive flags on check-in.
 */
const DevicesPage = () => {
  const dispatch = useDispatch()
  const devices  = useSelector(selectDeviceList)
  const meta     = useSelector(selectDeviceMeta)
  const loading  = useSelector(selectDeviceLoading)

  const fetchDevices = useCallback((page) => {
    dispatch(fetchDevicesThunk(page ? { page } : {}))
  }, [dispatch])

  useEffect(() => {
    fetchDevices()
  }, [fetchDevices])

  const trustedCount   = devices.filter((d) => d.is_trusted).length
  const untrustedCount = devices.filter((d) => !d.is_trusted).length

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Appareils
            </h1>
            {trustedCount > 0 && (
              <Badge variant="success">
                {trustedCount} approuvé{trustedCount > 1 ? 's' : ''}
              </Badge>
            )}
            {untrustedCount > 0 && (
              <Badge variant="default">
                {untrustedCount} non approuvé{untrustedCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-sm text-slate-400">
            Gérez les appareils enregistrés lors des pointages employés
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />}
          onClick={() => fetchDevices()}
          disabled={loading}
        >
          Actualiser
        </Button>
      </motion.div>

      {/* Trust info banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="flex items-start gap-3 rounded-xl border border-blue-200
                   bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/10"
      >
        <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
        <p className="text-xs text-blue-700 dark:text-blue-400">
          Les appareils approuvés sont moins susceptibles de déclencher des alertes
          de pointage suspect. Approuvez uniquement les appareils que vous reconnaissez.
        </p>
      </motion.div>

      {/* Table */}
      <DeviceTable onPageChange={fetchDevices} />
    </div>
  )
}

export default DevicesPage