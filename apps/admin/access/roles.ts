import type { Access, FieldAccess } from "payload";

type UserWithRole = {
  id: string;
  email: string;
  role: "SUPER_ADMIN" | "CLIENT_ADMIN";
};

export const isSuperAdmin: Access = ({ req: { user } }) => {
  if (!user) return false;
  return (user as UserWithRole).role === "SUPER_ADMIN";
};

export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false;
  const u = user as UserWithRole;
  if (u.role === "SUPER_ADMIN") return true;
  return { id: { equals: u.id } };
};

export const isLoggedIn: Access = ({ req: { user } }) => Boolean(user);

export const superAdminFieldAccess: FieldAccess = ({ req: { user } }) => {
  if (!user) return false;
  return (user as UserWithRole).role === "SUPER_ADMIN";
};
