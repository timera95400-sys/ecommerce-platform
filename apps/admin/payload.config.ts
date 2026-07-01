// =============================================================================
// LIVRABLE 3 — Configuration Payload CMS 3.x
// =============================================================================

import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { Users } from "./collections/Users";
import { Products } from "./collections/Products";
import { Categories } from "./collections/Categories";
import { Orders } from "./collections/Orders";
import { Coupons } from "./collections/Coupons";
import { Pages } from "./collections/Pages";
import { Reviews } from "./collections/Reviews";
import { Media } from "./collections/Media";
import { SiteConfig } from "./globals/SiteConfig";
import path from "path";
import { fileURLToPath } from "url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: "users",
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: "— Admin",
    },
  },

  editor: lexicalEditor(),

  db: postgresAdapter({
    pool: {
      connectionString: process.env["DATABASE_URL"] ?? "",
    },
  }),

  collections: [Users, Products, Categories, Orders, Coupons, Pages, Reviews, Media],
  globals: [SiteConfig],

  serverURL: process.env["PAYLOAD_PUBLIC_SERVER_URL"] ?? "http://localhost:3001",

  cors: [process.env["STORE_URL"] ?? "http://localhost:3000"],

  csrf: [
    process.env["STORE_URL"] ?? "http://localhost:3000",
    process.env["PAYLOAD_PUBLIC_SERVER_URL"] ?? "http://localhost:3001",
  ],

  secret: process.env["PAYLOAD_SECRET"] ?? "CHANGE_ME_IN_PRODUCTION",

  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },

  graphQL: { disable: true },

  upload: {
    limits: { fileSize: 10_000_000 },
  },

  telemetry: false,
});
