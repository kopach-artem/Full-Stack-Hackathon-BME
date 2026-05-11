import { defineConfig, devices } from "@playwright/test";

const pnpm = process.platform === "win32"
  ? `"${process.env.APPDATA}\\npm\\pnpm.cmd"`
  : "pnpm";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: {
    timeout: 10_000
  },
  use: {
    baseURL: "http://localhost:5173",
    trace: "retain-on-failure"
  },
  webServer: {
    command: `${pnpm} dev`,
    url: "http://localhost:5173/login",
    reuseExistingServer: true,
    timeout: 60_000
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
