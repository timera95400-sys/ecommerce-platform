// =============================================================================
// LIVRABLE 5 — Stripe Checkout Session creation
// Validation montant cote serveur AVANT redirection
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createCheckoutSession } from "@repo/stripe";

const bodySchema = z.object({
  orderId: z.string().cuid(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requete invalide" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Donnees invalides" }, { status: 400 });
  }

  const { orderId } = parsed.data;

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }

  if (order.status !== "PENDING") {
    return NextResponse.json(
      { error: "Cette commande a deja ete traitee" },
      { status: 409 },
    );
  }

  const customerEmail = order.guestEmail ?? "";
  if (!customerEmail) {
    return NextResponse.json({ error: "Email client manquant" }, { status: 400 });
  }

  const baseUrl = process.env["NEXT_PUBLIC_STORE_URL"] ?? "http://localhost:3000";

  try {
    const session = await createCheckoutSession({
      lineItems: order.items.map((item) => ({
        productId: item.productId ?? "",
        name: item.productName,
        image: item.productImage ?? undefined,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        variantLabel: item.variantLabel ?? undefined,
      })),
      customerEmail,
      orderId: order.id,
      shippingCost: Number(order.shippingCost),
      discountAmount: Number(order.discountAmount),
      successUrl: `${baseUrl}/commande/confirmation/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/checkout?order=${order.id}`,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err) {
    console.error("Stripe session creation error:", err);
    return NextResponse.json(
      { error: "Impossible de creer la session de paiement" },
      { status: 500 },
    );
  }
}
