import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 })
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  })

  return Response.json(categories)
}