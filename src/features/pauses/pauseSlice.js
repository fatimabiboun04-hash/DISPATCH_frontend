import { createSlice } from '@reduxjs/toolkit'
import {
  fetchPausesByPlanningThunk,
  fetchPausesBatchThunk,
  createPauseThunk,
  updatePauseThunk,
  deletePauseThunk,
} from './pauseThunks'

/**
 * Pauses state.
 *
 * byPlanningId: keyed map { [planningId]: pause[] }
 * Allows the drawer to show pauses for the selected planning
 * without polluting global state.
 *
 * Pause fields from backend:
 *   pause_start / pause_end → 'HH:mm' strings (datetime:H:i cast)
 *   duration_minutes → computed accessor
 *   is_active → computed accessor
 */
const initialState = {
  byPlanningId:    {},  // { [planningId]: [...pauses] }
  loading:         {},  // { [planningId]: boolean }
  submitting:      false,
  submitError:     null,
}

const pauseSlice = createSlice({
  name: 'pauses',
  initialState,
  reducers: {
    clearPauseError: (state) => {
      state.submitError = null
    },
  },
  extraReducers: (builder) => {

    // ── Fetch by planning ──────────────────────────────────
    builder
      .addCase(fetchPausesByPlanningThunk.pending, (state, action) => {
        const id = action.meta.arg
        state.loading[id] = true
      })
      .addCase(fetchPausesByPlanningThunk.fulfilled, (state, action) => {
        const { planningId, data } = action.payload
        state.loading[planningId]       = false
        state.byPlanningId[planningId]  = data
      })
      .addCase(fetchPausesByPlanningThunk.rejected, (state, action) => {
        const id = action.meta.arg
        state.loading[id] = false
      })

    // ── Fetch batch ────────────────────────────────────────
    builder
      .addCase(fetchPausesBatchThunk.fulfilled, (state, action) => {
        const grouped = action.payload
        Object.entries(grouped).forEach(([planningId, pauses]) => {
          state.byPlanningId[planningId] = pauses
          state.loading[planningId]      = false
        })
      })
      .addCase(fetchPausesBatchThunk.rejected, (state, action) => {
        // Only clear loading for the IDs that were in the batch request
        const requestedIds = action.meta.arg || []
        requestedIds.forEach((id) => {
          state.loading[id] = false
        })
      })

    // ── Create pause ───────────────────────────────────────
    // Single user → returns one pause object with user + planning.shift loaded
    // Team        → returns array of pauses (no relations loaded)
    builder
      .addCase(createPauseThunk.pending, (state) => {
        state.submitting  = true
        state.submitError = null
      })
      .addCase(createPauseThunk.fulfilled, (state, action) => {
        state.submitting = false
        const { planningId, data } = action.payload

        // Normalize: always work with array
        const newPauses = Array.isArray(data) ? data : [data]

        if (!state.byPlanningId[planningId]) {
          state.byPlanningId[planningId] = []
        }
        // Append, avoiding duplicates
        newPauses.forEach((p) => {
          if (!state.byPlanningId[planningId].find((x) => x.id === p.id)) {
            state.byPlanningId[planningId].push(p)
          }
        })
      })
      .addCase(createPauseThunk.rejected, (state, action) => {
        state.submitting  = false
        state.submitError = action.payload
      })

    // ── Update pause ───────────────────────────────────────
    builder
      .addCase(updatePauseThunk.pending, (state) => {
        state.submitting  = true
        state.submitError = null
      })
      .addCase(updatePauseThunk.fulfilled, (state, action) => {
        state.submitting = false
        const { planningId, data } = action.payload
        const list = state.byPlanningId[planningId]
        if (list) {
          const idx = list.findIndex((p) => p.id === data.id)
          if (idx >= 0) list[idx] = data
        }
      })
      .addCase(updatePauseThunk.rejected, (state, action) => {
        state.submitting  = false
        state.submitError = action.payload
      })

    // ── Delete pause ───────────────────────────────────────
    builder
      .addCase(deletePauseThunk.fulfilled, (state, action) => {
        const { planningId, pauseId } = action.payload
        const list = state.byPlanningId[planningId]
        if (list) {
          state.byPlanningId[planningId] = list.filter((p) => p.id !== pauseId)
        }
      })
  },
})

export const { clearPauseError } = pauseSlice.actions
export default pauseSlice.reducer