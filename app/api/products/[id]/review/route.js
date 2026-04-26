import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const productId = params.id

    // 🔥 UPSERT (update kalau sudah ada, create kalau belum)
    await prisma.review.upsert({
      where: {
        productId_userId: {
          productId: productId,
          userId: session.user.id,
        },
      },
      update: {
        rating: body.rating,
        comment: body.comment,
      },
      create: {
        rating: body.rating,
        comment: body.comment,
        productId: productId,
        userId: session.user.id,
      },
    })

    // Hitung ulang rating
    const reviews = await prisma.review.findMany({
      where: { productId }
    })

    const total = reviews.reduce((acc, r) => acc + r.rating, 0)
    const average = reviews.length > 0 ? total / reviews.length : 0

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: average,
        reviewCount: reviews.length,
      },
    })

    return NextResponse.json({ message: "Review saved" })

  } catch (error) {
    console.error("REVIEW ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function GET(req, { params }) {
  try {
    const productId = params.id

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Review fetch error:', error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}
