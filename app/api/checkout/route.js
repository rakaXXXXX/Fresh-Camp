// /api/checkout
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return Response.json({ error: "Cart kosong" }, { status: 400 });
    }

    let subtotal = 0;

    for (const item of cartItems) {
      const price = item.product.salePrice || item.product.price;
      subtotal += Number(price) * item.quantity;
    }

    const tax = subtotal * 0.1;
    const shipping = subtotal > 200 ? 0 : 15;
    const total = subtotal + tax + shipping;

    const orderNumber = "ORDER-" + Date.now();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        subtotal,
        taxAmount: tax,
        shippingFee: shipping,
        totalAmount: total,
        paymentMethod: "BANK_TRANSFER",
        items: {
          create: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.salePrice || item.product.price,
            color: item.color,
            size: item.size,
          })),
        },
      },
    });

    // HAPUS CART SETELAH CHECKOUT
    await prisma.cartItem.deleteMany({
      where: { userId },
    });

    return Response.json({
      orderNumber,
      total,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ error: 'Checkout failed: ' + error.message }, { status: 500 });
  }
}

