import type { CollectionConfig } from "payload";
import { isLoggedIn } from "../access/roles";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

export const Products: CollectionConfig = {
  slug: "products",
  labels: { singular: "Produit", plural: "Produits" },
  admin: {
    useAsTitle: "name",
    group: "Catalogue",
    defaultColumns: ["name", "price", "category", "status", "totalStock"],
  },
  access: { read: isLoggedIn, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  hooks: {
    beforeChange: [
      ({ data }: { data: Record<string, unknown> }) => {
        if (!data["slug"] && data["name"]) {
          data["slug"] = (data["name"] as string)
            .toLowerCase()
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
        }
        return data;
      },
    ],
  },
  fields: [
    { name: "name", type: "text", label: "Nom du produit", required: true, maxLength: 200 },
    { name: "slug", type: "text", label: "Slug (URL)", unique: true },
    {
      type: "tabs",
      tabs: [
        {
          label: "Informations",
          fields: [
            { name: "description", type: "richText", label: "Description", editor: lexicalEditor() },
            {
              type: "row",
              fields: [
                { name: "price", type: "number", label: "Prix de vente (EUR)", required: true, min: 0, admin: { width: "50%" } },
                { name: "compareAtPrice", type: "number", label: "Prix barre (EUR)", min: 0, admin: { width: "50%" } },
              ],
            },
            { name: "category", type: "relationship", label: "Categorie", relationTo: "categories", hasMany: false },
            {
              name: "badge", type: "select", label: "Badge", defaultValue: "NONE",
              options: [
                { label: "Aucun", value: "NONE" },
                { label: "Nouveau", value: "NEW" },
                { label: "Promo", value: "PROMO" },
                { label: "Bestseller", value: "BESTSELLER" },
              ],
            },
            {
              name: "status", type: "select", label: "Statut", required: true, defaultValue: "DRAFT",
              options: [
                { label: "Publie", value: "PUBLISHED" },
                { label: "Brouillon", value: "DRAFT" },
                { label: "Archive", value: "ARCHIVED" },
              ],
            },
          ],
        },
        {
          label: "Images",
          fields: [
            {
              name: "images", type: "array", label: "Images (jusqu'a 8)", maxRows: 8,
              fields: [
                { name: "image", type: "upload", relationTo: "media", required: true },
                { name: "alt", type: "text", label: "Texte alternatif" },
              ],
            },
          ],
        },
        {
          label: "Variantes & Stock",
          fields: [
            { name: "totalStock", type: "number", label: "Stock total", defaultValue: 0, min: 0 },
            {
              name: "variants", type: "array", label: "Variantes",
              fields: [
                { name: "name", type: "text", label: "Nom variante", required: true },
                {
                  name: "options", type: "array", label: "Options",
                  fields: [
                    { name: "label", type: "text", label: "Label", required: true },
                    { name: "stock", type: "number", label: "Stock", defaultValue: 0, min: 0 },
                    { name: "sku", type: "text", label: "SKU" },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "SEO",
          fields: [
            { name: "seoTitle", type: "text", label: "Titre meta", maxLength: 70 },
            { name: "seoDescription", type: "textarea", label: "Description meta", maxLength: 160 },
            { name: "seoImage", type: "upload", label: "Image OG", relationTo: "media" },
          ],
        },
      ],
    },
  ],
  timestamps: true,
};
