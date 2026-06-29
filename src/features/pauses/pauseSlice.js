import { createSlice } from '@reduxjs/toolkit'
import {
  fetchPausesByPlanningThunk,
  fetchPausesBatchThunk,
  createPauseThunk,
  updatePauseThunk,
  deletePauseThunk,
  fetchPausesListThunk,
  fetchPauseStatsThunk,
  fetchPauseThunk,
  cancelPauseThunk,
  completePauseThunk,
} from './pauseThunks'

const initialState = {
  byPlanningId:    {},
  loading:         {},
  submitting:      false,
  submitError:     null,
  list:            null,
  listLoading:     false,
  stats:           null,
  statsLoading:    false,
  selectedPause:   null,
  selectedLoading: false,
}

const pauseSlice = createSlice({
  name: 'pauses',
  initialState,
  reducers: {
    clearPauseError: (state) => {
      state.submitError = null
    },
    clearPauseList: (state) => {
      state.list = null
    },
    clearPauseStats: (state) => {
      state.stats = null
    },
  },
  extraReducers: (builder) => {

    // ── Fetch list (admin) ─────────────────────────────────
    builder
      .addCase(fetchPausesListThunk.pending, (state) => {
        state.listLoading = true
        state.submitError = null
      })
      .addCase(fetchPausesListThunk.fulfilled, (state, action) => {
        state.listLoading = false
        state.list = action.payload
      })
      .addCase(fetchPausesListThunk.rejected, (state, action) => {
        state.listLoading = false
        state.submitError = action.payload
      })

    // ── Fetch stats (admin) ────────────────────────────────
    builder
      .addCase(fetchPauseStatsThunk.pending, (state) => {
        state.statsLoading = true
      })
      .addCase(fetchPauseStatsThunk.fulfilled, (state, action) => {
        state.statsLoading = false
        state.stats = action.payload
      })
      .addCase(fetchPauseStatsThunk.rejected, (state) => {
        state.statsLoading = false
      })

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
        const requestedIds = action.meta.arg || []
        requestedIds.forEach((id) => {
          state.loading[id] = false
        })
      })

    // ── Create pause ───────────────────────────────────────
    builder
      .addCase(createPauseThunk.pending, (state) => {
        state.submitting  = true
        state.submitError = null
      })
      .addCase(createPauseThunk.fulfilled, (state, action) => {
        state.submitting = false
        const { planningId, data } = action.payload
        const newPauses = Array.isArray(data) ? data : [data]
        if (!state.byPlanningId[planningId]) {
          state.byPlanningId[planningId] = []
        }
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

    // ── Fetch single pause ─────────────────────────────────
    builder
      .addCase(fetchPauseThunk.pending, (state) => {
        state.selectedLoading = true
        state.submitError = null
      })
      .addCase(fetchPauseThunk.fulfilled, (state, action) => {
        state.selectedLoading = false
        state.selectedPause = action.payload
      })
      .addCase(fetchPauseThunk.rejected, (state, action) => {
        state.selectedLoading = false
        state.submitError = action.payload
      })

    // ── Cancel pause ───────────────────────────────────────
    builder
      .addCase(cancelPauseThunk.pending, (state) => {
        state.submitting = true
        state.submitError = null
      })
      .addCase(cancelPauseThunk.fulfilled, (state, action) => {
        state.submitting = false
        const { planningId, data } = action.payload
        const list = state.byPlanningId[planningId]
        if (list) {
          const idx = list.findIndex((p) => p.id === data.id)
          if (idx >= 0) list[idx] = data
        }
      })
      .addCase(cancelPauseThunk.rejected, (state, action) => {
        state.submitting = false
        state.submitError = action.payload
      })

    // ── Complete pause ─────────────────────────────────────
    builder
      .addCase(completePauseThunk.pending, (state) => {
        state.submitting = true
        state.submitError = null
      })
      .addCase(completePauseThunk.fulfilled, (state, action) => {
        state.submitting = false
        const { planningId, data } = action.payload
        const list = state.byPlanningId[planningId]
        if (list) {
          const idx = list.findIndex((p) => p.id === data.id)
          if (idx >= 0) list[idx] = data
        }
      })
      .addCase(completePauseThunk.rejected, (state, action) => {
        state.submitting = false
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

export const { clearPauseError, clearPauseList, clearPauseStats } = pauseSlice.actions
export default pauseSlice.reducer
