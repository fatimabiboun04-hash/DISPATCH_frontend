/**
 * Dashboard selectors.
 * Each selector maps exactly to the backend response field names.
 */

// Stats — from GET /v1/dashboard/stats → res.data.data
export const selectStats            = (state) => state.dashboard.stats
export const selectStatsLoading     = (state) => state.dashboard.statsLoading
export const selectStatsError       = (state) => state.dashboard.statsError

// Derived from stats.coverage
export const selectCoveragePct      = (state) => state.dashboard.stats?.coverage?.percentage ?? 0
export const selectActiveCount      = (state) => state.dashboard.stats?.coverage?.active ?? 0
export const selectTotalEmployees   = (state) => state.dashboard.stats?.coverage?.total ?? 0
export const selectDelaysToday      = (state) => state.dashboard.stats?.delays_today ?? 0
export const selectPendingLeaves    = (state) => state.dashboard.stats?.pending_leaves ?? 0
export const selectFlaggedPointages = (state) => state.dashboard.stats?.flagged_pointages ?? 0
export const selectTodayAssignments = (state) => state.dashboard.stats?.today_assignments ?? 0

// Live feed — from GET /v1/dashboard/live-feed → res.data.data (array)
export const selectLiveFeed         = (state) => state.dashboard.liveFeed
export const selectLiveFeedLoading  = (state) => state.dashboard.liveFeedLoading

// Coverage gauge — from GET /v1/dashboard/coverage → res.data.data (array of 7)
export const selectCoverageWeek     = (state) => state.dashboard.coverage
export const selectCoverageLoading  = (state) => state.dashboard.coverageLoading

// Active pauses — from GET /v1/dashboard/active-pauses → res.data.data
export const selectActivePauses     = (state) => state.dashboard.activePauses
export const selectActivePausesCount= (state) => state.dashboard.activePauses?.count ?? 0
export const selectActivePausesLoading = (state) => state.dashboard.activePausesLoading
export const selectCoverageError = (state) => state.dashboard.coverageError