import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const products = await prisma.product.findMany({
      include: {
        category: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(products)
  } catch (error) {
    console.error('GET products error:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log('🔍 BODY RECEIVED:', {
      name: body.name,
      images: body.images,
      imagesCount: body.images?.length || 0,
      categoryId: body.categoryId
    })

    if (!body.name?.trim() || !body.categoryId) {
      return NextResponse.json({ error: 'Missing name or category' }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        name: body.name.trim(),
        slug: body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        description: body.description || '',
        price: Number(body.price),
        images: Array.isArray(body.images) ? body.images : body.images ? [body.images] : [],
        categoryId: body.categoryId,
        isActive: true
      }
    })

    console.log('✅ SAVED:', product.id, 'Images:', product.images.length)
    return NextResponse.json(product)
  } catch (error) {
    console.error('💥 POST ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}