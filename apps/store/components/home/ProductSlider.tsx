import { ProductCard } from "@/components/product/ProductCard";

interface Product {
  id: string;
  slug: string;
  name: string;
  price: unknown;
  compareAtPrice?: unknown;
  badge?: string;
  totalStock: number;
  images: Array<{ url: string; alt?: string | null }>;
}

export function ProductSlider({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          slug={product.slug}
          name={product.name}
          price={Number(product.price)}
          compareAtPrice={product.compareAtPrice ? Number(product.compareAtPrice) : undefined}
          badge={product.badge ?? "NONE"}
          images={product.images}
          totalStock={product.totalStock}
        />
      ))}
    </div>
  );
}
