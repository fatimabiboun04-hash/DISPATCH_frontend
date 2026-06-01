import { useDispatch, useSelector } from 'react-redux'
import { Download, Loader2 } from 'lucide-react'
import { downloadReportThunk } from '../../features/reports/reportThunks'
import { selectDownloadLoading } from '../../features/reports/reportSelectors'
import { Button, Tooltip } from '../ui'
import { cn } from '../../utils/cn'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

/**
 * DownloadButton — triggers file download for a completed report.
 *
 * Backend GET /v1/reports/{id}/download returns:
 *   Storage::download($report->file_path) — binary file
 * Returns 422 if status !== 'completed'
 * Returns 404 if file not on disk
 *
 * Uses responseType: 'blob' then URL.createObjectURL for download.
 * Generates a meaningful filename from report type and dates.
 */
const DownloadButton = ({ report }) => {
  const dispatch       = useDispatch()
  const downloadLoading= useSelector(selectDownloadLoading)
  const isLoading      = downloadLoading[report.id] || false

  if (report.status !== 'completed') return null

  const getFileName = () => {
    const typeMap = { weekly: 'hebdo', monthly: 'mensuel', custom: 'custom' }
    const type    = typeMap[report.type] || report.type
    const start   = report.start_date?.replace(/-/g, '') || ''
    const ext     = report.file_type || 'pdf'
    return `rapport-${type}-${start}.${ext}`
  }

  const handleDownload = async () => {
    const result = await dispatch(downloadReportThunk({
      id:       report.id,
      fileName: getFileName(),
    }))
    if (downloadReportThunk.rejected.match(result)) {
      toast.error('Impossible de télécharger le rapport. Réessayez plus tard.')
    }
  }

  return (
    <Tooltip content={`Télécharger ${getFileName()}`}>
      <Button
        variant="secondary"
        size="sm"
        leftIcon={
          isLoading
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <Download className="h-3.5 w-3.5" />
        }
        disabled={isLoading}
        onClick={handleDownload}
      >
        {isLoading ? 'Téléchargement…' : 'Télécharger'}
      </Button>
    </Tooltip>
  )
}

export default DownloadButton