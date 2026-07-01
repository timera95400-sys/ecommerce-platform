import { z } from "zod";

// ---------------------------------------------------------------------------
// Checkout — coordonnees client
// ---------------------------------------------------------------------------

export const addressSchema = z.object({
  firstName: z
    .string()
    .min(1, "Prenom requis")
    .max(50)
    .regex(/^[\p{L}\s'-]+$/u, "Caracteres invalides"),
  lastName: z
    .string()
    .min(1, "Nom requis")
    .max(50)
    .regex(/^[\p{L}\s'-]+$/u, "Caracteres invalides"),
  email: z.string().email("Email invalide"),
  phone: z
    .string()
    .regex(/^(\+33|0)[0-9]{9}$/, "Numero de telephone invalide")
    .optional()
    .or(z.literal("")),
  street: z.string().min(5, "Adresse trop courte").max(200),
  city: z.string().min(2).max(100),
  zip: z.string().regex(/^\d{4,10}$/, "Code postal invalide"),
  country: z.string().length(2, "Code pays ISO 2 lettres requis"),
});

export const checkoutSchema = z.object({
  shipping: addressSchema,
  useDifferentBillingAddress: z.boolean().default(false),
  billing: addressSchema.optional(),
  shippingOptionId: z.string().min(1, "Option de livraison requise"),
  paymentMethod: z.enum(["stripe", "paypal"]),
  couponCode: z.string().max(50).optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

// ---------------------------------------------------------------------------
// Validation du coupon (API)
// ---------------------------------------------------------------------------

export const couponValidationSchema = z.object({
  code: z
    .string()
    .min(1, "Code requis")
    .max(50)
    .toUpperCase()
    .regex(/^[A-Z0-9_-]+$/, "Code invalide"),
  orderTotal: z.number().positive(),
});

// ---------------------------------------------------------------------------
// Review
// ---------------------------------------------------------------------------

export const reviewSchema = z.object({
  productId: z.string().cuid("ID produit invalide"),
  authorName: z.string().min(1).max(100),
  authorEmail: z.string().email(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

// ---------------------------------------------------------------------------
// Newsletter
// ---------------------------------------------------------------------------

export const newsletterSchema = z.object({
  email: z.string().email("Email invalide"),
});

// ---------------------------------------------------------------------------
// Recherche
// ---------------------------------------------------------------------------

export const searchSchema = z.object({
  q: z.string().min(1).max(100).trim(),
  page: z.coerce.number().int().positive().default(1),
});

// ---------------------------------------------------------------------------
// Filtres boutique
// ---------------------------------------------------------------------------

export const catalogFiltersSchema = z.object({
  cat: z.string().optional(),
  sort: z
    .enum(["relevance", "price-asc", "price-desc", "newest", "bestseller"])
    .default("relevance"),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  inStock: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
});

// ---------------------------------------------------------------------------
// Compte client
// ---------------------------------------------------------------------------

export const registerSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Mot de passe trop court (8 caracteres minimum)")
    .max(128)
    .regex(/[A-Z]/, "Le mot de passe doit contenir une majuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir un chiffre"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
