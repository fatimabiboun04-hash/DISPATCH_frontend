import { createSelector } from '@reduxjs/toolkit'

export const selectAdminLeaveList    = (state) => state.leave.adminList
export const selectAdminLeaveMeta    = (state) => state.leave.adminMeta
export const selectAdminLeaveLoading = (state) => state.leave.adminLoading
export const selectAdminLeaveError   = (state) => state.leave.adminError
export const selectAdminLeaveFilters = (state) => state.leave.adminFilters
export const selectLeaveActionLoading= (state) => state.leave.actionLoading

export const selectMyLeaveList       = (state) => state.leave.myList
export const selectMyLeaveMeta       = (state) => state.leave.myMeta
export const selectMyLeaveLoading    = (state) => state.leave.myLoading

export const selectLeaveSubmitting   = (state) => state.leave.submitting
export const selectLeaveSubmitError  = (state) => state.leave.submitError

/** Memoized: only recomputes when adminList ref changes */
export const selectPendingLeaveCount = createSelector(
  [selectAdminLeaveList],
  (list) => list.filter((l) => l.status === 'pending').length
)

export const selectApproveConflict = (state) => state.leave.approveConflict
export const selectApproveResult   = (state) => state.leave.approveResult