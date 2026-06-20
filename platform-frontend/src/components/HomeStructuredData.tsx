interface Product {
  _id: string;
  model: string;
  brand: string;
  price: number;
  discount: number;
  images: string[];
  stock: number;
}

interface Config {
  name: string;
  slug: string;
  theme: {
    logoUrl: string;
    primaryColor: string;
    accentColor: string;
  };
  settings: {
    email: string;
    phone: string;
    address: string;
  };
}

export function HomeStructuredData({
  config,
  products,
}: {
  config: Config;
  products: Product[];
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: config.name,
    url: `${baseUrl}/${config.slug}`,
    logo: config.theme.logoUrl || `${baseUrl}/logo.png`,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: config.settings.phone || "",
      contactType: "customer service",
      email: config.settings.email || "",
    },
    address: config.settings.address
      ? {
          "@type": "PostalAddress",
          streetAddress: config.settings.address,
        }
      : undefined,
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: config.name,
    url: `${baseUrl}/${config.slug}`,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/${config.slug}/catalog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const productSchemas = products.slice(0, 8).map((product) => {
    const finalPrice =
      product.discount > 0
        ? product.price - product.price * (product.discount / 100)
        : product.price;

    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: `${product.brand} ${product.model}`,
      image: product.images?.[0] || "",
      description: `${product.brand} ${product.model}`,
      brand: {
        "@type": "Brand",
        name: product.brand,
      },
      offers: {
        "@type": "Offer",
        url: `${baseUrl}/${config.slug}/product/${product._id}`,
        priceCurrency: "USD",
        price: finalPrice,
        availability:
          product.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
      },
    };
  });

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${baseUrl}/${config.slug}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Catalog",
        item: `${baseUrl}/${config.slug}/catalog`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      {productSchemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />
      ))}
    </>
  );
}
