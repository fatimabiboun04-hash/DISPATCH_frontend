import { createSlice } from '@reduxjs/toolkit'
import {
  fetchReportsThunk,
  generateReportThunk,
  downloadReportThunk,
} from './reportThunks'

/**
 * Reports state.
 *
 * Status lifecycle (from GenerateReportJob):
 *   'queued' → created by controller
 *   'processing' → job started (may skip if fast queue)
 *   'completed' → file_path set, download available
 *   'failed' → job threw exception
 *
 * NOTE: Fix #7 identified — original migration has status enum without 'queued'
 * and file_path not nullable. The frontend handles all 4 status values
 * defensively (treats any non-completed/failed as in-progress).
 *
 * download: handled via blob response — triggers browser download.
 * No download state stored in Redux — it's a fire-and-forget browser action.
 */
const initialState = {
  list:        [],
  meta:        null,
  loading:     false,
  error:       null,

  // Generation state
  generating:  false,
  generateError: null,

  // Per-report download loading
  downloadLoading: {},  // { [reportId]: boolean }

  // Polling
  isPolling: false,
}

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearGenerateError: (state) => {
      state.generateError = null
    },
    setPolling: (state, action) => {
      state.isPolling = action.payload
    },
    setDownloadLoading: (state, action) => {
      const { id, loading } = action.payload
      state.downloadLoading[id] = loading
    },
    // Update a single report's status in the list (used by polling)
    updateReportStatus: (state, action) => {
      const updated = action.payload  // array from fetch
      updated.forEach((r) => {
        const idx = state.list.findIndex((x) => x.id === r.id)
        if (idx >= 0) state.list[idx] = r
      })
    },
  },
  extraReducers: (builder) => {

    // ── Fetch list ─────────────────────────────────────────
    builder
      .addCase(fetchReportsThunk.pending, (state) => {
        state.loading = true
        state.error   = null
      })
      .addCase(fetchReportsThunk.fulfilled, (state, action) => {
        state.loading = false
        state.list    = action.payload.data
        state.meta    = action.payload.meta
      })
      .addCase(fetchReportsThunk.rejected, (state, action) => {
        state.loading = false
        state.error   = action.payload
      })

    // ── Generate report ────────────────────────────────────
    builder
      .addCase(generateReportThunk.pending, (state) => {
        state.generating    = true
        state.generateError = null
      })
      .addCase(generateReportThunk.fulfilled, (state, action) => {
        state.generating = false
        // Prepend newly created report to list
        state.list.unshift(action.payload)
        if (state.meta) state.meta.total += 1
      })
      .addCase(generateReportThunk.rejected, (state, action) => {
        state.generating    = false
        state.generateError = action.payload
      })
  },
})

export const {
  clearGenerateError,
  setPolling,
  setDownloadLoading,
  updateReportStatus,
} = reportSlice.actions

export default reportSlice.reducer