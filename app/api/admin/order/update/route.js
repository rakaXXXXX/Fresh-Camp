// /api/admin/order/update
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 })
  }

  const { orderNumber, status } = await req.json();

  await prisma.order.update({
    where: { orderNumber },
    data: {
      status: status
    },
  });

  return Response.json({ success: true });
}
