import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient() // ← SATU prisma aja

export const dynamic = 'force-dynamic'

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    
    await prisma.product.delete({ 
      where: { id } 
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete product' 
    }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id } = params

    // Fix slug generation
    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        price: Number(body.price),
        images: Array.isArray(body.images) ? body.images : body.images ? [body.images] : [], // Fix array
        slug: slug,
        categoryId: body.categoryId,
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('PUT error:', error)
    return NextResponse.json({ 
      error: `Failed to update: ${error.message}` 
    }, { status: 500 })
  }
}