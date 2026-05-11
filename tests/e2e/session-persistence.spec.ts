import { expect, test } from "@playwright/test";
import { login } from "./helpers";

test("student session survives a page reload", async ({ page }) => {
  await login(page, "toth.bela@school.edu", "student123");

  await expect(page).toHaveURL(/\/student$/);
  await expect(page.getByText("Class: 2024/A")).toBeVisible();

  await page.reload();

  await expect(page).toHaveURL(/\/student$/);
  await expect(page.getByRole("heading", { name: /Welcome/ })).toBeVisible();
  await expect(page.getByText("Class: 2024/A")).toBeVisible();
});
