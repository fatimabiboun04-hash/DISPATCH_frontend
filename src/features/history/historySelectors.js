export const selectAuditLogs            = (state) => state.history.auditLogs
export const selectAuditMeta            = (state) => state.history.auditMeta
export const selectAuditLoading         = (state) => state.history.auditLoading
export const selectAuditError           = (state) => state.history.auditError
export const selectAuditFilters         = (state) => state.history.auditFilters

export const selectLeaveHistory         = (state) => state.history.leaveHistory
export const selectLeaveHistoryMeta     = (state) => state.history.leaveHistoryMeta
export const selectLeaveHistoryLoading  = (state) => state.history.leaveHistoryLoading
export const selectLeaveHistoryError    = (state) => state.history.leaveHistoryError

export const selectWeeklyHistory        = (state) => state.history.weeklyHistory
export const selectWeeklyHistoryLoading = (state) => state.history.weeklyHistoryLoading
export const selectWeeklyHistoryError   = (state) => state.history.weeklyHistoryError