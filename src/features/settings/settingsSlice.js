import { createSlice } from '@reduxjs/toolkit'
import {
  fetchSettingsThunk,
  updateSettingsThunk,
} from './settingsThunks'

/**
 * Settings state.
 *
 * Backend GET /v1/settings returns:
 *   successResponse($settings) where $settings = Setting::all()->groupBy('group')
 *
 * Response shape:
 *   { data: { general: [...], gps: [...], planning: [...], pointage: [...] } }
 *
 * CRITICAL: value field is ALWAYS a JSON object, never a scalar.
 *   - Scalar stored as: { value: <scalar> }
 *   - Object stored as: { lat: ..., lng: ..., radius_meters: ... }
 *
 * Known keys from backend codebase:
 *   office_location     (gps group):      { lat, lng, radius_meters }
 *   friday_lock_hour    (planning group):  { time: 'HH:MM' }
 *   check_in_grace_minutes (pointage):    { minutes: 15 }
 *
 * isDirty: true when local edits differ from saved state.
 * Triggers the sticky SaveBar.
 */
const initialState = {
  // Raw grouped settings from backend
  grouped: {},          // { general: [...], gps: [...], ... }
  loading: false,
  error:   null,

  // Local edits — flat map { key: value_object }
  // Populated when user edits a field
  localEdits: {},

  isDirty:    false,
  saving:     false,
  saveError:  null,
  saveSuccess: false,
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    /**
     * Update a single setting value locally.
     * key: setting key string
     * value: the new value object (matches backend JSON structure)
     */
    setLocalSetting: (state, action) => {
      const { key, value } = action.payload
      state.localEdits[key] = value
      state.isDirty         = true
      state.saveSuccess     = false
    },
    clearDirty: (state) => {
      state.isDirty    = false
      state.localEdits = {}
    },
    clearSaveSuccess: (state) => {
      state.saveSuccess = false
    },
  },
  extraReducers: (builder) => {

    // ── Fetch settings ─────────────────────────────────────
    builder
      .addCase(fetchSettingsThunk.pending, (state) => {
        state.loading = true
        state.error   = null
      })
      .addCase(fetchSettingsThunk.fulfilled, (state, action) => {
        state.loading    = false
        state.grouped    = action.payload
        state.localEdits = {}
        state.isDirty    = false
      })
      .addCase(fetchSettingsThunk.rejected, (state, action) => {
        state.loading = false
        state.error   = action.payload
      })

    // ── Update settings ────────────────────────────────────
    builder
      .addCase(updateSettingsThunk.pending, (state) => {
        state.saving    = true
        state.saveError = null
      })
      .addCase(updateSettingsThunk.fulfilled, (state, action) => {
        state.saving      = false
        state.grouped     = action.payload
        state.localEdits  = {}
        state.isDirty     = false
        state.saveSuccess = true
      })
      .addCase(updateSettingsThunk.rejected, (state, action) => {
        state.saving    = false
        state.saveError = action.payload
      })
  },
})

export const {
  setLocalSetting,
  clearDirty,
  clearSaveSuccess,
} = settingsSlice.actions

export default settingsSlice.reducer