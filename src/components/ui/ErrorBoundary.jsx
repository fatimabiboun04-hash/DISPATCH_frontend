import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-lg border border-red-200 bg-red-50/50 p-8 dark:border-red-800 dark:bg-red-900/10">
          <AlertTriangle className="h-10 w-10 text-red-400" />
          <div className="text-center">
            <h3 className="text-sm font-semibold text-red-700 dark:text-red-300">
              Une erreur est survenue
            </h3>
            <p className="mt-1 text-xs text-red-500 dark:text-red-400">
              {this.state.error?.message || 'Impossible de charger cette page'}
            </p>
          </div>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Réessayer
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
