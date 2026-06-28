import { createSelector } from '@reduxjs/toolkit'

export const selectTodayPointage       = (state) => state.pointage.todayPointage
export const selectCheckInLoading      = (state) => state.pointage.checkInLoading
export const selectCheckOutLoading     = (state) => state.pointage.checkOutLoading
export const selectCheckInError        = (state) => state.pointage.checkInError
export const selectCheckOutError       = (state) => state.pointage.checkOutError
export const selectLastAction          = (state) => state.pointage.lastAction

export const selectMyPointages         = (state) => state.pointage.myPointages
export const selectMyPointagesMeta     = (state) => state.pointage.myPointagesMeta
export const selectMyPointagesLoading  = (state) => state.pointage.myPointagesLoading
export const selectMyPointagesError    = (state) => state.pointage.myPointagesError

export const selectFlaggedPointages    = (state) => state.pointage.flagged
export const selectFlaggedMeta         = (state) => state.pointage.flaggedMeta
export const selectFlaggedLoading      = (state) => state.pointage.flaggedLoading
export const selectFlaggedError        = (state) => state.pointage.flaggedError

export const selectAbsentToday         = (state) => state.pointage.absentToday
export const selectAbsentLoading       = (state) => state.pointage.absentLoading
export const selectAbsentError         = (state) => state.pointage.absentError

const getTodayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Plain selector (not memoized) because it depends on the current date
export const selectIsCheckedIn = (state) => {
  const p = selectTodayPointage(state)
  if (!p) return false
  if (p.check_out_at) return false
  const checkIn = (p.check_in_at || '').slice(0, 10)
  return checkIn === getTodayStr()
}

export const selectReplacements = (state) => state.pointage.replacements
export const selectReplacementsLoading = (state) => state.pointage.replacementsLoading
