"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductImage {
  id: string;
  url: string;
  alt?: string | null;
}

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-surface-alt w-full" />
    );
  }

  const active = images[activeIndex] ?? images[0];

  return (
    <div className="space-y-3">
      {/* Image principale */}
      <div className="relative aspect-square bg-surface-alt overflow-hidden">
        {active && (
          <Image
            src={active.url}
            alt={active.alt ?? productName}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        )}
      </div>

      {/* Miniatures */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={`relative shrink-0 w-16 h-16 border-2 transition-colors ${i === activeIndex ? "border-primary" : "border-transparent hover:border-border"}`}
            >
              <Image
                src={img.url}
                alt={img.alt ?? `${productName} ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
