import { Resend } from "resend";

if (!process.env["RESEND_API_KEY"]) {
  console.warn("RESEND_API_KEY is not defined — emails will not be sent");
}

const resend = new Resend(process.env["RESEND_API_KEY"] ?? "");

const FROM = process.env["EMAIL_FROM"] ?? "boutique@example.com";
const SHOP_NAME = process.env["NEXT_PUBLIC_SHOP_NAME"] ?? "Ma Boutique";

interface OrderEmailData {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  items: Array<{ name: string; quantity: number; unitPrice: number }>;
  total: number;
  shippingAddress: string;
  deliveryDelay: string;
}

export async function sendOrderConfirmationToCustomer(data: OrderEmailData) {
  const itemsHtml = data.items
    .map(
      (i) =>
        `<tr><td>${i.name}</td><td>${i.quantity}</td><td>${i.unitPrice.toFixed(2)} EUR</td></tr>`,
    )
    .join("");

  await resend.emails.send({
    from: `${SHOP_NAME} <${FROM}>`,
    to: data.customerEmail,
    subject: `Confirmation de commande #${data.orderNumber}`,
    html: `
      <h2>Merci pour votre commande, ${data.customerName} !</h2>
      <p>Votre commande <strong>#${data.orderNumber}</strong> a bien ete enregistree.</p>
      <table border="1" cellpadding="8" style="border-collapse:collapse;width:100%">
        <thead><tr><th>Article</th><th>Qte</th><th>Prix</th></tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p><strong>Total : ${data.total.toFixed(2)} EUR</strong></p>
      <p>Adresse de livraison : ${data.shippingAddress}</p>
      <p>Delai de livraison estime : ${data.deliveryDelay}</p>
      <p>Un email de suivi vous sera envoye quand votre colis sera expedie.</p>
    `,
  });
}

export async function sendNewOrderAlertToMerchant(data: OrderEmailData) {
  const merchantEmail = process.env["MERCHANT_EMAIL"];
  if (!merchantEmail) return;

  await resend.emails.send({
    from: `Systeme <${FROM}>`,
    to: merchantEmail,
    subject: `Nouvelle commande #${data.orderNumber} — ${data.total.toFixed(2)} EUR`,
    html: `
      <h2>Nouvelle commande recue</h2>
      <p>Client : ${data.customerName} (${data.customerEmail})</p>
      <p>Montant : <strong>${data.total.toFixed(2)} EUR</strong></p>
      <p>Commande #${data.orderNumber}</p>
    `,
  });
}

export async function sendOrderStatusUpdate(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  status: string,
  trackingNumber?: string,
) {
  const trackingLine = trackingNumber
    ? `<p>Numero de suivi : <strong>${trackingNumber}</strong></p>`
    : "";

  await resend.emails.send({
    from: `${SHOP_NAME} <${FROM}>`,
    to: customerEmail,
    subject: `Mise a jour de votre commande #${orderNumber}`,
    html: `
      <h2>Mise a jour de commande</h2>
      <p>Bonjour ${customerName},</p>
      <p>Le statut de votre commande <strong>#${orderNumber}</strong> est desormais : <strong>${status}</strong></p>
      ${trackingLine}
    `,
  });
}

export async function sendPasswordReset(email: string, resetLink: string) {
  await resend.emails.send({
    from: `${SHOP_NAME} <${FROM}>`,
    to: email,
    subject: "Reinitialisation de votre mot de passe",
    html: `
      <h2>Reinitialisation de mot de passe</h2>
      <p>Cliquez sur le lien ci-dessous pour reinitialiser votre mot de passe. Ce lien est valable 1 heure.</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>Si vous n'avez pas demande cette reinitialisation, ignorez cet email.</p>
    `,
  });
}

export async function sendLowStockAlert(
  productName: string,
  stock: number,
) {
  const merchantEmail = process.env["MERCHANT_EMAIL"];
  if (!merchantEmail) return;

  await resend.emails.send({
    from: `Systeme <${FROM}>`,
    to: merchantEmail,
    subject: `Alerte stock faible : ${productName}`,
    html: `
      <h2>Alerte : stock faible</h2>
      <p>Le produit <strong>${productName}</strong> n'a plus que <strong>${stock}</strong> unites en stock.</p>
      <p>Pensez a reapprovisionner votre catalogue.</p>
    `,
  });
}
