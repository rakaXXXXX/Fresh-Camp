import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        // Only categories with active products
        products: {
          some: {
            isActive: true
          }
        }
      },
      orderBy: { name: "asc" },
      include: { _count: { select: { products: { where: { isActive: true } } } } }
    })
    return Response.json(categories)
  } catch (error) {
    console.error('Categories API error:', error)
    return Response.json({ error: `Failed to fetch categories: ${error.message}` }, { status: 500 })
  }
}
