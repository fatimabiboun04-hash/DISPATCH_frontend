export const selectEmployeeList         = (state) => state.employees.list
export const selectEmployeeMeta         = (state) => state.employees.meta
export const selectEmployeeListLoading  = (state) => state.employees.listLoading
export const selectEmployeeListError    = (state) => state.employees.listError
export const selectEmployeeFilters      = (state) => state.employees.filters
export const selectEmployeeDetail       = (state) => state.employees.detail
export const selectEmployeeDetailLoading= (state) => state.employees.detailLoading
export const selectEmployeeDetailError  = (state) => state.employees.detailError
export const selectEmployeeSubmitting   = (state) => state.employees.submitting
export const selectEmployeeSubmitError  = (state) => state.employees.submitError
export const selectEmployeeHistory      = (state) => state.employees.history
export const selectEmployeeHistoryLoading = (state) => state.employees.historyLoading
export const selectProfilePlanning      = (state) => state.employees.profilePlanning
export const selectProfilePlanningLoading = (state) => state.employees.profilePlanningLoading
export const selectProfilePointages     = (state) => state.employees.profilePointages
export const selectProfilePointagesLoading = (state) => state.employees.profilePointagesLoading