import { createSlice } from '@reduxjs/toolkit'
import {
  fetchSkillsThunk,
  createSkillThunk,
  updateSkillThunk,
  deleteSkillThunk,
} from './skillThunks'

const initialState = {
  list:        [],
  loading:     false,
  error:       null,
  submitting:  false,
  submitError: null,
}

const skillSlice = createSlice({
  name: 'skills',
  initialState,
  reducers: {
    clearSubmitError: (state) => {
      state.submitError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSkillsThunk.pending, (state) => {
        state.loading = true
        state.error   = null
      })
      .addCase(fetchSkillsThunk.fulfilled, (state, action) => {
        state.loading = false
        state.list    = action.payload
      })
      .addCase(fetchSkillsThunk.rejected, (state, action) => {
        state.loading = false
        state.error   = action.payload
      })

    builder
      .addCase(createSkillThunk.pending, (state) => {
        state.submitting  = true
        state.submitError = null
      })
      .addCase(createSkillThunk.fulfilled, (state, action) => {
        state.submitting = false
        state.list.push(action.payload)
      })
      .addCase(createSkillThunk.rejected, (state, action) => {
        state.submitting  = false
        state.submitError = action.payload
      })

    builder
      .addCase(updateSkillThunk.pending, (state) => {
        state.submitting  = true
        state.submitError = null
      })
      .addCase(updateSkillThunk.fulfilled, (state, action) => {
        state.submitting = false
        const idx = state.list.findIndex((s) => s.id === action.payload.id)
        if (idx >= 0) state.list[idx] = action.payload
      })
      .addCase(updateSkillThunk.rejected, (state, action) => {
        state.submitting  = false
        state.submitError = action.payload
      })

    builder
      .addCase(deleteSkillThunk.pending, (state) => {
        state.submitting  = true
        state.submitError = null
      })
      .addCase(deleteSkillThunk.fulfilled, (state, action) => {
        state.submitting = false
        state.list = state.list.filter((s) => s.id !== action.payload)
      })
      .addCase(deleteSkillThunk.rejected, (state, action) => {
        state.submitting  = false
        state.submitError = action.payload
      })
  },
})

export const { clearSubmitError } = skillSlice.actions
export default skillSlice.reducer
