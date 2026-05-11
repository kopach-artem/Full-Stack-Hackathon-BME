import { expect, test } from "@playwright/test";

test("student can log in, see subjects and grades, then log out", async ({ page }) => {
  await page.goto("/login");

  await page.getByPlaceholder("you@school.edu").fill("toth.bela@school.edu");
  await page.getByPlaceholder("••••••••").fill("student123");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/student$/);
  await expect(page.getByRole("heading", { name: /Welcome/ })).toBeVisible();
  await expect(page.getByText("Class: 2024/A")).toBeVisible();

  await page
    .locator('a[href="/student/subjects"]')
    .filter({ hasText: "View subjects assigned to your class" })
    .click();

  await expect(page).toHaveURL(/\/student\/subjects$/);
  await expect(page.getByRole("heading", { name: "My Subjects" })).toBeVisible();
  await expect(page.getByText("Class 2024/A")).toBeVisible();
  await expect(page.getByText("Mathematics")).toBeVisible();

  await page.getByText("Mathematics").click();

  await expect(page).toHaveURL(/\/student\/grades\?assignmentId=/);
  await expect(page.getByRole("heading", { name: "My Grades" })).toBeVisible();
  await expect(page.getByText("Mathematics")).toBeVisible();
  await expect(page.getByText("Regular avg")).toBeVisible();
  await expect(page.getByText("3.60", { exact: true }).first()).toBeVisible();

  await page.getByRole("button", { name: "Logout" }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});
