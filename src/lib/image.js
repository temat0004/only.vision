// Сжимаем фото в браузере перед загрузкой: длинная сторона до maxSide px, формат WebP.
// Фото с телефона весят 3–8 МБ, после сжатия обычно 100–250 КБ.
export async function resizeImage(file, maxSide = 1400, quality = 0.85) {
  if (!file.type.startsWith('image/')) throw new Error('Это не картинка')
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h)
  bitmap.close?.()
  const blob = await new Promise((r) => canvas.toBlob(r, 'image/webp', quality))
  if (!blob) throw new Error('Не удалось обработать фото')
  return blob
}

export const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(fr.result)
    fr.onerror = reject
    fr.readAsDataURL(blob)
  })
