export function getWebPUrl(originalUrl: string, width = 1200): string {
  if (!originalUrl || !originalUrl.includes('cloudinary.com')) return originalUrl
  return originalUrl.replace('/upload/', `/upload/f_webp,q_auto,c_limit,w_${width}/`)
}

export function getThumbUrl(originalUrl: string, size = 400): string {
  if (!originalUrl || !originalUrl.includes('cloudinary.com')) return originalUrl
  return originalUrl.replace('/upload/', `/upload/f_webp,q_auto,c_fill,w_${size},h_${size}/`)
}

export function getBlurUrl(originalUrl: string): string {
  if (!originalUrl || !originalUrl.includes('cloudinary.com')) return ''
  return originalUrl.replace('/upload/', '/upload/f_webp,q_1,w_20,e_blur:200/')
}
