import { Resend } from "resend";

const resend = new Resend(process.env["RESEND_API_KEY"] ?? "");
const FROM = process.env["EMAIL_FROM"] ?? "boutique@example.com";
const SHOP = process.env["SHOP_NAME"] ?? "Ma Boutique";

export async function sendOrderStatusUpdate(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  status: string,
  trackingNumber?: string,
): Promise<void> {
  const trackingLine = trackingNumber
    ? `<p>Numero de suivi : <strong>${trackingNumber}</strong></p>`
    : "";

  await resend.emails.send({
    from: `${SHOP} <${FROM}>`,
    to: customerEmail,
    subject: `Mise a jour commande #${orderNumber} — ${status}`,
    html: `
      <h2>Mise a jour de votre commande</h2>
      <p>Bonjour ${customerName},</p>
      <p>Votre commande <strong>#${orderNumber}</strong> est maintenant : <strong>${status}</strong></p>
      ${trackingLine}
      <p>Merci pour votre achat.</p>
    `,
  });
}
