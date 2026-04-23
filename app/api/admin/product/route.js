import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 })
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  })

  return Response.json(products)
}

export async function POST(req) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 })
  }

  const body = await req.json()

  
  const slug = body.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")

 const product = await prisma.product.create({
  data: {
    name: body.name,
    description: body.description,
    price: Number(body.price),
    images: body.image ? [body.image] : [],
    colors: [],
sizes: [],
features: [],
    slug: slug,

    category: {
      connect: {
        id: body.categoryId,  
      },
    },
  },
})

  return Response.json(product)
}