import { expect, test } from "@playwright/test";

test("guest is redirected to login from protected student route", async ({ page }) => {
  await page.goto("/student/grades");

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});

test("guest is redirected to login from protected teacher route", async ({ page }) => {
  await page.goto("/teacher/grades");

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});

test("guest is redirected to login from protected admin route", async ({ page }) => {
  await page.goto("/admin/users");

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});
