// =============================================================================
// LIVRABLE 5 — PayPal createOrder
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createPayPalOrder } from "@repo/paypal";

const bodySchema = z.object({
  orderId: z.string().cuid(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Donnees invalides" }, { status: 400 });
  }

  const order = await db.order.findUnique({
    where: { id: parsed.data.orderId },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }

  if (order.status !== "PENDING") {
    return NextResponse.json({ error: "Commande deja traitee" }, { status: 409 });
  }

  try {
    const paypalOrder = await createPayPalOrder({
      orderId: order.id,
      items: order.items.map((i) => ({
        name: i.productName,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
      })),
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shippingCost),
      discount: Number(order.discountAmount),
      total: Number(order.total),
    });

    return NextResponse.json({ paypalOrderId: paypalOrder.id }, { status: 200 });
  } catch (err) {
    console.error("PayPal createOrder error:", err);
    return NextResponse.json(
      { error: "Impossible de creer la commande PayPal" },
      { status: 500 },
    );
  }
}
