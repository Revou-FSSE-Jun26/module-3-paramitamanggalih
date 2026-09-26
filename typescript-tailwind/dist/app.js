"use strict";
const categories = [
    {
        id: 1,
        name: "Laptop"
    },
    {
        id: 2,
        name: "Accessories"
    },
    {
        id: 3,
        name: "Monitor"
    }
];
const products = [
    {
        id: 1,
        name: "Laptop Pro",
        description: "Laptop untuk kebutuhan kerja dan belajar.",
        price: 12000000,
        stock: 5,
        category: categories[0],
        tags: ["laptop", "work", "study"]
    },
    {
        id: 2,
        name: "Mechanical Keyboard",
        description: "Keyboard mechanical dengan switch yang nyaman.",
        price: 850000,
        stock: 10,
        category: categories[1],
        tags: ["keyboard", "gaming", "office"]
    },
    {
        id: 3,
        name: "Wireless Mouse",
        description: "Mouse wireless ringan dan praktis.",
        price: 350000,
        stock: 0,
        category: categories[1],
        tags: ["mouse", "wireless", "office"]
    },
    {
        id: 4,
        name: "4K Monitor",
        description: "Monitor 4K untuk pekerjaan dan multimedia.",
        price: 4500000,
        stock: 7,
        category: categories[2],
        tags: ["monitor", "4k", "display"]
    }
];
const cart = {
    items: [],
    totalItems: 0
};
function getStockStatus(stock) {
    return stock > 0 ? "in-stock" : "out-of-stock";
}
function formatPrice(price) {
    return `Rp ${price.toLocaleString("id-ID")}`;
}
function addToCart(product) {
    if (product.stock === 0) {
        return;
    }
    cart.items.push(product);
    cart.totalItems += 1;
    updateCartCounter();
}
function updateCartCounter() {
    const cartCount = document.querySelector("#cart-count");
    if (cartCount) {
        cartCount.textContent = String(cart.totalItems);
    }
}
function renderProducts(productList) {
    const productGrid = document.querySelector("#product-grid");
    if (!productGrid) {
        return;
    }
    productGrid.innerHTML = "";
    productList.forEach((product) => {
        const stockStatus = getStockStatus(product.stock);
        const card = document.createElement("article");
        const stockClasses = stockStatus === "in-stock"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700";
        const buttonClasses = stockStatus === "in-stock"
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-400 cursor-not-allowed";
        card.className =
            "rounded-2xl bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-xl";
        card.innerHTML = `
      <div class="mb-4 flex items-center justify-between">
        <span class="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
          ${product.category.name}
        </span>

        <span class="rounded-full px-3 py-1 text-sm font-semibold ${stockClasses}">
          ${stockStatus === "in-stock" ? "In Stock" : "Out of Stock"}
        </span>
      </div>

      <h2 class="mb-2 text-xl font-bold text-gray-900">
        ${product.name}
      </h2>

      <p class="mb-4 min-h-12 text-sm text-gray-600">
        ${product.description}
      </p>

      <p class="mb-4 text-2xl font-bold text-blue-700">
        ${formatPrice(product.price)}
      </p>

      <p class="mb-4 text-sm text-gray-500">
        Stock: ${product.stock}
      </p>

      <button
        type="button"
        data-product-id="${product.id}"
        class="w-full rounded-xl px-4 py-3 font-semibold text-white ${buttonClasses}"
        ${stockStatus === "out-of-stock" ? "disabled" : ""}
      >
        ${stockStatus === "in-stock" ? "Add to Cart" : "Unavailable"}
      </button>
    `;
        const button = card.querySelector("button[data-product-id]");
        button?.addEventListener("click", () => {
            addToCart(product);
        });
        productGrid.appendChild(card);
    });
}
const searchInput = document.querySelector("#search");
searchInput?.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const filteredProducts = products.filter((product) => {
        return (product.name.toLowerCase().includes(searchTerm) ||
            product.category.name.toLowerCase().includes(searchTerm) ||
            product.tags.some((tag) => tag.toLowerCase().includes(searchTerm)));
    });
    renderProducts(filteredProducts);
});
renderProducts(products);
updateCartCounter();
