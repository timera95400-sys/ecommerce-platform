# E-Commerce Platform — Guide de déploiement

Système e-commerce complet : storefront Next.js 14 + back-office Payload CMS 2.x.

## Architecture

```
apps/store    → Storefront client (Next.js 14, Vercel)
apps/admin    → Back-office admin (Payload CMS, Railway)
packages/
  database/   → Schema Prisma (PostgreSQL)
  stripe/     → Wrapper Stripe
  paypal/     → Wrapper PayPal
  ui/         → Composants partagés
```

## Deployer un nouveau client (2h)

### Etape 1 — Prérequis comptes

- [Neon.tech](https://neon.tech) — base de données PostgreSQL (gratuit)
- [Vercel](https://vercel.com) — hébergement storefront (gratuit)
- [Railway](https://railway.app) — hébergement Payload admin (~5$/mois)
- [Cloudinary](https://cloudinary.com) — médias (gratuit 25Go)
- [Resend](https://resend.com) — emails transactionnels (gratuit 3000/mois)
- [Stripe](https://stripe.com) — paiements CB
- [PayPal Developer](https://developer.paypal.com) — paiements PayPal

### Etape 2 — Configuration locale

```bash
git clone <repo> mon-client
cd mon-client
pnpm install
cp .env.example .env.local
# Remplir toutes les variables dans .env.local
```

### Etape 3 — Base de données

```bash
cd packages/database
pnpm db:push          # Creer les tables
pnpm db:generate      # Generer le client Prisma
```

### Etape 4 — Choisir le template

Dans `.env.local` :
```
NEXT_PUBLIC_TEMPLATE=minimal        # ou dark-premium ou bold-color
```

### Etape 5 — Déployer le storefront (Vercel)

1. Pousser le repo sur GitHub
2. Importer sur Vercel
3. Racine du projet : `apps/store`
4. Ajouter toutes les variables d'environnement depuis `.env.local`
5. Déployer

### Etape 6 — Déployer l'admin (Railway)

1. Créer un nouveau projet Railway
2. Connecter le repo GitHub
3. Racine : `apps/admin`
4. Variables d'environnement : copier depuis `.env.local`
5. Déployer

### Etape 7 — Configurer le domaine

Dans Vercel : `votredomaine.com` → storefront
Dans Railway : `admin.votredomaine.com` → admin Payload

### Etape 8 — Créer le compte client

Accéder à `https://admin.votredomaine.com/admin`
Créer le premier compte SUPER_ADMIN, puis le compte CLIENT_ADMIN du client.

### Etape 9 — Livraison au client

- Transmettre l'URL admin + identifiants CLIENT_ADMIN
- Envoyer le fichier `GUIDE_ADMIN.md`

---

## Coûts par client

| Service | Coût mensuel |
|---|---|
| Vercel | Gratuit |
| Railway | ~5$ |
| Neon.tech | Gratuit |
| Cloudinary | Gratuit |
| Resend | Gratuit |
| **Total** | **~5$/mois** |

## Commandes utiles

```bash
pnpm dev                    # Lancer tout en dev
pnpm build                  # Build de production
pnpm db:studio              # Ouvrir Prisma Studio (visualiser la BDD)
pnpm db:migrate             # Appliquer les migrations
```
