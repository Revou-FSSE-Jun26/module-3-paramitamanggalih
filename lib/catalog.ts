import type { Product, Category } from "@/types/product";

export const CATALOG_PRODUCT_NAMES = [
  "Wireless Mouse",
  "Mechanical Keyboard",
  "USB-C Hub",
  "Bluetooth Headphones",
  "Basic T-Shirt",
  "Denim Jacket",
  "Desk Lamp",
  "Office Chair",
  "Clean Code",
  "Design Patterns",
] as const;

export const CATALOG_CATEGORY_NAMES = [
  "Electronics",
  "Fashion",
  "Home & Living",
  "Books",
] as const;

const productOrder = new Map<string, number>(
  CATALOG_PRODUCT_NAMES.map((name, index) => [
    name.toLowerCase(),
    index,
  ])
);

const categoryOrder = new Map<string, number>(
  CATALOG_CATEGORY_NAMES.map((name, index) => [
    name.toLowerCase(),
    index,
  ])
);

export function isCatalogProduct(
  product: Pick<Product, "name">
): boolean {
  return productOrder.has(product.name.trim().toLowerCase());
}

export function filterCatalogProducts<T extends Product>(
  products: T[]
): T[] {
  return products
    .filter(isCatalogProduct)
    .sort(
      (a, b) =>
        (productOrder.get(a.name.trim().toLowerCase()) ?? 999) -
        (productOrder.get(b.name.trim().toLowerCase()) ?? 999)
    );
}

export function isCatalogCategory(
  category: Pick<Category, "name">
): boolean {
  return categoryOrder.has(category.name.trim().toLowerCase());
}

export function filterCatalogCategories<T extends Category>(
  categories: T[]
): T[] {
  return categories
    .filter(isCatalogCategory)
    .sort(
      (a, b) =>
        (categoryOrder.get(a.name.trim().toLowerCase()) ?? 999) -
        (categoryOrder.get(b.name.trim().toLowerCase()) ?? 999)
    );
}