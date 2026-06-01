import { createSlice } from '@reduxjs/toolkit'
import { toggleRatingThunk, fetchCurrentRatingThunk } from './ratingThunks'

/**
 * Rating state.
 * currentRatings: keyed by employeeId → { has_rating, type, icon, reason }
 * Allows the table to show the current week rating per employee
 * without an extra API call for each row.
 */
const initialState = {
  // Map of employeeId → current rating data
  currentRatings: {},
  toggling:       {},  // employeeId → boolean (loading state per employee)
  error:          null,
}

const ratingSlice = createSlice({
  name: 'ratings',
  initialState,
  reducers: {
    clearRatingError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {

    // ── Toggle rating ──────────────────────────────────────
    builder
      .addCase(toggleRatingThunk.pending, (state, action) => {
        state.toggling[action.meta.arg.employeeId] = true
        state.error = null
      })
      .addCase(toggleRatingThunk.fulfilled, (state, action) => {
        const { employeeId, data } = action.payload
        state.toggling[employeeId] = false
        // Store the new rating in currentRatings
        state.currentRatings[employeeId] = {
          has_rating: true,
          type:   data.type,
          icon:   data.icon,
          reason: data.rating?.reason || '',
        }
      })
      .addCase(toggleRatingThunk.rejected, (state, action) => {
        state.toggling[action.meta.arg.employeeId] = false
        state.error = action.payload
      })

    // ── Fetch current rating ───────────────────────────────
    builder
      .addCase(fetchCurrentRatingThunk.fulfilled, (state, action) => {
        const { employeeId, data } = action.payload
        state.currentRatings[employeeId] = data
      })
  },
})

export const { clearRatingError } = ratingSlice.actions
export default ratingSlice.reducer