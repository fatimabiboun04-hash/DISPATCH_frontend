import { AlertTriangle, RefreshCw } from 'lucide-react'
import Button from './Button'
import { cn } from '../../utils/cn'

/**
 * ErrorState — shown when an API call fails.
 * Always provides a retry button.
 */
const ErrorState = ({
  message = 'Une erreur est survenue.',
  onRetry,
  className,
}) => (
  <div className={cn(
    'flex flex-col items-center justify-center gap-4 py-12 text-center',
    className
  )}>
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl
                    bg-red-50 dark:bg-red-900/20">
      <AlertTriangle className="h-7 w-7 text-red-500" />
    </div>
    <div>
      <p className="font-semibold text-slate-700 dark:text-slate-200">
        Erreur de chargement
      </p>
      <p className="mt-1 text-sm text-slate-400">{message}</p>
    </div>
    {onRetry && (
      <Button
        variant="secondary"
        size="sm"
        leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
        onClick={onRetry}
      >
        Réessayer
      </Button>
    )}
  </div>
)

export default ErrorState