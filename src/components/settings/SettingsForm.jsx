import { useEffect }             from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MapPin, Clock, Calendar, Bell } from 'lucide-react'
import { fetchSettingsThunk, updateSettingsThunk } from '../../features/settings/settingsThunks'
import {
  selectGroupedSettings,
  selectSettingsLoading,
  selectSettingsError,
  selectLocalEdits,
  selectIsDirty,
  selectSaving,
  selectSaveError,
  selectSaveSuccess,
  selectSettingValue,
} from '../../features/settings/settingsSelectors'
import { setLocalSetting, clearDirty, clearSaveSuccess } from '../../features/settings/settingsSlice'
import SettingsSection from './SettingsSection'
import SaveBar         from './SaveBar'
import { Input, Switch, Skeleton, ErrorState } from '../ui'

/**
 * SettingsForm — main settings management form.
 *
 * Sections based on known setting keys from backend codebase:
 *
 * 1. GPS — office_location: { lat, lng, radius_meters }
 *    Used by: GpsValidationService.validate()
 *
 * 2. Planning — friday_lock_hour: { time: 'HH:MM' }
 *    Used by: EnsurePlanningIsUnlocked middleware
 *
 * 3. Pointage — check_in_grace_minutes: { minutes: 15 }
 *    Used by: PointageController@checkIn
 *
 * CRITICAL value wrapping:
 *   Backend stores scalars as { value: scalar } via Setting::set()
 *   But direct batch update via PUT uses the value as-is if it's already an object.
 *   We always send objects: { minutes: 15 }, { time: '17:00' }, { lat, lng, radius_meters }
 *
 * Unknown settings from DB are displayed generically.
 */
const SettingsForm = () => {
  const dispatch = useDispatch()
  const grouped  = useSelector(selectGroupedSettings)
  const loading  = useSelector(selectSettingsLoading)
  const error    = useSelector(selectSettingsError)
  const localEdits = useSelector(selectLocalEdits)
  const isDirty    = useSelector(selectIsDirty)
  const saving     = useSelector(selectSaving)
  const saveError  = useSelector(selectSaveError)
  const saveSuccess= useSelector(selectSaveSuccess)

  // Selectors for each known setting
  const officeLocation     = useSelector(selectSettingValue('office_location'))
  const fridayLockHour     = useSelector(selectSettingValue('friday_lock_hour'))
  const graceMinutes       = useSelector(selectSettingValue('check_in_grace_minutes'))

  useEffect(() => {
    dispatch(fetchSettingsThunk())
    return () => dispatch(clearSaveSuccess())
  }, [dispatch])

  const setField = (key, value, group) => {
    dispatch(setLocalSetting({ key, value, group }))
  }

  const handleSave = () => {
    // Build settings array from localEdits
    const settingsArray = Object.entries(localEdits).map(([key, value]) => {
      // Find the group from existing grouped settings
      let group = 'general'
      for (const [g, items] of Object.entries(grouped)) {
        if (Array.isArray(items) && items.find((s) => s.key === key)) {
          group = g
          break
        }
      }
      return { key, value, group }
    })

    if (settingsArray.length === 0) return
    dispatch(updateSettingsThunk(settingsArray))
  }

  const handleReset = () => {
    dispatch(clearDirty())
    dispatch(fetchSettingsThunk())
  }

  if (loading && Object.keys(grouped).length === 0) {
    return (
      <div className="space-y-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton.Block key={i} className="h-40 rounded-2xl" />
        ))}
      </div>
    )
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => dispatch(fetchSettingsThunk())} />
  }

  return (
    <div className="flex flex-col gap-5 pb-20">

      {/* ── Section 1: GPS ────────────────────────────────── */}
      <SettingsSection
        title="Localisation GPS"
        description="Zone de bureau autorisée pour le pointage des employés"
        icon={MapPin}
      >
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Latitude bureau"
            type="number"
            step="0.000001"
            placeholder="33.589886"
            value={officeLocation?.lat ?? ''}
            onChange={(e) => setField(
              'office_location',
              {
                ...( officeLocation || {} ),
                lat: parseFloat(e.target.value) || 0,
              },
              'gps'
            )}
          />
          <Input
            label="Longitude bureau"
            type="number"
            step="0.000001"
            placeholder="-7.603869"
            value={officeLocation?.lng ?? ''}
            onChange={(e) => setField(
              'office_location',
              {
                ...( officeLocation || {} ),
                lng: parseFloat(e.target.value) || 0,
              },
              'gps'
            )}
          />
        </div>

        <Input
          label="Rayon autorisé (mètres)"
          type="number"
          min="50"
          max="2000"
          step="50"
          placeholder="200"
          helper="Distance maximale du bureau pour valider un pointage GPS"
          value={officeLocation?.radius_meters ?? ''}
          onChange={(e) => setField(
            'office_location',
            {
              ...( officeLocation || {} ),
              radius_meters: parseInt(e.target.value) || 200,
            },
            'gps'
          )}
        />

        {/* GPS validation info */}
        <div className="rounded-xl bg-blue-50 px-4 py-3 text-xs
                        text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
          ℹ Le système valide la position GPS à chaque pointage d'entrée.
          Les pointages hors zone sont marqués comme suspects.
        </div>
      </SettingsSection>

      {/* ── Section 2: Planning ───────────────────────────── */}
      <SettingsSection
        title="Planning"
        description="Règles de verrouillage automatique du planning"
        icon={Calendar}
      >
        <Input
          label="Heure de verrouillage le vendredi"
          type="time"
          value={fridayLockHour?.time ?? '17:00'}
          helper="Après cette heure le vendredi, le planning de la semaine est automatiquement verrouillé"
          onChange={(e) => setField(
            'friday_lock_hour',
            { time: e.target.value },
            'planning'
          )}
        />

        <div className="rounded-xl bg-amber-50 px-4 py-3 text-xs
                        text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
          ⚠ Le verrouillage automatique s'applique via le middleware
          <code className="mx-1 rounded bg-amber-100 px-1 dark:bg-amber-900/40">
            EnsurePlanningIsUnlocked
          </code>
          chaque vendredi à l'heure définie.
        </div>
      </SettingsSection>

      {/* ── Section 3: Pointage ───────────────────────────── */}
      <SettingsSection
        title="Pointage"
        description="Paramètres de tolérance pour les arrivées"
        icon={Clock}
      >
        <Input
          label="Délai de tolérance (minutes)"
          type="number"
          min="0"
          max="60"
          step="5"
          value={graceMinutes?.minutes ?? 15}
          helper="Un employé pointant dans ce délai après l'heure prévue n'est pas marqué en retard"
          onChange={(e) => setField(
            'check_in_grace_minutes',
            { minutes: parseInt(e.target.value) || 0 },
            'pointage'
          )}
        />

        <div className="rounded-xl bg-surface-50 px-4 py-3 text-xs
                        text-slate-500 dark:bg-dark-600 dark:text-slate-400">
          Exemple : avec 15 minutes de tolérance, un shift démarrant à 09:00
          peut pointer jusqu'à 09:15 sans être marqué en retard.
        </div>
      </SettingsSection>

      {/* ── Section 4: Unknown / additional settings ──────── */}
      {Object.entries(grouped)
        .filter(([group]) => !['gps', 'planning', 'pointage'].includes(group))
        .map(([group, items]) => (
          Array.isArray(items) && items.length > 0 && (
            <SettingsSection
              key={group}
              title={group.charAt(0).toUpperCase() + group.slice(1)}
              description="Paramètres système supplémentaires"
              icon={Bell}
            >
              {items.map((setting) => (
                <div key={setting.key}
                     className="rounded-xl border border-surface-200 px-4 py-3
                                dark:border-dark-600">
                  <p className="text-xs font-mono font-medium text-slate-600
                                dark:text-slate-300">
                    {setting.key}
                  </p>
                  <p className="mt-1 text-xs text-slate-400 font-mono">
                    {JSON.stringify(setting.value)}
                  </p>
                </div>
              ))}
            </SettingsSection>
          )
        ))
      }

      {/* Sticky save bar */}
      <SaveBar
        isDirty={isDirty}
        saving={saving}
        saveError={saveError}
        saveSuccess={saveSuccess}
        onSave={handleSave}
        onReset={handleReset}
      />
    </div>
  )
}

export default SettingsForm