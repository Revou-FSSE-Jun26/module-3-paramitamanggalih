export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category_id: number;
  category?: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface CartItem {
  id: number | string;
  name: string;
  price: number;
  quantity: number;
}
