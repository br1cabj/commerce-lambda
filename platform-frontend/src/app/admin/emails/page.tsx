"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useTenant } from "@/hooks/useTenant";
import { Save, Mail, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { useTranslations } from "@/hooks/useTranslations";

interface EmailTemplate {
  trigger: string;
  subject: string;
  bodyHtml: string;
  isActive: boolean;
}

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  { trigger: "ORDER_CONFIRMED", subject: "Order Confirmation", bodyHtml: "<h1>Thank you for your order!</h1>", isActive: true },
  { trigger: "ORDER_SHIPPED", subject: "Your order has shipped", bodyHtml: "<h1>Good news! Your order is on the way.</h1>", isActive: true },
  { trigger: "WELCOME_USER", subject: "Welcome to our store", bodyHtml: "<h1>Welcome!</h1><p>We are glad to have you.</p>", isActive: true }
];

export default function EmailsAdminPage() {
  const { config } = useTenant();
  const { isAuthenticated, isAdmin, isHydrated: isAuthHydrated } = useAuth();
  const { adminT, isHydrated: isLangHydrated } = useTranslations();
  const router = useRouter();

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!isAuthHydrated) return;
    if (!isAuthenticated || !isAdmin) {
      router.push("/");
    }
  }, [isAuthenticated, isAdmin, isAuthHydrated, router]);

  useEffect(() => {
    if (!config?.slug) return;
    let ignore = false;

    async function load() {
      try {
        const data = await api.get("/emails", config?.slug);
        if (ignore) return;

        const dataArray = Array.isArray(data) ? data : [];
        const merged = DEFAULT_TEMPLATES.map(def => {
          const found = dataArray.find(t => t.trigger === def.trigger);
          return found || def;
        });

        setTemplates(merged);
      } catch (err) {
        console.error("Error loading email templates:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => { ignore = true; };
  }, [config?.slug]);

  const handleSave = async (template: EmailTemplate) => {
    setSaving(true);
    setMessage(null);
    try {
      await api.put("/emails", template, config?.slug);
      setMessage({ type: "success", text: adminT("saved") });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to save template";
      setMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  const isReady = isAuthHydrated && isLangHydrated && isAuthenticated && isAdmin && config;

  if (!isReady || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AdminNav />
        <div className="p-8 text-center text-gray-500 font-semibold animate-pulse">
          {adminT("loadingEmails")}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <AdminNav />

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <Mail className="h-6 w-6 text-orange-500" /> {adminT("transactionalEmails")}
            </h1>
            <p className="text-gray-500 text-sm mt-1">{adminT("emailsDesc")}</p>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-xl flex items-center gap-2 border ${
            message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
          } font-semibold text-sm`}>
            {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            {message.text}
          </div>
        )}

        <div className="grid gap-6">
          {templates.map((template, idx) => (
            <div key={template.trigger} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-gray-800 text-sm uppercase tracking-wider">{template.trigger.replace(/_/g, ' ')}</h3>
                  <p className="text-xs text-gray-400 font-medium">Sent automatically on this event.</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{adminT("active")}</span>
                  <input
                    type="checkbox"
                    checked={template.isActive}
                    onChange={(e) => {
                      const newTemplates = [...templates];
                      newTemplates[idx].isActive = e.target.checked;
                      setTemplates(newTemplates);
                    }}
                    className="rounded border-gray-200 text-orange-500 focus:ring-orange-500 h-5 w-5"
                  />
                </label>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">{adminT("subjectLine")}</label>
                  <input
                    type="text"
                    value={template.subject}
                    onChange={(e) => {
                      const newTemplates = [...templates];
                      newTemplates[idx].subject = e.target.value;
                      setTemplates(newTemplates);
                    }}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all font-semibold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">{adminT("htmlBody")}</label>
                  <textarea
                    value={template.bodyHtml}
                    onChange={(e) => {
                      const newTemplates = [...templates];
                      newTemplates[idx].bodyHtml = e.target.value;
                      setTemplates(newTemplates);
                    }}
                    rows={5}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all font-mono text-sm"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleSave(template)}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 text-sm font-bold shadow-sm transition-transform hover:scale-[1.02]"
                  >
                    <Save className="h-4 w-4" /> {saving ? adminT("saving") : adminT("saveTemplate")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
