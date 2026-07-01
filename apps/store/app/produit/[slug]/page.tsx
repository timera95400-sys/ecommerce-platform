// =============================================================================
// LIVRABLE 6 — Fiche produit (/produit/[slug])
// =============================================================================

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductGallery } from "@/components/product/ProductGallery";
import { VariantSelector } from "@/components/product/VariantSelector";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface PageProps {
  params: { slug: string };
}

async function getProduct(slug: string) {
  return db.product.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      images: { orderBy: { order: "asc" } },
      variants: { include: { options: true } },
      category: true,
      reviews: { where: { status: "APPROVED" }, orderBy: { createdAt: "desc" } },
    },
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: "Produit introuvable" };
  return {
    title: product.seoTitle ?? product.name,
    description: product.seoDescription ?? `Achetez ${product.name}`,
    openGraph: product.seoImage
      ? { images: [{ url: product.seoImage }] }
      : undefined,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const related = product.categoryId
    ? await db.product.findMany({
        where: {
          categoryId: product.categoryId,
          status: "PUBLISHED",
          id: { not: product.id },
        },
        take: 4,
        include: { images: { orderBy: { order: "asc" }, take: 2 } },
      })
    : [];

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : null;

  const totalStock =
    product.variants.length > 0
      ? product.variants.reduce(
          (s, v) => s + v.options.reduce((os, o) => os + o.stock, 0),
          0,
        )
      : product.totalStock;

  const breadcrumb = [
    { label: "Accueil", href: "/" },
    { label: "Boutique", href: "/boutique" },
    ...(product.category
      ? [{ label: product.category.name, href: `/boutique?cat=${product.category.slug}` }]
      : []),
    { label: product.name, href: "#" },
  ];

  return (
    <>
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-10">
        <Breadcrumb items={breadcrumb} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <ProductGallery images={product.images} productName={product.name} />

          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <h1 className="font-heading text-3xl font-semibold flex-1">
                {product.name}
              </h1>
              {product.badge !== "NONE" && <Badge type={product.badge} />}
            </div>

            {avgRating !== null && (
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <span className="text-yellow-500">{"★".repeat(Math.round(avgRating))}</span>
                <span>
                  {avgRating.toFixed(1)} ({product.reviews.length} avis)
                </span>
              </div>
            )}

            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-semibold">
                {Number(product.price).toFixed(2)} EUR
              </span>
              {product.compareAtPrice && (
                <span className="text-text-muted line-through text-lg">
                  {Number(product.compareAtPrice).toFixed(2)} EUR
                </span>
              )}
            </div>

            {product.description && (
              <div
                className="prose prose-sm max-w-none text-text-muted"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml ?? product.description }}
              />
            )}

            <div className="text-sm font-medium">
              {totalStock === 0 ? (
                <span className="text-red-500">Rupture de stock</span>
              ) : totalStock <= 5 ? (
                <span className="text-orange-500">
                  Plus que {totalStock} disponible{totalStock > 1 ? "s" : ""}
                </span>
              ) : (
                <span className="text-green-600">En stock</span>
              )}
            </div>

            <VariantSelector
              productId={product.id}
              productName={product.name}
              productSlug={product.slug}
              price={Number(product.price)}
              variants={product.variants}
              totalStock={totalStock}
              image={product.images[0]?.url}
            />
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="font-heading text-xl font-semibold mb-6">
              Vous aimerez aussi
            </h2>
            <ProductGrid products={related} />
          </section>
        )}

        {product.reviews.length > 0 && (
          <section className="mt-20">
            <h2 className="font-heading text-xl font-semibold mb-6">
              Avis clients
            </h2>
            <div className="space-y-4">
              {product.reviews.map((r) => (
                <div key={r.id} className="border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{r.authorName}</span>
                    <div className="text-yellow-500 text-sm">
                      {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                    </div>
                  </div>
                  {r.comment && (
                    <p className="text-sm text-text-muted">{r.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
