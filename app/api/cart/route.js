import { NextResponse } from 'next/server'
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  return NextResponse.json(cart);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { productId, quantity, size, color } = await req.json();

  if (!productId || quantity == null) {
    return NextResponse.json({ error: "Missing productId or quantity" }, { status: 400 });
  }

  if (quantity <= 0) {
    // Remove item
    const deleted = await prisma.cartItem.deleteMany({
      where: {
        userId,
        productId,
        size: size || null,
        color: color || null
      }
    });
    return NextResponse.json({ deleted: deleted.count });
  }

  try {
    // Find existing item with exact match on all unique fields
    const existingItems = await prisma.cartItem.findMany({
      where: {
        userId,
        productId,
        size: size || null,
        color: color || null
      },
      take: 1
    });

    const existing = existingItems[0];
    let cartItem;

    if (existing) {
      // Update quantity by adding to existing
      cartItem = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { 
          quantity: existing.quantity + quantity
        },
        include: {
          product: true
        }
      });
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
      });
    }

    return NextResponse.json({ success: true, cartItem });
  } catch (error) {
    console.error("Cart upsert error:", error);
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}
