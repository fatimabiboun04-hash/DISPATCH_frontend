import { useEffect, useState }      from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion }                   from 'framer-motion'
import { Monitor } from 'lucide-react'
import { fetchDevicesThunk }        from '../../features/devices/deviceThunks'
import {
  selectDeviceList,
  selectDeviceMeta,
  selectDeviceLoading,
  selectDeviceError,
} from '../../features/devices/deviceSelectors'
import DeviceStatusBadge from './DeviceStatusBadge'
import DeviceActions     from './DeviceActions'
import { Avatar, Skeleton, EmptyState, ErrorState, Pagination } from '../ui'
import { formatRelative } from '../../utils/formatters'

/**
 * DeviceTable — paginated list of registered devices.
 *
 * Backend GET /v1/devices: paginate(20) with user loaded.
 *
 * Device model fields: id, user_id, fingerprint, name, is_trusted,
 *   trusted_at, last_used_at
 *
 * IMPORTANT: Device has NO browser/os/ip columns.
 * `name` contains the full user-agent string from check-in.
 * We extract a short label from it for display.
 */

/**
 * Extract a short readable label from a user-agent string.
 * name field contains raw user-agent from device_fingerprint registration.
 */
const getDeviceLabel = (name) => {
  if (!name) return 'Appareil inconnu'
  const ua = name.toLowerCase()
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    if (ua.includes('android'))    return '📱 Android'
    if (ua.includes('iphone'))     return '📱 iPhone'
    return '📱 Mobile'
  }
  if (ua.includes('chrome'))  return '🌐 Chrome'
  if (ua.includes('firefox')) return '🌐 Firefox'
  if (ua.includes('safari'))  return '🌐 Safari'
  if (ua.includes('edge'))    return '🌐 Edge'
  if (ua.startsWith('web-'))  return '🌐 Web Browser'
  return name.slice(0, 30)
}

const DeviceTable = ({ onPageChange }) => {
  const dispatch = useDispatch()
  const devices  = useSelector(selectDeviceList)
  const meta     = useSelector(selectDeviceMeta)
  const loading  = useSelector(selectDeviceLoading)
  const error    = useSelector(selectDeviceError)

  if (loading && devices.length === 0) {
    return (
      <div className="rounded-xl border border-surface-200 bg-white
                      dark:border-dark-600 dark:bg-dark-700">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i}
               className="flex items-center gap-4 px-4 py-3.5
                          border-b border-surface-100 last:border-0
                          dark:border-dark-600">
            <Skeleton.Circle size="h-8 w-8" />
            <Skeleton.Line width="w-28" height="h-3" />
            <Skeleton.Line width="w-36" height="h-3" />
            <Skeleton.Line width="w-20" height="h-5 rounded-full" />
            <Skeleton.Line width="w-24" height="h-7 rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  if (error)            return <ErrorState message={error} />
  if (devices.length === 0) {
    return (
      <EmptyState
        icon={Monitor}
        title="Aucun appareil enregistré"
        description="Les appareils apparaissent ici lors du premier pointage de l'employé."
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-xl border border-surface-200
                      bg-white dark:border-dark-600 dark:bg-dark-700">
        <table className="w-full min-w-full">
          <thead>
            <tr className="border-b border-surface-100 bg-surface-50
                           dark:border-dark-600 dark:bg-dark-800">
              {['Employé', 'Appareil', 'Empreinte', 'Dernière activité', 'Statut', 'Actions']
                .map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-2xs font-semibold
                                          uppercase tracking-wider text-slate-500
                                          dark:text-slate-400">
                    {h}
                  </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-surface-100 dark:divide-dark-600">
            {devices.map((device, i) => (
              <motion.tr
                key={device.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="group transition-colors hover:bg-surface-50
                           dark:hover:bg-dark-600"
              >
                {/* Employee */}
                <td className="px-4 py-3.5">
                  {device.user ? (
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        src={device.user.avatar_url}
                        name={device.user.name}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium
                                      text-slate-800 dark:text-slate-100">
                          {device.user.name}
                        </p>
                        <p className="text-2xs text-slate-400 truncate max-w-28">
                          {device.user.email}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400">—</span>
                  )}
                </td>

                {/* Device name (from user-agent) */}
                <td className="px-4 py-3.5">
                  <p className="text-sm text-slate-700 dark:text-slate-200">
                    {getDeviceLabel(device.name)}
                  </p>
                  {device.name && (
                    <p className="mt-0.5 max-w-48 truncate text-2xs text-slate-400"
                       title={device.name}>
                      {device.name}
                    </p>
                  )}
                </td>

                {/* Fingerprint */}
                <td className="px-4 py-3.5">
                  <code className="text-2xs font-mono text-slate-500
                                   dark:text-slate-400 truncate max-w-28 block">
                    {device.fingerprint?.slice(0, 16)}…
                  </code>
                </td>

                {/* Last activity */}
                <td className="px-4 py-3.5">
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {device.last_used_at
                      ? formatRelative(device.last_used_at)
                      : '—'
                    }
                  </p>
                  {device.trusted_at && (
                    <p className="text-2xs text-emerald-500 mt-0.5">
                      Approuvé {formatRelative(device.trusted_at)}
                    </p>
                  )}
                </td>

                {/* Status */}
                <td className="px-4 py-3.5">
                  <DeviceStatusBadge isTrusted={device.is_trusted} />
                </td>

                {/* Actions */}
                <td className="px-4 py-3.5">
                  <DeviceActions device={device} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && meta.last_page > 1 && (
        <Pagination
          currentPage={meta.current_page}
          lastPage={meta.last_page}
          total={meta.total}
          perPage={meta.per_page}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}

export default DeviceTable