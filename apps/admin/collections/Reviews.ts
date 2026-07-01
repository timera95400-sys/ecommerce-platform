import type { CollectionConfig } from "payload";
import { isLoggedIn } from "../access/roles";

export const Reviews: CollectionConfig = {
  slug: "reviews",
  labels: { singular: "Avis Client", plural: "Avis Clients" },
  admin: { useAsTitle: "authorName", group: "Contenu" },
  access: { read: isLoggedIn, create: () => false, update: isLoggedIn, delete: isLoggedIn },
  fields: [
    { name: "product", type: "relationship", label: "Produit", relationTo: "products", required: true },
    { name: "authorName", type: "text", label: "Auteur", required: true },
    { name: "authorEmail", type: "email", label: "Email" },
    { name: "rating", type: "number", label: "Note (1-5)", required: true, min: 1, max: 5 },
    { name: "comment", type: "textarea", label: "Commentaire" },
    {
      name: "status", type: "select", label: "Moderation", required: true, defaultValue: "PENDING",
      options: [
        { label: "En attente", value: "PENDING" },
        { label: "Approuve", value: "APPROVED" },
        { label: "Refuse", value: "REJECTED" },
      ],
    },
  ],
  timestamps: true,
};
