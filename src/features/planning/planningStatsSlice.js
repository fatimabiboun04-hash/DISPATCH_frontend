import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axiosInstance from '../../services/axiosInstance'
import { API } from '../../constants/apiRoutes'

export const fetchPlanningStatsThunk = createAsyncThunk(
  'planningStats/fetch',
  async (params, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(API.PLANNING.STATS, { params })
      return res.data.data
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load planning stats')
    }
  }
)

const initialState = {
  data: null,
  loading: false,
  error: null,
}

const planningStatsSlice = createSlice({
  name: 'planningStats',
  initialState,
  reducers: {
    clearStats: (state) => {
      state.data = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlanningStatsThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPlanningStatsThunk.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchPlanningStatsThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearStats } = planningStatsSlice.actions
export default planningStatsSlice.reducer
