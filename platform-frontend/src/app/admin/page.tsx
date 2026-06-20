"use client";

import { useEffect, useState, useCallback } from "react";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  Plus,
  Edit,
  Trash,
  Star,
} from "lucide-react";
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
  sizes: { size: string; stock: number }[];
}

export default function AdminPage() {
  const { config } = useTenant();
  const { isAuthenticated, isAdmin , isHydrated} = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("0");
  const [sizes, setSizes] = useState<{ size: string; stock: string }[]>([
    { size: "", stock: "" },
  ]);
  const [images, setImages] = useState<FileList | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    if (!config) return [];
    try {
      const data = (await api.get("/products?limit=50", config.slug)) as {
        results: Product[];
      };
      return data.results || [];
    } catch (err) {
      console.error("Error loading products:", err);
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
    loadProducts().then((result) => {
      if (!ignore) setProducts(result);
    });
    return () => { ignore = true; };
  }, [isAuthenticated, isAdmin, router, loadProducts, isHydrated]);

  const handleEdit = (product: Product) => {
    setError("");
    setEditingProduct(product);
    setName(product.model);
    setBrand(product.brand);
    setCategory(product.category || "");
    setPrice(product.price.toString());
    setDiscount(product.discount.toString());
    setSizes(
      product.sizes?.map((s) => ({
        size: s.size,
        stock: s.stock.toString(),
      })) || [{ size: "", stock: "" }],
    );
    setExistingImages(product.images || []);
    setImages(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!config) return;

    if (isNaN(Number(price)) || Number(price) <= 0) {
      return setError("Price must be a positive number.");
    }
    const parsedDiscount = discount === "" ? "0" : discount;
    if (isNaN(Number(parsedDiscount)) || Number(parsedDiscount) < 0 || Number(parsedDiscount) > 100) {
      return setError("Discount must be a valid percentage between 0 and 100.");
    }

    const sizesList = sizes
      .filter((s) => s.size.trim() !== "" && s.stock !== "")
      .map((s) => ({ size: s.size.trim(), stock: Number(s.stock) }));
      
    if (sizesList.length === 0) {
      return setError("You must provide at least one valid size with stock.");
    }

    const totalStock = sizesList.reduce((acc, s) => acc + s.stock, 0);
    const formData = new FormData();
    formData.append("model", name);
    formData.append("brand", brand);
    formData.append("category", category);
    formData.append("price", price);
    formData.append("discount", parsedDiscount);
    formData.append("sizes", JSON.stringify(sizesList));
    formData.append("stock", totalStock.toString());
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
    setCategory("");
    setPrice("");
    setDiscount("0");
    setSizes([{ size: "", stock: "" }]);
    setImages(null);
    setExistingImages([]);
  };
  const addSizeRow = () => setSizes([...sizes, { size: "", stock: "" }]);
  const removeSizeRow = (i: number) =>
    setSizes(sizes.filter((_, idx) => idx !== i));
  const updateSize = (i: number, field: "size" | "stock", value: string) => {
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Model
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Brand
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-colors"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Price ($)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-colors"
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
                  className="w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-colors"
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
                  className="w-full px-4 py-2.5 rounded-xl border bg-gray-50"
                />
                {existingImages.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 font-semibold mb-2">
                      Current Images (Uploading new will overwrite):
                    </p>
                    <div className="flex gap-2 overflow-x-auto">
                      {existingImages.map((img, idx) => (
                        <Image
                          key={idx}
                          src={img}
                          alt="Product"
                          width={48}
                          height={48}
                          className="object-cover rounded-md border"
                          unoptimized
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h3 className="font-extrabold text-sm mb-4 text-gray-800">
                Sizes & Stock
              </h3>
              {sizes.map((s, i) => (
                <div key={i} className="flex gap-3 mb-3">
                  <input
                    type="text"
                    value={s.size}
                    onChange={(e) => updateSize(i, "size", e.target.value)}
                    placeholder="Size (e.g., L, 42)"
                    className="flex-1 px-4 py-2.5 rounded-lg border text-sm"
                    required
                  />
                  <input
                    type="number"
                    value={s.stock}
                    onChange={(e) => updateSize(i, "stock", e.target.value)}
                    placeholder="Stock quantity"
                    min="0"
                    className="w-32 px-4 py-2.5 rounded-lg border text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeSizeRow(i)}
                    className="px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm font-bold transition-colors"
                  >
                    X
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSizeRow}
                className="mt-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-semibold text-gray-800 transition-colors"
              >
                + Add Size Option
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
                    unoptimized
                  />
                </td>
                <td className="px-4 py-3">
                  <span className="font-bold">{product.model}</span>
                  <p className="text-xs text-gray-500">
                    {product.brand} | {product.category}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span className="bg-gray-200 px-2 py-1 rounded text-xs">
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
                        {product.price -
                          product.price * (product.discount / 100)}
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
                      className="p-1 rounded bg-red-500 text-white"
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
