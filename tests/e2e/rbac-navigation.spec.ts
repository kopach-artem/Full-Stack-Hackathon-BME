import { expect, test } from "@playwright/test";
import { login, logout } from "./helpers";

test("student cannot open admin or teacher routes", async ({ page }) => {
  await login(page, "toth.bela@school.edu", "student123");
  await expect(page).toHaveURL(/\/student$/);

  await page.goto("/admin/users");
  await expect(page).toHaveURL(/\/student$/);
  await expect(page.getByText("Class: 2024/A")).toBeVisible();

  await page.goto("/teacher/grades");
  await expect(page).toHaveURL(/\/student$/);
  await expect(page.getByRole("heading", { name: /Welcome/ })).toBeVisible();

  await logout(page);
});
