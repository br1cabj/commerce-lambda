"use client";

import { useEffect, useState, useCallback } from "react";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Palette, Check, Eye } from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";

interface Template {
  id: string;
  name: string;
  description: string;
}

interface TemplateDetail extends Template {
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    heroTitle: { en: string; es: string };
    heroSubtitle: { en: string; es: string };
  };
  heroSlides: Array<{
    title: { en: string; es: string };
    subtitle: { en: string; es: string };
    ctaPrimary: { en: string; es: string };
    ctaSecondary: { en: string; es: string };
  }>;
  categories: string[];
}

export default function AdminTemplatesPage() {
  const { config, fetchConfig } = useTenant();
  const { isAuthenticated, isAdmin , isHydrated} = useAuth();
  const router = useRouter();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState("");

  const loadTemplates = useCallback(async () => {
    if (!config) return [];
    try {
      const data = (await api.get("/templates", config.slug)) as Template[];
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading templates");
      return [];
    }
  }, [config]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || !isAdmin) {
      router.push("/");
      return;
    }
    let ignore = false;
    (async () => {
      const result = await loadTemplates();
      if (!ignore) {
        setTemplates(result);
        setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [isAuthenticated, isAdmin, router, loadTemplates, isHydrated]);

  const loadTemplateDetail = async (templateId: string) => {
    if (!config) return;
    try {
      const data = (await api.get(`/templates/${templateId}`, config.slug)) as TemplateDetail;
      setSelectedTemplate(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading template details");
    }
  };

  const applyTemplate = async (templateId: string) => {
    if (!config) return;
    
    if (!confirm("This will overwrite your current theme and translations. Continue?")) {
      return;
    }

    setApplying(true);
    setError("");
    try {
      await api.post("/templates/apply", { templateId }, config.slug);
      await fetchConfig(config.slug);
      setApplied(true);
      setTimeout(() => setApplied(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error applying template");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <AdminNav />

      <div className="mb-6">
        <h2 className="text-2xl font-bold">Templates</h2>
        <p className="text-gray-500 text-sm mt-1">
          Choose a pre-designed template for your industry
        </p>
      </div>

      {applied && (
        <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg mb-6 font-semibold flex items-center gap-2">
          <Check className="h-4 w-4" />
          Template applied successfully!
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold">{template.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{template.description}</p>
              </div>
              <Palette className="h-6 w-6 text-gray-400" />
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => loadTemplateDetail(template.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                <Eye className="h-4 w-4" />
                Preview
              </button>
              <button
                onClick={() => applyTemplate(template.id)}
                disabled={applying}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-colors"
                style={{ backgroundColor: config?.theme.accentColor }}
              >
                {applying ? "Applying..." : "Apply"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold">{selectedTemplate.name}</h3>
                  <p className="text-gray-500 mt-1">{selectedTemplate.description}</p>
                </div>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-bold mb-3">Color Scheme</h4>
                  <div className="flex gap-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-12 h-12 rounded-lg border-2 border-gray-200"
                        style={{ backgroundColor: selectedTemplate.theme.primaryColor }}
                      ></div>
                      <span className="text-sm text-gray-600">Primary</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-12 h-12 rounded-lg border-2 border-gray-200"
                        style={{ backgroundColor: selectedTemplate.theme.secondaryColor }}
                      ></div>
                      <span className="text-sm text-gray-600">Secondary</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-12 h-12 rounded-lg border-2 border-gray-200"
                        style={{ backgroundColor: selectedTemplate.theme.accentColor }}
                      ></div>
                      <span className="text-sm text-gray-600">Accent</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold mb-3">Hero Slides</h4>
                  <div className="space-y-3">
                    {selectedTemplate.heroSlides.map((slide, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <p className="font-semibold text-lg">{slide.title.en}</p>
                        <p className="text-sm text-gray-600 mt-1">{slide.subtitle.en}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                            {slide.ctaPrimary.en}
                          </span>
                          <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                            {slide.ctaSecondary.en}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold mb-3">Suggested Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.categories.map((category, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 px-3 py-1 rounded-full text-sm"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      applyTemplate(selectedTemplate.id);
                      setSelectedTemplate(null);
                    }}
                    disabled={applying}
                    className="flex-1 px-4 py-2 rounded-lg font-semibold text-white disabled:opacity-50 transition-colors"
                    style={{ backgroundColor: config?.theme.accentColor }}
                  >
                    {applying ? "Applying..." : "Apply Template"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
