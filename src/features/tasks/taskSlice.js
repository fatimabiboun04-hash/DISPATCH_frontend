import { createSlice } from '@reduxjs/toolkit'
import {
  fetchTasksThunk,
  createTaskThunk,
  updateTaskThunk,
  deleteTaskThunk,
  fetchMyTasksThunk,
} from './taskThunks'

const initialState = {
  list:       [],
  myTasks:    [],
  loading:    false,
  error:      null,
  myTasksLoading: false,
  myTasksError: null,
  submitting: false,
  submitError: null,
}

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearSubmitError: (state) => {
      state.submitError = null
    },
  },
  extraReducers: (builder) => {

    builder
      .addCase(fetchTasksThunk.pending, (state) => {
        state.loading = true
        state.error   = null
      })
      .addCase(fetchTasksThunk.fulfilled, (state, action) => {
        state.loading = false
        state.list    = action.payload
      })
      .addCase(fetchTasksThunk.rejected, (state, action) => {
        state.loading = false
        state.error   = action.payload
      })

    builder
      .addCase(fetchMyTasksThunk.pending, (state) => {
        state.myTasksLoading = true
        state.myTasksError   = null
      })
      .addCase(fetchMyTasksThunk.fulfilled, (state, action) => {
        state.myTasksLoading = false
        state.myTasks = action.payload
      })
      .addCase(fetchMyTasksThunk.rejected, (state, action) => {
        state.myTasksLoading = false
        state.myTasksError   = action.payload
      })

    builder
      .addCase(createTaskThunk.pending, (state) => {
        state.submitting  = true
        state.submitError = null
      })
      .addCase(createTaskThunk.fulfilled, (state, action) => {
        state.submitting = false
        state.list.unshift(action.payload)
      })
      .addCase(createTaskThunk.rejected, (state, action) => {
        state.submitting  = false
        state.submitError = action.payload
      })

    builder
      .addCase(updateTaskThunk.pending, (state) => {
        state.submitting  = true
        state.submitError = null
      })
      .addCase(updateTaskThunk.fulfilled, (state, action) => {
        state.submitting = false
        const idx = state.list.findIndex((t) => t.id === action.payload.id)
        if (idx >= 0) state.list[idx] = action.payload
        const myIdx = state.myTasks.findIndex((t) => t.id === action.payload.id)
        if (myIdx >= 0) state.myTasks[myIdx] = action.payload
      })
      .addCase(updateTaskThunk.rejected, (state, action) => {
        state.submitting  = false
        state.submitError = action.payload
      })

    builder
      .addCase(deleteTaskThunk.fulfilled, (state, action) => {
        state.list = state.list.filter((t) => t.id !== action.payload)
        state.myTasks = state.myTasks.filter((t) => t.id !== action.payload)
      })
  },
})

export const { clearSubmitError } = taskSlice.actions
export default taskSlice.reducer
