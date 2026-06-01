import { createAsyncThunk } from '@reduxjs/toolkit'
import historyService        from '../../services/historyService'

/**
 * GET /v1/audit-logs
 * Filters: action, entity_type, user_id, date_from, date_to
 * Returns paginatedResponse (paginate 50) with user loaded.
 */
export const fetchAuditLogsThunk = createAsyncThunk(
  'history/fetchAuditLogs',
  async (params, { rejectWithValue }) => {
    try {
      return await historyService.getAuditLogs(params)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load audit logs')
    }
  }
)

/**
 * GET /v1/leave-requests?status=approved&status=rejected
 * Uses admin leave endpoint with status filter.
 * No dedicated history endpoint — reuses existing route.
 */
export const fetchLeaveHistoryThunk = createAsyncThunk(
  'history/fetchLeaveHistory',
  async (params, { rejectWithValue }) => {
    try {
      return await historyService.getLeaveHistory(params)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load leave history')
    }
  }
)

/**
 * Builds weekly dashboard history from available data.
 * No dedicated backend endpoint for this.
 * Fetches planning counts for multiple past weeks.
 * Returns array of week summary objects.
 */
export const fetchWeeklyHistoryThunk = createAsyncThunk(
  'history/fetchWeeklyHistory',
  async (weeksBack = 8, { rejectWithValue }) => {
    try {
      return await historyService.getWeeklyHistory(weeksBack)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load weekly history')
    }
  }
)