import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { getApiUrl } from '@/lib/serverApi';

interface SitemapProduct {
  _id: string;
  updatedAt?: string;
}

interface SitemapCategory {
  slug: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers();
  const tenantSlug =
    headersList.get("x-tenant-slug") ||
    process.env.NEXT_PUBLIC_DEFAULT_TENANT ||
    "default";

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const apiUrl = getApiUrl();

    const res = await fetch(`${apiUrl}/products?limit=1000`, {
      headers: { "x-tenant-slug": tenantSlug },
      next: { revalidate: 3600 },
    });

    const catRes = await fetch(`${apiUrl}/categories`, {
      headers: { "x-tenant-slug": tenantSlug },
      next: { revalidate: 3600 },
    });

    const sitemapData: MetadataRoute.Sitemap = [
      {
        url: `${baseUrl}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/catalog`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/faq`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.5,
      }
    ];

    if (res.ok) {
      const { products } = await res.json();
      products?.forEach((product: SitemapProduct) => {
        sitemapData.push({
          url: `${baseUrl}/product/${product._id}`,
          lastModified: new Date(product.updatedAt || new Date()),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      });
    }

    if (catRes.ok) {
      const categories = await catRes.json();
      categories?.forEach((category: SitemapCategory) => {
        sitemapData.push({
          url: `${baseUrl}/catalog/${category.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      });
    }

    return sitemapData;
  } catch {
    return [
      {
        url: `${baseUrl}`,
        lastModified: new Date(),
      }
    ];
  }
}
