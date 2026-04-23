import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get('limit')) || 24
    const page = Number(searchParams.get('page')) || 1
    const skip = (page - 1) * limit
    const categorySlug = searchParams.get('category')

    const where = { 
      isActive: true 
    }
    if (categorySlug) {
      where.category = { slug: categorySlug }
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: { 
          id: true,
          name: true,
          slug: true,
          description: true,
          price: true,
          salePrice: true,
          images: true,
          rating: true,
          reviewCount: true,
          isFeatured: true,
          isActive: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.product.count({ where })
    ])

    return Response.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Products API error:', error)
    return Response.json({ 
      error: `Failed to fetch products: ${error.message || error.code || 'Unknown error'}`
    }, { status: 500 })
  }
}

