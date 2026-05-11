import { expect, test } from "@playwright/test";
import { login, logout } from "./helpers";

test("admin can inspect seeded users, classes, subjects and assignments", async ({ page }) => {
  await login(page, "admin@school.edu", "admin123");
  await expect(page).toHaveURL(/\/admin$/);

  await page.locator("nav").getByRole("link", { name: "Users" }).click();
  await expect(page.getByRole("heading", { name: "User Management" })).toBeVisible();
  await expect(page.getByText("kovacs.peter@school.edu").first()).toBeVisible();
  await expect(page.getByText("toth.bela@school.edu")).toBeVisible();

  await page.locator("nav").getByRole("link", { name: "Classes" }).click();
  await expect(page.getByRole("heading", { name: "Class Management" })).toBeVisible();
  await expect(page.getByText("2024/A")).toBeVisible();
  await expect(page.getByText("2024/B")).toBeVisible();

  await page.locator("nav").getByRole("link", { name: "Subjects" }).click();
  await expect(page.getByRole("heading", { name: "Subject Management" })).toBeVisible();
  await expect(page.getByText("Mathematics")).toBeVisible();
  await expect(page.getByText("Physics")).toBeVisible();

  await page.locator("nav").getByRole("link", { name: "Assignments" }).click();
  await expect(page.getByRole("heading", { name: "Subject Assignments" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Mathematics" }).first()).toBeVisible();
  await expect(page.getByText("kovacs.peter@school.edu").first()).toBeVisible();

  await logout(page);
});
