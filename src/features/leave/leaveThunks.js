import { createAsyncThunk } from '@reduxjs/toolkit'
import leaveService from '../../services/leaveService'

/**
 * GET /v1/leave-requests (admin)
 * params: { status?, user_id?, page? }
 */
export const fetchLeaveRequestsThunk = createAsyncThunk(
  'leave/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      return await leaveService.getAll(params)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load leave requests')
    }
  }
)

/**
 * POST /v1/leave-requests (employee only)
 * Body: { start_date, end_date, reason, type }
 * StoreLeaveRequest authorize() = isEmployee()
 */
export const submitLeaveRequestThunk = createAsyncThunk(
  'leave/submit',
  async (data, { rejectWithValue }) => {
    try {
      return await leaveService.submit(data)
    } catch (err) {
      // 422 overlap error: 'You already have approved leave in this date range'
      return rejectWithValue(err.message || 'Failed to submit leave request')
    }
  }
)

/**
 * POST /v1/leave-requests/{id}/approve (admin)
 *
 * New flow:
 * 1. First call WITHOUT force → backend checks for planning conflicts
 * 2. If conflicts exist → backend returns 422 with { has_conflicts, requires_force, conflicts }
 *    Thunk returns this as a structured payload with isConflict: true
 * 3. Second call WITH { force: true } → backend removes planning and approves
 *    On success returns: { leave_request, planning_removed, replacement_suggestions }
 *
 * The calling component uses the conflict payload to show a warning dialog.
 */
export const approveLeaveThunk = createAsyncThunk(
  'leave/approve',
  async ({ id, force = false } = {}, { rejectWithValue }) => {
    try {
      return await leaveService.approve(id, { force })
    } catch (err) {
      // Check if this is a planning conflict (requires_force)
      if (err.errors?.requires_force) {
        return rejectWithValue({
          isConflict: true,
          has_conflicts: true,
          requires_force: true,
          conflicts: err.errors.conflicts || [],
          conflict_count: err.errors.conflict_count || 0,
          message: err.message || 'Planning conflict detected',
        })
      }
      return rejectWithValue({ message: err.message || 'Failed to approve' })
    }
  }
)

/**
 * POST /v1/leave-requests/{id}/reject (admin)
 * Body: { rejection_reason: string (required) }
 * Returns updated leave with user + approver loaded.
 */
export const rejectLeaveThunk = createAsyncThunk(
  'leave/reject',
  async ({ id, rejection_reason }, { rejectWithValue }) => {
    try {
      return await leaveService.reject(id, rejection_reason)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to reject')
    }
  }
)

/**
 * GET /v1/me/leave-requests (employee)
 * Returns paginated own leave requests (no relations loaded).
 */
export const fetchMyLeaveRequestsThunk = createAsyncThunk(
  'leave/fetchMine',
  async (params, { rejectWithValue }) => {
    try {
      return await leaveService.getMine(params)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)