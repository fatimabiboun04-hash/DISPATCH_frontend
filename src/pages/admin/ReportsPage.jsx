import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion }                   from 'framer-motion'
import { fetchReportsThunk }        from '../../features/reports/reportThunks'
import {
  selectReportList,
  selectReportMeta,
} from '../../features/reports/reportSelectors'
import ReportGenerator   from '../../components/reports/ReportGenerator'
import ReportHistoryList from '../../components/reports/ReportHistoryList'

/**
 * ReportsPage — /admin/reports
 *
 * Layout:
 *   Left (md): ReportGenerator form — type, date range, file format
 *   Right:     ReportHistoryList — all generated reports with status + download
 *
 * Flow:
 * 1. Admin selects type + dates + format → submits
 * 2. Backend creates report record (status: 'queued') + dispatches job
 * 3. Frontend adds new report to list, starts polling every 5s
 * 4. When status → 'completed', download button appears
 * 5. When all reports settled, polling stops
 *
 * Backend POST /v1/reports: { type, start_date, end_date, file_type }
 * Returns 202 with new report record.
 *
 * Backend GET /v1/reports: paginate(15) with generator loaded.
 * Backend GET /v1/reports/{id}/download: binary blob.
 */
const ReportsPage = () => {
  const dispatch = useDispatch()
  const list     = useSelector(selectReportList)
  const meta     = useSelector(selectReportMeta)

  const fetchReports = useCallback((page) => {
    dispatch(fetchReportsThunk(page ? { page } : {}))
  }, [dispatch])

  // Initial load
  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Rapports
        </h1>
        <p className="mt-0.5 text-sm text-slate-400">
          Générez et téléchargez des rapports d'activité et de performance
        </p>
      </motion.div>

      {/* Main layout: generator + history */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">

        {/* Generator form — 2 cols */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          className="lg:col-span-2"
        >
          <ReportGenerator onSuccess={() => fetchReports()} />
        </motion.div>

        {/* History list — 3 cols */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3"
        >
          <ReportHistoryList onPageChange={fetchReports} />
        </motion.div>
      </div>
    </div>
  )
}

export default ReportsPage