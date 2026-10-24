const http = require("node:http");
const { URL } = require("node:url");

const PORT = 5001;

const categories = [{ id: 1, name: "Electronics" }];
const products = [
  {
    id: 1,
    name: "E2E Test Laptop",
    description: "A product for frontend testing",
    price: 1250000,
    stock: 20,
    category_id: 1,
    category: "Electronics",
  },
];

const users =
  process.env.E2E_ADMIN_EMAIL && process.env.E2E_ADMIN_PASSWORD
    ? [{
        id: 1,
        name: "E2E Admin",
        email: process.env.E2E_ADMIN_EMAIL,
        password: process.env.E2E_ADMIN_PASSWORD,
        role: "admin",
        created_at: new Date().toISOString(),
      }]
    : [];
const orders = [];

let nextCategoryId = 2;
let nextProductId = 2;
let nextUserId = users.reduce((max, user) => Math.max(max, user.id), 0) + 1;
let nextOrderId = 1;

function send(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
  };
}

function serializeOrder(order) {
  return {
    ...order,
    items: order.items.map((item) => ({ ...item })),
  };
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return res.end();
  }

  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const path = url.pathname;

  try {
    if (path === "/api" && req.method === "GET") {
      return send(res, 200, {
        message: "RevoShop mock API is running",
        status: "success",
      });
    }

    if (path === "/products" && req.method === "GET") {
      return send(res, 200, products);
    }

    if (path === "/products" && req.method === "POST") {
      const data = await readBody(req);
      const category = categories.find(
        (item) => item.id === Number(data.category_id)
      );

      if (!data.name || !category || Number(data.price) < 0 ||
          !Number.isInteger(Number(data.stock)) || Number(data.stock) < 0) {
        return send(res, 400, { message: "Invalid product data" });
      }

      const product = {
        id: nextProductId++,
        name: String(data.name).trim(),
        description: data.description || null,
        price: Number(data.price),
        stock: Number(data.stock),
        category_id: category.id,
        category: category.name,
      };

      products.push(product);
      return send(res, 201, product);
    }

    let match = path.match(/^\/products\/(\d+)$/);
    if (match) {
      const id = Number(match[1]);
      const index = products.findIndex((item) => item.id === id);

      if (index < 0) {
        return send(res, 404, { message: "Product not found" });
      }

      if (req.method === "GET") {
        return send(res, 200, products[index]);
      }

      if (req.method === "PUT") {
        const data = await readBody(req);
        const product = products[index];

        if (data.category_id !== undefined) {
          const category = categories.find(
            (item) => item.id === Number(data.category_id)
          );
          if (!category) {
            return send(res, 404, { message: "Category not found" });
          }
          product.category_id = category.id;
          product.category = category.name;
        }

        if (data.name !== undefined) product.name = String(data.name).trim();
        if (data.description !== undefined) product.description = data.description;
        if (data.price !== undefined) product.price = Number(data.price);
        if (data.stock !== undefined) product.stock = Number(data.stock);

        return send(res, 200, product);
      }

      if (req.method === "DELETE") {
        if (orders.some((order) =>
          order.items.some((item) => item.product_id === id)
        )) {
          return send(res, 409, {
            message: "Cannot delete a product linked to an order",
          });
        }

        products.splice(index, 1);
        return send(res, 200, { message: "Product deleted successfully" });
      }
    }

    if (path === "/categories" && req.method === "GET") {
      return send(res, 200, categories);
    }

    if (path === "/categories" && req.method === "POST") {
      const data = await readBody(req);
      const name = typeof data.name === "string" ? data.name.trim() : "";

      if (!name) return send(res, 400, { message: "Name is required" });
      if (categories.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
        return send(res, 409, { message: "Category already exists" });
      }

      const category = { id: nextCategoryId++, name };
      categories.push(category);
      return send(res, 201, category);
    }

    match = path.match(/^\/categories\/(\d+)$/);
    if (match) {
      const id = Number(match[1]);
      const index = categories.findIndex((item) => item.id === id);

      if (index < 0) {
        return send(res, 404, { message: "Category not found" });
      }

      if (req.method === "GET") {
        return send(res, 200, {
          ...categories[index],
          products: products.filter((item) => item.category_id === id),
        });
      }

      if (req.method === "PUT") {
        const data = await readBody(req);
        const name = typeof data.name === "string" ? data.name.trim() : "";

        if (!name) return send(res, 400, { message: "Name is required" });
        if (categories.some((item) => item.id !== id &&
          item.name.toLowerCase() === name.toLowerCase())) {
          return send(res, 409, { message: "Category already exists" });
        }

        categories[index].name = name;
        products.filter((item) => item.category_id === id)
          .forEach((item) => { item.category = name; });

        return send(res, 200, categories[index]);
      }

      if (req.method === "DELETE") {
        if (products.some((item) => item.category_id === id)) {
          return send(res, 409, {
            message: "Category cannot be deleted because it has products",
          });
        }

        categories.splice(index, 1);
        return send(res, 200, { message: "Category deleted successfully" });
      }
    }

    if (path === "/users" && req.method === "POST") {
      const data = await readBody(req);
      const name = typeof data.name === "string" ? data.name.trim() : "";
      const email = typeof data.email === "string" ? data.email.trim() : "";
      const password = data.password;

      if (!name || !email || typeof password !== "string" || password.length < 6) {
        return send(res, 400, { message: "Invalid registration data" });
      }

      if (users.some((item) => item.email.toLowerCase() === email.toLowerCase())) {
        return send(res, 409, { message: "Email already registered" });
      }

      const user = {
        id: nextUserId++,
        name,
        email,
        password,
        role: "customer",
        created_at: new Date().toISOString(),
      };

      users.push(user);
      return send(res, 201, publicUser(user));
    }

    if (path === "/auth/login" && req.method === "POST") {
      const data = await readBody(req);
      const user = users.find((item) =>
        item.email.toLowerCase() === String(data.email || "").trim().toLowerCase()
      );

      if (!user || user.password !== data.password) {
        return send(res, 401, { message: "Invalid email or password" });
      }

      return send(res, 200, {
        message: "Login successful",
        user: publicUser(user),
      });
    }

    if (path === "/orders" && req.method === "GET") {
      let result = [...orders];
      const userId = url.searchParams.get("user_id");
      if (userId !== null) {
        result = result.filter((item) => item.user_id === Number(userId));
      }

      const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || 20)));
      const offset = Math.max(0, Number(url.searchParams.get("offset") || 0));

      return send(res, 200, result.slice(offset, offset + limit).map(serializeOrder));
    }

    if (path === "/orders" && req.method === "POST") {
      const data = await readBody(req);
      const user = users.find((item) => item.id === Number(data.user_id));

      if (!user) return send(res, 404, { message: "User not found" });
      if (!Array.isArray(data.items) || data.items.length === 0) {
        return send(res, 400, { message: "Order items are required" });
      }

      const quantities = new Map();

      for (const item of data.items) {
        const id = Number(item.product_id);
        const quantity = Number(item.quantity);
        if (!Number.isInteger(id) || !Number.isInteger(quantity) || quantity < 1) {
          return send(res, 400, { message: "Invalid order item" });
        }
        quantities.set(id, (quantities.get(id) || 0) + quantity);
      }

      const orderItems = [];
      let total = 0;

      for (const [id, quantity] of quantities) {
        const product = products.find((item) => item.id === id);
        if (!product) return send(res, 404, { message: "Product not found" });
        if (product.stock < quantity) {
          return send(res, 409, { message: "Insufficient stock" });
        }

        orderItems.push({
          product_id: id,
          quantity,
          price: product.price,
        });
        total += product.price * quantity;
      }

      for (const item of orderItems) {
        const product = products.find((entry) => entry.id === item.product_id);
        product.stock -= item.quantity;
      }

      const order = {
        id: nextOrderId++,
        user_id: user.id,
        total,
        status: "pending",
        created_at: new Date().toISOString(),
        items: orderItems,
      };

      orders.unshift(order);
      return send(res, 201, serializeOrder(order));
    }

    match = path.match(/^\/orders\/(\d+)$/);
    if (match && req.method === "GET") {
      const order = orders.find((item) => item.id === Number(match[1]));
      return order
        ? send(res, 200, serializeOrder(order))
        : send(res, 404, { message: "Order not found" });
    }

    return send(res, 404, { message: "Mock endpoint not found" });
  } catch (error) {
    console.error("Mock API error:", error);
    return send(res, 500, { message: "Mock API internal error" });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`RevoShop E2E mock API running on http://127.0.0.1:${PORT}`);
});

