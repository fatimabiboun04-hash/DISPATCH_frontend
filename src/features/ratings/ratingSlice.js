import { createSlice } from '@reduxjs/toolkit'
import { rateEmployeeThunk, fetchCurrentRatingThunk, fetchRatingStatsThunk } from './ratingThunks'

const initialState = {
  currentRatings: {},
  rating:         null,
  ratingLoading:  false,
  toggling:       {},
  stats:          null,
  statsLoading:   false,
  error:          null,
}

const ratingSlice = createSlice({
  name: 'ratings',
  initialState,
  reducers: {
    clearRatingError: (state) => { state.error = null },
    clearRatingStats: (state) => { state.stats = null },
  },
  extraReducers: (builder) => {

    // ── Rate employee ──────────────────────────────────────
    builder
      .addCase(rateEmployeeThunk.pending, (state, action) => {
        state.toggling[action.meta.arg.employeeId] = true
        state.error = null
      })
      .addCase(rateEmployeeThunk.fulfilled, (state, action) => {
        const { employeeId, data } = action.payload
        state.toggling[employeeId] = false
        state.currentRatings[employeeId] = {
          has_rating: true,
          score:   data.score,
          type:    data.type,
          label:   data.label,
        }
      })
      .addCase(rateEmployeeThunk.rejected, (state, action) => {
        state.toggling[action.meta.arg.employeeId] = false
        state.error = action.payload
      })

    // ── Fetch current rating ───────────────────────────────
    builder
      .addCase(fetchCurrentRatingThunk.pending, (state) => {
        state.ratingLoading = true
      })
      .addCase(fetchCurrentRatingThunk.fulfilled, (state, action) => {
        const { employeeId, data } = action.payload
        state.ratingLoading = false
        state.currentRatings[employeeId] = data
        state.rating = data
      })
      .addCase(fetchCurrentRatingThunk.rejected, (state) => {
        state.ratingLoading = false
      })

    // ── Fetch rating stats ────────────────────────────────
    builder
      .addCase(fetchRatingStatsThunk.pending, (state) => {
        state.statsLoading = true
        state.error = null
      })
      .addCase(fetchRatingStatsThunk.fulfilled, (state, action) => {
        state.statsLoading = false
        state.stats = action.payload
      })
      .addCase(fetchRatingStatsThunk.rejected, (state, action) => {
        state.statsLoading = false
        state.error = action.payload
      })
  },
})

export const { clearRatingError, clearRatingStats } = ratingSlice.actions
export default ratingSlice.reducer