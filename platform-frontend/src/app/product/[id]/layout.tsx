import { Metadata } from "next";
import { headers } from "next/headers";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const headersList = await headers();
  const tenantSlug =
    headersList.get("x-tenant-slug") ||
    process.env.NEXT_PUBLIC_DEFAULT_TENANT ||
    "default";

  try {
    const apiUrl =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3001/api";
    const res = await fetch(`${apiUrl}/products/${resolvedParams.id}`, {
      headers: { "x-tenant-slug": tenantSlug },
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error("Failed to fetch product");

    const product = await res.json();

    return {
      title: `${product.model} - ${product.brand}`,
      description: `Buy ${product.model} by ${product.brand}. Price: $${product.price}. Shop now!`,
      openGraph: {
        title: `${product.model} - ${product.brand}`,
        description: `Buy ${product.model} by ${product.brand}. Shop now!`,
        images: product.images?.length ? [{ url: product.images[0] }] : [],
      },
    };
  } catch {
    return {
      title: "Product Details",
    };
  }
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
