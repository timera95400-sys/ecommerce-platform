import type { CollectionConfig } from "payload";
import { isLoggedIn } from "../access/roles";

export const Categories: CollectionConfig = {
  slug: "categories",
  labels: { singular: "Categorie", plural: "Categories" },
  admin: { useAsTitle: "name", group: "Catalogue" },
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
    { name: "name", type: "text", label: "Nom", required: true },
    { name: "slug", type: "text", label: "Slug", unique: true },
    { name: "image", type: "upload", label: "Image", relationTo: "media" },
    { name: "description", type: "textarea", label: "Description" },
    { name: "order", type: "number", label: "Ordre", defaultValue: 0 },
    { name: "parent", type: "relationship", label: "Categorie parente", relationTo: "categories", hasMany: false },
  ],
  timestamps: true,
};
