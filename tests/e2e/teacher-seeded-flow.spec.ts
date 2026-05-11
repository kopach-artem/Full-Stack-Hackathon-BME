import { expect, test } from "@playwright/test";
import { login, logout } from "./helpers";

test("teacher can inspect own subjects and open grade entry", async ({ page }) => {
  await login(page, "kovacs.peter@school.edu", "teacher123");
  await expect(page).toHaveURL(/\/teacher$/);

  await page.locator("nav").getByRole("link", { name: "My Subjects" }).click();
  await expect(page.getByRole("heading", { name: "My Subjects" })).toBeVisible();
  const math2024A = page
    .locator('[class*="cursor-pointer"]')
    .filter({ hasText: "Mathematics" })
    .filter({ hasText: "Class 2024/A" })
    .first();

  await expect(math2024A).toBeVisible();
  await math2024A.click();
  await expect(page).toHaveURL(/\/teacher\/grades\?assignmentId=/);
  await expect(page.getByRole("heading", { name: "Grade Entry" })).toBeVisible();
  await expect(page.getByText(/Class 2024\/A/)).toBeVisible();
  await expect(page.getByText("toth.bela@school.edu")).toBeVisible();
  await expect(page.getByText("kiss.eva@school.edu")).toBeVisible();
  await expect(page.getByText("Class avg (regular)")).toBeVisible();

  await logout(page);
});
