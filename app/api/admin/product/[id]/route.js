import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 })
  }

  const body = await req.json()

  const slug = body.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")

  const product = await prisma.product.update({
    where: { id: params.id },
    data: {
      name: body.name,
      description: body.description,
      price: Number(body.price),
      images: body.image ? [body.image] : undefined,
      slug: slug, 
    },
  })

  return Response.json(product)
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 })
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Delete related records first (match exact schema model names)
      await tx.review.deleteMany({
        where: { productId: params.id }
      })
      
      await tx.cartItem.deleteMany({
        where: { productId: params.id }
      })
      
      await tx.wishlistItem.deleteMany({
        where: { productId: params.id }
      })
      
      await tx.orderItem.deleteMany({
        where: { productId: params.id }
      })
      
      // Now delete the product
      await tx.product.delete({
        where: { id: params.id }
      })
    })
    
    return Response.json({ message: "Product and related data deleted successfully" })
  } catch (error) {
    console.error("Delete product error:", error)
    return new Response(
      `Failed to delete product: ${error.message}`, 
      { status: 500 }
    )
  }
}
