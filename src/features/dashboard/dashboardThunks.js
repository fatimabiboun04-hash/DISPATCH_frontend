import { createAsyncThunk } from '@reduxjs/toolkit'
import dashboardService from '../../services/dashboardService'

export const fetchStatsThunk = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      return await dashboardService.getStats()
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load stats')
    }
  }
)

export const fetchLiveFeedThunk = createAsyncThunk(
  'dashboard/fetchLiveFeed',
  async (_, { rejectWithValue }) => {
    try {
      return await dashboardService.getLiveFeed()
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load feed')
    }
  }
)

export const fetchCoverageThunk = createAsyncThunk(
  'dashboard/fetchCoverage',
  async (_, { rejectWithValue }) => {
    try {
      return await dashboardService.getCoverage()
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load coverage')
    }
  }
)

export const fetchActivePausesThunk = createAsyncThunk(
  'dashboard/fetchActivePauses',
  async (_, { rejectWithValue }) => {
    try {
      return await dashboardService.getActivePauses()
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load pauses')
    }
  }
)

export const fetchWeeklyHistoryThunk = createAsyncThunk(
  'dashboard/fetchWeeklyHistory',
  async (_, { rejectWithValue }) => {
    try {
      return await dashboardService.getWeeklyHistory()
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load weekly history')
    }
  }
)