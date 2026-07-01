// =============================================================================
// LIVRABLE 6 — Page d'accueil (/)
// Server Component — zero useEffect, donnees via Prisma
// =============================================================================

import { db } from "@/lib/db";
import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProductSlider } from "@/components/home/ProductSlider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

async function getHomeData() {
  const [config, categories, bestsellers, newest] = await Promise.all([
    db.siteConfig.findUnique({ where: { id: "singleton" } }),
    db.category.findMany({
      where: { parentId: null },
      orderBy: { order: "asc" },
      take: 8,
    }),
    db.product.findMany({
      where: { status: "PUBLISHED", totalStock: { gt: 0 } },
      orderBy: [{ badge: "desc" }, { createdAt: "desc" }],
      take: 8,
      include: { images: { orderBy: { order: "asc" }, take: 2 } },
    }),
    db.product.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { images: { orderBy: { order: "asc" }, take: 2 } },
    }),
  ]);

  return { config, categories, bestsellers, newest };
}

export default async function HomePage() {
  const { config, categories, bestsellers, newest } = await getHomeData();

  return (
    <>
      <Header />
      <main className="flex-1">
        {config?.promoBannerActive && config.promoBannerText && (
          <div
            className="py-2 px-4 text-center text-sm font-medium"
            style={{
              backgroundColor: config.promoBannerBgColor,
              color: config.promoBannerTextColor,
            }}
          >
            {config.promoBannerText}
          </div>
        )}

        <Hero
          image={config?.heroImage ?? null}
          title={config?.heroTitle ?? "Bienvenue dans notre boutique"}
          subtitle={config?.heroSubtitle ?? null}
          ctaText={config?.heroCtaText ?? "Decouvrir la boutique"}
          ctaLink={config?.heroCtaLink ?? "/boutique"}
        />

        {categories.length > 0 && (
          <section className="py-16 px-4 max-w-7xl mx-auto">
            <h2 className="font-heading text-2xl font-semibold mb-8">
              Nos categories
            </h2>
            <CategoryGrid categories={categories} />
          </section>
        )}

        {bestsellers.length > 0 && (
          <section className="py-16 px-4 max-w-7xl mx-auto">
            <h2 className="font-heading text-2xl font-semibold mb-8">
              Meilleures ventes
            </h2>
            <ProductSlider products={bestsellers} />
          </section>
        )}

        {newest.length > 0 && (
          <section className="py-16 px-4 max-w-7xl mx-auto">
            <h2 className="font-heading text-2xl font-semibold mb-8">
              Nouveautes
            </h2>
            <ProductSlider products={newest} />
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
