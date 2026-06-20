import { headers } from "next/headers";
import { HomeClient } from "@/components/HomeClient";
import { HomeStructuredData } from "@/components/HomeStructuredData";

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
  isNew?: boolean;
  isBestSeller?: boolean;
  createdAt?: string;
  salesCount?: number;
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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const res = await fetch(`${apiUrl}/store/config/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function fetchProducts(slug: string, params: string = "isFeatured=true&limit=8") {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const res = await fetch(`${apiUrl}/products?${params}`, {
      headers: { "x-tenant-slug": slug },
      next: { revalidate: 60 },
    });
    if (!res.ok) return { results: [] };
    return res.json();
  } catch {
    return { results: [] };
  }
}

async function fetchReviews(slug: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const res = await fetch(`${apiUrl}/reviews?limit=3`, {
      headers: { "x-tenant-slug": slug },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const slug = await getTenantSlug();
  if (!slug) return null;

  const config = await fetchConfig(slug);
  if (!config) return null;

  const [featuredData, newData, bestSellersData, offersData, reviews] = await Promise.all([
    fetchProducts(slug, "isFeatured=true&limit=8"),
    fetchProducts(slug, "sort=createdAt&order=desc&limit=8"),
    fetchProducts(slug, "sort=salesCount&order=desc&limit=8"),
    fetchProducts(slug, "minDiscount=20&limit=8"),
    fetchReviews(slug),
  ]);

  const featuredProducts: Product[] = featuredData?.results || [];
  const newProducts: Product[] = newData?.results || [];
  const bestSellers: Product[] = bestSellersData?.results || [];
  const offerProducts: Product[] = offersData?.results || [];

  return (
    <>
      <HomeStructuredData config={config} products={featuredProducts} />
      <HomeClient
        config={config}
        featuredProducts={featuredProducts}
        newProducts={newProducts}
        bestSellers={bestSellers}
        offerProducts={offerProducts}
        reviews={reviews}
      />
    </>
  );
}
