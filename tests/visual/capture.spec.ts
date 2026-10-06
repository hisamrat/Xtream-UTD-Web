import { expect, test } from "@playwright/test";

/**
 * Captures full-page screenshots of every route in both themes so layouts can be
 * compared before and after a change. Output: test-artifacts/screens/<label>/.
 * Run with: SCREEN_LABEL=after npm run test:e2e -- tests/visual
 */
const label = process.env.SCREEN_LABEL ?? "current";

const routes = [
  { name: "home", path: "/" },
  { name: "explore", path: "/explore" },
  { name: "products", path: "/products" },
  { name: "products-search", path: "/products?q=light" },
  { name: "products-empty", path: "/products?q=zzzz-no-match" },
  { name: "product-details", path: "/products/refillable-perfume-bottle-8ml" },
  { name: "about", path: "/about" },
  { name: "contact", path: "/contact" },
  { name: "terms", path: "/terms" },
  { name: "offline", path: "/offline" },
  { name: "not-found", path: "/products/does-not-exist" }
];

for (const theme of ["dark", "light"] as const) {
  for (const route of routes) {
    test(`${route.name} (${theme})`, async ({ page }, testInfo) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });

      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.addInitScript((value) => {
        window.localStorage.setItem("xtream-theme", value);
        window.sessionStorage.setItem("xtream-utd:home-swap-offset", "0");
        Math.random = () => 0;
      }, theme);

      await page.goto(route.path, { waitUntil: "networkidle" });
      await page.waitForTimeout(2200);
      await page.screenshot({
        path: `test-artifacts/screens/${label}/${testInfo.project.name}/${route.name}-${theme}.png`,
        fullPage: route.name !== "home",
        animations: "disabled"
      });

      const relevantErrors = errors.filter((message) => !/Failed to load resource/i.test(message));
      expect(relevantErrors, relevantErrors.join("\n")).toEqual([]);
    });
  }
}
