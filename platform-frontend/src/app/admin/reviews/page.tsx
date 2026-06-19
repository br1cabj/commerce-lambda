"use client";

import { useEffect, useState } from "react";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Plus, Trash, Star } from "lucide-react";

interface Review {
  _id: string;
  clientName: string;
  clientRole: string;
  message: string;
  image: string;
}

export default function AdminReviewsPage() {
  const { config } = useTenant();
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) { router.push("/"); return; }
    loadReviews();
  }, [config, isAuthenticated, isAdmin, router]);

  const loadReviews = async () => {
    if (!config) return;
    try {
      const data = await api.get("/reviews", config.slug) as Review[];
      setReviews(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading reviews");
      console.error("Error loading reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const createReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!config || !image) return;

    const formData = new FormData();
    formData.append("clientName", name);
    formData.append("clientRole", role);
    formData.append("message", message);
    formData.append("image", image);

    try {
      await api.post("/reviews", formData, config.slug);
      setShowForm(false);
      setName(""); setRole(""); setMessage(""); setImage(null);
      loadReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating review");
    }
  };

  const deleteReview = async (id: string) => {
    if (!config || !confirm("Delete this review?")) return;
    try {
      await api.delete(`/reviews/${id}`, config.slug);
      loadReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting review");
    }
  };

  if (!config) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Reviews</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white"
          style={{ backgroundColor: config.theme.accentColor }}
        >
          <Plus className="h-4 w-4" /> New Review
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>
      )}

      {showForm && (
        <form onSubmit={createReview} className="bg-white rounded-xl shadow-sm border p-6 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Client Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 rounded-lg border" required />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Role / Title</label>
              <input type="text" value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-2 rounded-lg border" placeholder="e.g., Professional Athlete" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="w-full px-4 py-2 rounded-lg border" rows={3} required />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Profile Photo</label>
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="w-full px-4 py-2 rounded-lg border" required />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="px-6 py-2 rounded-lg font-semibold text-white" style={{ backgroundColor: config.theme.accentColor }}>Publish</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 rounded-lg border font-semibold">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <p className="text-gray-500 font-medium">No reviews yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
              <img src={review.image} alt={review.clientName} className="h-12 w-12 rounded-full object-cover border-2" style={{ borderColor: config.theme.accentColor }} />
              <div className="flex-1">
                <p className="font-bold">{review.clientName}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{review.clientRole}</p>
                <p className="text-sm text-gray-600 italic mt-1">&ldquo;{review.message}&rdquo;</p>
              </div>
              <div className="flex gap-1 text-yellow-400">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <button onClick={() => deleteReview(review._id)} className="p-2 rounded hover:bg-red-50 text-red-500">
                <Trash className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
