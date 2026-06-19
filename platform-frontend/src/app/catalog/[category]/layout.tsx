import { Metadata } from "next";
import { headers } from "next/headers";

type Props = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;

  const categoryName = resolvedParams.category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: categoryName,
    description: `Browse our collection of ${categoryName}. Find the best products for you!`,
    openGraph: {
      title: `${categoryName} Collection`,
      description: `Browse our collection of ${categoryName}.`,
    },
  };
}

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
