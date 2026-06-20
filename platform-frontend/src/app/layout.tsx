import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { TenantProvider } from "@/components/TenantProvider";
import { AnnouncementBarWrapper } from "@/components/AnnouncementBarWrapper";
import { headers } from "next/headers";

const poppins = Poppins({
  weight: ["400", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const tenantSlug =
    headersList.get("x-tenant-slug") ||
    process.env.NEXT_PUBLIC_DEFAULT_TENANT ||
    "default";

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const res = await fetch(`${apiUrl}/store/config`, {
      headers: { "x-tenant-slug": tenantSlug },
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error("Failed to fetch");

    const config = await res.json();

    return {
      title: {
        default: config.name || "E-Commerce Store",
        template: `%s | ${config.name || "E-Commerce Store"}`,
      },
      description:
        config.theme?.heroSubtitle || "Your specialized online store",
      openGraph: {
        title: config.name || "E-Commerce Store",
        description:
          config.theme?.heroSubtitle || "Your specialized online store",
        siteName: config.name || "E-Commerce",
      },
    };
  } catch {
    return {
      title: "E-Commerce Store",
      description: "Your specialized online store",
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const tenantSlug =
    headersList.get("x-tenant-slug") ||
    process.env.NEXT_PUBLIC_DEFAULT_TENANT ||
    null;

  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: "var(--font-poppins), sans-serif" }}
      >
        <TenantProvider initialSlug={tenantSlug}>
          <AnnouncementBarWrapper />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </TenantProvider>
      </body>
    </html>
  );
}
