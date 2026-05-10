import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const dynamic = 'force-dynamic'

export async function POST(req) {
  try {
    console.log('🔄 Upload started')
    
    const data = await req.formData()
    const file = data.get('file')

    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 })
    }

    console.log('📁 File:', file.name, file.size)

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const publicId = `products/${Date.now()}_${Math.random().toString(36).substring(7)}`

    console.log('☁️ Uploading:', publicId)

    // UPLOAD & OPTIMIZE SEBELUM resolve
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { 
          folder: "products",
          public_id: publicId,
          resource_type: "image",
          quality: "auto:good",
        },
        async (error, uploadResult) => {  // ← uploadResult di sini
          if (error) {
            console.error('❌ Upload failed:', error)
            reject(error)
          } else {
            console.log('✅ Upload OK:', uploadResult.secure_url)
            
            // OPTIMIZE langsung di callback
            const optimizedUrl = cloudinary.url(uploadResult.public_id, {
              transformation: [
                { width: 800, height: 800, crop: "fill", gravity: "auto", quality: "auto" }
              ]
            })
            
            console.log('✨ Optimized:', optimizedUrl)
            
            // Resolve dengan data lengkap
            resolve({
              success: true,
              url: optimizedUrl,
              original: uploadResult.secure_url,
              public_id: uploadResult.public_id
            })
          }
        }
      )
      stream.end(buffer)
    })

    console.log('🎉 Return result')
    return NextResponse.json(result)  // ← Langsung return result

  } catch (error) {
    console.error('💥 Error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}