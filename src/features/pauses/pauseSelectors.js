/**
 * Get pauses for a specific planning ID.
 * Used by the drawer to show the pause layer for the selected card.
 */
export const selectPausesByPlanningId = (planningId) => (state) =>
  state.pauses.byPlanningId[planningId] || []

export const selectPausesLoading = (planningId) => (state) =>
  state.pauses.loading[planningId] || false

export const selectPauseSubmitting = (state) => state.pauses.submitting
export const selectPauseSubmitError = (state) => state.pauses.submitError