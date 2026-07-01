"use client";

// =============================================================================
// LIVRABLE 6 — Panier (/panier)
// Client Component — Zustand cart store
// =============================================================================

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function PanierPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    couponCode,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    subtotal,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const sub = subtotal();
  const total = Math.max(0, sub - couponDiscount);

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), orderTotal: sub }),
      });
      const data = (await res.json()) as {
        valid?: boolean;
        code?: string;
        discountAmount?: number;
        error?: string;
      };
      if (!res.ok || !data.valid) {
        setCouponError(data.error ?? "Code invalide");
        return;
      }
      applyCoupon(data.code!, data.discountAmount!);
      setCouponInput("");
    } catch {
      setCouponError("Erreur reseau");
    } finally {
      setCouponLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-24 text-center">
          <p className="text-xl font-heading mb-6 text-text-muted">
            Votre panier est vide.
          </p>
          <Link
            href="/boutique"
            className="inline-block bg-primary text-white px-8 py-3 text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Continuer mes achats
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-10">
        <h1 className="font-heading text-3xl font-semibold mb-8">Panier</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Articles */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.variantOptionId ?? "base"}`}
                className="flex gap-4 border border-border p-4"
              >
                {item.image && (
                  <div className="relative w-20 h-20 shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/produit/${item.slug}`}
                    className="font-medium text-sm hover:text-primary transition-colors line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  {item.variantLabel && (
                    <p className="text-xs text-text-muted mt-0.5">
                      {item.variantLabel}
                    </p>
                  )}
                  <p className="text-sm font-semibold mt-2">
                    {item.unitPrice.toFixed(2)} EUR
                  </p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <button
                    onClick={() =>
                      removeItem(item.productId, item.variantOptionId)
                    }
                    className="text-xs text-text-muted hover:text-red-500 transition-colors"
                  >
                    Supprimer
                  </button>
                  <div className="flex items-center border border-border">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.variantOptionId,
                          item.quantity - 1,
                        )
                      }
                      className="w-8 h-8 flex items-center justify-center hover:bg-surface-alt"
                    >
                      -
                    </button>
                    <span className="w-8 h-8 flex items-center justify-center text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.variantOptionId,
                          item.quantity + 1,
                        )
                      }
                      disabled={item.quantity >= item.maxStock}
                      className="w-8 h-8 flex items-center justify-center hover:bg-surface-alt disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm font-semibold">
                    {(item.unitPrice * item.quantity).toFixed(2)} EUR
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Recapitulatif */}
          <aside className="border border-border p-6 h-fit space-y-4">
            <h2 className="font-semibold text-lg">Recapitulatif</h2>

            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Sous-total</span>
              <span>{sub.toFixed(2)} EUR</span>
            </div>

            {couponCode ? (
              <div className="flex justify-between text-sm text-green-600">
                <span>
                  Code{" "}
                  <span className="font-mono font-semibold">{couponCode}</span>
                </span>
                <div className="flex items-center gap-2">
                  <span>- {couponDiscount.toFixed(2)} EUR</span>
                  <button
                    onClick={removeCoupon}
                    className="text-text-muted hover:text-red-500 text-xs"
                  >
                    x
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Code promo"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    className="px-4 py-2 bg-surface-alt text-sm hover:bg-border transition-colors disabled:opacity-50"
                  >
                    {couponLoading ? "..." : "Appliquer"}
                  </button>
                </div>
                {couponError && (
                  <p className="text-xs text-red-500">{couponError}</p>
                )}
              </div>
            )}

            <div className="border-t border-border pt-4 flex justify-between font-semibold">
              <span>Total</span>
              <span>{total.toFixed(2)} EUR</span>
            </div>

            <p className="text-xs text-text-muted">
              Livraison calculee a l'etape suivante
            </p>

            <Link
              href="/checkout"
              className="block w-full text-center bg-primary text-white py-3 text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              Commander
            </Link>

            <Link
              href="/boutique"
              className="block w-full text-center text-sm text-text-muted hover:text-text-base transition-colors"
            >
              Continuer mes achats
            </Link>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
