import Stripe from "stripe";
import { stripe } from "./index";

export interface CheckoutLineItem {
  productId: string;
  name: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  variantLabel?: string;
}

export interface CreateCheckoutSessionParams {
  lineItems: CheckoutLineItem[];
  customerEmail: string;
  orderId: string;
  shippingCost: number;
  discountAmount: number;
  couponCode?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export async function createCheckoutSession(
  params: CreateCheckoutSessionParams,
): Promise<Stripe.Checkout.Session> {
  const {
    lineItems,
    customerEmail,
    orderId,
    shippingCost,
    successUrl,
    cancelUrl,
    metadata,
  } = params;

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: customerEmail,
    line_items: lineItems.map((item) => ({
      price_data: {
        currency: "eur",
        unit_amount: Math.round(item.unitPrice * 100),
        product_data: {
          name: item.variantLabel
            ? `${item.name} — ${item.variantLabel}`
            : item.name,
          ...(item.image ? { images: [item.image] } : {}),
        },
      },
      quantity: item.quantity,
    })),
    success_url: successUrl,
    cancel_url: cancelUrl,
    payment_intent_data: {
      metadata: {
        orderId,
        ...metadata,
      },
    },
    metadata: {
      orderId,
      ...metadata,
    },
  };

  if (shippingCost > 0) {
    sessionParams.shipping_options = [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: Math.round(shippingCost * 100), currency: "eur" },
          display_name: "Livraison",
        },
      },
    ];
  }

  const session = await stripe.checkout.sessions.create(sessionParams, {
    idempotencyKey: `checkout_${orderId}`,
  });

  return session;
}

export async function createPaymentIntent(
  amountCents: number,
  orderId: string,
  customerEmail: string,
): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.create(
    {
      amount: amountCents,
      currency: "eur",
      receipt_email: customerEmail,
      metadata: { orderId },
      automatic_payment_methods: { enabled: true },
    },
    { idempotencyKey: `pi_${orderId}` },
  );
}

export async function retrieveSession(
  sessionId: string,
): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent", "line_items"],
  });
}
