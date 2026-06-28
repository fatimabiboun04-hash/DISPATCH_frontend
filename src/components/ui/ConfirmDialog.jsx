import { memo } from 'react'
import { AlertTriangle, Trash2 } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'

/**
 * ConfirmDialog — reusable delete / destructive action confirmation.
 * Always shown before any irreversible action.
 */
const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  loading = false,
  title = 'Confirmer la suppression',
  description = 'Cette action est irréversible. Voulez-vous continuer ?',
  confirmLabel = 'Supprimer',
  cancelLabel  = 'Annuler',
  variant = 'danger',  // 'danger' | 'warning'
}) => (
  <Modal
    open={open}
    onClose={onClose}
    size="sm"
    title=""
    showClose={false}
    footer={
      <>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant={variant === 'danger' ? 'danger' : 'outline'}
          loading={loading}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </>
    }
  >
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl
                       ${variant === 'danger'
                         ? 'bg-red-50 dark:bg-red-900/20'
                         : 'bg-amber-50 dark:bg-amber-900/20'}`}>
        {variant === 'danger'
          ? <Trash2       className="h-7 w-7 text-red-500" />
          : <AlertTriangle className="h-7 w-7 text-amber-500" />
        }
      </div>
      <div>
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
          {title}
        </h3>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  </Modal>
)

export default memo(ConfirmDialog)