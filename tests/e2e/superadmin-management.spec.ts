import { expect, test } from "@playwright/test";
import { login, logout } from "./helpers";

test("superadmin can inspect admin and superadmin management", async ({ page }) => {
  await login(page, "superadmin@school.edu", "superadmin123");
  await expect(page).toHaveURL(/\/superadmin$/);

  await page.locator("nav").getByRole("link", { name: "Admins" }).click();
  await expect(page.getByRole("heading", { name: "Admin Management" })).toBeVisible();
  await expect(page.getByText("admin@school.edu")).toBeVisible();

  await page.getByRole("button", { name: /Super Admins/ }).click();
  await expect(page.getByText("superadmin@school.edu")).toBeVisible();

  await page.locator("nav").getByRole("link", { name: "Users" }).click();
  await expect(page).toHaveURL(/\/admin\/users$/);
  await expect(page.getByRole("heading", { name: "User Management" })).toBeVisible();

  await logout(page);
});
