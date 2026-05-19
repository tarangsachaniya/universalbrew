import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }
export { getWebPUrl, getThumbUrl } from './cloudinary-url'

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string = 'original'
): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder, resource_type: 'image', format: 'webp', transformation: { quality: 'auto' } }, (error, result) => {
        if (error || !result) return reject(error ?? new Error('Upload failed'))
        resolve(result.secure_url)
      })
      .end(fileBuffer)
  })
}