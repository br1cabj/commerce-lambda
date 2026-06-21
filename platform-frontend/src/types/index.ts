export interface ProductSize {
  size: string;
  stock: number;
  price?: number;
  sku?: string;
  imageUrl?: string;
}

export interface Product {
  _id: string;
  model: string;
  brand: string;
  price: number;
  discount: number;
  images: string[];
  sizes: ProductSize[];
  stock: number;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  createdAt?: string;
  salesCount?: number;
  category?: string;
  description?: string;
  sku?: string;
  slug?: string;
  status?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Review {
  _id: string;
  clientName: string;
  clientRole: string;
  message: string;
  image: string;
  rating: number;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  icon?: string;
}
