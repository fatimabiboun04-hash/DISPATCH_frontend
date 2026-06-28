import { createSelector } from '@reduxjs/toolkit'

// Stats – base
export const selectStats            = (state) => state.dashboard.stats
export const selectStatsLoading     = (state) => state.dashboard.statsLoading
export const selectStatsError       = (state) => state.dashboard.statsError

// Derived from stats — memoised so they re-compute only when stats ref changes
const selectStatsCoverage = createSelector([selectStats], (s) => s?.coverage)
const selectStatsWeekly  = createSelector([selectStats], (s) => s?.weekly_hours)

export const selectCoveragePct      = createSelector([selectStatsCoverage], (c) => c?.percentage ?? 0)
export const selectActiveCount      = createSelector([selectStatsCoverage], (c) => c?.active ?? 0)
export const selectPresentNow       = createSelector([selectStatsCoverage], (c) => c?.present_now ?? 0)
export const selectPlannedToday     = createSelector([selectStatsCoverage], (c) => c?.total ?? 0)
export const selectTodayAssignments = createSelector([selectStatsCoverage], (c) => c?.total ?? 0)
export const selectTotalEmployees   = createSelector([selectStats], (s) => s?.total_employees ?? 0)
export const selectDelaysToday      = createSelector([selectStats], (s) => s?.delays_today ?? 0)
export const selectPendingLeaves    = createSelector([selectStats], (s) => s?.pending_leaves ?? 0)
export const selectFlaggedPointages = createSelector([selectStats], (s) => s?.flagged_pointages ?? 0)
export const selectOvertimes        = createSelector([selectStats], (s) => s?.overtimes ?? 0)
export const selectWeeklyCompletion = createSelector([selectStats], (s) => s?.weekly_completion ?? 0)
export const selectWeeklyHoursData  = createSelector([selectStatsWeekly], (w) => w ?? null)

// Live feed
export const selectLiveFeed         = (state) => state.dashboard.liveFeed
export const selectLiveFeedLoading  = (state) => state.dashboard.liveFeedLoading

// Coverage gauge
export const selectCoverageWeek     = (state) => state.dashboard.coverage
export const selectCoverageLoading  = (state) => state.dashboard.coverageLoading
export const selectCoverageError    = (state) => state.dashboard.coverageError

// Active pauses
export const selectActivePauses     = (state) => state.dashboard.activePauses
export const selectActivePausesCount= createSelector([selectActivePauses], (p) => p?.count ?? 0)
export const selectActivePausesLoading = (state) => state.dashboard.activePausesLoading

// Weekly history
export const selectWeeklyHistory    = (state) => state.dashboard.weeklyHistory
export const selectWeeklyHistoryLoading = (state) => state.dashboard.weeklyHistoryLoading
export const selectWeeklyHistoryError   = (state) => state.dashboard.weeklyHistoryError