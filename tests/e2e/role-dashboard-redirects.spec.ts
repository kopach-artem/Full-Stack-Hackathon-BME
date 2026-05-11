import { expect, test } from "@playwright/test";
import { login, logout } from "./helpers";

test("student is redirected to the student dashboard after login", async ({ page }) => {
  await login(page, "toth.bela@school.edu", "student123");

  await expect(page).toHaveURL(/\/student$/);
  await expect(page.getByText("Class: 2024/A")).toBeVisible();

  await logout(page);
});

test("teacher is redirected to the teacher dashboard after login", async ({ page }) => {
  await login(page, "kovacs.peter@school.edu", "teacher123");

  await expect(page).toHaveURL(/\/teacher$/);
  await expect(page.getByRole("heading", { name: /Welcome/ })).toBeVisible();

  await logout(page);
});

test("admin is redirected to the admin dashboard after login", async ({ page }) => {
  await login(page, "admin@school.edu", "admin123");

  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "Admin Panel" })).toBeVisible();
  await expect(page.getByText("Logged in as School Admin")).toBeVisible();

  await logout(page);
});

test("superadmin is redirected to the superadmin dashboard after login", async ({ page }) => {
  await login(page, "superadmin@school.edu", "superadmin123");

  await expect(page).toHaveURL(/\/superadmin$/);
  await expect(page.getByRole("heading", { name: "Super Admin Panel" })).toBeVisible();
  await expect(page.getByText("Logged in as Super Admin")).toBeVisible();

  await logout(page);
});
