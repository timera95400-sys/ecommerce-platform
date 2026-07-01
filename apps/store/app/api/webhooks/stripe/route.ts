// =============================================================================
// LIVRABLE 5 — Stripe Webhook Handler
// Sécurisé par vérification de signature HMAC
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { constructStripeEvent, handleStripeEvent } from "@repo/stripe";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { sendOrderConfirmationToCustomer, sendNewOrderAlertToMerchant, sendOrderStatusUpdate } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let rawBody: Buffer;
  try {
    rawBody = Buffer.from(await request.arrayBuffer());
  } catch {
    return NextResponse.json({ error: "Cannot read body" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = constructStripeEvent(rawBody, signature);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    await handleStripeEvent(event, {
      onCheckoutSessionCompleted: async (session) => {
        const orderId = session.metadata?.["orderId"];
        if (!orderId) return;

        const order = await db.order.update({
          where: { id: orderId },
          data: {
            status: "CONFIRMED",
            paymentSessionId: session.id,
            paymentIntentId: String(session.payment_intent ?? ""),
          },
          include: { items: true },
        });

        const customerEmail = session.customer_email ?? order.guestEmail ?? "";
        const customerName = `${order.shippingFirstName} ${order.shippingLastName}`;

        await sendOrderConfirmationToCustomer({
          orderNumber: order.orderNumber,
          customerEmail,
          customerName,
          items: order.items.map((i) => ({
            name: i.productName,
            quantity: i.quantity,
            unitPrice: Number(i.unitPrice),
          })),
          total: Number(order.total),
          shippingAddress: `${order.shippingStreet}, ${order.shippingZip} ${order.shippingCity}`,
          deliveryDelay: order.shippingOptionName ?? "3-5 jours ouvrés",
        });

        await sendNewOrderAlertToMerchant({
          orderNumber: order.orderNumber,
          customerEmail,
          customerName,
          items: order.items.map((i) => ({
            name: i.productName,
            quantity: i.quantity,
            unitPrice: Number(i.unitPrice),
          })),
          total: Number(order.total),
          shippingAddress: `${order.shippingStreet}, ${order.shippingZip} ${order.shippingCity}`,
          deliveryDelay: "",
        });

        // Decrement stock
        for (const item of order.items) {
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
      },

      onPaymentIntentSucceeded: async (intent) => {
        // Handled via checkout.session.completed in most flows
        const orderId = intent.metadata["orderId"];
        if (!orderId) return;
        await db.order.updateMany({
          where: { id: orderId, status: "PENDING" },
          data: { status: "CONFIRMED", paymentIntentId: intent.id },
        });
      },

      onPaymentIntentFailed: async (intent) => {
        const orderId = intent.metadata["orderId"];
        if (!orderId) return;
        await db.order.updateMany({
          where: { id: orderId },
          data: { status: "CANCELLED" },
        });
      },

      onChargeRefunded: async (charge) => {
        const intentId = typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id;
        if (!intentId) return;
        const order = await db.order.findFirst({
          where: { paymentIntentId: intentId },
        });
        if (!order) return;
        await db.order.update({
          where: { id: order.id },
          data: { status: "REFUNDED" },
        });
        const customerEmail = order.guestEmail ?? "";
        if (customerEmail) {
          await sendOrderStatusUpdate(
            customerEmail,
            `${order.shippingFirstName} ${order.shippingLastName}`,
            order.orderNumber,
            "Remboursée",
          );
        }
      },
    });
  } catch (err) {
    console.error("Stripe webhook handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
