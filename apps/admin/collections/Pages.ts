import type { CollectionConfig } from "payload";
import { isLoggedIn } from "../access/roles";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

export const Pages: CollectionConfig = {
  slug: "pages",
  labels: { singular: "Page", plural: "Pages" },
  admin: { useAsTitle: "title", group: "Contenu" },
  access: { read: isLoggedIn, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  hooks: {
    beforeChange: [
      ({ data }: { data: Record<string, unknown> }) => {
        if (!data["slug"] && data["title"]) {
          data["slug"] = (data["title"] as string)
            .toLowerCase().normalize("NFD")
            .replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        }
        return data;
      },
    ],
  },
  fields: [
    { name: "title", type: "text", label: "Titre", required: true },
    { name: "slug", type: "text", label: "Slug", unique: true },
    { name: "content", type: "richText", label: "Contenu", editor: lexicalEditor() },
    {
      name: "status", type: "select", label: "Statut", required: true, defaultValue: "DRAFT",
      options: [{ label: "Publiee", value: "PUBLISHED" }, { label: "Brouillon", value: "DRAFT" }],
    },
    { name: "seoTitle", type: "text", label: "Titre meta", maxLength: 70 },
    { name: "seoDescription", type: "textarea", label: "Description meta", maxLength: 160 },
  ],
  timestamps: true,
};
