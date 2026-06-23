"use client";
 
import { useEffect, useState, useCallback } from "react";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Plus, Trash, ToggleLeft, ToggleRight, Edit } from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";
import Image from "next/image";
import { useTranslations } from "@/hooks/useTranslations";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  icon: string;
  backgroundColor: string;
  displayStyle: "image" | "icon" | "gradient";
  showOnHome: boolean;
  isActive: boolean;
  order: number;
}

export default function AdminCategoriesPage() {
  const { config } = useTenant();
  const { isAuthenticated, isAdmin, isHydrated } = useAuth();
  const { adminT } = useTranslations();
  const router = useRouter();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("");
  const [displayStyle, setDisplayStyle] = useState<"image" | "icon" | "gradient">("image");
  const [showOnHome, setShowOnHome] = useState(true);
  const [order, setOrder] = useState("0");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const loadCategories = useCallback(async () => {
    if (!config) return [];
    try {
      const data = (await api.get("/categories?limit=100", config.slug)) as {
        results: Category[];
      };
      return data?.results || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading categories");
      console.error("Error loading categories:", err);
      return [];
    }
  }, [config]);

  const refreshCategories = useCallback(async () => {
    const result = await loadCategories();
    setCategories(result);
  }, [loadCategories]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || !isAdmin) {
      router.push("/");
      return;
    }
    let ignore = false;
    (async () => {
      const result = await loadCategories();
      if (!ignore) {
        setCategories(result);
        setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [isAuthenticated, isAdmin, router, loadCategories, isHydrated]);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setIcon("");
    setBackgroundColor("");
    setDisplayStyle("image");
    setShowOnHome(true);
    setOrder("0");
    setImageUrl("");
    setImageFile(null);
    setShowForm(false);
    setError("");
  };

  const editCategory = (cat: Category) => {
    setEditingId(cat._id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setIcon(cat.icon || "");
    setBackgroundColor(cat.backgroundColor || "");
    setDisplayStyle(cat.displayStyle || "image");
    setShowOnHome(cat.showOnHome);
    setOrder(String(cat.order || 0));
    setImageUrl(cat.imageUrl || "");
    setImageFile(null);
    setShowForm(true);
    setError("");
  };

  const saveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!config) return;
    
    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug);
    formData.append("description", description);
    formData.append("icon", icon);
    formData.append("backgroundColor", backgroundColor);
    formData.append("displayStyle", displayStyle);
    formData.append("showOnHome", String(showOnHome));
    formData.append("order", order);
    formData.append("imageUrl", imageUrl);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, formData, config.slug);
      } else {
        await api.post("/categories", formData, config.slug);
      }
      resetForm();
      refreshCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving category");
    }
  };

  const toggleCategory = async (id: string) => {
    if (!config) return;
    try {
      await api.put(`/categories/${id}/toggle`, {}, config.slug);
      refreshCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error toggling category");
    }
  };

  const deleteCategory = async (id: string) => {
    if (!config || !confirm(adminT("confirmDeleteCategory"))) return;
    try {
      await api.delete(`/categories/${id}`, config.slug);
      refreshCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting category");
    }
  };

  if (!isHydrated || loading) {
    return <div className="p-8 text-center">{adminT("loading")}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <AdminNav />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">{adminT("categoriesManagement")}</h2>
          <p className="text-gray-500 text-sm">{adminT("manageDynamicCategories")}</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 text-sm font-semibold"
        >
          <Plus className="h-4 w-4" /> {adminT("addCategory")}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded mb-6">{error}</div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
          <h3 className="text-xl font-bold mb-4">{editingId ? adminT("editCategory") : adminT("newCategory")}</h3>
          <form onSubmit={saveCategory} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{adminT("name")} *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingId) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
                    }
                  }}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="e.g. Laptops Gamer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{adminT("slug")} *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="e.g. laptops-gamer"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{adminT("description")}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{adminT("displayStyle")}</label>
                <select
                  value={displayStyle}
                  onChange={(e) => setDisplayStyle(e.target.value as "image" | "icon" | "gradient")}
                  className="w-full px-3 py-2 border rounded bg-white text-sm"
                >
                  <option value="image">{adminT("imageBackground")}</option>
                  <option value="icon">{adminT("iconEmoji")}</option>
                  <option value="gradient">{adminT("gradientBackground")}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">{adminT("backgroundColorHex")}</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={backgroundColor || "#f3f4f6"}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="h-10 w-10 p-1 border rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded uppercase text-sm"
                    placeholder="#F3F4F6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Icon/Emoji</label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder="e.g. 💻"
                />
              </div>
            </div>

            {displayStyle === "image" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium mb-1">{adminT("uploadBgImage")}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border rounded bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{adminT("orPasteImageUrl")}</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 border rounded text-sm"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                {(imageUrl || imageFile) && (
                  <div className="md:col-span-2 mt-2">
                    <p className="text-xs text-gray-500 font-semibold mb-1">Image Preview:</p>
                    <div className="relative w-28 h-20 border rounded-xl overflow-hidden bg-gray-50">
                      <Image
                        src={imageFile ? URL.createObjectURL(imageFile) : imageUrl}
                        alt="Category Background"
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{adminT("orderSorting")}</label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                  min="0"
                />
              </div>
              
              <div className="flex items-center mt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOnHome}
                    onChange={(e) => setShowOnHome(e.target.checked)}
                    className="w-5 h-5 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                  />
                  <span className="text-sm font-medium text-gray-900">{adminT("showOnHome")}</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border rounded hover:bg-gray-50 text-sm font-semibold"
              >
                {adminT("cancel")}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 text-sm font-semibold"
              >
                {editingId ? adminT("updateCategory") : adminT("saveCategory")}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">{adminT("categories")}</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">{adminT("displayStyle")}</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">{adminT("homeBuilder")}</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <tr key={cat._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{cat.name}</div>
                  <div className="text-sm text-gray-500">/{cat.slug}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {cat.displayStyle}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {cat.showOnHome ? (
                    <span className="text-green-600 text-sm font-medium">Yes</span>
                  ) : (
                    <span className="text-gray-400 text-sm font-medium">No</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleCategory(cat._id)}
                    className={`flex items-center gap-1 text-sm font-medium ${
                      cat.isActive ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {cat.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                    {cat.isActive ? adminT("active") : adminT("inactive")}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => editCategory(cat)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteCategory(cat._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No categories found. Create your first category above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
