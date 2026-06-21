"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { config } = useTenant();
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password, config?.slug || "");
      toast.success(`Welcome back to ${config?.name}!`);
      const redirectUrl = localStorage.getItem("redirectAfterLogin") || "/";
      localStorage.removeItem("redirectAfterLogin");
      const safePath = redirectUrl.startsWith("/") ? redirectUrl : "/";
      router.push(safePath);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (!config) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700 px-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full">
        <div
          className="p-8 text-center text-white"
          style={{ backgroundColor: config.theme.primaryColor }}
        >
          {config.theme.logoUrl && (
            <Image
              src={config.theme.logoUrl}
              alt={config.name}
              width={64}
              height={64}
              className="rounded-full mx-auto mb-3 object-cover"

            />
          )}
          <h2 className="text-2xl font-bold">{config.name}</h2>
          <p className="text-gray-300 text-sm mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-500 uppercase mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent"
              style={
                {
                  "--tw-ring-color": config.theme.accentColor,
                } as React.CSSProperties
              }
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-500 uppercase mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent"
              style={
                {
                  "--tw-ring-color": config.theme.accentColor,
                } as React.CSSProperties
              }
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-white transition-transform hover:scale-105 disabled:opacity-50"
            style={{ backgroundColor: config.theme.accentColor }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold hover:underline"
              style={{ color: config.theme.primaryColor }}
            >
              Register here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
