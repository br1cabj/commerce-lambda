"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { Globe } from "lucide-react";

export function LanguageSelector() {
  const { currentLanguage, setLanguage, supportedLanguages } =
    useTranslations();

  if (supportedLanguages.length <= 1) return null;

  return (
    <div className="flex items-center gap-1">
      <Globe className="h-4 w-4 text-gray-500" />
      <select
        value={currentLanguage}
        onChange={(e) => setLanguage(e.target.value as "en" | "es")}
        className="text-sm bg-transparent border-none text-gray-700 font-medium cursor-pointer focus:outline-none"
      >
        {supportedLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {lang === "en" ? "EN" : "ES"}
          </option>
        ))}
      </select>
    </div>
  );
}
