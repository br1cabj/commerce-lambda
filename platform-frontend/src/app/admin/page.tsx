"use client";

import { useEffect, useState, useCallback } from "react";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Plus, Edit, Trash, Star } from "lucide-react";
import Image from "next/image";
import { AdminNav } from "@/components/admin/AdminNav";

interface Product {
  _id: string;
  model: string;
  brand: string;
  category: string;
  price: number;
  discount: number;
  stock: number;
  images: string[];
  isFeatured: boolean;
  sizes: { size: string; stock: number; price?: number; sku?: string; imageUrl?: string }[];
  description?: string;
  sku?: string;
  packageData?: {
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
  };
  status?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export default function AdminPage() {
  const { config } = useTenant();
  const { isAuthenticated, isAdmin, isHydrated } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("0");
  const [packageWeight, setPackageWeight] = useState("0");
  const [packageLength, setPackageLength] = useState("0");
  const [packageWidth, setPackageWidth] = useState("0");
  const [packageHeight, setPackageHeight] = useState("0");
  const [sizes, setSizes] = useState<{ size: string; stock: string; price?: string; sku?: string; imageUrl?: string }[]>([
    { size: "", stock: "", price: "", sku: "", imageUrl: "" },
  ]);
  const [images, setImages] = useState<FileList | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [status, setStatus] = useState("published");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [categoriesList, setCategoriesList] = useState<{name: string, slug: string}[]>([]);
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    if (!config) return [];
    try {
      const data = (await api.get("/products?limit=50&status=all", config.slug)) as {
        results: Product[];
      };
      return data.results || [];
    } catch (err) {
      console.error("Error loading products:", err);
      return [];
    }
  }, [config]);

  const loadCategories = useCallback(async () => {
    if (!config) return [];
    try {
      const data = (await api.get("/categories?limit=100", config.slug)) as {
        results: { name: string; slug: string }[];
      };
      return data.results || [];
    } catch (err) {
      console.error("Error loading categories:", err);
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
    Promise.all([loadProducts(), loadCategories()]).then(([prods, cats]) => {
      if (!ignore) {
        setProducts(prods);
        setCategoriesList(cats);
        if (cats.length > 0) {
          setCategory((current) => current || cats[0].slug);
        }
      }
    });
    return () => {
      ignore = true;
    };
  }, [isAuthenticated, isAdmin, router, loadProducts, loadCategories, isHydrated]);

  const handleEdit = (product: Product) => {
    setError("");
    setEditingProduct(product);
    setName(product.model);
    setBrand(product.brand);
    setCategory(product.category || "");
    setDescription(product.description || "");
    setSku(product.sku || "");
    setPrice(product.price.toString());
    setDiscount(product.discount.toString());
    setPackageWeight(product.packageData?.weight?.toString() || "0");
    setPackageLength(product.packageData?.length?.toString() || "0");
    setPackageWidth(product.packageData?.width?.toString() || "0");
    setPackageHeight(product.packageData?.height?.toString() || "0");
    setSizes(
      product.sizes?.map((s) => ({
        size: s.size,
        stock: s.stock.toString(),
        price: s.price?.toString() || "",
        sku: s.sku || "",
        imageUrl: s.imageUrl || "",
      })) || [{ size: "", stock: "", price: "", sku: "", imageUrl: "" }],
    );
    setExistingImages(product.images || []);
    setImages(null);
    setStatus(product.status || "published");
    setSeoTitle(product.seoTitle || "");
    setSeoDescription(product.seoDescription || "");
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!config || !confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`, config.slug);
      loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting product");
    }
  };

  const toggleFeatured = async (id: string) => {
    if (!config) return;
    try {
      await api.put(`/products/${id}/feature`, {}, config.slug);
      loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error toggling featured");
    }
  };

  const deleteExistingImage = (idx: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== idx));
  };

  const moveExistingImage = (idx: number, direction: "left" | "right") => {
    const newImages = [...existingImages];
    const targetIdx = direction === "left" ? idx - 1 : idx + 1;
    if (targetIdx >= 0 && targetIdx < newImages.length) {
      const temp = newImages[idx];
      newImages[idx] = newImages[targetIdx];
      newImages[targetIdx] = temp;
      setExistingImages(newImages);
    }
  };

  const insertFormat = (tagOpen: string, tagClose: string) => {
    const textarea = document.getElementById("product-description-textarea") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const replacement = tagOpen + selectedText + tagClose;
    setDescription(text.substring(0, start) + replacement + text.substring(end));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagOpen.length, start + tagOpen.length + selectedText.length);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!config) return;

    if (isNaN(Number(price)) || Number(price) <= 0) {
      return setError("Price must be a positive number.");
    }
    const parsedDiscount = discount === "" ? "0" : discount;
    if (
      isNaN(Number(parsedDiscount)) ||
      Number(parsedDiscount) < 0 ||
      Number(parsedDiscount) > 100
    ) {
      return setError("Discount must be a valid percentage between 0 and 100.");
    }

    const sizesList = sizes
      .filter((s) => s.size.trim() !== "" && s.stock !== "")
      .map((s) => ({
        size: s.size.trim(),
        stock: Number(s.stock),
        price: s.price && s.price.trim() !== "" ? Number(s.price) : undefined,
        sku: s.sku && s.sku.trim() !== "" ? s.sku.trim() : undefined,
        imageUrl: s.imageUrl && s.imageUrl.trim() !== "" ? s.imageUrl.trim() : undefined,
      }));

    if (sizesList.length === 0) {
      return setError("You must provide at least one valid variant/option with stock.");
    }

    const totalStock = sizesList.reduce((acc, s) => acc + s.stock, 0);
    const formData = new FormData();
    formData.append("model", name);
    formData.append("brand", brand);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("sku", sku);
    formData.append("price", price);
    formData.append("discount", parsedDiscount);
    formData.append("packageWeight", packageWeight);
    formData.append("packageLength", packageLength);
    formData.append("packageWidth", packageWidth);
    formData.append("packageHeight", packageHeight);
    formData.append("sizes", JSON.stringify(sizesList));
    formData.append("stock", totalStock.toString());
    formData.append("status", status);
    formData.append("seoTitle", seoTitle);
    formData.append("seoDescription", seoDescription);

    if (editingProduct) {
      formData.append("existingImages", JSON.stringify(existingImages));
    }

    if (images)
      for (let i = 0; i < images.length; i++)
        formData.append("images", images[i]);

    try {
      if (editingProduct)
        await api.put(`/products/${editingProduct._id}`, formData, config.slug);
      else await api.post("/products", formData, config.slug);
      setShowForm(false);
      setEditingProduct(null);
      resetForm();
      loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving product");
    }
  };

  const resetForm = () => {
    setName("");
    setBrand("");
    setCategory(categoriesList.length > 0 ? categoriesList[0].slug : "");
    setDescription("");
    setSku("");
    setPrice("");
    setDiscount("0");
    setPackageWeight("0");
    setPackageLength("0");
    setPackageWidth("0");
    setPackageHeight("0");
    setSizes([{ size: "", stock: "", price: "", sku: "", imageUrl: "" }]);
    setImages(null);
    setExistingImages([]);
    setStatus("published");
    setSeoTitle("");
    setSeoDescription("");
  };
  const addSizeRow = () => setSizes([...sizes, { size: "", stock: "", price: "", sku: "", imageUrl: "" }]);
  const removeSizeRow = (i: number) =>
    setSizes(sizes.filter((_, idx) => idx !== i));
  const updateSize = (i: number, field: "size" | "stock" | "price" | "sku" | "imageUrl", value: string) => {
    const u = [...sizes];
    u[i][field] = value;
    setSizes(u);
  };

  if (!config) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <AdminNav />

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-10">
          <h2 className="text-2xl font-extrabold mb-6 text-gray-800">
            {editingProduct
              ? `Editing: ${editingProduct.model}`
              : "Add New Product"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name / Model *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="e.g. Air Max 90"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Brand *</label>
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="e.g. Nike"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded bg-white text-sm"
                >
                  <option value="" disabled>Select a category</option>
                  {categoriesList.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">SKU (Optional)</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder="e.g. NK-AM90-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Publication Status *</label>
                <select
                  required
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded bg-white text-sm"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium">Description</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => insertFormat("<strong>", "</strong>")}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-xs font-bold rounded"
                  >
                    Bold
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormat("<em>", "</em>")}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-xs italic rounded"
                  >
                    Italic
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormat("<h3>", "</h3>")}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-xs font-semibold rounded"
                  >
                    H3
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormat("<ul>\n  <li>", "</li>\n</ul>")}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-xs rounded"
                  >
                    Bullet List
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormat('<a href="url" target="_blank" class="underline font-semibold text-blue-600">', "</a>")}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-xs rounded text-blue-600 font-bold"
                  >
                    Link
                  </button>
                </div>
              </div>
              <textarea
                id="product-description-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
                rows={5}
                placeholder="Detailed product description (Supports HTML)..."
              />
            </div>

            <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100">
              <h3 className="font-extrabold text-sm mb-4 text-blue-900 flex items-center gap-2">
                🌐 Search Engine Optimization (SEO)
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    SEO Meta Title (Optional - falls back to brand & model)
                  </label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Custom meta title for Google search"
                    className="w-full px-4 py-2 rounded border bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    SEO Meta Description (Optional - falls back to description)
                  </label>
                  <textarea
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Short description for Google search snippet"
                    rows={2}
                    className="w-full px-4 py-2 rounded border bg-white text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h3 className="font-bold text-sm mb-4 text-gray-800">
                Logistics & Package Dimensions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={packageWeight}
                    onChange={(e) => setPackageWeight(e.target.value)}
                    className="w-full px-4 py-2 rounded border bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Length (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={packageLength}
                    onChange={(e) => setPackageLength(e.target.value)}
                    className="w-full px-4 py-2 rounded border bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Width (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={packageWidth}
                    onChange={(e) => setPackageWidth(e.target.value)}
                    className="w-full px-4 py-2 rounded border bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Height (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={packageHeight}
                    onChange={(e) => setPackageHeight(e.target.value)}
                    className="w-full px-4 py-2 rounded border bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-colors text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Discount %
                </label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Upload New Images
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setImages(e.target.files)}
                  className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 text-sm"
                />
                {existingImages.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 font-semibold mb-2">
                      Current Images (Drag & Drop replacement using sorting):
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {existingImages.map((img, idx) => (
                        <div key={idx} className="relative group border rounded-xl overflow-hidden bg-gray-50">
                          <div className="relative aspect-square w-full">
                            <Image
                              src={img}
                              alt="Product"
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          </div>
                          <div className="p-1.5 flex justify-between items-center bg-white border-t">
                            <div className="flex gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveExistingImage(idx, "left")}
                                className="p-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs disabled:opacity-30 font-bold"
                                title="Move Left"
                              >
                                &lt;
                              </button>
                              <button
                                type="button"
                                disabled={idx === existingImages.length - 1}
                                onClick={() => moveExistingImage(idx, "right")}
                                className="p-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs disabled:opacity-30 font-bold"
                                title="Move Right"
                              >
                                &gt;
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => deleteExistingImage(idx)}
                              className="p-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-bold"
                              title="Delete Image"
                            >
                              Del
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h3 className="font-extrabold text-sm mb-4 text-gray-800">
                Variants & Stock
              </h3>
              {sizes.map((s, i) => (
                <div key={i} className="bg-white p-4 rounded-xl border mb-3 space-y-3">
                  <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex-1 min-w-[150px]">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Variant Name *</label>
                      <input
                        type="text"
                        value={s.size}
                        onChange={(e) => updateSize(i, "size", e.target.value)}
                        placeholder="e.g. Red, XL, 128GB"
                        className="w-full px-3 py-2 rounded-lg border text-sm"
                        required
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Stock *</label>
                      <input
                        type="number"
                        value={s.stock}
                        onChange={(e) => updateSize(i, "stock", e.target.value)}
                        placeholder="Qty"
                        min="0"
                        className="w-full px-3 py-2 rounded-lg border text-sm"
                        required
                      />
                    </div>
                    <div className="w-28">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Price (Override)</label>
                      <input
                        type="number"
                        value={s.price || ""}
                        onChange={(e) => updateSize(i, "price", e.target.value)}
                        placeholder="Base Price"
                        min="0"
                        className="w-full px-3 py-2 rounded-lg border text-sm"
                      />
                    </div>
                    <div className="w-36">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">SKU (Override)</label>
                      <input
                        type="text"
                        value={s.sku || ""}
                        onChange={(e) => updateSize(i, "sku", e.target.value)}
                        placeholder="Variant SKU"
                        className="w-full px-3 py-2 rounded-lg border text-sm"
                      />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Image URL (Override)</label>
                      <input
                        type="text"
                        value={s.imageUrl || ""}
                        onChange={(e) => updateSize(i, "imageUrl", e.target.value)}
                        placeholder="Image URL"
                        className="w-full px-3 py-2 rounded-lg border text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSizeRow(i)}
                      className="self-end px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-bold transition-colors mb-0.5"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addSizeRow}
                className="mt-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-semibold text-gray-800 transition-colors"
              >
                + Add Variant/Option
              </button>
            </div>
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="px-8 py-3 rounded-xl font-bold text-white transition-transform hover:scale-105 shadow-md"
                style={{ backgroundColor: config.theme.accentColor }}
              >
                {editingProduct ? "Update Product" : "Create Product"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                  resetForm();
                }}
                className="px-8 py-3 rounded-xl border-2 font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Inventory ({products.length})</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingProduct(null);
            resetForm();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white"
          style={{ backgroundColor: config.theme.primaryColor }}
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="px-4 py-3 text-left">Image</th>
              <th className="px-4 py-3 text-left">Model</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Stock</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Image
                    src={product.images?.[0] || ""}
                    alt=""
                    width={40}
                    height={40}
                    className="object-cover rounded"
                  />
                </td>
                <td className="px-4 py-3">
                  <span className="font-bold">{product.model}</span>
                  <p className="text-xs text-gray-500">
                    {product.brand} | {product.category}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    product.status === "draft" ? "bg-amber-100 text-amber-800" :
                    product.status === "archived" ? "bg-red-100 text-red-800" :
                    "bg-green-100 text-green-800"
                  }`}>
                    {product.status || "published"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="bg-gray-200 px-2 py-1 rounded text-xs font-semibold">
                    {product.stock} units
                  </span>
                </td>
                <td className="px-4 py-3">
                  {product.discount > 0 ? (
                    <div>
                      <span className="text-red-500 line-through text-xs">
                        ${product.price}
                      </span>
                      <p className="font-bold text-green-600">
                        $
                        {(Math.round((product.price - product.price * (product.discount / 100)) * 100) / 100).toFixed(2)}
                      </p>
                    </div>
                  ) : (
                    <span className="font-bold">${product.price}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex gap-1 justify-center">
                    <button
                      onClick={() => toggleFeatured(product._id)}
                      className={`p-1 rounded ${product.isFeatured ? "bg-green-500 text-white" : "border"}`}
                    >
                      <Star className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-1 rounded bg-yellow-500 text-white"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="p-1 rounded bg-red-50 text-red-600"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
