// =============================================================================
// LIVRABLE 6 — Catalogue (/boutique)
// Filtres + tri + pagination — Server Component
// =============================================================================

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { catalogFiltersSchema } from "@/lib/validations";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

function getStringParam(val: string | string[] | undefined): string | undefined {
  return Array.isArray(val) ? val[0] : val;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Boutique",
    description: "Decouvrez tous nos produits",
  };
}

export default async function BoutiquePage({ searchParams }: PageProps) {
  const raw = {
    cat: getStringParam(searchParams["cat"]),
    sort: getStringParam(searchParams["sort"]),
    minPrice: getStringParam(searchParams["minPrice"]),
    maxPrice: getStringParam(searchParams["maxPrice"]),
    inStock: getStringParam(searchParams["inStock"]),
    page: getStringParam(searchParams["page"]),
  };

  const filters = catalogFiltersSchema.parse(raw);
  const { page, cat, sort, minPrice, maxPrice, inStock } = filters;
  const PER_PAGE = 12;
  const skip = (page - 1) * PER_PAGE;

  const where = {
    status: "PUBLISHED" as const,
    ...(cat ? { category: { slug: cat } } : {}),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? {
          price: {
            ...(minPrice !== undefined ? { gte: minPrice } : {}),
            ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
          },
        }
      : {}),
    ...(inStock ? { totalStock: { gt: 0 } } : {}),
  };

  const orderBy = (() => {
    switch (sort) {
      case "price-asc":
        return { price: "asc" as const };
      case "price-desc":
        return { price: "desc" as const };
      case "newest":
        return { createdAt: "desc" as const };
      default:
        return { createdAt: "desc" as const };
    }
  })();

  const [products, totalCount, categories] = await Promise.all([
    db.product.findMany({
      where,
      orderBy,
      skip,
      take: PER_PAGE,
      include: { images: { orderBy: { order: "asc" }, take: 2 } },
    }),
    db.product.count({ where }),
    db.category.findMany({
      where: { parentId: null },
      orderBy: { order: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / PER_PAGE);

  return (
    <>
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading text-3xl font-semibold">Boutique</h1>
          <p className="text-text-muted text-sm">
            {totalCount} produit{totalCount !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filtres */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-6 space-y-6">
              <div>
                <h3 className="font-semibold text-sm uppercase tracking-wide mb-3">
                  Categories
                </h3>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/boutique"
                      className={`text-sm block py-1 ${!cat ? "font-semibold text-primary" : "text-text-muted hover:text-text-base"}`}
                    >
                      Tout
                    </Link>
                  </li>
                  {categories.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/boutique?cat=${c.slug}`}
                        className={`text-sm block py-1 ${cat === c.slug ? "font-semibold text-primary" : "text-text-muted hover:text-text-base"}`}
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-sm uppercase tracking-wide mb-3">
                  Tri
                </h3>
                <ul className="space-y-1">
                  {[
                    { value: "relevance", label: "Pertinence" },
                    { value: "price-asc", label: "Prix croissant" },
                    { value: "price-desc", label: "Prix decroissant" },
                    { value: "newest", label: "Nouveautes" },
                  ].map((s) => (
                    <li key={s.value}>
                      <Link
                        href={`/boutique?${cat ? `cat=${cat}&` : ""}sort=${s.value}`}
                        className={`text-sm block py-1 ${sort === s.value ? "font-semibold text-primary" : "text-text-muted hover:text-text-base"}`}
                      >
                        {s.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* Grille produits */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="text-center py-24 text-text-muted">
                <p className="text-lg mb-4">Aucun produit trouve.</p>
                <Link href="/boutique" className="text-primary underline">
                  Voir tous les produits
                </Link>
              </div>
            ) : (
              <>
                <ProductGrid products={products} />

                {totalPages > 1 && (
                  <nav className="flex justify-center items-center gap-2 mt-12">
                    {page > 1 && (
                      <Link
                        href={`/boutique?${cat ? `cat=${cat}&` : ""}sort=${sort}&page=${page - 1}`}
                        className="px-4 py-2 border border-border text-sm hover:bg-surface-alt transition-colors"
                      >
                        Precedent
                      </Link>
                    )}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Link
                        key={p}
                        href={`/boutique?${cat ? `cat=${cat}&` : ""}sort=${sort}&page=${p}`}
                        className={`px-4 py-2 border text-sm transition-colors ${p === page ? "bg-primary text-white border-primary" : "border-border hover:bg-surface-alt"}`}
                      >
                        {p}
                      </Link>
                    ))}
                    {page < totalPages && (
                      <Link
                        href={`/boutique?${cat ? `cat=${cat}&` : ""}sort=${sort}&page=${page + 1}`}
                        className="px-4 py-2 border border-border text-sm hover:bg-surface-alt transition-colors"
                      >
                        Suivant
                      </Link>
                    )}
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
