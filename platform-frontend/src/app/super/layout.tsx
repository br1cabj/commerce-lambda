"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Store, LogOut, ShieldAlert } from "lucide-react";

const superLinks = [
  {
    href: "/super",
    label: "Overview",
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    href: "/super/tenants",
    label: "Tenants Management",
    icon: <Store className="h-4 w-4" />,
  },
];

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user, logout, isHydrated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user?.role !== "super_admin") {
      router.push("/");
    }
  }, [isAuthenticated, user, router, isHydrated]);

  if (!isAuthenticated || user?.role !== "super_admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
        <div className="animate-pulse flex flex-col items-center">
          <ShieldAlert className="h-12 w-12 text-purple-500 mb-4" />
          <p className="text-slate-400 text-lg tracking-widest font-light">
            AUTHENTICATING
          </p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500/30">
      <style>{`
        #global-navbar, #global-footer, #global-announcement {
          display: none !important;
        }
      `}</style>
      {/* Dynamic Header */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-slate-950/80 backdrop-blur-md border-b border-white/5 py-3 shadow-lg"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <ShieldAlert className="h-5 w-5 text-white" />
              </div>
              <h1 className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Platform Admin
              </h1>
            </div>
            <div className="h-6 w-px bg-white/10 hidden md:block"></div>
            <nav className="hidden md:flex gap-1">
              {superLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.icon} {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></span>
              <span className="text-xs font-medium text-slate-300">
                {user.email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-28 pb-12 px-6 max-w-7xl mx-auto relative z-10">
        {/* Mobile Navigation (shows only on small screens) */}
        <div className="md:hidden flex gap-2 overflow-x-auto pb-4 mb-6 hide-scrollbar">
          {superLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25"
                    : "bg-white/5 text-slate-400 border border-white/5"
                }`}
              >
                {link.icon} {link.label}
              </Link>
            );
          })}
        </div>

        {/* Ambient background glows */}
        <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px] pointer-events-none"></div>
        <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none"></div>

        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
}
