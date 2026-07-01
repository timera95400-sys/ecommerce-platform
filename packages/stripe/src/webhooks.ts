import Stripe from "stripe";
import { stripe } from "./index";

export function constructStripeEvent(
  payload: string | Buffer,
  signature: string,
): Stripe.Event {
  const webhookSecret = process.env["STRIPE_WEBHOOK_SECRET"];
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not defined");
  }
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

export type StripeEventHandler = {
  onCheckoutSessionCompleted: (session: Stripe.Checkout.Session) => Promise<void>;
  onPaymentIntentSucceeded: (intent: Stripe.PaymentIntent) => Promise<void>;
  onPaymentIntentFailed: (intent: Stripe.PaymentIntent) => Promise<void>;
  onChargeRefunded: (charge: Stripe.Charge) => Promise<void>;
};

export async function handleStripeEvent(
  event: Stripe.Event,
  handlers: StripeEventHandler,
): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status === "paid") {
        await handlers.onCheckoutSessionCompleted(session);
      }
      break;
    }
    case "payment_intent.succeeded": {
      const intent = event.data.object as Stripe.PaymentIntent;
      await handlers.onPaymentIntentSucceeded(intent);
      break;
    }
    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      await handlers.onPaymentIntentFailed(intent);
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      await handlers.onChargeRefunded(charge);
      break;
    }
    default:
      break;
  }
}
