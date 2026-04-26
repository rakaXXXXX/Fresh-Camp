import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Get user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        address: true,
        city: true,
        zipCode: true,
        country: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const stats = await prisma.$transaction([
      prisma.order.aggregate({
        where: { userId: user.id },
        _sum: { totalAmount: true }
      }),
      prisma.review.count({
        where: { userId: user.id }
      }),
      prisma.wishlistItem.count({
        where: { userId: user.id }
      })
    ])

    const userWithStats = {
      ...user,
      totalSpent: Number(stats[0]._sum?.totalAmount || 0),
      reviewCount: stats[1],
      wishlistCount: stats[2],
      totalOrders: await prisma.order.count({ where: { userId: user.id } })
    }

    return new Response(
      JSON.stringify(userWithStats),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('GET Profile Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// PUT - Update user profile
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.name) {
      return new Response(
        JSON.stringify({ error: 'Name is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const updateData = {
      name: body.name,
      phone: body.phone || null,
      address: body.address || null,
      city: body.city || null,
      zipCode: body.zipCode || null,
      country: body.country || null,
      updatedAt: new Date()
    }

    // Add image if provided (URL from upload)
    if (body.image) {
      updateData.image = body.image
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        address: true,
        city: true,
        zipCode: true,
        country: true,
        updatedAt: true
      }
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Profile updated successfully',
        user: updatedUser 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('PUT Profile Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to update profile' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

