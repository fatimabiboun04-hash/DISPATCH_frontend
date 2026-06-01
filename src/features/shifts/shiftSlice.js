import { createSlice } from '@reduxjs/toolkit'
import {
  fetchShiftsThunk,
  createShiftThunk,
  updateShiftThunk,
  deactivateShiftThunk,
} from './shiftThunks'

/**
 * Shifts state.
 *
 * IMPORTANT: GET /v1/shifts returns a plain array (not paginated).
 * Backend: Shift::orderBy('start_time')->get()
 * Response: { success: true, data: [...], message: '' }
 * NO meta object — no pagination.
 *
 * "delete" is actually deactivation:
 *   ShiftController@destroy → $shift->update(['is_active' => false])
 *   Returns successResponse(null, 'Shift deactivated')
 */
const initialState = {
  list:        [],       // all shifts (active + inactive)
  loading:     false,
  error:       null,
  submitting:  false,
  submitError: null,

  // Filter UI state — show inactive shifts toggle
  showInactive: false,
}

const shiftSlice = createSlice({
  name: 'shifts',
  initialState,
  reducers: {
    clearSubmitError: (state) => {
      state.submitError = null
    },
    toggleShowInactive: (state) => {
      state.showInactive = !state.showInactive
    },
  },
  extraReducers: (builder) => {

    // ── Fetch list ─────────────────────────────────────────
    // Returns plain array — no meta
    builder
      .addCase(fetchShiftsThunk.pending, (state) => {
        state.loading = true
        state.error   = null
      })
      .addCase(fetchShiftsThunk.fulfilled, (state, action) => {
        state.loading = false
        state.list    = action.payload  // plain array
      })
      .addCase(fetchShiftsThunk.rejected, (state, action) => {
        state.loading = false
        state.error   = action.payload
      })

    // ── Create ─────────────────────────────────────────────
    builder
      .addCase(createShiftThunk.pending, (state) => {
        state.submitting  = true
        state.submitError = null
      })
      .addCase(createShiftThunk.fulfilled, (state, action) => {
        state.submitting = false
        // Insert in correct position (sorted by start_time)
        state.list.push(action.payload)
        state.list.sort((a, b) => {
          const toMinutes = (t) => {
            const [h, m] = (t || '00:00').split(':').map(Number)
            return h * 60 + m
          }
          return toMinutes(a.start_time) - toMinutes(b.start_time)
        })
      })
      .addCase(createShiftThunk.rejected, (state, action) => {
        state.submitting  = false
        state.submitError = action.payload
      })

    // ── Update ─────────────────────────────────────────────
    builder
      .addCase(updateShiftThunk.pending, (state) => {
        state.submitting  = true
        state.submitError = null
      })
      .addCase(updateShiftThunk.fulfilled, (state, action) => {
        state.submitting = false
        const idx = state.list.findIndex((s) => s.id === action.payload.id)
        if (idx >= 0) state.list[idx] = action.payload
      })
      .addCase(updateShiftThunk.rejected, (state, action) => {
        state.submitting  = false
        state.submitError = action.payload
      })

    // ── Deactivate (not delete) ────────────────────────────
    // Returns successResponse(null) so payload is null
    // We update the shift's is_active in the local list
    builder
      .addCase(deactivateShiftThunk.fulfilled, (state, action) => {
        // action.payload = shiftId (we pass it through)
        const idx = state.list.findIndex((s) => s.id === action.payload)
        if (idx >= 0) state.list[idx].is_active = false
      })
  },
})

export const { clearSubmitError, toggleShowInactive } = shiftSlice.actions
export default shiftSlice.reducer