import { test, expect } from "@playwright/test";

test("admin can create, edit, and delete categories and products", async ({
  page,
}) => {
  const adminEmail = process.env.E2E_ADMIN_EMAIL;
  const adminPassword = process.env.E2E_ADMIN_PASSWORD;

  test.skip(
    !adminEmail || !adminPassword,
    "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run this test."
  );

  const suffix = `${Date.now()}`;
  const categoryName = `E2E Category ${suffix}`;
  const updatedCategoryName = `E2E Updated Category ${suffix}`;
  const productName = `E2E Product ${suffix}`;
  const updatedProductName = `E2E Updated Product ${suffix}`;

  // Sign in as an administrator.
  await page.goto("/login");
  await page.getByLabel("Email address").fill(adminEmail!);
  await page.getByLabel("Password", { exact: true }).fill(adminPassword!);
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });

  // Create a category.
  await page.goto("/dashboard/categories");
  await page.getByLabel("Category name").fill(categoryName);
  await page.getByRole("button", { name: "Create Category" }).click();

  const categoryRow = page
    .getByText(categoryName, { exact: true })
    .locator("xpath=../..");

  await expect(categoryRow).toBeVisible();

  // Edit the category.
  await categoryRow.getByRole("button", { name: "Edit" }).click();
  await page.getByLabel("Category name").fill(updatedCategoryName);
  await page.getByRole("button", { name: "Save Changes" }).click();

  const updatedCategoryRow = page
    .getByText(updatedCategoryName, { exact: true })
    .locator("xpath=../..");

  await expect(updatedCategoryRow).toBeVisible();

  // Create a product using the new category.
  await page.goto("/dashboard");
  await page.getByLabel("Product name").fill(productName);
  await page.getByLabel("Category", { exact: true }).selectOption({
    label: updatedCategoryName,
  });
  await page.getByLabel("Price (IDR)").fill("125000");
  await page.getByLabel("Stock").fill("5");
  await page.getByLabel("Description").fill("Created by Playwright E2E test");

  await page.getByRole("button", { name: "Create Product" }).click();

  const productRow = page
    .getByText(productName, { exact: true })
    .locator("xpath=../..");

  await expect(productRow).toBeVisible();

  // Edit the product.
  await productRow.getByRole("button", { name: "Edit" }).click();
  await page.getByLabel("Product name").fill(updatedProductName);
  await page.getByRole("button", { name: "Save Changes" }).click();

  const updatedProductRow = page
    .getByText(updatedProductName, { exact: true })
    .locator("xpath=../..");

  await expect(updatedProductRow).toBeVisible();

  // Delete the product, accepting the confirmation dialog.
  page.once("dialog", (dialog) => dialog.accept());
  await updatedProductRow.getByRole("button", { name: "Delete" }).click();
  await expect(updatedProductRow).toHaveCount(0);

  // The category is now unused, so it can be deleted.
  await page.goto("/dashboard/categories");

  const categoryToDelete = page
    .getByText(updatedCategoryName, { exact: true })
    .locator("xpath=../..");

  await expect(categoryToDelete).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await categoryToDelete.getByRole("button", { name: "Delete" }).click();

  await expect(
    page.getByText(updatedCategoryName, { exact: true })
  ).toHaveCount(0);
});
