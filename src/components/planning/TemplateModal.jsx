import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchTemplatesThunk,
  createTemplateThunk,
  deleteTemplateThunk,
  duplicateTemplateThunk,
  loadTemplateThunk,
} from '../../features/planning/planningTemplateThunks'
import {
  selectTemplates,
  selectTemplatesLoading,
  selectTemplatesCreating,
  selectLoadLoading,
  selectLoadResult,
  selectLoadErrors,
} from '../../features/planning/planningTemplateSelectors'
import { clearLoadResult } from '../../features/planning/planningTemplateSlice'
import { Modal, Button, Input, Select, ConfirmDialog, Badge, Skeleton, EmptyState, Tabs } from '../ui'
import { Save, Download, Copy, Trash2, RefreshCw, FileText, AlertTriangle, CheckCircle, X } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'

const TemplateModal = ({
  open,
  onClose,
  weekNumber,
  year,
  onTemplateLoaded,
}) => {
  const dispatch = useDispatch()
  const templates = useSelector(selectTemplates)
  const loading = useSelector(selectTemplatesLoading)
  const creating = useSelector(selectTemplatesCreating)
  const loadLoading = useSelector(selectLoadLoading)
  const loadResult = useSelector(selectLoadResult)
  const loadErrors = useSelector(selectLoadErrors)

  const [tab, setTab] = useState('save')
  const [saveName, setSaveName] = useState('')
  const [saveDescription, setSaveDescription] = useState('')
  const [loadTemplateId, setLoadTemplateId] = useState('')
  const [targetWeek, setTargetWeek] = useState(String(weekNumber))
  const [targetYear, setTargetYear] = useState(String(year))
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [duplicateName, setDuplicateName] = useState('')

  useEffect(() => {
    if (open) {
      dispatch(fetchTemplatesThunk())
      dispatch(clearLoadResult())
    }
  }, [open, dispatch])

  const handleSave = async () => {
    if (!saveName.trim()) {
      toast.error('Veuillez donner un nom au template')
      return
    }
    const result = await dispatch(createTemplateThunk({
      name: saveName.trim(),
      description: saveDescription.trim() || undefined,
      week_number: weekNumber,
      year,
    }))
    if (createTemplateThunk.fulfilled.match(result)) {
      toast.success('Template créé')
      setSaveName('')
      setSaveDescription('')
      setTab('load')
    }
  }

  const handleLoad = async () => {
    if (!loadTemplateId) {
      toast.error('Sélectionnez un template')
      return
    }
    const result = await dispatch(loadTemplateThunk({
      id: Number(loadTemplateId),
      week_number: Number(targetWeek),
      year: Number(targetYear),
    }))
    if (loadTemplateThunk.fulfilled.match(result)) {
      toast.success(`Template chargé — ${result.payload.created_count} assignation(s) créée(s)`)
      onTemplateLoaded?.()
    }
  }

  const handleDelete = async (id) => {
    const result = await dispatch(deleteTemplateThunk(id))
    if (deleteTemplateThunk.fulfilled.match(result)) {
      toast.success('Template supprimé')
    }
    setDeleteConfirm(null)
  }

  const handleDuplicate = async () => {
    if (!duplicateName.trim() || !deleteConfirm) return
    const result = await dispatch(duplicateTemplateThunk({
      id: deleteConfirm,
      name: duplicateName.trim(),
    }))
    if (duplicateTemplateThunk.fulfilled.match(result)) {
      toast.success('Template dupliqué')
    }
    setDeleteConfirm(null)
    setDuplicateName('')
  }

  const templateOptions = templates.map((t) => ({
    value: String(t.id),
    label: `${t.name} (S${t.week_number}-${t.year})`,
  }))

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Gestion des templates"
        subtitle="Sauvegarder, charger ou dupliquer des plannings"
        size="lg"
      >
        <Tabs
          tabs={[
            { value: 'save', label: 'Sauvegarder', icon: Save },
            { value: 'load', label: 'Charger', icon: Download },
            { value: 'manage', label: 'Gérer', icon: FileText },
          ]}
          value={tab}
          onChange={setTab}
          className="mb-4"
        />

        {tab === 'save' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Créer un template à partir de la semaine courante (S{weekNumber}-{year})
            </p>
            <Input
              label="Nom du template"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Ex: Semaine type - Équipe A"
              required
            />
            <Input
              label="Description (optionnelle)"
              value={saveDescription}
              onChange={(e) => setSaveDescription(e.target.value)}
              placeholder="Notes sur ce template…"
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={onClose}>Annuler</Button>
              <Button loading={creating} leftIcon={<Save className="h-4 w-4" />} onClick={handleSave}>
                Sauvegarder
              </Button>
            </div>
          </div>
        )}

        {tab === 'load' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Charger un template dans une semaine cible
            </p>

            {loadResult && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-900/20">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    {loadResult.created_count} assignation(s) créée(s)
                  </span>
                </div>
                {loadErrors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {loadErrors.map((err, i) => (
                      <p key={i} className="text-xs text-amber-600">⚠ {err}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Select
              label="Template"
              placeholder="— Sélectionnez —"
              options={templateOptions}
              value={loadTemplateId}
              onChange={(e) => setLoadTemplateId(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Semaine cible"
                type="number"
                value={targetWeek}
                onChange={(e) => setTargetWeek(e.target.value)}
                min={1} max={53}
              />
              <Input
                label="Année cible"
                type="number"
                value={targetYear}
                onChange={(e) => setTargetYear(e.target.value)}
                min={2020} max={2099}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={onClose}>Fermer</Button>
              <Button
                loading={loadLoading}
                leftIcon={<Download className="h-4 w-4" />}
                onClick={handleLoad}
                disabled={!loadTemplateId}
              >
                Charger
              </Button>
            </div>
          </div>
        )}

        {tab === 'manage' && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton.Block key={i} className="h-16 rounded-xl" />
              ))
            ) : templates.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Aucun template"
                description="Sauvegardez d'abord un planning comme template."
                size="sm"
              />
            ) : (
              templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between rounded-xl border border-surface-100 p-3 dark:border-dark-600"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      {template.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      Semaine {template.week_number}/{template.year}
                      {template.items_count !== undefined && ` · ${template.items_count} assignation(s)`}
                    </p>
                    {template.description && (
                      <p className="mt-0.5 text-2xs text-slate-500">{template.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        setDeleteConfirm(template.id)
                        setDuplicateName(`${template.name} (copie)`)
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500"
                      onClick={() => setDeleteConfirm(template.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteConfirm && !duplicateName}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm)}
        title="Supprimer le template"
        description="Cette action est irréversible."
        confirmLabel="Supprimer"
        variant="danger"
      />

      {/* Duplicate dialog — inline */}
      {!!deleteConfirm && !!duplicateName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-strong dark:bg-dark-700">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Dupliquer le template
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Donnez un nom à la copie du template.
            </p>
            <input
              value={duplicateName}
              onChange={(e) => setDuplicateName(e.target.value)}
              placeholder="Nom de la copie"
              className="mt-3 w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-dark-500 dark:bg-dark-600"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => { setDeleteConfirm(null); setDuplicateName('') }}
                className="rounded-lg border border-surface-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-surface-50 dark:border-dark-500 dark:text-slate-300"
              >
                Annuler
              </button>
              <button
                onClick={handleDuplicate}
                className="rounded-lg bg-brand-500 px-4 py-2 text-xs font-medium text-white hover:bg-brand-600"
              >
                Dupliquer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default TemplateModal
