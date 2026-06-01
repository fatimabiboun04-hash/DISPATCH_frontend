import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn, LogOut, MapPin, AlertCircle } from 'lucide-react'
import { checkInThunk, checkOutThunk } from '../../features/pointage/pointageThunks'
import {
  selectIsCheckedIn,
  selectCheckInLoading,
  selectCheckOutLoading,
  selectCheckInError,
  selectCheckOutError,
  selectLastAction,
} from '../../features/pointage/pointageSelectors'
import { clearCheckInError, clearCheckOutError, clearLastAction } from '../../features/pointage/pointageSlice'
import { getStableDeviceFingerprint } from '../../utils/deviceFingerprint'
import { Button } from '../ui'
import { cn } from '../../utils/cn'
import toast from 'react-hot-toast'

/**
 * PointageActions — the primary check-in / check-out interface.
 *
 * Per spec: "Button: Je suis présent"
 *
 * Check-in requires: latitude, longitude, device_fingerprint
 * Uses browser Geolocation API to get coordinates automatically.
 *
 * Backend CheckInRequest authorize() = isEmployee() only.
 * This component is only rendered in the employee space.
 *
 * GPS:
 * - Request location on button click
 * - Show loading while getting location
 * - Show error if denied
 * - Send to backend — backend validates against office zone
 */
const PointageActions = ({ onSuccess }) => {
  const dispatch       = useDispatch()
  const isCheckedIn    = useSelector(selectIsCheckedIn)
  const checkInLoading = useSelector(selectCheckInLoading)
  const checkOutLoading= useSelector(selectCheckOutLoading)
  const checkInError   = useSelector(selectCheckInError)
  const checkOutError  = useSelector(selectCheckOutError)
  const lastAction     = useSelector(selectLastAction)

  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsError,   setGpsError]   = useState(null)

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearCheckInError())
    dispatch(clearCheckOutError())
  }, [dispatch])

  // Show success toast on last action
  useEffect(() => {
    if (!lastAction) return
    if (lastAction.type === 'check_in') {
      const isFlagged = lastAction.result?.is_flagged
      if (isFlagged) {
        toast('Pointage enregistré — signalé pour vérification', {
          icon: '⚠️',
          style: { background: '#fffbeb', color: '#92400e' },
        })
      } else {
        toast.success('Pointage d\'entrée enregistré avec succès')
      }
    } else if (lastAction.type === 'check_out') {
      const hours = lastAction.result?.worked_hours || 0
      toast.success(`Pointage de sortie enregistré — ${hours.toFixed(1)}h travaillées`)
    }
    dispatch(clearLastAction())
    onSuccess?.()
  }, [lastAction, dispatch, onSuccess])

  const getLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Géolocalisation non supportée par ce navigateur'))
        return
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            reject(new Error('Accès à la localisation refusé. Vérifiez les permissions de votre navigateur.'))
          } else {
            reject(new Error('Impossible d\'obtenir votre position GPS'))
          }
        },
        { timeout: 10000, maximumAge: 60000 }
      )
    })

  const handleCheckIn = async () => {
    setGpsError(null)
    dispatch(clearCheckInError())

    setGpsLoading(true)
    let location
    try {
      location = await getLocation()
    } catch (err) {
      setGpsLoading(false)
      setGpsError(err.message)
      return
    }
    setGpsLoading(false)

    dispatch(checkInThunk({
      latitude:          location.latitude,
      longitude:         location.longitude,
      deviceFingerprint: getStableDeviceFingerprint(),
    }))
  }

  const handleCheckOut = () => {
    dispatch(clearCheckOutError())
    dispatch(checkOutThunk())
  }

  const isLoading = checkInLoading || checkOutLoading || gpsLoading
  const error     = gpsError || checkInError || checkOutError

  return (
    <div className="flex flex-col gap-4">

      {/* GPS status indicator */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
        <span>
          {gpsLoading
            ? 'Récupération de la position GPS…'
            : 'La localisation GPS est requise pour le pointage'}
        </span>
      </div>

      {/* Primary action button */}
      <AnimatePresence mode="wait">
        {!isCheckedIn ? (
          <motion.div
            key="check-in"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <button
              onClick={handleCheckIn}
              disabled={isLoading}
              className={cn(
                'group relative flex w-full flex-col items-center gap-3',
                'rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-8',
                'transition-all duration-200',
                'hover:border-emerald-400 hover:bg-emerald-100 hover:shadow-medium',
                'active:scale-98',
                'dark:border-emerald-700 dark:bg-emerald-900/20',
                'dark:hover:border-emerald-600 dark:hover:bg-emerald-900/30',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {/* Animated ring */}
              {!isLoading && (
                <div className="absolute inset-0 rounded-2xl border-2
                                border-emerald-400 opacity-0 scale-100
                                group-hover:opacity-30 group-hover:scale-105
                                transition-all duration-300" />
              )}

              <div className={cn(
                'flex h-16 w-16 items-center justify-center rounded-2xl',
                'bg-emerald-500 shadow-medium',
                isLoading && 'animate-pulse'
              )}>
                {isLoading ? (
                  <div className="h-7 w-7 animate-spin rounded-full
                                  border-3 border-white border-t-transparent" />
                ) : (
                  <LogIn className="h-8 w-8 text-white" />
                )}
              </div>

              <div className="text-center">
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                  {gpsLoading ? 'Localisation…' : 'Je suis présent'}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-500">
                  Enregistrer mon arrivée
                </p>
              </div>
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="check-out"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <button
              onClick={handleCheckOut}
              disabled={isLoading}
              className={cn(
                'flex w-full flex-col items-center gap-3 rounded-2xl',
                'border-2 border-slate-300 bg-slate-50 p-8',
                'transition-all duration-200',
                'hover:border-slate-400 hover:bg-slate-100 hover:shadow-medium',
                'active:scale-98',
                'dark:border-dark-400 dark:bg-dark-700',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <div className={cn(
                'flex h-16 w-16 items-center justify-center rounded-2xl',
                'bg-slate-600 shadow-medium dark:bg-dark-400',
                isLoading && 'animate-pulse'
              )}>
                {isLoading ? (
                  <div className="h-7 w-7 animate-spin rounded-full
                                  border-3 border-white border-t-transparent" />
                ) : (
                  <LogOut className="h-8 w-8 text-white" />
                )}
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-slate-700 dark:text-slate-200">
                  Pointer la sortie
                </p>
                <p className="text-xs text-slate-500">
                  Enregistrer ma sortie
                </p>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-2.5 rounded-xl border border-red-200
                       bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-900/20"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PointageActions