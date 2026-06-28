import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector }          from 'react-redux'
import { motion }                            from 'framer-motion'
import { Plus, Pencil, Trash2 }             from 'lucide-react'
import toast                                 from 'react-hot-toast'
import {
  fetchSkillsThunk,
  createSkillThunk,
  updateSkillThunk,
  deleteSkillThunk,
} from '../../features/skills/skillThunks'
import {
  selectSkills,
  selectSkillsLoading,
  selectSkillsError,
  selectSkillsSubmitting,
} from '../../features/skills/skillSelectors'
import { Button, Modal, Input, ConfirmDialog, ErrorState } from '../../components/ui'

const SkillsPage = () => {
  const dispatch   = useDispatch()
  const skills     = useSelector(selectSkills)
  const loading    = useSelector(selectSkillsLoading)
  const error      = useSelector(selectSkillsError)
  const submitting = useSelector(selectSkillsSubmitting)

  const [formOpen, setFormOpen] = useState(false)
  const [editSkill, setEditSkill] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState('')

  const fetchSkills = useCallback(() => {
    dispatch(fetchSkillsThunk())
  }, [dispatch])

  useEffect(() => {
    fetchSkills()
  }, [fetchSkills])

  const openCreate = () => {
    setEditSkill(null)
    setFormName('')
    setFormCategory('')
    setFormOpen(true)
  }

  const openEdit = (skill) => {
    setEditSkill(skill)
    setFormName(skill.name)
    setFormCategory(skill.category || '')
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!formName.trim()) {
      toast.error('Le nom est requis')
      return
    }
    const data = { name: formName.trim(), category: formCategory.trim() || null }
    const action = editSkill
      ? updateSkillThunk({ id: editSkill.id, data })
      : createSkillThunk(data)
    const result = await dispatch(action)
    const fulfilled = editSkill
      ? updateSkillThunk.fulfilled.match(result)
      : createSkillThunk.fulfilled.match(result)
    if (fulfilled) {
      toast.success(editSkill ? 'Compétence mise à jour' : 'Compétence créée')
      setFormOpen(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const result = await dispatch(deleteSkillThunk(deleteTarget.id))
    if (deleteSkillThunk.fulfilled.match(result)) {
      toast.success('Compétence supprimée')
      setDeleteTarget(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Compétences
          </h1>
          <p className="mt-0.5 text-sm text-slate-400">
            {skills.length} compétence{skills.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Nouvelle compétence
        </Button>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchSkills} />
      ) : skills.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 py-12 dark:border-slate-700">
          <p className="text-sm text-slate-400">Aucune compétence</p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={openCreate}>
            Créer une compétence
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-dark-600">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Nom</th>
                <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Catégorie</th>
                <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {skills.map((skill) => (
                <tr key={skill.id} className="hover:bg-slate-50 dark:hover:bg-dark-600">
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                    {skill.name}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {skill.category || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(skill)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-dark-500"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(skill)}
                        className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editSkill ? 'Modifier la compétence' : 'Nouvelle compétence'}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)} disabled={submitting}>
              Annuler
            </Button>
            <Button loading={submitting} onClick={handleSubmit}>
              {editSkill ? 'Enregistrer' : 'Créer'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Nom"
            required
            placeholder="Ex: Soudure"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />
          <Input
            label="Catégorie"
            placeholder="Ex: Technique"
            value={formCategory}
            onChange={(e) => setFormCategory(e.target.value)}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={submitting}
        variant="danger"
        title="Supprimer la compétence"
        description={`Supprimer définitivement "${deleteTarget?.name}" ? Les employés ayant cette compétence ne seront pas affectés.`}
        confirmLabel="Supprimer"
      />
    </div>
  )
}

export default SkillsPage
