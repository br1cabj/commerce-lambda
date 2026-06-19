"use client";

import { useEffect, useState } from "react";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Package, ShoppingCart, Tag, Star, Settings, Plus, Edit, Trash } from "lucide-react";

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

const adminLinks = [
  { href: "/admin", label: "Products", icon: <Package className="h-4 w-4" /> },
  { href: "/admin/orders", label: "Orders", icon: <ShoppingCart className="h-4 w-4" /> },
  { href: "/admin/coupons", label: "Coupons", icon: <Tag className="h-4 w-4" /> },
  { href: "/admin/reviews", label: "Reviews", icon: <Star className="h-4 w-4" /> },
  { href: "/admin/settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
];

export default function AdminPage() {
  const { config } = useTenant();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("0");
  const [sizes, setSizes] = useState<{ size: string; stock: string }[]>([{ size: "", stock: "" }]);
  const [images, setImages] = useState<FileList | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) { router.push("/"); return; }
    loadProducts();
  }, [config, isAuthenticated, isAdmin, router]);

  const loadProducts = async () => {
    if (!config) return;
    try {
      const data = await api.get("/products?limit=50", config.slug) as { results: Product[] };
      setProducts(data.results || []);
    } catch (err) { console.error("Error loading products:", err); }
  };

  const handleEdit = (product: Product) => {
    setError("");
    setEditingProduct(product);
    setName(product.model); setBrand(product.brand); setCategory(product.category || "");
    setPrice(product.price.toString()); setDiscount(product.discount.toString());
    setSizes(product.sizes?.map(s => ({ size: s.size, stock: s.stock.toString() })) || [{ size: "", stock: "" }]);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!config || !confirm("Delete this product?")) return;
    try { await api.delete(`/products/${id}`, config.slug); loadProducts(); }
    catch (err) { setError(err instanceof Error ? err.message : "Error deleting product"); }
  };

  const toggleFeatured = async (id: string) => {
    if (!config) return;
    try { await api.put(`/products/${id}/feature`, {}, config.slug); loadProducts(); }
    catch (err) { setError(err instanceof Error ? err.message : "Error toggling featured"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!config) return;
    const sizesList = sizes.filter(s => s.size && s.stock).map(s => ({ size: s.size, stock: Number(s.stock) }));
    const totalStock = sizesList.reduce((acc, s) => acc + s.stock, 0);
    const formData = new FormData();
    formData.append("model", name); formData.append("brand", brand); formData.append("category", category);
    formData.append("price", price); formData.append("discount", discount);
    formData.append("sizes", JSON.stringify(sizesList)); formData.append("stock", totalStock.toString());
    if (images) for (let i = 0; i < images.length; i++) formData.append("images", images[i]);

    try {
      if (editingProduct) await api.put(`/products/${editingProduct._id}`, formData, config.slug);
      else await api.post("/products", formData, config.slug);
      setShowForm(false); setEditingProduct(null); resetForm(); loadProducts();
    } catch (err) { setError(err instanceof Error ? err.message : "Error saving product"); }
  };

  const resetForm = () => { setName(""); setBrand(""); setCategory(""); setPrice(""); setDiscount("0"); setSizes([{ size: "", stock: "" }]); setImages(null); };
  const addSizeRow = () => setSizes([...sizes, { size: "", stock: "" }]);
  const removeSizeRow = (i: number) => setSizes(sizes.filter((_, idx) => idx !== i));
  const updateSize = (i: number, field: "size" | "stock", value: string) => { const u = [...sizes]; u[i][field] = value; setSizes(u); };

  if (!config) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <nav className="flex flex-wrap gap-2">
          {adminLinks.map((link) => (
            <Link key={link.href} href={link.href} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-gray-100 hover:bg-gray-200 transition-colors">
              {link.icon} {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">{editingProduct ? `Editing: ${editingProduct.model}` : "Add New Product"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><label className="block text-sm font-bold mb-1">Model</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 rounded-lg border" required /></div>
              <div><label className="block text-sm font-bold mb-1">Brand</label><input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full px-4 py-2 rounded-lg border" required /></div>
              <div><label className="block text-sm font-bold mb-1">Category</label><input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2 rounded-lg border" required /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><label className="block text-sm font-bold mb-1">Price</label><input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-4 py-2 rounded-lg border" required /></div>
              <div><label className="block text-sm font-bold mb-1">Discount %</label><input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} className="w-full px-4 py-2 rounded-lg border" /></div>
              <div><label className="block text-sm font-bold mb-1">Images</label><input type="file" multiple accept="image/*" onChange={(e) => setImages(e.target.files)} className="w-full px-4 py-2 rounded-lg border" /></div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-bold text-sm mb-3">Sizes & Stock</h3>
              {sizes.map((s, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input type="text" value={s.size} onChange={(e) => updateSize(i, "size", e.target.value)} placeholder="Size" className="flex-1 px-3 py-2 rounded border text-sm" required />
                  <input type="number" value={s.stock} onChange={(e) => updateSize(i, "stock", e.target.value)} placeholder="Stock" className="w-24 px-3 py-2 rounded border text-sm" required />
                  <button type="button" onClick={() => removeSizeRow(i)} className="px-3 py-2 bg-red-500 text-white rounded text-sm font-bold">X</button>
                </div>
              ))}
              <button type="button" onClick={addSizeRow} className="text-sm font-semibold text-blue-600 hover:underline">+ Add Size</button>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-2 rounded-lg font-semibold text-white" style={{ backgroundColor: config.theme.accentColor }}>{editingProduct ? "Update" : "Create"} Product</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingProduct(null); resetForm(); }} className="px-6 py-2 rounded-lg border font-semibold">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Inventory ({products.length})</h2>
        <button onClick={() => { setShowForm(true); setEditingProduct(null); resetForm(); }} className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white" style={{ backgroundColor: config.theme.primaryColor }}>
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
                <td className="px-4 py-3"><img src={product.images?.[0] || ""} alt="" className="h-10 w-10 object-cover rounded" /></td>
                <td className="px-4 py-3"><span className="font-bold">{product.model}</span><p className="text-xs text-gray-500">{product.brand} | {product.category}</p></td>
                <td className="px-4 py-3"><span className="bg-gray-200 px-2 py-1 rounded text-xs">{product.stock} units</span></td>
                <td className="px-4 py-3">
                  {product.discount > 0 ? (<div><span className="text-red-500 line-through text-xs">${product.price}</span><p className="font-bold text-green-600">${product.price - product.price * (product.discount / 100)}</p></div>) : (<span className="font-bold">${product.price}</span>)}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex gap-1 justify-center">
                    <button onClick={() => toggleFeatured(product._id)} className={`p-1 rounded ${product.isFeatured ? "bg-green-500 text-white" : "border"}`}><Star className="h-4 w-4" /></button>
                    <button onClick={() => handleEdit(product)} className="p-1 rounded bg-yellow-500 text-white"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(product._id)} className="p-1 rounded bg-red-500 text-white"><Trash className="h-4 w-4" /></button>
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
