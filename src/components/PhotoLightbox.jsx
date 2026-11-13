import Modal from './Modal'

export default function PhotoLightbox({ open, photo, name, onClose }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy="photo-lightbox-title"
      dialogClassName="photo-lightbox-dialog"
      contentClassName="photo-lightbox"
    >
      <div className="photo-lightbox-bar">
        <h2 className="h6 mb-0 text-truncate photo-lightbox-title" id="photo-lightbox-title">
          {name || 'Photo du produit'}
        </h2>
        <button
          type="button"
          className="photo-lightbox-close"
          onClick={onClose}
          aria-label="Fermer la photo"
        >
          <i className="bi bi-x-lg" aria-hidden="true"></i>
        </button>
      </div>
      <div
        className="photo-lightbox-body"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose()
        }}
      >
        <img src={photo} alt={name ? `Photo de ${name}` : 'Photo du produit'} />
      </div>
    </Modal>
  )
}
