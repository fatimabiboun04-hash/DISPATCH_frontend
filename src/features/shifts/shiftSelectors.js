import { createSelector } from '@reduxjs/toolkit'

export const selectAllShifts      = (state) => state.shifts.list
export const selectShiftsLoading  = (state) => state.shifts.loading
export const selectShiftsError    = (state) => state.shifts.error
export const selectShiftsSubmitting  = (state) => state.shifts.submitting
export const selectShiftsSubmitError = (state) => state.shifts.submitError
export const selectShowInactive   = (state) => state.shifts.showInactive

export const selectActiveShifts = createSelector(
  [selectAllShifts],
  (shifts) => shifts.filter((s) => s.is_active)
)
