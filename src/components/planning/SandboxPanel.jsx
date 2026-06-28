import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  generateSandboxThunk,
  acceptSandboxThunk,
  cancelSandboxThunk,
} from '../../features/planning/planningSandboxThunks'
import {
  selectSandboxItems,
  selectSandboxCount,
  selectSandboxSessionId,
  selectSandboxGenerating,
  selectSandboxAccepting,
  selectSandboxErrors,
  selectSandboxError,
  selectSandboxResult,
} from '../../features/planning/planningSandboxSelectors'
import { clearSandbox } from '../../features/planning/planningSandboxSlice'
import { Button, Badge, Skeleton, Tooltip } from '../ui'
import { Eye, CheckCircle, X, AlertTriangle, Zap, RefreshCw } from 'lucide-react'
import { cn } from '../../utils/cn'
import toast from 'react-hot-toast'

const SandboxPanel = ({ weekNumber, year, onRefresh }) => {
  const dispatch = useDispatch()
  const items = useSelector(selectSandboxItems)
  const count = useSelector(selectSandboxCount)
  const sessionId = useSelector(selectSandboxSessionId)
  const generating = useSelector(selectSandboxGenerating)
  const accepting = useSelector(selectSandboxAccepting)
  const errors = useSelector(selectSandboxErrors)
  const error = useSelector(selectSandboxError)
  const result = useSelector(selectSandboxResult)

  const [isOpen, setIsOpen] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handleGenerate = async () => {
    const id = crypto.randomUUID()
    await dispatch(generateSandboxThunk({
      week_number: weekNumber,
      year,
      session_id: id,
    }))
    setIsOpen(true)
    setShowPreview(true)
  }

  const handleAccept = async () => {
    if (!sessionId) return
    const res = await dispatch(acceptSandboxThunk(sessionId))
    if (acceptSandboxThunk.fulfilled.match(res)) {
      toast.success(`${res.payload.created_count} assignation(s) créée(s)`)
      dispatch(clearSandbox())
      setIsOpen(false)
      setShowPreview(false)
      onRefresh?.()
    } else {
      toast.error('Erreur lors de la validation')
    }
  }

  const handleCancel = async () => {
    if (sessionId) {
      await dispatch(cancelSandboxThunk(sessionId))
    }
    dispatch(clearSandbox())
    setIsOpen(false)
    setShowPreview(false)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Generate button */}
      <Button
        size="sm"
        leftIcon={generating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
        loading={generating}
        onClick={handleGenerate}
      >
        Prévisualiser la génération
      </Button>

      {/* Sandbox panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-brand-200 bg-brand-50 dark:border-brand-800 dark:bg-brand-900/20">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-brand-200 px-4 py-3 dark:border-brand-800">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-brand-600" />
                  <span className="text-sm font-semibold text-brand-800 dark:text-brand-300">
                    Mode prévisualisation
                  </span>
                  {count > 0 && (
                    <Badge variant="primary" size="sm">{count} assignation(s)</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {result ? null : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 h-8 text-xs"
                        onClick={handleCancel}
                        disabled={accepting}
                      >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Annuler
                      </Button>
                      <Button
                        size="sm"
                        className="h-8 text-xs"
                        loading={accepting}
                        leftIcon={<CheckCircle className="h-3.5 w-3.5" />}
                        onClick={handleAccept}
                        disabled={count === 0}
                      >
                        Accepter
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {generating ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton.Block key={i} className="h-12 rounded-lg" />
                    ))}
                  </div>
                ) : error ? (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    {error}
                  </div>
                ) : result ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-emerald-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">
                        {result.created_count} assignation(s) créée(s)
                      </span>
                    </div>
                    {result.errors?.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {result.errors.map((err, i) => (
                          <p key={i} className="text-xs text-amber-600">⚠ {err}</p>
                        ))}
                      </div>
                    )}
                    <Button variant="secondary" size="sm" onClick={handleCancel}>
                      Fermer
                    </Button>
                  </div>
                ) : showPreview && items.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-lg border border-brand-100 bg-white p-2.5 text-xs dark:border-brand-900/30 dark:bg-dark-700"
                      >
                        <div className="h-7 w-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-2xs">
                          {item.user?.name?.charAt(0) || '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-800 dark:text-slate-100">
                            {item.user?.name || 'Inconnu'}
                          </p>
                          <p className="text-slate-400">
                            {item.shift?.name} · {item.date}
                          </p>
                        </div>
                        <Badge variant="primary" size="sm" className="text-2xs">
                          {item.shift?.start_time}–{item.shift?.end_time}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">
                    Aucune assignation à prévisualiser
                  </p>
                )}

                {/* Errors from generation */}
                {errors.length > 0 && !result && (
                  <div className="mt-3 space-y-1 border-t border-brand-200 pt-3 dark:border-brand-800">
                    <p className="text-2xs font-semibold text-amber-600 uppercase tracking-wider">
                      Erreurs de génération
                    </p>
                    {errors.map((err, i) => (
                      <p key={i} className="text-xs text-amber-600">⚠ {err}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer notice */}
              <div className="border-t border-brand-200 px-4 py-2 dark:border-brand-800">
                <p className="text-2xs text-brand-500">
                  ℹ Rien n'est sauvegardé tant que vous n'acceptez pas la prévisualisation.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SandboxPanel
