import { createSelector } from '@reduxjs/toolkit'

export const selectPlanningData     = (state) => state.planning.data
export const selectPlanningMeta     = (state) => state.planning.meta
export const selectPlanningLoading  = (state) => state.planning.loading
export const selectPlanningError    = (state) => state.planning.error
export const selectWeekInfo         = (state) => state.planning.weekInfo
export const selectPlanningFilters  = (state) => state.planning.filters
export const selectPlanningSubmitting = (state) => state.planning.submitting
export const selectConflictErrors   = (state) => state.planning.conflictErrors
export const selectSubmitError      = (state) => state.planning.submitError
export const selectFieldErrors      = (state) => state.planning.fieldErrors
export const selectDeleteLoading    = (state) => state.planning.deleteLoading
export const selectDeleteError      = (state) => state.planning.deleteError
export const selectOverrideLoading  = (state) => state.planning.overrideLoading
export const selectOverrideError    = (state) => state.planning.overrideError
export const selectLockPlanningLoading = (state) => state.planning.lockPlanningLoading
export const selectLockPlanningError   = (state) => state.planning.lockPlanningError
export const selectLockLoading      = (state) => state.planning.lockLoading
export const selectLockResult       = (state) => state.planning.lockResult
export const selectGenerateLoading  = (state) => state.planning.generateLoading
export const selectGenerateResult   = (state) => state.planning.generateResult
export const selectGenerateErrors   = (state) => state.planning.generateErrors
export const selectSuggestions      = (state) => state.planning.suggestions
export const selectSuggestionsLoading = (state) => state.planning.suggestionsLoading

export const selectHistoryData       = (state) => state.planning.historyData
export const selectHistoryMeta       = (state) => state.planning.historyMeta
export const selectHistoryLoading    = (state) => state.planning.historyLoading
export const selectHistoryError      = (state) => state.planning.historyError
export const selectHistoryWeekInfo   = (state) => state.planning.historyWeekInfo

export const selectHistoryByDate = createSelector(
  [selectHistoryData],
  (data) => {
    const grouped = {}
    data.forEach((p) => {
      const key = p.date
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(p)
    })
    return grouped
  }
)

export const selectPlanningByDate = createSelector(
  [selectPlanningData],
  (data) => {
    const grouped = {}
    data.forEach((p) => {
      const key = p.date
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(p)
    })
    return grouped
  }
)

export const selectHasLockedRecords = createSelector(
  [selectPlanningData],
  (data) => data.some((p) => p.is_locked)
)

export const selectLockedCount = createSelector(
  [selectPlanningData],
  (data) => data.filter((p) => p.is_locked).length
)

export const selectSelectedIds = (state) => state.planning.selectedIds
export const selectBatchLoading = (state) => state.planning.batchLoading
export const selectBatchResult = (state) => state.planning.batchResult
export const selectBatchErrors = (state) => state.planning.batchErrors
export const selectBatchValidation = (state) => state.planning.batchValidation

export const selectSelectedPlannings = createSelector(
  [selectPlanningData, selectSelectedIds],
  (data, ids) => data.filter((p) => ids.includes(p.id))
)
