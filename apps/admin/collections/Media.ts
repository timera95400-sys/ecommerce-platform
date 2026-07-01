import type { CollectionConfig } from "payload";
import { isLoggedIn } from "../access/roles";
import path from "path";
import { fileURLToPath } from "url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Media", plural: "Medias" },
  admin: { group: "Contenu" },
  access: { read: () => true, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  upload: {
    staticDir: path.resolve(dirname, "../public/media"),
    imageSizes: [
      { name: "thumbnail", width: 400, height: 400 },
      { name: "card", width: 800, height: 800 },
    ],
    adminThumbnail: "thumbnail",
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
  },
  fields: [
    { name: "alt", type: "text", label: "Texte alternatif" },
    { name: "folder", type: "text", label: "Dossier" },
  ],
  timestamps: true,
};
