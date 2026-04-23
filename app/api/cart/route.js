import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const cart = await prisma.cartItem.findMany({
    where: { userId },
    include: { 
      product: {
        select: {
          id: true,
          name: true,
          price: true,
          images: true,
          description: true,
          salePrice: true
        }
      }
    },
  });

  return Response.json(cart);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { productId, quantity, size, color } = await req.json();

  if (!productId || quantity == null) {
    return Response.json({ error: "Missing productId or quantity" }, { status: 400 });
  }

  if (quantity <= 0) {
    // Remove item
    const deleted = await prisma.cartItem.deleteMany({
      where: {
        userId,
        productId,
        size,
        color
      }
    });
    return Response.json({ deleted: deleted.count });
  }

  try {
    // Upsert: update existing or create new
    // Manual upsert since no @@unique index
    // Safe manual find/update/create
    const whereClause = {
      userId,
      productId
    }

    // First check if item exists (ignore optional fields for find)
    const existingItems = await prisma.cartItem.findMany({
      where: whereClause,
      take: 1
    })

    const existing = existingItems[0]

    let cartItem

    if (quantity <= 0) {
      await prisma.cartItem.deleteMany({
        where: {
          userId,
          productId
        }
      })
    } else if (existing) {
      cartItem = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { 
          quantity,
          color: color || null,
          size: size || null
        },
        include: {
          product: true
        }
      })
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity,
          color: color || null,
          size: size || null
        },
        include: {
          product: true
        }
      })
    }

    return Response.json({ success: true, cartItem });

    return Response.json(cartItem);
  } catch (error) {
    console.error("Cart upsert error:", error);
    return Response.json({ error: "Failed to update cart" }, { status: 500 });
  }
}
