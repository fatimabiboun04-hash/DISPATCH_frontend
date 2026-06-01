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

/**
 * Count of pending leave requests — used in dashboard KPI.
 */
export const selectPendingLeaveCount = (state) =>
  state.leave.adminList.filter((l) => l.status === 'pending').length