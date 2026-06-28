import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axiosInstance from '../../services/axiosInstance'
import { API } from '../../constants/apiRoutes'

export const fetchPlanningAuditsThunk = createAsyncThunk(
  'planningAudits/fetch',
  async (params, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(API.PLANNING.AUDITS, { params })
      return { data: res.data.data, meta: res.data.meta }
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load planning audits')
    }
  }
)

const initialState = {
  list: [],
  meta: null,
  loading: false,
  error: null,
}

const planningAuditSlice = createSlice({
  name: 'planningAudits',
  initialState,
  reducers: {
    clearAudits: (state) => {
      state.list = []
      state.meta = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlanningAuditsThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPlanningAuditsThunk.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload.data
        state.meta = action.payload.meta
      })
      .addCase(fetchPlanningAuditsThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearAudits } = planningAuditSlice.actions
export default planningAuditSlice.reducer
