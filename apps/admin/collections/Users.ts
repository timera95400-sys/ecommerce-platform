import type { CollectionConfig } from "payload";
import { isSuperAdmin, isAdminOrSelf, isLoggedIn } from "../access/roles";

export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    tokenExpiration: 28800,
  },
  admin: {
    useAsTitle: "email",
    group: "Administration",
  },
  access: {
    create: isSuperAdmin,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
    delete: isSuperAdmin,
  },
  fields: [
    { name: "firstName", type: "text", label: "Prenom", required: true },
    { name: "lastName", type: "text", label: "Nom", required: true },
    {
      name: "role",
      type: "select",
      label: "Role",
      required: true,
      defaultValue: "CLIENT_ADMIN",
      options: [
        { label: "Super Admin (Agence)", value: "SUPER_ADMIN" },
        { label: "Admin Client (Commercant)", value: "CLIENT_ADMIN" },
      ],
      access: { update: isSuperAdmin },
    },
  ],
  timestamps: true,
};
