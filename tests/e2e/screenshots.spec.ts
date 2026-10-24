import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

test("capture Checkpoint 3 UI screenshots", async ({ page }) => {
  const screenshotDir = path.resolve("docs/screenshots");
  await mkdir(screenshotDir, { recursive: true });

  await page.setViewportSize({ width: 1440, height: 1000 });

  // Home
  await page.goto("/");
  await expect(page.locator("main")).toBeVisible();
  await page.screenshot({
    path: path.join(screenshotDir, "checkpoint3-home.png"),
    fullPage: true,
  });

  // Product catalog
  await page.goto("/products");
  await expect(
    page.getByRole("heading", { name: "Product Catalog" })
  ).toBeVisible();
  await page.screenshot({
    path: path.join(screenshotDir, "checkpoint3-products.png"),
    fullPage: true,
  });

  // Product detail
  await page.goto("/products/1");
  await expect(page.locator("main h1").first()).toBeVisible();
  await page.screenshot({
    path: path.join(screenshotDir, "checkpoint3-product-detail.png"),
    fullPage: true,
  });

  // Categories
  await page.goto("/categories");
  await expect(page.locator("main h1").first()).toBeVisible();
  await page.screenshot({
    path: path.join(screenshotDir, "checkpoint3-categories.png"),
    fullPage: true,
  });

  // Register
  await page.goto("/register");
  await expect(
    page.getByRole("heading", { name: "Create your account" })
  ).toBeVisible();
  await page.screenshot({
    path: path.join(screenshotDir, "checkpoint3-register.png"),
    fullPage: true,
  });

  // Login
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { name: "Welcome back" })
  ).toBeVisible();
  await page.screenshot({
    path: path.join(screenshotDir, "checkpoint3-login.png"),
    fullPage: true,
  });

  // Admin dashboard: requires the test-only mock admin credentials.
  const adminEmail = process.env.E2E_ADMIN_EMAIL;
  const adminPassword = process.env.E2E_ADMIN_PASSWORD;

  expect(
    adminEmail && adminPassword,
    "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD before screenshot capture."
  ).toBeTruthy();

  await page.getByLabel("Email address").fill(adminEmail!);
  await page.getByLabel("Password", { exact: true }).fill(adminPassword!);
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(
    page.getByRole("heading", { name: "Product Dashboard" })
  ).toBeVisible();

  await page.screenshot({
    path: path.join(screenshotDir, "checkpoint3-admin-dashboard.png"),
    fullPage: true,
  });

  // Admin category management
  await page.goto("/dashboard/categories");
  await expect(
    page.getByRole("heading", { name: "Category Management" })
  ).toBeVisible();
  await page.screenshot({
    path: path.join(screenshotDir, "checkpoint3-admin-categories.png"),
    fullPage: true,
  });
});
