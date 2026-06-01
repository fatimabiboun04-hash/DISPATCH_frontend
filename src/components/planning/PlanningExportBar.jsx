import { FileDown, Printer } from 'lucide-react'
import { Button } from '../ui'

/**
 * PlanningExportBar — export and print actions for history view.
 *
 * PDF export: uses browser print API with print-specific CSS.
 * The backend PDF endpoint (GET /v1/reports/{id}/download) is for
 * generated reports — not for planning grid export.
 * Planning grid export is handled client-side via window.print().
 */
const PlanningExportBar = ({ weekLabel, onExport, className }) => {
  const handlePrint = () => {
    const originalTitle = document.title
    document.title = `Planning ${weekLabel}`
    window.print()
    document.title = originalTitle
  }

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <Button
        variant="secondary"
        size="sm"
        leftIcon={<Printer className="h-3.5 w-3.5" />}
        onClick={handlePrint}
      >
        Imprimer
      </Button>
      {onExport && (
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<FileDown className="h-3.5 w-3.5" />}
          onClick={onExport}
        >
          Exporter PDF
        </Button>
      )}
    </div>
  )
}

export default PlanningExportBar