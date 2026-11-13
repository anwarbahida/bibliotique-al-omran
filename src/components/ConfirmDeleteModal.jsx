import Modal from './Modal'

export default function ConfirmDeleteModal({ product, busy, onClose, onConfirm }) {
  return (
    <Modal open={Boolean(product)} onClose={busy ? undefined : onClose} size="sm" labelledBy="delete-title">
      <div className="modal-body p-4 text-center">
        <div className="danger-icon" aria-hidden="true">
          <i className="bi bi-trash3"></i>
        </div>

        <h2 className="h5 mt-3 mb-2" id="delete-title">Supprimer ce produit ?</h2>
        <p className="text-muted small mb-4">
          « {product?.name} » sera définitivement retiré de l’inventaire.
        </p>

        <div className="d-flex gap-2">
          <button type="button" className="btn btn-light border flex-fill" onClick={onClose} disabled={busy}>
            Annuler
          </button>
          <button type="button" className="btn btn-danger flex-fill" onClick={onConfirm} disabled={busy}>
            {busy ? (
              <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
            ) : (
              <>
                <i className="bi bi-trash3 me-2" aria-hidden="true"></i>
                Supprimer
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}
