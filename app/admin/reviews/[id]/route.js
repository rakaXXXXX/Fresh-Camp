import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    const review = await prisma.review.findUnique({
      where: { id },
      include: { product: true }
    })

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    // Delete review
    await prisma.review.delete({
      where: { id }
    })

    // Recalc product rating
    const otherReviews = await prisma.review.findMany({
      where: { productId: review.productId }
    })

    const total = otherReviews.reduce((acc, r) => acc + r.rating, 0)
    const average = otherReviews.length > 0 ? total / otherReviews.length : 0

    await prisma.product.update({
      where: { id: review.productId },
      data: {
        rating: average,
        reviewCount: otherReviews.length
      }
    })

    return NextResponse.json({ message: "Review deleted" })

  } catch (error) {
    console.error("Review delete error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

