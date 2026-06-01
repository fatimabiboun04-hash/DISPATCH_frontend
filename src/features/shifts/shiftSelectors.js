/**
 * Shift selectors.
 * selectActiveShifts → filtered list used in planning dropdowns.
 * selectAllShifts    → full list for admin management page.
 */
export const selectAllShifts      = (state) => state.shifts.list
export const selectShiftsLoading  = (state) => state.shifts.loading
export const selectShiftsError    = (state) => state.shifts.error
export const selectShiftsSubmitting  = (state) => state.shifts.submitting
export const selectShiftsSubmitError = (state) => state.shifts.submitError
export const selectShowInactive   = (state) => state.shifts.showInactive

/**
 * Only active shifts — used in planning cell dropdowns.
 * Memoized-style selector (recomputed on list change).
 */
export const selectActiveShifts = (state) =>
  state.shifts.list.filter((s) => s.is_active)

/**
 * Shifts grouped by type — useful for planning color mapping.
 */
export const selectShiftsByType = (state) =>
  state.shifts.list.reduce((acc, shift) => {
    if (!acc[shift.type]) acc[shift.type] = []
    acc[shift.type].push(shift)
    return acc
  }, {})