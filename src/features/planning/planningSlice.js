import { createSlice } from '@reduxjs/toolkit'
import {
  fetchPlanningThunk,
  createPlanningThunk,
  updatePlanningThunk,
  deletePlanningThunk,
  lockCurrentWeekThunk,
  generateNextWeekThunk,
  overrideLockThunk,
  suggestEmployeesThunk,
  fetchPlanningHistoryThunk,
} from './planningThunks'

const initialState = {
  // Live planning
  data:        [],
  meta:        null,
  loading:     false,
  error:       null,

  weekInfo: {
    weekNumber: null,
    year:       null,
  },

  filters: {
    team_id:  '',
    shift_id: '',
    user_id:  '',
  },

  lockLoading:  false,
  lockResult:   null,

  generateLoading: false,
  generateResult:  null,
  generateErrors:  [],

  submitting:      false,
  submitError:     null,
  conflictErrors:  [],

  suggestions:         [],
  suggestionsLoading:  false,

  // Planning history (read-only)
  historyData:      [],
  historyMeta:      null,
  historyLoading:   false,
  historyError:     null,
  historyWeekInfo:  { weekNumber: null, year: null },
}

const planningSlice = createSlice({
  name: 'planning',
  initialState,
  reducers: {
    setWeekInfo: (state, action) => {
      state.weekInfo = action.payload
    },
    setHistoryWeekInfo: (state, action) => {
      state.historyWeekInfo = action.payload
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetFilters: (state) => {
      state.filters = initialState.filters
    },
    clearConflictErrors: (state) => {
      state.conflictErrors = []
    },
    clearSubmitError: (state) => {
      state.submitError    = null
      state.conflictErrors = []
    },
    clearGenerateResult: (state) => {
      state.generateResult = null
      state.generateErrors = []
    },
    clearSuggestions: (state) => {
      state.suggestions = []
    },
    clearHistory: (state) => {
      state.historyData   = []
      state.historyMeta   = null
      state.historyError  = null
    },
  },
  extraReducers: (builder) => {

    // ── Fetch planning ─────────────────────────────────────
    builder
      .addCase(fetchPlanningThunk.pending, (state) => {
        state.loading = true
        state.error   = null
      })
      .addCase(fetchPlanningThunk.fulfilled, (state, action) => {
        state.loading = false
        state.data    = action.payload.data
        state.meta    = action.payload.meta
      })
      .addCase(fetchPlanningThunk.rejected, (state, action) => {
        state.loading = false
        state.error   = action.payload
      })

    // ── Create ─────────────────────────────────────────────
    builder
      .addCase(createPlanningThunk.pending, (state) => {
        state.submitting     = true
        state.submitError    = null
        state.conflictErrors = []
      })
      .addCase(createPlanningThunk.fulfilled, (state, action) => {
        state.submitting = false
        state.data.push(action.payload)
      })
      .addCase(createPlanningThunk.rejected, (state, action) => {
        state.submitting = false
        if (action.payload?.isConflict) {
          state.conflictErrors = action.payload.errors
        } else {
          state.submitError = action.payload?.message || 'Failed to create planning'
        }
      })

    // ── Update ─────────────────────────────────────────────
    builder
      .addCase(updatePlanningThunk.pending, (state) => {
        state.submitting     = true
        state.submitError    = null
        state.conflictErrors = []
      })
      .addCase(updatePlanningThunk.fulfilled, (state, action) => {
        state.submitting = false
        const idx = state.data.findIndex((p) => p.id === action.payload.id)
        if (idx >= 0) state.data[idx] = action.payload
      })
      .addCase(updatePlanningThunk.rejected, (state, action) => {
        state.submitting = false
        if (action.payload?.isConflict) {
          state.conflictErrors = action.payload.errors
        } else {
          state.submitError = action.payload?.message || 'Failed to update planning'
        }
      })

    // ── Delete ─────────────────────────────────────────────
    builder
      .addCase(deletePlanningThunk.fulfilled, (state, action) => {
        state.data = state.data.filter((p) => p.id !== action.payload)
      })

    // ── Lock ───────────────────────────────────────────────
    builder
      .addCase(lockCurrentWeekThunk.pending, (state) => {
        state.lockLoading = true
      })
      .addCase(lockCurrentWeekThunk.fulfilled, (state, action) => {
        state.lockLoading = false
        state.lockResult  = action.payload
        state.data = state.data.map((p) =>
          p.week_number === action.payload.week_number &&
          p.year        === action.payload.year
            ? { ...p, is_locked: true }
            : p
        )
      })
      .addCase(lockCurrentWeekThunk.rejected, (state) => {
        state.lockLoading = false
      })

    // ── Generate ───────────────────────────────────────────
    builder
      .addCase(generateNextWeekThunk.pending, (state) => {
        state.generateLoading = true
        state.generateResult  = null
        state.generateErrors  = []
      })
      .addCase(generateNextWeekThunk.fulfilled, (state, action) => {
        state.generateLoading = false
        state.generateResult  = action.payload
        state.generateErrors  = action.payload.errors || []
      })
      .addCase(generateNextWeekThunk.rejected, (state) => {
        state.generateLoading = false
      })

    // ── Override lock ──────────────────────────────────────
    builder
      .addCase(overrideLockThunk.fulfilled, (state, action) => {
        const idx = state.data.findIndex((p) => p.id === action.payload.id)
        if (idx >= 0) state.data[idx] = action.payload
      })

    // ── Suggestions ────────────────────────────────────────
    builder
      .addCase(suggestEmployeesThunk.pending, (state) => {
        state.suggestionsLoading = true
        state.suggestions        = []
      })
      .addCase(suggestEmployeesThunk.fulfilled, (state, action) => {
        state.suggestionsLoading = false
        state.suggestions        = action.payload
      })
      .addCase(suggestEmployeesThunk.rejected, (state) => {
        state.suggestionsLoading = false
        state.suggestions        = []
      })

    // ── Planning history ───────────────────────────────────
    builder
      .addCase(fetchPlanningHistoryThunk.pending, (state) => {
        state.historyLoading = true
        state.historyError   = null
      })
      .addCase(fetchPlanningHistoryThunk.fulfilled, (state, action) => {
        state.historyLoading = false
        state.historyData    = action.payload.data
        state.historyMeta    = action.payload.meta
      })
      .addCase(fetchPlanningHistoryThunk.rejected, (state, action) => {
        state.historyLoading = false
        state.historyError   = action.payload
      })
  },
})

export const {
  setWeekInfo,
  setHistoryWeekInfo,
  setFilters,
  resetFilters,
  clearConflictErrors,
  clearSubmitError,
  clearGenerateResult,
  clearSuggestions,
  clearHistory,
} = planningSlice.actions

export default planningSlice.reducer