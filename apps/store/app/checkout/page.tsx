"use client";

// =============================================================================
// LIVRABLE 6 — Tunnel de paiement (/checkout)
// Etapes : Coordonnees > Livraison > Paiement
// =============================================================================

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useCartStore } from "@/store/cartStore";
import { checkoutSchema, type CheckoutFormData } from "@/lib/validations";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const STEPS = ["Coordonnees", "Livraison", "Paiement"] as const;
type Step = 0 | 1 | 2;

const COUNTRIES = [
  { code: "FR", name: "France" },
  { code: "BE", name: "Belgique" },
  { code: "CH", name: "Suisse" },
  { code: "LU", name: "Luxembourg" },
  { code: "CA", name: "Canada" },
];

const SHIPPING_OPTIONS = [
  { id: "standard", name: "Livraison Standard", delay: "3-5 jours ouvrés", price: 4.9 },
  { id: "express", name: "Livraison Express", delay: "1-2 jours ouvrés", price: 9.9 },
  { id: "free", name: "Livraison offerte", delay: "5-7 jours ouvrés", price: 0 },
];

export default function CheckoutPage() {
  const { items, subtotal, couponCode, couponDiscount, clearCart } = useCartStore();
  const [step, setStep] = useState<Step>(0);
  const [selectedShipping, setSelectedShipping] = useState(SHIPPING_OPTIONS[0]);
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal">("stripe");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: "stripe", shippingOptionId: "standard" },
  });

  const sub = subtotal();
  const shipping = selectedShipping?.price ?? 0;
  const discount = couponDiscount;
  const total = Math.max(0, sub - discount + shipping);

  async function createOrder(): Promise<string> {
    const values = getValues();
    const res = await fetch("/api/checkout/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({
          productId: i.productId,
          variantOptionId: i.variantOptionId,
          productName: i.name,
          variantLabel: i.variantLabel,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          totalPrice: i.unitPrice * i.quantity,
          productImage: i.image,
        })),
        shipping: values.shipping,
        shippingOptionId: selectedShipping?.id,
        shippingOptionName: `${selectedShipping?.name} (${selectedShipping?.delay})`,
        shippingCost: shipping,
        subtotal: sub,
        discountAmount: discount,
        total,
        couponCode: couponCode ?? undefined,
        paymentMethod,
      }),
    });
    if (!res.ok) throw new Error("Erreur lors de la creation de la commande");
    const data = (await res.json()) as { orderId: string };
    return data.orderId;
  }

  async function handleStripeCheckout() {
    setLoading(true);
    setError(null);
    try {
      const orderId = await createOrder();
      const res = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Erreur Stripe");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="flex-1 max-w-xl mx-auto px-4 py-24 text-center">
          <p className="text-lg text-text-muted mb-6">Votre panier est vide.</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env["NEXT_PUBLIC_PAYPAL_CLIENT_ID"] ?? "",
        currency: "EUR",
      }}
    >
      <Header />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-10">
        {/* Etapes */}
        <nav className="flex items-center gap-0 mb-10">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center">
              <div
                className={`flex items-center gap-2 text-sm font-medium ${i <= step ? "text-primary" : "text-text-muted"}`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${i < step ? "bg-primary text-white border-primary" : i === step ? "border-primary text-primary" : "border-border"}`}
                >
                  {i < step ? "✓" : i + 1}
                </span>
                {label}
              </div>
              {i < STEPS.length - 1 && (
                <span className="mx-3 text-border">—</span>
              )}
            </div>
          ))}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Formulaire */}
          <div className="lg:col-span-2">
            {step === 0 && (
              <div className="space-y-4">
                <h2 className="font-heading text-xl font-semibold">Vos coordonnées</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Prénom</label>
                    <input
                      {...register("shipping.firstName")}
                      className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    />
                    {errors.shipping?.firstName && (
                      <p className="text-xs text-red-500 mt-1">{errors.shipping.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Nom</label>
                    <input
                      {...register("shipping.lastName")}
                      className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Email</label>
                  <input
                    type="email"
                    {...register("shipping.email")}
                    className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                  {errors.shipping?.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.shipping.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Adresse</label>
                  <input
                    {...register("shipping.street")}
                    className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Code postal</label>
                    <input
                      {...register("shipping.zip")}
                      className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Ville</label>
                    <input
                      {...register("shipping.city")}
                      className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Pays</label>
                  <select
                    {...register("shipping.country")}
                    className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary bg-surface"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="w-full bg-primary text-white py-3 text-sm font-semibold hover:bg-primary-hover transition-colors"
                >
                  Continuer vers la livraison
                </button>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-heading text-xl font-semibold">Mode de livraison</h2>
                <div className="space-y-3">
                  {SHIPPING_OPTIONS.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-center justify-between border p-4 cursor-pointer transition-colors ${selectedShipping?.id === option.id ? "border-primary" : "border-border hover:border-text-muted"}`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          checked={selectedShipping?.id === option.id}
                          onChange={() => setSelectedShipping(option)}
                          className="accent-primary"
                        />
                        <div>
                          <p className="text-sm font-medium">{option.name}</p>
                          <p className="text-xs text-text-muted">{option.delay}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold">
                        {option.price === 0 ? "Gratuit" : `${option.price.toFixed(2)} EUR`}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(0)}
                    className="flex-1 border border-border py-3 text-sm hover:bg-surface-alt transition-colors"
                  >
                    Retour
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 bg-primary text-white py-3 text-sm font-semibold hover:bg-primary-hover transition-colors"
                  >
                    Continuer vers le paiement
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="font-heading text-xl font-semibold">Paiement</h2>

                {/* Onglets methode */}
                <div className="flex border border-border">
                  <button
                    onClick={() => setPaymentMethod("stripe")}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${paymentMethod === "stripe" ? "bg-primary text-white" : "hover:bg-surface-alt"}`}
                  >
                    Carte bancaire
                  </button>
                  <button
                    onClick={() => setPaymentMethod("paypal")}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${paymentMethod === "paypal" ? "bg-primary text-white" : "hover:bg-surface-alt"}`}
                  >
                    PayPal
                  </button>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                    {error}
                  </div>
                )}

                {paymentMethod === "stripe" && (
                  <div className="space-y-4">
                    <p className="text-sm text-text-muted">
                      Vous serez redirigé vers la page de paiement sécurisée Stripe.
                      Cartes acceptées : Visa, Mastercard, CB, American Express.
                    </p>
                    <button
                      onClick={handleStripeCheckout}
                      disabled={loading}
                      className="w-full bg-primary text-white py-4 text-sm font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50"
                    >
                      {loading ? "Redirection en cours..." : `Payer ${total.toFixed(2)} EUR par carte`}
                    </button>
                  </div>
                )}

                {paymentMethod === "paypal" && (
                  <PayPalButtons
                    style={{ layout: "vertical", color: "blue", shape: "rect" }}
                    createOrder={async () => {
                      const orderId = await createOrder();
                      const res = await fetch("/api/checkout/paypal/create", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ orderId }),
                      });
                      const data = (await res.json()) as { paypalOrderId?: string; error?: string };
                      if (!data.paypalOrderId) throw new Error(data.error ?? "Erreur PayPal");
                      return data.paypalOrderId;
                    }}
                    onApprove={async (data) => {
                      const internalOrderId = sessionStorage.getItem("pendingOrderId") ?? "";
                      const res = await fetch("/api/checkout/paypal/capture", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          paypalOrderId: data.orderID,
                          internalOrderId,
                        }),
                      });
                      const result = (await res.json()) as { success?: boolean; orderId?: string };
                      if (result.success) {
                        clearCart();
                        window.location.href = `/commande/confirmation/${result.orderId}`;
                      }
                    }}
                    onError={() => setError("Erreur PayPal. Veuillez réessayer.")}
                  />
                )}

                <div className="flex items-center justify-center gap-2 text-xs text-text-muted pt-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Paiement 100% sécurisé — Visa, Mastercard, CB, PayPal
                </div>

                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-text-muted hover:text-text-base transition-colors"
                >
                  Retour
                </button>
              </div>
            )}
          </div>

          {/* Recap permanent */}
          <aside className="border border-border p-6 h-fit space-y-4 sticky top-24">
            <h2 className="font-semibold">Recapitulatif</h2>
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={`${item.productId}-${item.variantOptionId ?? ""}`} className="flex justify-between text-sm">
                  <span className="text-text-muted line-clamp-2 flex-1 mr-2">
                    {item.name}{item.variantLabel ? ` (${item.variantLabel})` : ""} x{item.quantity}
                  </span>
                  <span className="font-medium shrink-0">
                    {(item.unitPrice * item.quantity).toFixed(2)} EUR
                  </span>
                </li>
              ))}
            </ul>
            <div className="border-t border-border pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Sous-total</span>
                <span>{sub.toFixed(2)} EUR</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Remise</span>
                  <span>- {discount.toFixed(2)} EUR</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-text-muted">Livraison</span>
                <span>{shipping === 0 ? "Gratuite" : `${shipping.toFixed(2)} EUR`}</span>
              </div>
              <div className="flex justify-between font-semibold text-base border-t border-border pt-2">
                <span>Total TTC</span>
                <span>{total.toFixed(2)} EUR</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </PayPalScriptProvider>
  );
}
