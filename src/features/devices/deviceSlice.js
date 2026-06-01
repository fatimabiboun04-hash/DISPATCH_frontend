import { createSlice } from '@reduxjs/toolkit'
import {
  fetchDevicesThunk,
  trustDeviceThunk,
  untrustDeviceThunk,
} from './deviceThunks'

/**
 * Devices state.
 *
 * Device model fields: id, user_id, fingerprint, name, is_trusted, trusted_at, last_used_at
 * Device has NO browser/os/ip columns — only `name` (user-agent string) and fingerprint.
 *
 * Backend GET /v1/devices: paginate(20) with user loaded.
 * trust/untrust return updated device with user loaded.
 */
const initialState = {
  list:        [],
  meta:        null,
  loading:     false,
  error:       null,

  // Per-device action loading
  actionLoading: {},  // { [deviceId]: boolean }
}

const deviceSlice = createSlice({
  name: 'devices',
  initialState,
  reducers: {},
  extraReducers: (builder) => {

    // ── Fetch ──────────────────────────────────────────────
    builder
      .addCase(fetchDevicesThunk.pending, (state) => {
        state.loading = true
        state.error   = null
      })
      .addCase(fetchDevicesThunk.fulfilled, (state, action) => {
        state.loading = false
        state.list    = action.payload.data
        state.meta    = action.payload.meta
      })
      .addCase(fetchDevicesThunk.rejected, (state, action) => {
        state.loading = false
        state.error   = action.payload
      })

    // ── Trust ──────────────────────────────────────────────
    builder
      .addCase(trustDeviceThunk.pending, (state, action) => {
        state.actionLoading[action.meta.arg] = true
      })
      .addCase(trustDeviceThunk.fulfilled, (state, action) => {
        state.actionLoading[action.payload.id] = false
        const idx = state.list.findIndex((d) => d.id === action.payload.id)
        if (idx >= 0) state.list[idx] = action.payload
      })
      .addCase(trustDeviceThunk.rejected, (state, action) => {
        state.actionLoading[action.meta.arg] = false
      })

    // ── Untrust ────────────────────────────────────────────
    builder
      .addCase(untrustDeviceThunk.pending, (state, action) => {
        state.actionLoading[action.meta.arg] = true
      })
      .addCase(untrustDeviceThunk.fulfilled, (state, action) => {
        state.actionLoading[action.payload.id] = false
        const idx = state.list.findIndex((d) => d.id === action.payload.id)
        if (idx >= 0) state.list[idx] = action.payload
      })
      .addCase(untrustDeviceThunk.rejected, (state, action) => {
        state.actionLoading[action.meta.arg] = false
      })
  },
})

export default deviceSlice.reducer