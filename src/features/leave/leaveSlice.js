import { createSlice } from '@reduxjs/toolkit'
import {
  fetchLeaveRequestsThunk,
  submitLeaveRequestThunk,
  approveLeaveThunk,
  rejectLeaveThunk,
  fetchMyLeaveRequestsThunk,
} from './leaveThunks'

/**
 * Leave state.
 *
 * adminList:  paginated list for admin management (GET /v1/leave-requests)
 * myList:     paginated list for employee's own requests (GET /v1/me/leave-requests)
 *
 * Filters persisted: status, user_id
 *
 * Status values:  'pending' | 'approved' | 'rejected'
 * Type values:    'annual' | 'sick' | 'emergency' | 'unpaid'
 *
 * Backend:
 * - index()      → paginate(20), loads user
 * - myRequests() → paginate(15), no relations
 * - approve()    → only works on pending, loads user + approver
 * - reject()     → requires rejection_reason, loads user + approver
 * - store()      → authorize()=isEmployee(), checks overlap
 */
const initialState = {
  // Admin list
  adminList:        [],
  adminMeta:        null,
  adminLoading:     false,
  adminError:       null,
  adminFilters: {
    status:  '',
    user_id: '',
  },

  // Employee's own list
  myList:        [],
  myMeta:        null,
  myLoading:     false,
  myError:       null,

  // CRUD
  submitting:  false,
  submitError: null,

  // Per-request action loading (approve/reject)
  actionLoading: {},  // { [leaveId]: boolean }

  // Per-request reject error
  rejectError: null,

  // Planning conflict data (from approve with no force)
  approveConflict: null,  // { leaveId, conflicts, conflict_count }

  // Approval result data (replacement suggestions after force-approve)
  approveResult: null,  // { leaveId, planning_removed, replacement_suggestions }
}

const leaveSlice = createSlice({
  name: 'leave',
  initialState,
  reducers: {
    setAdminFilters: (state, action) => {
      state.adminFilters = { ...state.adminFilters, ...action.payload }
    },
    resetAdminFilters: (state) => {
      state.adminFilters = initialState.adminFilters
    },
    clearSubmitError: (state) => {
      state.submitError = null
    },
    setApproveConflict: (state, action) => {
      state.approveConflict = action.payload
    },
    clearApproveConflict: (state) => {
      state.approveConflict = null
    },
    clearApproveResult: (state) => {
      state.approveResult = null
    },
    clearRejectError: (state) => {
      state.rejectError = null
    },
  },
  extraReducers: (builder) => {

    // ── Admin: fetch all ───────────────────────────────────
    builder
      .addCase(fetchLeaveRequestsThunk.pending, (state) => {
        state.adminLoading = true
        state.adminError   = null
      })
      .addCase(fetchLeaveRequestsThunk.fulfilled, (state, action) => {
        state.adminLoading = false
        state.adminList    = action.payload.data
        state.adminMeta    = action.payload.meta
      })
      .addCase(fetchLeaveRequestsThunk.rejected, (state, action) => {
        state.adminLoading = false
        state.adminError   = action.payload
      })

    // ── Employee: submit ───────────────────────────────────
    builder
      .addCase(submitLeaveRequestThunk.pending, (state) => {
        state.submitting  = true
        state.submitError = null
      })
      .addCase(submitLeaveRequestThunk.fulfilled, (state, action) => {
        state.submitting = false
        // Prepend to employee's own list
        state.myList.unshift(action.payload)
        if (state.myMeta) state.myMeta.total += 1
      })
      .addCase(submitLeaveRequestThunk.rejected, (state, action) => {
        state.submitting  = false
        state.submitError = action.payload
      })

    // ── Admin: approve ─────────────────────────────────────
    builder
      .addCase(approveLeaveThunk.pending, (state, action) => {
        const leaveId = typeof action.meta.arg === 'object' ? action.meta.arg.id : action.meta.arg
        state.actionLoading[leaveId] = true
      })
      .addCase(approveLeaveThunk.fulfilled, (state, action) => {
        // New response shape: { leave_request, planning_removed, replacement_suggestions }
        const leaveRequest = action.payload.leave_request || action.payload
        state.actionLoading[leaveRequest.id] = false
        // Store approval result (replacement suggestions)
        if (action.payload.replacement_suggestions) {
          state.approveResult = {
            leaveId: leaveRequest.id,
            planning_removed: action.payload.planning_removed || 0,
            replacement_suggestions: action.payload.replacement_suggestions || [],
          }
        }
        // Update in admin list
        const idx = state.adminList.findIndex((l) => l.id === leaveRequest.id)
        if (idx >= 0) state.adminList[idx] = leaveRequest
      })
      .addCase(approveLeaveThunk.rejected, (state, action) => {
        const leaveId = typeof action.meta.arg === 'object' ? action.meta.arg.id : action.meta.arg
        state.actionLoading[leaveId] = false
        // If conflict, store for UI
        if (action.payload?.isConflict) {
          state.approveConflict = {
            leaveId,
            conflicts: action.payload.conflicts || [],
            conflict_count: action.payload.conflict_count || 0,
          }
        }
      })

    // ── Admin: reject ──────────────────────────────────────
    builder
      .addCase(rejectLeaveThunk.pending, (state, action) => {
        state.actionLoading[action.meta.arg.id] = true
        state.rejectError = null
      })
      .addCase(rejectLeaveThunk.fulfilled, (state, action) => {
        state.actionLoading[action.payload.id] = false
        const idx = state.adminList.findIndex((l) => l.id === action.payload.id)
        if (idx >= 0) state.adminList[idx] = action.payload
      })
      .addCase(rejectLeaveThunk.rejected, (state, action) => {
        state.actionLoading[action.meta.arg.id] = false
        state.rejectError = action.payload
      })

    // ── Employee: fetch own ────────────────────────────────
    builder
      .addCase(fetchMyLeaveRequestsThunk.pending, (state) => {
        state.myLoading = true
        state.myError   = null
      })
      .addCase(fetchMyLeaveRequestsThunk.fulfilled, (state, action) => {
        state.myLoading = false
        state.myList    = action.payload.data
        state.myMeta    = action.payload.meta
      })
      .addCase(fetchMyLeaveRequestsThunk.rejected, (state, action) => {
        state.myLoading = false
        state.myError   = action.payload
      })
  },
})

export const {
  setAdminFilters,
  resetAdminFilters,
  clearSubmitError,
  setApproveConflict,
  clearApproveConflict,
  clearApproveResult,
  clearRejectError,
} = leaveSlice.actions

export default leaveSlice.reducer