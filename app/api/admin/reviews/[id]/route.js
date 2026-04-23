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

    const reviewId = params.id

    await prisma.review.delete({
      where: { id: reviewId }
    })

    return NextResponse.json({ message: "Review deleted successfully" })

  } catch (error) {
    console.error("Review delete error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

