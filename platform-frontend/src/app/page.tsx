import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { headers } from "next/headers";
import { ProductCard } from "@/components/ProductCard";

interface Product {
  _id: string;
  model: string;
  brand: string;
  price: number;
  discount: number;
  images: string[];
  sizes: { size: string; stock: number }[];
  stock: number;
  isFeatured: boolean;
}

async function getTenantSlug() {
  const headersList = await headers();
  return (
    headersList.get("x-tenant-slug") ||
    process.env.NEXT_PUBLIC_DEFAULT_TENANT ||
    null
  );
}

async function fetchConfig(slug: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const res = await fetch(`${apiUrl}/api/store/config/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    return null;
  }
}

async function fetchProducts(slug: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const res = await fetch(`${apiUrl}/api/products?isFeatured=true&limit=8`, {
      headers: { "x-tenant-slug": slug },
      next: { revalidate: 60 },
    });
    if (!res.ok) return { results: [] };
    return res.json();
  } catch (e) {
    return { results: [] };
  }
}

async function fetchReviews(slug: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const res = await fetch(`${apiUrl}/api/reviews?limit=3`, {
      headers: { "x-tenant-slug": slug },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch (e) {
    return [];
  }
}

export default async function Home() {
  const slug = await getTenantSlug();
  if (!slug) return null;

  const config = await fetchConfig(slug);
  if (!config) return null;

  const data = await fetchProducts(slug);
  const products: Product[] = data?.results || [];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden bg-gray-900">
        {config.theme.heroImageUrl && (
          <Image
            src={config.theme.heroImageUrl}
            alt="Hero"
            fill
            className="absolute inset-0 object-cover opacity-40"
            unoptimized
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
            {config.theme.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-6">
            {config.theme.heroSubtitle}
          </p>
          <Link
            href="/catalog"
            className="inline-block px-8 py-3 rounded-full font-semibold text-white transition-transform hover:scale-105"
            style={{ backgroundColor: config.theme.accentColor }}
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2
            className="text-2xl font-extrabold tracking-wide"
            style={{ color: config.theme.primaryColor }}
          >
            Featured Products
          </h2>
          <Link
            href="/catalog"
            className="text-sm font-semibold hover:underline"
            style={{ color: config.theme.accentColor }}
          >
            View All &rarr;
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 font-medium">
              No featured products yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              return (
                <ProductCard
                  key={product._id}
                  product={product}
                  accentColor={config.theme.accentColor}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Reviews Section */}
      {config?.settings.features.reviews && (
        <ReviewsSection slug={slug} accentColor={config.theme.accentColor} />
      )}
    </div>
  );
}

async function ReviewsSection({
  slug,
  accentColor,
}: {
  slug: string;
  accentColor: string;
}) {
  const reviews = await fetchReviews(slug);

  if (!reviews || reviews.length === 0) return null;

  return (
    <section className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2
            className="text-2xl font-extrabold"
            style={{ color: accentColor }}
          >
            What Our Customers Say
          </h2>
          <p className="text-gray-400 mt-2">Real reviews from our community</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review: any) => (
            <div
              key={review._id}
              className="group bg-gray-800 rounded-2xl p-7 border border-gray-700 transition-colors duration-300 relative overflow-hidden"
              style={{ "--hover-border": accentColor } as React.CSSProperties}
            >
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                .group:hover { border-color: var(--hover-border); }
              `,
                }}
              />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500"
                style={{ backgroundColor: accentColor }}
              />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-5">
                  <div
                    className="h-14 w-14 rounded-full border-2 overflow-hidden relative shadow-lg"
                    style={{ borderColor: accentColor }}
                  >
                    <Image
                      src={review.image}
                      alt={review.clientName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-gray-100">
                      {review.clientName}
                    </h4>
                    <p
                      className="text-xs font-bold uppercase tracking-widest mt-1"
                      style={{ color: accentColor }}
                    >
                      {review.clientRole}
                    </p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm italic leading-relaxed">
                  &ldquo;{review.message}&rdquo;
                </p>
                <div className="flex gap-1 mt-5 text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-current drop-shadow"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
