const productImages: Record<string, string> = {
  "wireless mouse": "/products/wireless-mouse.jpg",
  "mechanical keyboard": "/products/mechanical-keyboard.jpg",
  "usb-c hub": "/products/usb-c-hub.jpg",
  "bluetooth headphones": "/products/bluetooth-headphones.jpg",
  "basic t-shirt": "/products/basic-tshirt.jpg",
  "denim jacket": "/products/denim-jacket.jpg",
  "desk lamp": "/products/desk-lamp.jpg",
  "office chair": "/products/office-chair.jpg",
  "clean code": "/products/clean-code.jpg",
  "design patterns": "/products/design-patterns.jpg",
};

export function getProductImage(name: string): string {
  const normalized = name.trim().toLowerCase();

  return productImages[normalized] ?? "/products/no-image.svg";
}