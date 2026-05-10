import { NextResponse } from 'next/server'
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic'

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderNumber, imageUrl } = body;

    if (!orderNumber || !imageUrl) {
      return NextResponse.json({ error: "Missing orderNumber or imageUrl" }, { status: 400 });
    }

    await prisma.order.update({
      where: { orderNumber },
      data: {
        paymentProof: imageUrl,
        paymentStatus: "PENDING",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment route error:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ error: 'Payment update failed: ' + error.message }, { status: 500 });
  }
}
