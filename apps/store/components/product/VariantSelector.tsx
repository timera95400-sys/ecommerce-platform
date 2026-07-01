"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";

interface VariantOption {
  id: string;
  label: string;
  stock: number;
}

interface Variant {
  id: string;
  name: string;
  options: VariantOption[];
}

interface VariantSelectorProps {
  productId: string;
  productName: string;
  productSlug: string;
  price: number;
  variants: Variant[];
  totalStock: number;
  image?: string;
}

export function VariantSelector({
  productId,
  productName,
  productSlug,
  price,
  variants,
  totalStock,
  image,
}: VariantSelectorProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const hasVariants = variants.length > 0;

  function getSelectedOption(variantId: string): VariantOption | undefined {
    const optionId = selectedOptions[variantId];
    const variant = variants.find((v) => v.id === variantId);
    return variant?.options.find((o) => o.id === optionId);
  }

  const allSelected = hasVariants
    ? variants.every((v) => selectedOptions[v.id])
    : true;

  const currentStock = hasVariants
    ? (() => {
        if (!allSelected) return 0;
        const opt = variants.map((v) => getSelectedOption(v.id));
        return opt[0]?.stock ?? 0;
      })()
    : totalStock;

  const variantLabel = hasVariants
    ? variants
        .map((v) => getSelectedOption(v.id)?.label)
        .filter(Boolean)
        .join(" / ")
    : undefined;

  const selectedOptionId = hasVariants
    ? variants.length === 1
      ? selectedOptions[variants[0]?.id ?? ""]
      : undefined
    : undefined;

  function handleAddToCart() {
    if (currentStock === 0) return;
    addItem({
      productId,
      variantOptionId: selectedOptionId,
      name: productName,
      variantLabel,
      slug: productSlug,
      unitPrice: price,
      image,
      maxStock: currentStock,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="space-y-5">
      {variants.map((variant) => (
        <div key={variant.id}>
          <p className="text-sm font-medium mb-2">{variant.name}</p>
          <div className="flex flex-wrap gap-2">
            {variant.options.map((option) => (
              <button
                key={option.id}
                onClick={() =>
                  setSelectedOptions((prev) => ({
                    ...prev,
                    [variant.id]: option.id,
                  }))
                }
                disabled={option.stock === 0}
                className={`px-3 py-1.5 text-sm border transition-colors ${
                  selectedOptions[variant.id] === option.id
                    ? "border-primary bg-primary text-white"
                    : option.stock === 0
                    ? "border-border text-text-muted line-through cursor-not-allowed opacity-50"
                    : "border-border hover:border-primary"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Quantite */}
      <div>
        <p className="text-sm font-medium mb-2">Quantite</p>
        <div className="flex items-center border border-border w-fit">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-10 h-10 flex items-center justify-center hover:bg-surface-alt transition-colors text-lg"
          >
            -
          </button>
          <span className="w-12 h-10 flex items-center justify-center text-sm font-medium">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
            disabled={quantity >= currentStock}
            className="w-10 h-10 flex items-center justify-center hover:bg-surface-alt transition-colors text-lg disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={currentStock === 0 || (hasVariants && !allSelected)}
        className="w-full bg-primary text-white py-4 text-sm font-semibold uppercase tracking-widest hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {currentStock === 0
          ? "Rupture de stock"
          : added
          ? "Ajoute !"
          : hasVariants && !allSelected
          ? "Selectionner les options"
          : "Ajouter au panier"}
      </button>
    </div>
  );
}
