import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catalog",
  description: "Browse our complete catalog of products.",
};

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
