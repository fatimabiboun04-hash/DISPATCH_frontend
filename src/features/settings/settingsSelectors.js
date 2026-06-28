import { createSelector } from '@reduxjs/toolkit'

export const selectGroupedSettings  = (state) => state.settings.grouped
export const selectSettingsLoading  = (state) => state.settings.loading
export const selectSettingsError    = (state) => state.settings.error
export const selectLocalEdits       = (state) => state.settings.localEdits
export const selectIsDirty          = (state) => state.settings.isDirty
export const selectSaving           = (state) => state.settings.saving
export const selectSaveError        = (state) => state.settings.saveError
export const selectSaveSuccess      = (state) => state.settings.saveSuccess

// Pre-compute a flat key→value map (memoized)
export const selectSettingsMap = createSelector(
  [selectGroupedSettings, selectLocalEdits],
  (grouped, localEdits) => {
    const map = { ...localEdits }
    for (const group of Object.values(grouped)) {
      if (Array.isArray(group)) {
        for (const s of group) {
          if (map[s.key] === undefined) map[s.key] = s.value
        }
      }
    }
    return map
  }
)

export const selectSettingValue = (key) => (state) => {
  return selectSettingsMap(state)[key] ?? null
}

export const selectAllSettings = createSelector(
  [selectGroupedSettings],
  (grouped) => {
    const flat = []
    for (const group of Object.values(grouped)) {
      if (Array.isArray(group)) flat.push(...group)
    }
    return flat
  }
)
