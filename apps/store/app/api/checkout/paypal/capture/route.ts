// =============================================================================
// LIVRABLE 5 — PayPal captureOrder
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { OrderItem } from "@repo/database";
import { db } from "@/lib/db";
import { capturePayPalOrder } from "@repo/paypal";
import { sendOrderConfirmationToCustomer, sendNewOrderAlertToMerchant } from "@/lib/email";

const bodySchema = z.object({
  paypalOrderId: z.string().min(1),
  internalOrderId: z.string().cuid(),
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

  const { paypalOrderId, internalOrderId } = parsed.data;

  const order = await db.order.findUnique({
    where: { id: internalOrderId },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }

  if (order.status !== "PENDING") {
    return NextResponse.json({ error: "Commande deja traitee" }, { status: 409 });
  }

  try {
    const capture = await capturePayPalOrder(paypalOrderId, internalOrderId);

    const captureDetail = capture.purchase_units[0]?.payments?.captures?.[0];
    if (!captureDetail || captureDetail.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Capture PayPal non completee" },
        { status: 402 },
      );
    }

    const capturedAmount = parseFloat(captureDetail.amount.value);
    const expectedAmount = Number(order.total);
    if (Math.abs(capturedAmount - expectedAmount) > 0.01) {
      console.error("PayPal amount mismatch", { capturedAmount, expectedAmount });
      return NextResponse.json({ error: "Montant incorrect" }, { status: 402 });
    }

    const updatedOrder = await db.order.update({
      where: { id: internalOrderId },
      data: {
        status: "CONFIRMED",
        paymentIntentId: captureDetail.id,
      },
      include: { items: true },
    });

    // Decrement stock
    for (const item of updatedOrder.items) {
      if (item.variantOptionId) {
        await db.variantOption.update({
          where: { id: item.variantOptionId },
          data: { stock: { decrement: item.quantity } },
        });
      } else if (item.productId) {
        await db.product.update({
          where: { id: item.productId },
          data: { totalStock: { decrement: item.quantity } },
        });
      }
    }

    const customerEmail = updatedOrder.guestEmail ?? "";
    const customerName = `${updatedOrder.shippingFirstName} ${updatedOrder.shippingLastName}`;

    if (customerEmail) {
      await sendOrderConfirmationToCustomer({
        orderNumber: updatedOrder.orderNumber,
        customerEmail,
        customerName,
        items: updatedOrder.items.map((i: OrderItem) => ({
          name: i.productName,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
        })),
        total: Number(updatedOrder.total),
        shippingAddress: `${updatedOrder.shippingStreet}, ${updatedOrder.shippingZip} ${updatedOrder.shippingCity}`,
        deliveryDelay: updatedOrder.shippingOptionName ?? "3-5 jours ouvres",
      });

      await sendNewOrderAlertToMerchant({
        orderNumber: updatedOrder.orderNumber,
        customerEmail,
        customerName,
        items: updatedOrder.items.map((i: OrderItem) => ({
          name: i.productName,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
        })),
        total: Number(updatedOrder.total),
        shippingAddress: "",
        deliveryDelay: "",
      });
    }

    return NextResponse.json(
      { success: true, orderId: internalOrderId },
      { status: 200 },
    );
  } catch (err) {
    console.error("PayPal capture error:", err);
    return NextResponse.json(
      { error: "Erreur lors de la capture PayPal" },
      { status: 500 },
    );
  }
}
