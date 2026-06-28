import { createSlice } from '@reduxjs/toolkit'
import {
  generateSandboxThunk,
  previewSandboxThunk,
  acceptSandboxThunk,
  cancelSandboxThunk,
} from './planningSandboxThunks'

const initialState = {
  sessionId: null,
  items: [],
  count: 0,
  generating: false,
  loading: false,
  accepting: false,
  result: null,
  errors: [],
  error: null,
}

const planningSandboxSlice = createSlice({
  name: 'planningSandbox',
  initialState,
  reducers: {
    clearSandbox: (state) => {
      state.sessionId = null
      state.items = []
      state.count = 0
      state.result = null
      state.errors = []
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateSandboxThunk.pending, (state) => {
        state.generating = true
        state.errors = []
        state.error = null
      })
      .addCase(generateSandboxThunk.fulfilled, (state, action) => {
        state.generating = false
        state.sessionId = action.payload.session_id
        state.items = action.payload.items
        state.count = action.payload.generated_count
        state.errors = action.payload.errors || []
      })
      .addCase(generateSandboxThunk.rejected, (state, action) => {
        state.generating = false
        state.error = action.payload
      })

    builder
      .addCase(previewSandboxThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(previewSandboxThunk.fulfilled, (state, action) => {
        state.loading = false
        state.sessionId = action.payload.session_id
        state.items = action.payload.items
        state.count = action.payload.count
      })
      .addCase(previewSandboxThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    builder
      .addCase(acceptSandboxThunk.pending, (state) => {
        state.accepting = true
        state.error = null
      })
      .addCase(acceptSandboxThunk.fulfilled, (state, action) => {
        state.accepting = false
        state.result = action.payload
        state.items = []
        state.count = 0
      })
      .addCase(acceptSandboxThunk.rejected, (state, action) => {
        state.accepting = false
        state.error = action.payload
      })

    builder
      .addCase(cancelSandboxThunk.fulfilled, (state) => {
        state.sessionId = null
        state.items = []
        state.count = 0
        state.errors = []
      })
  },
})

export const { clearSandbox } = planningSandboxSlice.actions
export default planningSandboxSlice.reducer
