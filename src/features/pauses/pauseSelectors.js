import { createSelector } from '@reduxjs/toolkit'

const selectPausesState = (state) => state.pauses

export const selectPausesByPlanningId = createSelector(
  [selectPausesState, (_, planningId) => planningId],
  (pauses, planningId) => pauses.byPlanningId[planningId] || []
)

export const selectPausesLoading = createSelector(
  [selectPausesState, (_, planningId) => planningId],
  (pauses, planningId) => pauses.loading[planningId] || false
)

export const selectPauseSubmitting = (state) => state.pauses.submitting
export const selectPauseSubmitError = (state) => state.pauses.submitError
