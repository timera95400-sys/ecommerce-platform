import type { GlobalConfig } from "payload";
import { isLoggedIn, superAdminFieldAccess } from "../access/roles";

export const SiteConfig: GlobalConfig = {
  slug: "site-config",
  label: "Configuration du site",
  admin: { group: "Parametres" },
  access: { read: isLoggedIn, update: isLoggedIn },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Identite",
          fields: [
            { name: "shopName", type: "text", label: "Nom de la boutique", required: true },
            { name: "logo", type: "upload", label: "Logo", relationTo: "media" },
            { name: "favicon", type: "upload", label: "Favicon", relationTo: "media" },
            { name: "contactEmail", type: "email", label: "Email de contact" },
            { name: "phone", type: "text", label: "Telephone" },
          ],
        },
        {
          label: "Apparence",
          fields: [
            { name: "primaryColor", type: "text", label: "Couleur principale (hex)", defaultValue: "#111111" },
            { name: "secondaryColor", type: "text", label: "Couleur secondaire", defaultValue: "#ffffff" },
            {
              name: "fontFamily", type: "select", label: "Police", defaultValue: "Inter",
              options: [
                { label: "Inter", value: "Inter" },
                { label: "Poppins", value: "Poppins" },
                { label: "Cormorant Garamond", value: "Cormorant Garamond" },
              ],
            },
          ],
        },
        {
          label: "Accueil",
          fields: [
            { name: "heroImage", type: "upload", label: "Image hero", relationTo: "media" },
            { name: "heroTitle", type: "text", label: "Titre hero", defaultValue: "Bienvenue" },
            { name: "heroSubtitle", type: "text", label: "Sous-titre" },
            { name: "heroCtaText", type: "text", label: "Texte bouton CTA", defaultValue: "Decouvrir" },
            { name: "heroCtaLink", type: "text", label: "Lien CTA", defaultValue: "/boutique" },
            {
              type: "group", name: "promoBanner", label: "Bandeau promo",
              fields: [
                { name: "active", type: "checkbox", label: "Actif", defaultValue: false },
                { name: "text", type: "text", label: "Texte" },
                { name: "bgColor", type: "text", label: "Fond", defaultValue: "#000000" },
                { name: "textColor", type: "text", label: "Texte", defaultValue: "#ffffff" },
              ],
            },
          ],
        },
        {
          label: "Livraison",
          fields: [
            {
              name: "shippingOptions", type: "array", label: "Options de livraison",
              fields: [
                { name: "name", type: "text", label: "Nom", required: true },
                { name: "delay", type: "text", label: "Delai", required: true },
                { name: "price", type: "number", label: "Prix (EUR)", defaultValue: 0 },
                { name: "freeAbove", type: "number", label: "Gratuit au-dessus de (EUR)", defaultValue: 0 },
              ],
            },
          ],
        },
        {
          label: "Reseaux sociaux",
          fields: [
            { name: "instagramUrl", type: "text", label: "Instagram URL" },
            { name: "facebookUrl", type: "text", label: "Facebook URL" },
            { name: "tiktokUrl", type: "text", label: "TikTok URL" },
          ],
        },
        {
          label: "Paiements",
          fields: [
            { name: "stripePublishableKey", type: "text", label: "Stripe Publishable Key", access: { update: superAdminFieldAccess } },
            { name: "stripeEnabled", type: "checkbox", label: "Stripe actif", defaultValue: true },
            { name: "paypalClientId", type: "text", label: "PayPal Client ID", access: { update: superAdminFieldAccess } },
            { name: "paypalEnabled", type: "checkbox", label: "PayPal actif", defaultValue: true },
          ],
        },
        {
          label: "Catalogue",
          fields: [
            { name: "productsPerPage", type: "number", label: "Produits par page", defaultValue: 12, min: 4, max: 48 },
            { name: "lowStockThreshold", type: "number", label: "Seuil alerte stock", defaultValue: 5 },
          ],
        },
      ],
    },
  ],
};
