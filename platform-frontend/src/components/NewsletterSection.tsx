"use client";

import { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

interface NewsletterSectionProps {
  accentColor: string;
  primaryColor: string;
}

export function NewsletterSection({
  accentColor,
  primaryColor,
}: NewsletterSectionProps) {
  const { t, translations } = useTranslations();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitted(true);
      setEmail("");
    } catch (error) {
      console.error("Newsletter subscription error:", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="py-16 relative overflow-hidden"
      style={{ backgroundColor: primaryColor }}
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: accentColor }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: accentColor }} />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: `${accentColor}30` }}>
          <Mail className="h-8 w-8" style={{ color: accentColor }} />
        </div>

        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
          {t(translations?.newsletter?.title)}
        </h2>
        <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
          {t(translations?.newsletter?.subtitle)}
        </p>

        {submitted ? (
          <div className="flex items-center justify-center gap-3 text-white bg-white/10 backdrop-blur-sm rounded-full px-6 py-4 max-w-md mx-auto">
            <CheckCircle className="h-6 w-6 flex-shrink-0" style={{ color: accentColor }} />
            <span className="font-semibold">{t(translations?.newsletter?.success)}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t(translations?.newsletter?.placeholder)}
              required
              className="flex-1 px-5 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-full font-bold text-white transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: accentColor }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                t(translations?.newsletter?.button)
              )}
            </button>
          </form>
        )}

        <p className="text-white/50 text-xs mt-4">
          No spam, unsubscribe at any time. Read our privacy policy.
        </p>
      </div>
    </section>
  );
}
