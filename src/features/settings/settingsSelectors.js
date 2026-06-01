/**
 * Settings selectors.
 *
 * getSettingValue: reads from localEdits first, then grouped.
 * Returns the raw value object stored in backend.
 */
export const selectGroupedSettings  = (state) => state.settings.grouped
export const selectSettingsLoading  = (state) => state.settings.loading
export const selectSettingsError    = (state) => state.settings.error
export const selectLocalEdits       = (state) => state.settings.localEdits
export const selectIsDirty          = (state) => state.settings.isDirty
export const selectSaving           = (state) => state.settings.saving
export const selectSaveError        = (state) => state.settings.saveError
export const selectSaveSuccess      = (state) => state.settings.saveSuccess

/**
 * Get the effective value for a key.
 * Prefers localEdits over saved grouped value.
 * Flattens all groups into one lookup.
 */
export const selectSettingValue = (key) => (state) => {
  // Check local edits first
  if (state.settings.localEdits[key] !== undefined) {
    return state.settings.localEdits[key]
  }
  // Search all groups
  for (const group of Object.values(state.settings.grouped)) {
    if (!Array.isArray(group)) continue
    const found = group.find((s) => s.key === key)
    if (found) return found.value
  }
  return null
}

/**
 * Get all settings as a flat array.
 */
export const selectAllSettings = (state) => {
  const flat = []
  for (const group of Object.values(state.settings.grouped)) {
    if (Array.isArray(group)) flat.push(...group)
  }
  return flat
}