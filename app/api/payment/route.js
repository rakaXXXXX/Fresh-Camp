// /api/payment/upload
import prisma from "@/lib/prisma";

export async function POST(req) {
  const body = await req.json();

  const { orderNumber, imageUrl } = body;

  await prisma.order.update({
    where: { orderNumber },
    data: {
      paymentProof: imageUrl,
      paymentStatus: "PENDING",
    },
  });

  return Response.json({ success: true });
}