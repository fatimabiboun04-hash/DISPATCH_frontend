import { createAsyncThunk } from '@reduxjs/toolkit'
import reportService from '../../services/reportService'
import { setDownloadLoading } from './reportSlice'

/**
 * GET /v1/reports → paginatedResponse, loads generator
 */
export const fetchReportsThunk = createAsyncThunk(
  'reports/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      return await reportService.getAll(params)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load reports')
    }
  }
)

/**
 * POST /v1/reports
 * Body: { type, start_date, end_date, file_type }
 * Returns 202 with the created report (status: 'queued')
 */
export const generateReportThunk = createAsyncThunk(
  'reports/generate',
  async (data, { rejectWithValue }) => {
    try {
      return await reportService.generate(data)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to request report')
    }
  }
)

/**
 * GET /v1/reports/{id}/download
 * Returns binary file (blob).
 * Triggers browser download via URL.createObjectURL.
 *
 * This is NOT a standard Redux data thunk —
 * it side-effects the browser download directly.
 */
export const downloadReportThunk = createAsyncThunk(
  'reports/download',
  async ({ id, fileName }, { dispatch, rejectWithValue }) => {
    dispatch(setDownloadLoading({ id, loading: true }))
    try {
      const blob = await reportService.download(id)

      // Create object URL and trigger browser download
      const url  = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href  = url
      link.download = fileName || `report-${id}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      dispatch(setDownloadLoading({ id, loading: false }))
      return id
    } catch (err) {
      dispatch(setDownloadLoading({ id, loading: false }))
      return rejectWithValue(err.message || 'Download failed')
    }
  }
)