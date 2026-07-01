import type { CollectionConfig } from "payload";
import { isLoggedIn, isSuperAdmin } from "../access/roles";
import { sendOrderStatusUpdate } from "../hooks/email-hooks";

export const Orders: CollectionConfig = {
  slug: "orders",
  labels: { singular: "Commande", plural: "Commandes" },
  admin: {
    useAsTitle: "orderNumber",
    group: "Ventes",
    defaultColumns: ["orderNumber", "status", "total", "paymentMethod", "createdAt"],
    disableDuplicate: true,
  },
  access: {
    read: isLoggedIn,
    create: () => false,
    update: isLoggedIn,
    delete: isSuperAdmin,
  },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, operation }: { doc: Record<string, unknown>; previousDoc: Record<string, unknown>; operation: string }) => {
        if (operation === "update" && doc["status"] !== previousDoc["status"] && doc["guestEmail"]) {
          const labels: Record<string, string> = {
            CONFIRMED: "Confirmee", PROCESSING: "En preparation",
            SHIPPED: "Expediee", DELIVERED: "Livree",
            CANCELLED: "Annulee", REFUNDED: "Remboursee",
          };
          await sendOrderStatusUpdate(
            doc["guestEmail"] as string,
            `${doc["shippingFirstName"]} ${doc["shippingLastName"]}`,
            doc["orderNumber"] as string,
            labels[doc["status"] as string] ?? String(doc["status"]),
            doc["trackingNumber"] as string | undefined,
          );
        }
      },
    ],
  },
  fields: [
    { name: "orderNumber", type: "text", label: "Numero de commande", unique: true },
    {
      name: "status", type: "select", label: "Statut", required: true, defaultValue: "PENDING",
      options: [
        { label: "En attente", value: "PENDING" },
        { label: "Confirmee", value: "CONFIRMED" },
        { label: "En preparation", value: "PROCESSING" },
        { label: "Expediee", value: "SHIPPED" },
        { label: "Livree", value: "DELIVERED" },
        { label: "Annulee", value: "CANCELLED" },
        { label: "Remboursee", value: "REFUNDED" },
      ],
    },
    { name: "guestEmail", type: "email", label: "Email client" },
    { name: "guestFirstName", type: "text", label: "Prenom client" },
    { name: "guestLastName", type: "text", label: "Nom client" },
    { name: "shippingFirstName", type: "text", label: "Prenom livraison" },
    { name: "shippingLastName", type: "text", label: "Nom livraison" },
    { name: "shippingStreet", type: "text", label: "Rue" },
    { name: "shippingCity", type: "text", label: "Ville" },
    { name: "shippingZip", type: "text", label: "Code postal" },
    { name: "shippingCountry", type: "text", label: "Pays", defaultValue: "FR" },
    {
      name: "paymentMethod", type: "select", label: "Paiement",
      options: [{ label: "Stripe", value: "STRIPE" }, { label: "PayPal", value: "PAYPAL" }],
    },
    { name: "paymentIntentId", type: "text", label: "ID transaction" },
    { name: "subtotal", type: "number", label: "Sous-total" },
    { name: "discountAmount", type: "number", label: "Remise" },
    { name: "shippingCost", type: "number", label: "Livraison" },
    { name: "total", type: "number", label: "Total TTC" },
    { name: "couponCode", type: "text", label: "Code promo" },
    { name: "shippingOptionName", type: "text", label: "Option livraison" },
    { name: "trackingNumber", type: "text", label: "Numero de suivi" },
    { name: "notes", type: "textarea", label: "Notes internes" },
    {
      name: "items", type: "array", label: "Articles",
      admin: { readOnly: true },
      fields: [
        { name: "productName", type: "text", label: "Produit" },
        { name: "variantLabel", type: "text", label: "Variante" },
        { name: "quantity", type: "number", label: "Qte" },
        { name: "unitPrice", type: "number", label: "Prix unitaire" },
        { name: "totalPrice", type: "number", label: "Total" },
      ],
    },
  ],
  timestamps: true,
};
