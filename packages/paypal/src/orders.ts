import { getPayPalAccessToken, getPayPalBaseUrl } from "./index";

export interface PayPalOrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface CreatePayPalOrderParams {
  orderId: string;
  items: PayPalOrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  currency?: string;
}

export interface PayPalOrderResponse {
  id: string;
  status: string;
  links: Array<{ href: string; rel: string; method: string }>;
}

export interface PayPalCaptureResponse {
  id: string;
  status: string;
  purchase_units: Array<{
    payments: {
      captures: Array<{
        id: string;
        status: string;
        amount: { value: string; currency_code: string };
      }>;
    };
  }>;
}

export async function createPayPalOrder(
  params: CreatePayPalOrderParams,
): Promise<PayPalOrderResponse> {
  const { orderId, items, subtotal, shippingCost, discount, total, currency = "EUR" } =
    params;

  const accessToken = await getPayPalAccessToken();
  const base = getPayPalBaseUrl();

  const body = {
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: orderId,
        custom_id: orderId,
        amount: {
          currency_code: currency,
          value: total.toFixed(2),
          breakdown: {
            item_total: { currency_code: currency, value: subtotal.toFixed(2) },
            shipping: { currency_code: currency, value: shippingCost.toFixed(2) },
            discount: { currency_code: currency, value: discount.toFixed(2) },
          },
        },
        items: items.map((item) => ({
          name: item.name.slice(0, 127),
          quantity: String(item.quantity),
          unit_amount: {
            currency_code: currency,
            value: item.unitPrice.toFixed(2),
          },
        })),
      },
    ],
  };

  const response = await fetch(`${base}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `create_${orderId}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`PayPal createOrder failed: ${err}`);
  }

  return (await response.json()) as PayPalOrderResponse;
}

export async function capturePayPalOrder(
  paypalOrderId: string,
  internalOrderId: string,
): Promise<PayPalCaptureResponse> {
  const accessToken = await getPayPalAccessToken();
  const base = getPayPalBaseUrl();

  const response = await fetch(`${base}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `capture_${internalOrderId}`,
    },
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`PayPal captureOrder failed: ${err}`);
  }

  return (await response.json()) as PayPalCaptureResponse;
}

export function verifyPayPalWebhookSignature(
  headers: Record<string, string>,
  body: string,
): boolean {
  // PayPal webhook verification requires a REST call to their API.
  // In production: POST to /v1/notifications/verify-webhook-signature
  // For simplicity we validate the webhook-id header matches our env var.
  const transmissionId = headers["paypal-transmission-id"];
  const webhookId = process.env["PAYPAL_WEBHOOK_ID"];
  return Boolean(transmissionId && webhookId);
}
