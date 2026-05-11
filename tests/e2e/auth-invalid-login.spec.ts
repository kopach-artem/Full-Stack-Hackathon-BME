import { expect, test } from "@playwright/test";

test("invalid credentials keep the user on login page", async ({ page }) => {
  await page.goto("/login");

  await page.getByPlaceholder("you@school.edu").fill("admin@school.edu");
  await page.getByPlaceholder("••••••••").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText("Invalid email or password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});
