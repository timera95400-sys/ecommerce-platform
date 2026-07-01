import type { CollectionConfig } from "payload";
import { isLoggedIn } from "../access/roles";

export const Coupons: CollectionConfig = {
  slug: "coupons",
  labels: { singular: "Code Promo", plural: "Codes Promo" },
  admin: { useAsTitle: "code", group: "Ventes" },
  access: { read: isLoggedIn, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  fields: [
    {
      name: "code", type: "text", label: "Code", required: true, unique: true,
      hooks: { beforeChange: [({ value }: { value: string }) => value?.toUpperCase().replace(/\s/g, "")] },
    },
    {
      name: "type", type: "select", label: "Type", required: true,
      options: [{ label: "Pourcentage (%)", value: "PERCENTAGE" }, { label: "Montant fixe (EUR)", value: "FIXED" }],
    },
    { name: "value", type: "number", label: "Valeur", required: true, min: 0 },
    { name: "minOrderAmount", type: "number", label: "Montant minimum (EUR)", min: 0 },
    { name: "maxUses", type: "number", label: "Utilisations max", min: 1 },
    { name: "expiresAt", type: "date", label: "Date expiration" },
    { name: "usedCount", type: "number", label: "Utilisations actuelles", defaultValue: 0, admin: { readOnly: true } },
    { name: "isActive", type: "checkbox", label: "Code actif", defaultValue: true },
  ],
  timestamps: true,
};
