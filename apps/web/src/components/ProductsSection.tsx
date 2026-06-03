import { listProducts } from "@/lib/api";
import ProductCard from "./ProductCard";
import { ProductsSectionHeader } from "./ProductsSectionHeader";

export default async function ProductsSection() {
  const products = await listProducts();
  if (products.length === 0) return null;

  return (
    <section id="products" className="py-10 md:py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-6 md:mb-10">
          <ProductsSectionHeader />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
