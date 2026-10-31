import type { Product, Category } from "@/types/product";

export interface OrderItem {
  product_id: number;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  user_id: number;
  total: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function getApiUrl(path: string): string {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
  }

  return `${API_BASE_URL.replace(/\/$/, "")}${path}`;
}

async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(getApiUrl(path), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Flask API request failed: ${response.status} ${response.statusText}`
    );
  }

  return (await response.json()) as T;
}

export async function getProducts(): Promise<Product[]> {
  return apiFetch<Product[]>("/products");
}

export async function getProduct(id: string | number): Promise<Product> {
  return apiFetch<Product>(`/products/${encodeURIComponent(String(id))}`);
}

export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/categories");
}

export async function getOrders(
  limit = 20,
  offset = 0
): Promise<Order[]> {
  const params = new URLSearchParams({
    limit: String(Math.max(1, Math.min(limit, 100))),
    offset: String(Math.max(0, offset)),
  });

  return apiFetch<Order[]>(`/orders?${params.toString()}`);
}

export interface CategoryDetail extends Category {
  products: Product[];
}

export async function getCategory(
  id: string | number
): Promise<CategoryDetail> {
  return apiFetch<CategoryDetail>(
    `/categories/${encodeURIComponent(String(id))}`
  );
}
