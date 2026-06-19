import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { TenantProvider } from "@/components/TenantProvider";

const poppins = Poppins({
  weight: ["400", "600", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "E-Commerce Platform",
  description: "Generic e-commerce platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" style={{ fontFamily: "var(--font-poppins), sans-serif" }}>
        <TenantProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </TenantProvider>
      </body>
    </html>
  );
}
