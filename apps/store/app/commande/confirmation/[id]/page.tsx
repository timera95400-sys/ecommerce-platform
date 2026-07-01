// =============================================================================
// LIVRABLE 6 — Confirmation de commande (/commande/confirmation/[id])
// =============================================================================

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface PageProps {
  params: { id: string };
}

export const metadata: Metadata = { title: "Commande confirmee" };

export default async function ConfirmationPage({ params }: PageProps) {
  const order = await db.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });

  if (!order || order.status === "PENDING") notFound();

  const customerEmail = order.guestEmail ?? "";

  return (
    <>
      <Header />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-16 text-center">
        {/* Icone check animee — CSS uniquement, zero Lottie */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-600"
              viewBox="0 0 52 52"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="26" cy="26" r="24" />
              <path
                className="animate-check-draw"
                d="M14 27l8 8 16-16"
              />
            </svg>
          </div>
        </div>

        <h1 className="font-heading text-3xl font-semibold mb-3">
          Commande confirmee
        </h1>
        <p className="text-text-muted mb-2">
          Merci pour votre commande !
        </p>
        <p className="text-lg font-medium mb-8">
          Numero de commande :{" "}
          <span className="text-primary">#{order.orderNumber}</span>
        </p>

        {customerEmail && (
          <p className="text-sm text-text-muted mb-10">
            Un email de confirmation a ete envoye a{" "}
            <strong>{customerEmail}</strong>
          </p>
        )}

        {/* Recap commande */}
        <div className="text-left border border-border p-6 mb-8">
          <h2 className="font-semibold mb-4">Recapitulatif</h2>
          <ul className="space-y-3 mb-6">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.productName}
                  {item.variantLabel && (
                    <span className="text-text-muted ml-1">
                      ({item.variantLabel})
                    </span>
                  )}{" "}
                  x{item.quantity}
                </span>
                <span className="font-medium">
                  {Number(item.totalPrice).toFixed(2)} EUR
                </span>
              </li>
            ))}
          </ul>

          <div className="border-t border-border pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Sous-total</span>
              <span>{Number(order.subtotal).toFixed(2)} EUR</span>
            </div>
            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Remise</span>
                <span>- {Number(order.discountAmount).toFixed(2)} EUR</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-text-muted">Livraison</span>
              <span>
                {Number(order.shippingCost) === 0
                  ? "Gratuite"
                  : `${Number(order.shippingCost).toFixed(2)} EUR`}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-base border-t border-border pt-2">
              <span>Total</span>
              <span>{Number(order.total).toFixed(2)} EUR</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border text-sm text-text-muted space-y-1">
            <p>
              Adresse de livraison : {order.shippingStreet},{" "}
              {order.shippingZip} {order.shippingCity}
            </p>
            <p>Mode de paiement : {order.paymentMethod}</p>
            {order.shippingOptionName && (
              <p>
                Delai de livraison estime : {order.shippingOptionName}
              </p>
            )}
          </div>
        </div>

        <Link
          href="/boutique"
          className="inline-block bg-primary text-white px-8 py-3 text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          Retour a la boutique
        </Link>
      </main>
      <Footer />
    </>
  );
}
