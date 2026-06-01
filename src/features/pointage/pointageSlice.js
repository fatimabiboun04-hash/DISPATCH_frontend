import { createSlice } from '@reduxjs/toolkit'
import {
  checkInThunk,
  checkOutThunk,
  fetchMyPointagesThunk,
  fetchFlaggedThunk,
  verifyFlagThunk,
  fetchAbsentTodayThunk,
  fetchReplacementSuggestionThunk,
} from './pointageThunks'

/**
 * Pointage state.
 *
 * todayStatus: the current check-in state for the logged-in employee.
 *   Derived from the most recent pointage record (check_out_at null = still checked in).
 *
 * Backend status values:
 *   check-in:  'on_time' | 'late' | 'flagged'
 *   check-out: 'on_time' | 'late' | 'flagged' | 'early_leave'
 *
 * Admin-only data:
 *   flagged: paginated list of unverified suspicious check-ins
 *   absentToday: employees who have planning but no check-in
 */
const initialState = {
  // Employee self check-in/out
  todayPointage:    null,  // current open pointage (check_out_at = null)
  checkInLoading:   false,
  checkOutLoading:  false,
  checkInError:     null,
  checkOutError:    null,
  lastAction:       null,  // { type: 'check_in'|'check_out', result: {...} }

  // Employee pointage history (GET /v1/me/pointages)
  myPointages:       [],
  myPointagesMeta:   null,
  myPointagesLoading: false,
  myPointagesError:  null,

  // Admin: flagged pointages
  flagged:        [],
  flaggedMeta:    null,
  flaggedLoading: false,

  // Admin: absent today
  absentToday:        null,   // { absent_count, total_planned, absent_employees[] }
  absentLoading:      false,
  absentError:        null,

  // Admin: replacement suggestions per planning
  replacements:       {},     // { [planningId]: { planning_id, original_employee, suggestions[] } }
  replacementsLoading:{},     // { [planningId]: boolean }
}

const pointageSlice = createSlice({
  name: 'pointage',
  initialState,
  reducers: {
    clearCheckInError:  (state) => { state.checkInError  = null },
    clearCheckOutError: (state) => { state.checkOutError = null },
    clearLastAction:    (state) => { state.lastAction    = null },
    // Set today's pointage from profile/dashboard data
    setTodayPointage: (state, action) => {
      state.todayPointage = action.payload
    },
  },
  extraReducers: (builder) => {

    // ── Check-in ───────────────────────────────────────────
    builder
      .addCase(checkInThunk.pending, (state) => {
        state.checkInLoading = true
        state.checkInError   = null
        state.lastAction     = null
      })
      .addCase(checkInThunk.fulfilled, (state, action) => {
        state.checkInLoading = false
        state.todayPointage  = action.payload.pointage
        state.lastAction     = { type: 'check_in', result: action.payload }
      })
      .addCase(checkInThunk.rejected, (state, action) => {
        state.checkInLoading = false
        state.checkInError   = action.payload
      })

    // ── Check-out ──────────────────────────────────────────
    builder
      .addCase(checkOutThunk.pending, (state) => {
        state.checkOutLoading = true
        state.checkOutError   = null
      })
      .addCase(checkOutThunk.fulfilled, (state, action) => {
        state.checkOutLoading = false
        // Mark today pointage as closed
        if (state.todayPointage) {
          state.todayPointage = {
            ...state.todayPointage,
            check_out_at:  new Date().toISOString(),
            worked_minutes: action.payload.worked_hours * 60,
            status:         action.payload.status,
          }
        }
        state.lastAction = { type: 'check_out', result: action.payload }
      })
      .addCase(checkOutThunk.rejected, (state, action) => {
        state.checkOutLoading = false
        state.checkOutError   = action.payload
      })

    // ── My pointages ───────────────────────────────────────
    builder
      .addCase(fetchMyPointagesThunk.pending, (state) => {
        state.myPointagesLoading = true
        state.myPointagesError   = null
      })
      .addCase(fetchMyPointagesThunk.fulfilled, (state, action) => {
        state.myPointagesLoading = false
        state.myPointages        = action.payload.data
        state.myPointagesMeta    = action.payload.meta
        // Detect if there's an open check-in today
        const today       = new Date().toDateString()
        const openToday   = action.payload.data.find((p) => {
          const checkIn = new Date(p.check_in_at).toDateString()
          return checkIn === today && !p.check_out_at
        })
        if (openToday) state.todayPointage = openToday
      })
      .addCase(fetchMyPointagesThunk.rejected, (state, action) => {
        state.myPointagesLoading = false
        state.myPointagesError   = action.payload
      })

    // ── Flagged ────────────────────────────────────────────
    builder
      .addCase(fetchFlaggedThunk.pending, (state) => {
        state.flaggedLoading = true
      })
      .addCase(fetchFlaggedThunk.fulfilled, (state, action) => {
        state.flaggedLoading = false
        state.flagged        = action.payload.data
        state.flaggedMeta    = action.payload.meta
      })
      .addCase(fetchFlaggedThunk.rejected, (state) => {
        state.flaggedLoading = false
      })

    // ── Verify flag ────────────────────────────────────────
    builder
      .addCase(verifyFlagThunk.fulfilled, (state, action) => {
        const idx = state.flagged.findIndex((p) => p.id === action.payload.id)
        if (idx >= 0) {
          // Remove from flagged list once verified
          state.flagged.splice(idx, 1)
          if (state.flaggedMeta) state.flaggedMeta.total -= 1
        }
      })

    // ── Absent today ───────────────────────────────────────
    builder
      .addCase(fetchAbsentTodayThunk.pending, (state) => {
        state.absentLoading = true
        state.absentError   = null
      })
      .addCase(fetchAbsentTodayThunk.fulfilled, (state, action) => {
        state.absentLoading = false
        state.absentToday   = action.payload
      })
      .addCase(fetchAbsentTodayThunk.rejected, (state, action) => {
        state.absentLoading = false
        state.absentError   = action.payload
      })

    // ── Replacement suggestions ────────────────────────────
    builder
      .addCase(fetchReplacementSuggestionThunk.pending, (state, action) => {
        const id = action.meta.arg
        state.replacementsLoading[id] = true
      })
      .addCase(fetchReplacementSuggestionThunk.fulfilled, (state, action) => {
        const id = action.payload.planning_id
        state.replacementsLoading[id] = false
        state.replacements[id]        = action.payload
      })
      .addCase(fetchReplacementSuggestionThunk.rejected, (state, action) => {
        const id = action.meta.arg
        state.replacementsLoading[id] = false
      })
  },
})

export const {
  clearCheckInError,
  clearCheckOutError,
  clearLastAction,
  setTodayPointage,
} = pointageSlice.actions

export default pointageSlice.reducer