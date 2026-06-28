import { createSelector } from '@reduxjs/toolkit'

export const selectTasks          = (state) => state.tasks.list
export const selectMyTasks        = (state) => state.tasks.myTasks
export const selectTasksLoading   = (state) => state.tasks.loading
export const selectTasksError     = (state) => state.tasks.error
export const selectTasksSubmitting  = (state) => state.tasks.submitting
export const selectTasksSubmitError = (state) => state.tasks.submitError

export const selectTasksByStatus = createSelector(
  [selectTasks, (_, status) => status],
  (tasks, status) => tasks.filter((t) => t.status === status)
)

export const selectMyTasksByStatus = createSelector(
  [selectMyTasks, (_, status) => status],
  (tasks, status) => tasks.filter((t) => t.status === status)
)
