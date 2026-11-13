const DEFAULTS = {
  maxSize: 1000,
  quality: 0.72,
  maxBytes: 700_000,
}

function renderToDataUrl(source, sourceWidth, sourceHeight, options = {}) {
  const { maxSize, quality, maxBytes } = { ...DEFAULTS, ...options }

  if (!sourceWidth || !sourceHeight) {
    throw new Error('Cette image ne peut pas être lue.')
  }

  const scale = Math.min(1, maxSize / Math.max(sourceWidth, sourceHeight))
  const width = Math.max(1, Math.round(sourceWidth * scale))
  const height = Math.max(1, Math.round(sourceHeight * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) throw new Error("Impossible de préparer l'image.")

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, width, height)
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(source, 0, 0, width, height)

  let currentQuality = quality
  let dataUrl = canvas.toDataURL('image/jpeg', currentQuality)

  while (dataUrl.length > maxBytes && currentQuality > 0.4) {
    currentQuality = Math.max(0.4, currentQuality - 0.08)
    dataUrl = canvas.toDataURL('image/jpeg', currentQuality)
  }

  if (dataUrl.length > 950_000) {
    throw new Error('Photo trop lourde même après compression. Choisissez une image plus petite.')
  }

  return dataUrl
}

export function fileToDataUrl(file, options) {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith('image/')) {
      reject(new Error('Veuillez choisir un fichier image (JPG, PNG, WEBP…).'))
      return
    }

    if (file.size > 20 * 1024 * 1024) {
      reject(new Error('Image trop lourde (20 Mo maximum).'))
      return
    }

    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      try {
        resolve(renderToDataUrl(image, image.naturalWidth, image.naturalHeight, options))
      } catch (error) {
        reject(error)
      } finally {
        URL.revokeObjectURL(objectUrl)
      }
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Cette image ne peut pas être lue.'))
    }

    image.src = objectUrl
  })
}

export function videoFrameToDataUrl(video, options) {
  return renderToDataUrl(video, video.videoWidth, video.videoHeight, options)
}
