/**
 * Planning selectors.
 *
 * Key derived selectors:
 * - selectPlanningByDate: groups planning records by date string
 *   Used by the weekly grid to render each day column.
 * - selectConflicts: records with conflict markers
 * - selectIsCurrentWeekLocked: true if all records in view are locked
 */

export const selectPlanningData     = (state) => state.planning.data
export const selectPlanningMeta     = (state) => state.planning.meta
export const selectPlanningLoading  = (state) => state.planning.loading
export const selectPlanningError    = (state) => state.planning.error
export const selectWeekInfo         = (state) => state.planning.weekInfo
export const selectPlanningFilters  = (state) => state.planning.filters
export const selectPlanningSubmitting = (state) => state.planning.submitting
export const selectConflictErrors   = (state) => state.planning.conflictErrors
export const selectSubmitError      = (state) => state.planning.submitError
export const selectLockLoading      = (state) => state.planning.lockLoading
export const selectLockResult       = (state) => state.planning.lockResult
export const selectGenerateLoading  = (state) => state.planning.generateLoading
export const selectGenerateResult   = (state) => state.planning.generateResult
export const selectGenerateErrors   = (state) => state.planning.generateErrors
export const selectSuggestions      = (state) => state.planning.suggestions
export const selectSuggestionsLoading = (state) => state.planning.suggestionsLoading
// ── History selectors ──────────────────────────────────────────
export const selectHistoryData       = (state) => state.planning.historyData
export const selectHistoryMeta       = (state) => state.planning.historyMeta
export const selectHistoryLoading    = (state) => state.planning.historyLoading
export const selectHistoryError      = (state) => state.planning.historyError
export const selectHistoryWeekInfo   = (state) => state.planning.historyWeekInfo

/**
 * Group history records by date — same pattern as selectPlanningByDate.
 * Used by the read-only history grid.
 */
export const selectHistoryByDate = (state) => {
  const grouped = {}
  state.planning.historyData.forEach((p) => {
    const key = p.date
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(p)
  })
  return grouped
}
/**
 * Group planning records by date string 'YYYY-MM-DD'.
 * Returns: { '2026-05-20': [...plannings], '2026-05-21': [...] }
 * Used by WeeklyGrid to render each day column.
 */
export const selectPlanningByDate = (state) => {
  const grouped = {}
  state.planning.data.forEach((p) => {
    const key = p.date
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(p)
  })
  return grouped
}

/**
 * True if the viewed week has any locked records.
 */
export const selectHasLockedRecords = (state) =>
  state.planning.data.some((p) => p.is_locked)

/**
 * All locked records.
 */
export const selectLockedCount = (state) =>
  state.planning.data.filter((p) => p.is_locked).length