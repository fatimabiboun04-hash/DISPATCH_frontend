import { createSelector } from '@reduxjs/toolkit'

// ── Base selectors ──
export const selectStats            = (state) => state.dashboard.stats
export const selectStatsLoading     = (state) => state.dashboard.statsLoading
export const selectStatsError       = (state) => state.dashboard.statsError

// ── Navigation / Week ──
export const selectNavigation = (state) => state.dashboard.navigation
export const selectCurrentWeek = (state) => state.dashboard.currentWeek
export const selectCurrentYear = (state) => state.dashboard.currentYear
export const selectIsCurrentWeek = createSelector([selectStats], (s) => s?.is_current_week ?? true)
export const selectWeekLabel = createSelector(
  [selectNavigation, selectCurrentWeek, selectCurrentYear],
  (nav, week, year) => {
    if (nav?.week_start && nav?.week_end) {
      const s = nav.week_start.split('-').slice(1).join('/')
      const e = nav.week_end.split('-').slice(1).join('/')
      return `S${week} — ${s} - ${e}`
    }
    return `S${week} ${year}`
  }
)

// ── Derived from stats — memoised ──
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

// ── Cards (new comprehensive KPIs) ──
export const selectCards = (state) => state.dashboard.cards
export const selectEmployeesScheduledToday = createSelector([selectCards], (c) => c?.employees_scheduled_today ?? 0)
export const selectEmployeesWorkingNow     = createSelector([selectCards], (c) => c?.employees_working_now ?? 0)
export const selectEmployeesAbsent         = createSelector([selectCards], (c) => c?.employees_absent ?? 0)
export const selectEmployeesOnLeave        = createSelector([selectCards], (c) => c?.employees_on_leave ?? 0)
export const selectEmployeesOnPause        = createSelector([selectCards], (c) => c?.employees_on_pause ?? 0)
export const selectWeeklyWorkedHours       = createSelector([selectCards], (c) => c?.weekly_worked_hours ?? 0)
export const selectWeeklyPlannedHours      = createSelector([selectCards], (c) => c?.weekly_planned_hours ?? 0)
export const selectOvertimeHours           = createSelector([selectCards], (c) => c?.overtime_hours ?? 0)
export const selectMissingAssignments      = createSelector([selectCards], (c) => c?.missing_assignments ?? 0)
export const selectCompletedTasks          = createSelector([selectCards], (c) => c?.completed_tasks ?? 0)
export const selectPendingTasks            = createSelector([selectCards], (c) => c?.pending_tasks ?? 0)
export const selectLockedWeeks             = createSelector([selectCards], (c) => c?.locked_weeks ?? 0)
export const selectOpenWeeks               = createSelector([selectCards], (c) => c?.open_weeks ?? 0)
export const selectUnreadNotifications     = createSelector([selectCards], (c) => c?.unread_notifications ?? 0)

// ── Live feed ──
export const selectLiveFeed         = (state) => state.dashboard.liveFeed
export const selectLiveFeedLoading  = (state) => state.dashboard.liveFeedLoading

// ── Coverage gauge ──
export const selectCoverageWeek     = (state) => state.dashboard.coverage
export const selectCoverageLoading  = (state) => state.dashboard.coverageLoading
export const selectCoverageError    = (state) => state.dashboard.coverageError

// ── Active pauses ──
export const selectActivePauses     = (state) => state.dashboard.activePauses
export const selectActivePausesCount= createSelector([selectActivePauses], (p) => p?.count ?? 0)
export const selectActivePausesLoading = (state) => state.dashboard.activePausesLoading

// ── Weekly history ──
export const selectWeeklyHistory    = (state) => state.dashboard.weeklyHistory
export const selectWeeklyHistoryLoading = (state) => state.dashboard.weeklyHistoryLoading
export const selectWeeklyHistoryError   = (state) => state.dashboard.weeklyHistoryError

// ── Rating stats (from dashboard) ──
export const selectTotalRated       = createSelector([selectStats], (s) => s?.ratings?.total_rated ?? 0)
export const selectAverageRating    = createSelector([selectStats], (s) => s?.ratings?.average_score ?? 0)
export const selectFiveStarCount    = createSelector([selectStats], (s) => s?.ratings?.five_star_count ?? 0)
export const selectNeedsImprovement = createSelector([selectStats], (s) => s?.ratings?.needs_improvement_count ?? 0)

// ── Charts data ──
export const selectCharts = (state) => state.dashboard.charts
export const selectCoverageDays = createSelector([selectCharts], (c) => c?.coverage_days ?? [])
export const selectAttendanceWeek = createSelector([selectCharts], (c) => c?.attendance_week ?? [])
export const selectShiftDistribution = createSelector([selectCharts], (c) => c?.shift_distribution ?? [])
export const selectTeamCoverage = createSelector([selectCharts], (c) => c?.team_coverage ?? [])
export const selectTaskByStatus = createSelector([selectCharts], (c) => c?.task_by_status ?? {})
export const selectTaskByPriority = createSelector([selectCharts], (c) => c?.task_by_priority ?? {})
export const selectPauseDistribution = createSelector([selectCharts], (c) => c?.pause_distribution ?? {})
export const selectRatingsEvolution = createSelector([selectCharts], (c) => c?.ratings_evolution ?? [])
export const selectWeeklyComparison = createSelector([selectCharts], (c) => c?.weekly_comparison ?? {})

// ── KPI Engine ──
export const selectKpis = (state) => state.dashboard.kpis
export const selectProductivity      = createSelector([selectKpis], (k) => k?.productivity ?? 0)
export const selectUtilization       = createSelector([selectKpis], (k) => k?.utilization ?? 0)
export const selectAbsenceRate       = createSelector([selectKpis], (k) => k?.absence_rate ?? 0)
export const selectAvgPauseMinutes   = createSelector([selectKpis], (k) => k?.average_pause_minutes ?? 0)
export const selectOnTimePercentage  = createSelector([selectKpis], (k) => k?.on_time_percentage ?? 100)
export const selectPlanningQuality   = createSelector([selectKpis], (k) => k?.planning_quality ?? {})

// ── Alerts ──
export const selectAlerts = (state) => state.dashboard.alerts
export const selectCoverageAlerts   = createSelector([selectAlerts], (a) => a?.coverage_alerts ?? [])
export const selectOvertimeEmployeesCount = createSelector([selectAlerts], (a) => a?.overtime_employees ?? 0)
export const selectUnderHoursEmployeesCount = createSelector([selectAlerts], (a) => a?.under_hours_employees ?? 0)

// ── Quick actions ──
export const selectQuickActions = (state) => state.dashboard.quickActions

// ── Misc ──
export const selectLastRefreshed = (state) => state.dashboard.lastRefreshed
