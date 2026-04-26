import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const reviews = await prisma.review.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            images: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error("Admin reviews fetch error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

