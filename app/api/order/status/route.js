export async function POST(request) {
  const { id, status } = await request.json();
  const updatedOrder = await prisma.order.update({
    where: { id },
    data: { status },
  });
  return Response.json({ success: true, order: updatedOrder });
}
