const products = [
  {
    name: "Laptop",
    price: 10000000,
    stock: 5
  },
  {
    name: "Keyboard",
    price: 500000,
    stock: 10
  },
  {
    name: "Mouse",
    price: 250000,
    stock: 0
  },
  {
    name: "Monitor",
    price: 3000000,
    stock: 7
  }
];

const output = document.querySelector("#output");

// 1. forEach()
// Menampilkan semua nama produk
let productNames = "";

products.forEach((product) => {
  productNames += `${product.name}, `;
});

// 2. map()
// Membuat array harga setelah diskon 10%
const discountedPrices = products.map((product) => {
  return product.price * 0.9;
});

// 3. filter()
// Mengambil produk yang masih memiliki stock
const availableProducts = products.filter((product) => {
  return product.stock > 0;
});

// 4. reduce()
// Menghitung total nilai seluruh stock
const totalInventoryValue = products.reduce((total, product) => {
  return total + product.price * product.stock;
}, 0);

// Menampilkan hasil ke halaman
output.innerHTML = `
  <h2>Array Processing Results</h2>

  <p>
    <strong>forEach:</strong>
    ${productNames}
  </p>

  <p>
    <strong>map:</strong>
    ${discountedPrices.map((price) => `Rp ${price.toLocaleString("id-ID")}`).join(", ")}
  </p>

  <p>
    <strong>filter:</strong>
    ${availableProducts.map((product) => product.name).join(", ")}
  </p>

  <p>
    <strong>reduce:</strong>
    Rp ${totalInventoryValue.toLocaleString("id-ID")}
  </p>
`;