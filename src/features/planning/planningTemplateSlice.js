import { createSlice } from '@reduxjs/toolkit'
import {
  fetchTemplatesThunk,
  createTemplateThunk,
  deleteTemplateThunk,
  duplicateTemplateThunk,
  loadTemplateThunk,
} from './planningTemplateThunks'

const initialState = {
  list: [],
  meta: null,
  loading: false,
  error: null,
  creating: false,
  loadResult: null,
  loadErrors: [],
  loadLoading: false,
}

const planningTemplateSlice = createSlice({
  name: 'planningTemplates',
  initialState,
  reducers: {
    clearLoadResult: (state) => {
      state.loadResult = null
      state.loadErrors = []
    },
    clearTemplateError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTemplatesThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTemplatesThunk.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload.data
        state.meta = action.payload.meta
      })
      .addCase(fetchTemplatesThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    builder
      .addCase(createTemplateThunk.pending, (state) => {
        state.creating = true
        state.error = null
      })
      .addCase(createTemplateThunk.fulfilled, (state, action) => {
        state.creating = false
        state.list.unshift(action.payload)
      })
      .addCase(createTemplateThunk.rejected, (state, action) => {
        state.creating = false
        state.error = action.payload
      })

    builder
      .addCase(deleteTemplateThunk.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteTemplateThunk.fulfilled, (state, action) => {
        state.loading = false
        state.list = state.list.filter((t) => t.id !== action.payload)
      })
      .addCase(deleteTemplateThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    builder
      .addCase(duplicateTemplateThunk.fulfilled, (state, action) => {
        state.list.unshift(action.payload)
      })

    builder
      .addCase(loadTemplateThunk.pending, (state) => {
        state.loadLoading = true
        state.loadResult = null
        state.loadErrors = []
      })
      .addCase(loadTemplateThunk.fulfilled, (state, action) => {
        state.loadLoading = false
        state.loadResult = action.payload
        state.loadErrors = action.payload.errors || []
      })
      .addCase(loadTemplateThunk.rejected, (state, action) => {
        state.loadLoading = false
        state.loadErrors = [action.payload?.message || 'Failed to load template']
      })
  },
})

export const { clearLoadResult, clearTemplateError } = planningTemplateSlice.actions
export default planningTemplateSlice.reducer
