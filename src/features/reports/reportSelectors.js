import { createSelector } from '@reduxjs/toolkit'

export const selectReportList       = (state) => state.reports.list
export const selectReportMeta       = (state) => state.reports.meta
export const selectReportLoading    = (state) => state.reports.loading
export const selectReportError      = (state) => state.reports.error
export const selectReportGenerating = (state) => state.reports.generating
export const selectGenerateError    = (state) => state.reports.generateError
export const selectDownloadLoading  = (state) => state.reports.downloadLoading
export const selectIsPolling        = (state) => state.reports.isPolling

export const selectHasInProgressReports = createSelector(
  [selectReportList],
  (list) => list.some((r) => r.status === 'queued' || r.status === 'processing')
)
