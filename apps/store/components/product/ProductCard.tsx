"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { Badge } from "@/components/ui/Badge";

interface ProductImage {
  url: string;
  alt?: string | null;
}

interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  badge?: string;
  images: ProductImage[];
  totalStock: number;
}

export function ProductCard({
  id,
  slug,
  name,
  price,
  compareAtPrice,
  badge = "NONE",
  images,
  totalStock,
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const primaryImage = images[0];
  const hoverImage = images[1] ?? images[0];
  const outOfStock = totalStock === 0;

  const displayImage =
    hovered && hoverImage ? hoverImage : primaryImage ?? null;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (outOfStock) return;
    addItem({
      productId: id,
      name,
      slug,
      unitPrice: price,
      image: primaryImage?.url,
      maxStock: totalStock,
    });
  }

  return (
    <Link
      href={`/produit/${slug}`}
      className="group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-square bg-surface-alt overflow-hidden mb-3">
        {displayImage ? (
          <Image
            src={displayImage.url}
            alt={displayImage.alt ?? name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-surface-alt" />
        )}

        {badge !== "NONE" && (
          <div className="absolute top-2 left-2">
            <Badge type={badge} />
          </div>
        )}

        {outOfStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">
              Rupture de stock
            </span>
          </div>
        )}

        {!outOfStock && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-0 left-0 right-0 bg-primary text-white text-xs font-semibold py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
          >
            Ajouter au panier
          </button>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
          {name}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{price.toFixed(2)} EUR</span>
          {compareAtPrice && compareAtPrice > price && (
            <span className="text-xs text-text-muted line-through">
              {compareAtPrice.toFixed(2)} EUR
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
