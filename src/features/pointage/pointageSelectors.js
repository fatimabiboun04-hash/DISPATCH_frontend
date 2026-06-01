export const selectTodayPointage       = (state) => state.pointage.todayPointage
export const selectCheckInLoading      = (state) => state.pointage.checkInLoading
export const selectCheckOutLoading     = (state) => state.pointage.checkOutLoading
export const selectCheckInError        = (state) => state.pointage.checkInError
export const selectCheckOutError       = (state) => state.pointage.checkOutError
export const selectLastAction          = (state) => state.pointage.lastAction

export const selectMyPointages         = (state) => state.pointage.myPointages
export const selectMyPointagesMeta     = (state) => state.pointage.myPointagesMeta
export const selectMyPointagesLoading  = (state) => state.pointage.myPointagesLoading

export const selectFlaggedPointages    = (state) => state.pointage.flagged
export const selectFlaggedMeta         = (state) => state.pointage.flaggedMeta
export const selectFlaggedLoading      = (state) => state.pointage.flaggedLoading

export const selectAbsentToday         = (state) => state.pointage.absentToday
export const selectAbsentLoading       = (state) => state.pointage.absentLoading
export const selectAbsentError         = (state) => state.pointage.absentError

/**
 * True if employee is currently checked in (has open pointage today).
 * open = check_in_at today AND check_out_at is null.
 */
export const selectIsCheckedIn = (state) => {
  const p = state.pointage.todayPointage
  if (!p) return false
  const today   = new Date().toDateString()
  const checkIn = new Date(p.check_in_at).toDateString()
  return checkIn === today && !p.check_out_at
}

export const selectReplacements = (state) => state.pointage.replacements
export const selectReplacementsLoading = (state) => state.pointage.replacementsLoading