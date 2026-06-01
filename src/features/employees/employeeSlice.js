import { createSlice } from '@reduxjs/toolkit'
import {
  fetchEmployeesThunk,
  fetchEmployeeThunk,
  createEmployeeThunk,
  updateEmployeeThunk,
  deleteEmployeeThunk,
  fetchEmployeeHistoryThunk,
  fetchEmployeePlanningThunk,
  fetchEmployeePointagesThunk,
} from './employeeThunks'

/**
 * Employee state.
 *
 * list    → paginated employee list (GET /v1/employees)
 * detail  → single employee full profile (GET /v1/employees/{id})
 * history → activity timeline  (GET /v1/employees/{id}/history)
 * profile_planning  → employee's planning (GET /v1/employees/{id}/planning)
 * profile_pointages → employee's pointages (GET /v1/employees/{id}/pointages)
 */
const initialState = {
  // List
  list:        [],
  meta:        null,
  listLoading: false,
  listError:   null,

  // Filters stored to persist across navigation
  filters: {
    search:  '',
    team_id: '',
    status:  '',
    page:    1,
  },

  // Single employee detail
  detail:        null,
  detailLoading: false,
  detailError:   null,

  // Profile tabs data
  history:         [],
  historyMeta:     null,
  historyLoading:  false,

  profilePlanning:        [],
  profilePlanningMeta:    null,
  profilePlanningLoading: false,

  profilePointages:        [],
  profilePointagesMeta:    null,
  profilePointagesLoading: false,

  // CRUD states
  submitting: false,
  submitError: null,
}

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetFilters: (state) => {
      state.filters = initialState.filters
    },
    clearDetail: (state) => {
      state.detail         = null
      state.detailError    = null
      state.history        = []
      state.profilePlanning = []
      state.profilePointages = []
    },
    clearSubmitError: (state) => {
      state.submitError = null
    },
    // Optimistic rating update on the list
    updateEmployeeRatingInList: (state, action) => {
      const { employeeId, ratingData } = action.payload
      const emp = state.list.find((e) => e.id === employeeId)
      if (emp) {
        // Replace the current week rating
        if (!emp.ratings) emp.ratings = []
        const idx = emp.ratings.findIndex(
          (r) => r.week_number === ratingData.week_number && r.year === ratingData.year
        )
        if (idx >= 0) {
          emp.ratings[idx] = ratingData
        } else {
          emp.ratings.unshift(ratingData)
        }
      }
    },
  },
  extraReducers: (builder) => {

    // ── Fetch list ─────────────────────────────────────────
    builder
      .addCase(fetchEmployeesThunk.pending, (state) => {
        state.listLoading = true
        state.listError   = null
      })
      .addCase(fetchEmployeesThunk.fulfilled, (state, action) => {
        state.listLoading = false
        state.list        = action.payload.data
        state.meta        = action.payload.meta
      })
      .addCase(fetchEmployeesThunk.rejected, (state, action) => {
        state.listLoading = false
        state.listError   = action.payload
      })

    // ── Fetch single ───────────────────────────────────────
    builder
      .addCase(fetchEmployeeThunk.pending, (state) => {
        state.detailLoading = true
        state.detailError   = null
      })
      .addCase(fetchEmployeeThunk.fulfilled, (state, action) => {
        state.detailLoading = false
        state.detail        = action.payload
      })
      .addCase(fetchEmployeeThunk.rejected, (state, action) => {
        state.detailLoading = false
        state.detailError   = action.payload
      })

    // ── Create ─────────────────────────────────────────────
    builder
      .addCase(createEmployeeThunk.pending, (state) => {
        state.submitting  = true
        state.submitError = null
      })
      .addCase(createEmployeeThunk.fulfilled, (state, action) => {
        state.submitting = false
        state.list.unshift(action.payload)
        if (state.meta) state.meta.total += 1
      })
      .addCase(createEmployeeThunk.rejected, (state, action) => {
        state.submitting  = false
        state.submitError = action.payload
      })

    // ── Update ─────────────────────────────────────────────
    builder
      .addCase(updateEmployeeThunk.pending, (state) => {
        state.submitting  = true
        state.submitError = null
      })
      .addCase(updateEmployeeThunk.fulfilled, (state, action) => {
        state.submitting = false
        const idx = state.list.findIndex((e) => e.id === action.payload.id)
        if (idx >= 0) state.list[idx] = action.payload
        if (state.detail?.id === action.payload.id) state.detail = action.payload
      })
      .addCase(updateEmployeeThunk.rejected, (state, action) => {
        state.submitting  = false
        state.submitError = action.payload
      })

    // ── Delete ─────────────────────────────────────────────
    builder
      .addCase(deleteEmployeeThunk.fulfilled, (state, action) => {
        state.list = state.list.filter((e) => e.id !== action.payload)
        if (state.meta) state.meta.total -= 1
      })

    // ── History ────────────────────────────────────────────
    builder
      .addCase(fetchEmployeeHistoryThunk.pending, (state) => {
        state.historyLoading = true
      })
      .addCase(fetchEmployeeHistoryThunk.fulfilled, (state, action) => {
        state.historyLoading = false
        state.history        = action.payload.data
        state.historyMeta    = action.payload.meta
      })
      .addCase(fetchEmployeeHistoryThunk.rejected, (state) => {
        state.historyLoading = false
      })

    // ── Profile planning ───────────────────────────────────
    builder
      .addCase(fetchEmployeePlanningThunk.pending, (state) => {
        state.profilePlanningLoading = true
      })
      .addCase(fetchEmployeePlanningThunk.fulfilled, (state, action) => {
        state.profilePlanningLoading = false
        state.profilePlanning        = action.payload.data
        state.profilePlanningMeta    = action.payload.meta
      })
      .addCase(fetchEmployeePlanningThunk.rejected, (state) => {
        state.profilePlanningLoading = false
      })

    // ── Profile pointages ──────────────────────────────────
    builder
      .addCase(fetchEmployeePointagesThunk.pending, (state) => {
        state.profilePointagesLoading = true
      })
      .addCase(fetchEmployeePointagesThunk.fulfilled, (state, action) => {
        state.profilePointagesLoading = false
        state.profilePointages        = action.payload.data
        state.profilePointagesMeta    = action.payload.meta
      })
      .addCase(fetchEmployeePointagesThunk.rejected, (state) => {
        state.profilePointagesLoading = false
      })
  },
})

export const {
  setFilters,
  resetFilters,
  clearDetail,
  clearSubmitError,
  updateEmployeeRatingInList,
} = employeeSlice.actions

export default employeeSlice.reducer