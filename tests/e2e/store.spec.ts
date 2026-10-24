import { test, expect, type Page } from "@playwright/test";

interface ApiProduct {
  id: number;
  name: string;
  stock: number;
}

async function registerCustomer(page: Page) {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const email = `e2e-${unique}@example.com`;
  const password = "E2eTest123!";
  const name = "E2E Customer";

  await page.goto("/register");
  await page.getByLabel("Full name").fill(name);
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password").fill(password);

  await page.getByRole("button", { name: "Register" }).click();
  await expect(page).toHaveURL(/\/$/);

  return { email, password, name };
}

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Login" }).click();
}

test("customer can register and log in", async ({ page }) => {
  const customer = await registerCustomer(page);

  await page.getByRole("button", { name: /logout/i }).click();
  await login(page, customer.email, customer.password);

  await expect(page).toHaveURL(/\/$/);
});

test("customer can browse, add a product to cart, and check out", async ({
  page,
}) => {
  const customer = await registerCustomer(page);

  const apiBase = "http://127.0.0.1:5001";

  const productsResponse = await page.request.get(
    `${apiBase.replace(/\/$/, "")}/products`
  );

  expect(
    productsResponse.ok(),
    "The Flask API must be running and the products endpoint must respond."
  ).toBeTruthy();

  const products = (await productsResponse.json()) as ApiProduct[];
  const product = products.find(
    (candidate) => Number(candidate.stock) > 0
  );

  expect(
    product,
    "At least one database product must have stock greater than zero."
  ).toBeTruthy();

  await page.goto("/products");

  const productHeading = page.getByRole("heading", {
    name: product!.name,
    exact: true,
  });

  const productCard = productHeading.locator("xpath=..");
  const addToCart = productCard.getByRole("button", {
    name: "Add to Cart",
  });

  await expect(addToCart).toBeEnabled();
  await addToCart.click();

  await page.goto("/cart");
  await expect(page.getByText(product!.name, { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Proceed to Checkout" })
  ).toBeEnabled();

  await page.getByRole("button", { name: "Proceed to Checkout" }).click();
  await expect(page).toHaveURL(/\/checkout$/);

  await expect(page.getByText(`Order placed by ${customer.name} (${customer.email})`, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Confirm Order" }).click();

  await expect(page).toHaveURL(/\/orders$/);
  await expect(page.getByRole("heading", { name: "My Orders" })).toBeVisible();
});


