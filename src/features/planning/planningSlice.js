import { createSlice } from '@reduxjs/toolkit'
import {
  fetchPlanningThunk,
  createPlanningThunk,
  updatePlanningThunk,
  deletePlanningThunk,
  lockCurrentWeekThunk,
  generateNextWeekThunk,
  lockPlanningThunk,
  overrideLockThunk,
  suggestEmployeesThunk,
  fetchPlanningHistoryThunk,
  batchDeletePlanningsThunk,
  batchUpdateShiftThunk,
  batchAssignEmployeeThunk,
  duplicateDayThunk,
  validateBatchThunk,
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

  submitting:       false,
  submitError:      null,
  fieldErrors:      null,
  conflictErrors:   [],

  deleteLoading:   false,
  deleteError:     null,

  overrideLoading: false,
  overrideError:   null,

  lockPlanningLoading: false,
  lockPlanningError:   null,

  suggestions:         [],
  suggestionsLoading:  false,

  // Planning history (read-only)
  historyData:      [],
  historyMeta:      null,
  historyLoading:   false,
  historyError:     null,
  historyWeekInfo:  { weekNumber: null, year: null },

  // Batch operations
  batchLoading:    false,
  batchResult:     null,
  batchErrors:     [],
  batchValidation: { conflicts: [], conflict_count: 0, valid: true },

  // Selected planning IDs for multi-select
  selectedIds:     [],
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
      state.fieldErrors    = null
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
    clearLockResult: (state) => {
      state.lockResult = null
    },
    clearDeleteError: (state) => {
      state.deleteError = null
    },
    clearOverrideError: (state) => {
      state.overrideError = null
    },
    clearLockPlanningError: (state) => {
      state.lockPlanningError = null
    },
    setSelectedIds: (state, action) => {
      state.selectedIds = action.payload
    },
    toggleSelectedId: (state, action) => {
      const id = action.payload
      const idx = state.selectedIds.indexOf(id)
      if (idx >= 0) {
        state.selectedIds.splice(idx, 1)
      } else {
        state.selectedIds.push(id)
      }
    },
    clearSelectedIds: (state) => {
      state.selectedIds = []
    },
    clearBatchResult: (state) => {
      state.batchResult = null
      state.batchErrors = []
    },
    clearBatchValidation: (state) => {
      state.batchValidation = { conflicts: [], conflict_count: 0, valid: true }
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
        state.fieldErrors    = null
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
          state.submitError = action.payload?.message || 'Erreur lors de la création'
          state.fieldErrors = action.payload?.fieldErrors || null
        }
      })

    // ── Update ─────────────────────────────────────────────
    builder
      .addCase(updatePlanningThunk.pending, (state) => {
        state.submitting     = true
        state.submitError    = null
        state.fieldErrors    = null
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
          state.submitError = action.payload?.message || 'Erreur lors de la mise à jour'
          state.fieldErrors = action.payload?.fieldErrors || null
        }
      })

    // ── Delete ─────────────────────────────────────────────
    builder
      .addCase(deletePlanningThunk.pending, (state) => {
        state.deleteLoading = true
        state.deleteError   = null
      })
      .addCase(deletePlanningThunk.fulfilled, (state, action) => {
        state.deleteLoading = false
        state.data          = state.data.filter((p) => p.id !== action.payload)
      })
      .addCase(deletePlanningThunk.rejected, (state, action) => {
        state.deleteLoading = false
        state.deleteError   = action.payload?.message || 'Failed to delete planning'
      })

    // ── Lock ───────────────────────────────────────────────
    builder
      .addCase(lockCurrentWeekThunk.pending, (state) => {
        state.lockLoading = true
      })
      .addCase(lockCurrentWeekThunk.fulfilled, (state, action) => {
        state.lockLoading = false
        state.lockResult  = action.payload
        state.data.forEach((p) => {
          if (p.week_number === action.payload.week_number && p.year === action.payload.year) {
            p.is_locked = true
          }
        })
      })
      .addCase(lockCurrentWeekThunk.rejected, (state, action) => {
        state.lockLoading = false
        state.lockResult  = null
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
      .addCase(generateNextWeekThunk.rejected, (state, action) => {
        state.generateLoading = false
        state.generateErrors  = [action.payload?.message || 'Failed to generate next week']
      })

    // ── Override lock ──────────────────────────────────────
    builder
      .addCase(overrideLockThunk.pending, (state) => {
        state.overrideLoading = true
        state.overrideError   = null
      })
      .addCase(overrideLockThunk.fulfilled, (state, action) => {
        state.overrideLoading = false
        const idx = state.data.findIndex((p) => p.id === action.payload.id)
        if (idx >= 0) state.data[idx] = action.payload
      })
      .addCase(overrideLockThunk.rejected, (state, action) => {
        state.overrideLoading = false
        state.overrideError   = action.payload?.message || 'Failed to override lock'
      })

    // ── Lock single planning ───────────────────────────────
    builder
      .addCase(lockPlanningThunk.pending, (state) => {
        state.lockPlanningLoading = true
        state.lockPlanningError   = null
      })
      .addCase(lockPlanningThunk.fulfilled, (state, action) => {
        state.lockPlanningLoading = false
        const idx = state.data.findIndex((p) => p.id === action.payload.id)
        if (idx >= 0) state.data[idx] = action.payload
      })
      .addCase(lockPlanningThunk.rejected, (state, action) => {
        state.lockPlanningLoading = false
        state.lockPlanningError   = action.payload?.message || 'Failed to lock planning'
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
      .addCase(suggestEmployeesThunk.rejected, (state, action) => {
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

    // ── Batch delete ─────────────────────────────────────
    builder
      .addCase(batchDeletePlanningsThunk.pending, (state) => {
        state.batchLoading = true
        state.batchResult  = null
        state.batchErrors  = []
      })
      .addCase(batchDeletePlanningsThunk.fulfilled, (state, action) => {
        state.batchLoading = false
        state.batchResult  = action.payload
        state.selectedIds  = []
      })
      .addCase(batchDeletePlanningsThunk.rejected, (state, action) => {
        state.batchLoading = false
        state.batchErrors  = [action.payload?.message || 'Batch delete failed']
      })

    // ── Batch update shift ──────────────────────────────
    builder
      .addCase(batchUpdateShiftThunk.pending, (state) => {
        state.batchLoading = true
        state.batchResult  = null
        state.batchErrors  = []
      })
      .addCase(batchUpdateShiftThunk.fulfilled, (state, action) => {
        state.batchLoading = false
        state.batchResult  = action.payload
        state.selectedIds  = []
      })
      .addCase(batchUpdateShiftThunk.rejected, (state, action) => {
        state.batchLoading = false
        state.batchErrors  = [action.payload?.message || 'Batch shift update failed']
      })

    // ── Batch assign employee ──────────────────────────
    builder
      .addCase(batchAssignEmployeeThunk.pending, (state) => {
        state.batchLoading = true
        state.batchResult  = null
        state.batchErrors  = []
      })
      .addCase(batchAssignEmployeeThunk.fulfilled, (state, action) => {
        state.batchLoading = false
        state.batchResult  = action.payload
        state.selectedIds  = []
      })
      .addCase(batchAssignEmployeeThunk.rejected, (state, action) => {
        state.batchLoading = false
        state.batchErrors  = [action.payload?.message || 'Batch assign failed']
      })

    // ── Duplicate day ──────────────────────────────────
    builder
      .addCase(duplicateDayThunk.pending, (state) => {
        state.batchLoading = true
        state.batchResult  = null
        state.batchErrors  = []
      })
      .addCase(duplicateDayThunk.fulfilled, (state, action) => {
        state.batchLoading = false
        state.batchResult  = action.payload
      })
      .addCase(duplicateDayThunk.rejected, (state, action) => {
        state.batchLoading = false
        state.batchErrors  = [action.payload?.message || 'Day duplication failed']
      })

    // ── Validate batch ─────────────────────────────────
    builder
      .addCase(validateBatchThunk.fulfilled, (state, action) => {
        state.batchValidation = action.payload
      })
      .addCase(validateBatchThunk.rejected, (state, action) => {
        state.batchValidation = {
          conflicts: [{ message: action.payload?.message || 'Validation failed' }],
          conflict_count: 1,
          valid: false,
        }
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
  clearLockResult,
  clearDeleteError,
  clearOverrideError,
  clearLockPlanningError,
  setSelectedIds,
  toggleSelectedId,
  clearSelectedIds,
  clearBatchResult,
  clearBatchValidation,
} = planningSlice.actions

export default planningSlice.reducer