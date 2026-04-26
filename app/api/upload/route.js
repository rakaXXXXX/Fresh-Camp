import cloudinary from '@/lib/cloudinary'
import { v2 as cloudinaryV2 } from 'cloudinary'

// Ensure config loaded
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const dynamic = 'force-dynamic'

export async function POST(req) {
  try {
    const data = await req.formData()
    const file = data.get('file')

    if (!file) {
      return new Response("No file provided", { status: 400 })
    }

    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return new Response("File too large. Max 5MB", { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filename = Date.now() + `_${Math.random().toString(36).substring(7)}.${file.name.split('.').pop() || 'jpg'}`

    console.log('Uploading to Cloudinary:', filename, file.size)

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinaryV2.uploader.upload_stream(
        { 
          resource_type: "auto",
          folder: "products",  // ✅ FIXED: products folder for product images
          public_id: filename.replace(/\.[^/.]+$/, ""), // No extension in public_id
          transformation: [
            { width: 800, height: 800, crop: "fill", gravity: "auto" }, // Product card optimized
            { width: 400, height: 400, crop: "fill", gravity: "auto" }, 
            { quality: "auto" },
            { fetch_format: "auto" }
          ],
          eager: [  // Multiple eager versions for responsive
            { width: 400, height: 400, crop: "fill", gravity: "auto" },
            { width: 800, height: 800, crop: "fill", gravity: "auto" }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error)
            reject(error)
          } else {
            console.log('Cloudinary success:', result.public_id, result.secure_url)
            resolve(result)
          }
        }
      )
      uploadStream.end(buffer)
    })

    return Response.json({ 
      url: result.secure_url,
      public_id: result.public_id,
      success: true,
      width: result.width,
      height: result.height
    })
  } catch (error) {
    console.error('Upload route error:', error)
    return new Response(JSON.stringify({ 
      error: "Upload failed: " + error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

