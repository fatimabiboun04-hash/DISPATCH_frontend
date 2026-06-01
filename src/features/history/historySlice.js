import { createSlice } from '@reduxjs/toolkit'
import {
  fetchAuditLogsThunk,
  fetchLeaveHistoryThunk,
  fetchWeeklyHistoryThunk,
} from './historyThunks'

/**
 * History state.
 *
 * auditLogs:     paginated audit trail from GET /v1/audit-logs
 * leaveHistory:  approved/rejected leave requests for history view
 * weeklyHistory: array of week summaries built from planning data
 *
 * AuditLog fields: user_id, action, entity_type, entity_id,
 *   old_values(array), new_values(array), ip_address, created_at
 *   No updated_at (timestamps=false in model)
 *
 * Audit filters supported by backend:
 *   action, entity_type, user_id, date_from, date_to
 */
const initialState = {
  // Audit logs
  auditLogs:        [],
  auditMeta:        null,
  auditLoading:     false,
  auditError:       null,
  auditFilters: {
    action:      '',
    entity_type: '',
    user_id:     '',
    date_from:   '',
    date_to:     '',
  },

  // Leave history (approved + rejected)
  leaveHistory:        [],
  leaveHistoryMeta:    null,
  leaveHistoryLoading: false,
  leaveHistoryError:   null,

  // Weekly dashboard history
  // Each entry: { week_number, year, weekLabel, planning_count, stats }
  weeklyHistory:        [],
  weeklyHistoryLoading: false,
  weeklyHistoryError:   null,
}

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    setAuditFilters: (state, action) => {
      state.auditFilters = { ...state.auditFilters, ...action.payload }
    },
    resetAuditFilters: (state) => {
      state.auditFilters = initialState.auditFilters
    },
  },
  extraReducers: (builder) => {

    // ── Audit logs ─────────────────────────────────────────
    builder
      .addCase(fetchAuditLogsThunk.pending, (state) => {
        state.auditLoading = true
        state.auditError   = null
      })
      .addCase(fetchAuditLogsThunk.fulfilled, (state, action) => {
        state.auditLoading = false
        state.auditLogs    = action.payload.data
        state.auditMeta    = action.payload.meta
      })
      .addCase(fetchAuditLogsThunk.rejected, (state, action) => {
        state.auditLoading = false
        state.auditError   = action.payload
      })

    // ── Leave history ──────────────────────────────────────
    builder
      .addCase(fetchLeaveHistoryThunk.pending, (state) => {
        state.leaveHistoryLoading = true
        state.leaveHistoryError   = null
      })
      .addCase(fetchLeaveHistoryThunk.fulfilled, (state, action) => {
        state.leaveHistoryLoading = false
        state.leaveHistory        = action.payload.data
        state.leaveHistoryMeta    = action.payload.meta
      })
      .addCase(fetchLeaveHistoryThunk.rejected, (state, action) => {
        state.leaveHistoryLoading = false
        state.leaveHistoryError   = action.payload
      })

    // ── Weekly history ─────────────────────────────────────
    builder
      .addCase(fetchWeeklyHistoryThunk.pending, (state) => {
        state.weeklyHistoryLoading = true
        state.weeklyHistoryError   = null
      })
      .addCase(fetchWeeklyHistoryThunk.fulfilled, (state, action) => {
        state.weeklyHistoryLoading = false
        state.weeklyHistory        = action.payload
      })
      .addCase(fetchWeeklyHistoryThunk.rejected, (state, action) => {
        state.weeklyHistoryLoading = false
        state.weeklyHistoryError   = action.payload
      })
  },
})

export const {
  setAuditFilters,
  resetAuditFilters,
} = historySlice.actions

export default historySlice.reducer