import { createSlice } from '@reduxjs/toolkit'
import {
  fetchStatsThunk,
  fetchLiveFeedThunk,
  fetchCoverageThunk,
  fetchActivePausesThunk,
  fetchWeeklyHistoryThunk,
} from './dashboardThunks'

const initialState = {
  // Stats KPIs
  stats: null,
  statsLoading: false,
  statsError: null,

  // Live activity feed
  liveFeed: [],
  liveFeedLoading: false,
  liveFeedError: null,

  // Weekly coverage gauge
  coverage: [],
  coverageLoading: false,
  coverageError: null,

  // Active pauses widget
  activePauses: { count: 0, pauses: [] },
  activePausesLoading: false,
  activePausesError: null,

  // Weekly history (snapshots)
  weeklyHistory: [],
  weeklyHistoryLoading: false,
  weeklyHistoryError: null,

  // Charts data (from stats endpoint)
  charts: null,

  // KPI Engine data
  kpis: null,

  // Alerts data
  alerts: null,

  // Navigation
  navigation: null,

  // Quick actions
  quickActions: null,

  // Cards data
  cards: null,

  // Current week/year
  currentWeek: null,
  currentYear: null,

  // Timestamp of last full refresh
  lastRefreshed: null,
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setLastRefreshed: (state) => {
      state.lastRefreshed = new Date().toISOString()
    },
    clearState: () => initialState,
  },

  extraReducers: (builder) => {
    // ── Stats ───────────────────────────────────────────────
    builder
      .addCase(fetchStatsThunk.pending, (state) => {
        state.statsLoading = true
        state.statsError   = null
      })
      .addCase(fetchStatsThunk.fulfilled, (state, action) => {
        state.statsLoading = false
        state.stats        = action.payload

        // Extract chart data
        state.charts = action.payload?.charts ?? null
        state.kpis   = action.payload?.kpis   ?? null
        state.alerts = action.payload?.alerts ?? null
        state.navigation = action.payload?.navigation ?? null
        state.quickActions = action.payload?.quick_actions ?? null
        state.cards = action.payload?.cards ?? null
        state.currentWeek = action.payload?.current_week ?? null
        state.currentYear = action.payload?.current_year ?? null
      })
      .addCase(fetchStatsThunk.rejected, (state, action) => {
        state.statsLoading = false
        state.statsError   = action.payload
      })

    // ── Live Feed ───────────────────────────────────────────
    builder
      .addCase(fetchLiveFeedThunk.pending, (state) => {
        state.liveFeedLoading = true
        state.liveFeedError   = null
      })
      .addCase(fetchLiveFeedThunk.fulfilled, (state, action) => {
        state.liveFeedLoading = false
        state.liveFeed        = action.payload
      })
      .addCase(fetchLiveFeedThunk.rejected, (state, action) => {
        state.liveFeedLoading = false
        state.liveFeedError   = action.payload
      })

    // ── Coverage ────────────────────────────────────────────
    builder
      .addCase(fetchCoverageThunk.pending, (state) => {
        state.coverageLoading = true
        state.coverageError   = null
      })
      .addCase(fetchCoverageThunk.fulfilled, (state, action) => {
        state.coverageLoading = false
        state.coverage        = action.payload
      })
      .addCase(fetchCoverageThunk.rejected, (state, action) => {
        state.coverageLoading = false
        state.coverageError   = action.payload
      })

    // ── Active Pauses ───────────────────────────────────────
    builder
      .addCase(fetchActivePausesThunk.pending, (state) => {
        state.activePausesLoading = true
        state.activePausesError   = null
      })
      .addCase(fetchActivePausesThunk.fulfilled, (state, action) => {
        state.activePausesLoading = false
        state.activePauses        = action.payload
      })
      .addCase(fetchActivePausesThunk.rejected, (state, action) => {
        state.activePausesLoading = false
        state.activePausesError   = action.payload
      })

    // ── Weekly History ──────────────────────────────────────
    builder
      .addCase(fetchWeeklyHistoryThunk.pending, (state) => {
        state.weeklyHistoryLoading = true
        state.weeklyHistoryError   = null
      })
      .addCase(fetchWeeklyHistoryThunk.fulfilled, (state, action) => {
        state.weeklyHistoryLoading = false
        state.weeklyHistory        = action.payload
      })
      .addCase(fetchWeeklyHistoryThunk.rejected, (state, action) => {
        state.weeklyHistoryLoading = false
        state.weeklyHistoryError   = action.payload
      })
  },
})

export const { setLastRefreshed, clearState } = dashboardSlice.actions
export default dashboardSlice.reducer
