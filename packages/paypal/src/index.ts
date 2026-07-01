export * from "./orders";

export function getPayPalBaseUrl(): string {
  return process.env["PAYPAL_ENV"] === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env["PAYPAL_CLIENT_ID"];
  const clientSecret = process.env["PAYPAL_CLIENT_SECRET"];

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials are not defined");
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const base = getPayPalBaseUrl();

  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`PayPal auth failed: ${response.status}`);
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}
