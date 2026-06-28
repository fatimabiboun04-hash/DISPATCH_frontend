export const selectAuditList = (state) => state.planningAudits?.list || []
export const selectAuditMeta = (state) => state.planningAudits?.meta || null
export const selectAuditLoading = (state) => state.planningAudits?.loading || false
export const selectAuditError = (state) => state.planningAudits?.error || null
