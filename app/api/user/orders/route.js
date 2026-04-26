import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

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
      select: { id: true }
    })

    if (!user) {
      return new Response(
        JSON.stringify({ orders: [] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get orders from database
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                images: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Format orders for frontend
    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      date: order.createdAt,
      status: order.status,
      totalAmount: order.totalAmount,
      items: order.items.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        image: item.product.images[0]
      }))
    }))

    return new Response(
      JSON.stringify({ orders: formattedOrders }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('GET Orders Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch orders' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}