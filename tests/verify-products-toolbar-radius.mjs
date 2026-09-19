import { chromium } from "@playwright/test";
import { spawn } from "child_process";

async function main() {
  const PORT = 3033;
  console.log(`Starting Next.js server on port ${PORT}...`);
  const server = spawn("npx.cmd", ["next", "start", "-p", String(PORT)], {
    cwd: "d:/Codex/xtream-utd",
    stdio: "inherit",
    shell: true
  });

  await new Promise((resolve) => setTimeout(resolve, 3500));

  let browser;
  try {
    browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log("\n--- TEST 1: Products Toolbar in Light Mode (1440x900) ---");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`http://localhost:${PORT}/products`);
    await page.waitForTimeout(1500);

    // Switch to light mode to match user screenshot
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
    });
    await page.waitForTimeout(500);

    // Verify computed border-radius on search field, category button, filters button, and sort button
    const searchRadius = await page.$eval(".catalogue-search-field", (el) => window.getComputedStyle(el).borderRadius);
    const categoryRadius = await page.$eval(".catalogue-dropdown-btn", (el) => window.getComputedStyle(el).borderRadius);
    const filterRadius = await page.$eval(".filter-trigger-btn", (el) => window.getComputedStyle(el).borderRadius);
    const sortRadius = await page.$eval(".catalogue-sort-btn", (el) => window.getComputedStyle(el).borderRadius);

    console.log("Search field border-radius:", searchRadius);
    console.log("Category button border-radius:", categoryRadius);
    console.log("Filters button border-radius:", filterRadius);
    console.log("Sort button border-radius:", sortRadius);

    if (searchRadius !== "0px" || categoryRadius !== "0px" || filterRadius !== "0px" || sortRadius !== "0px") {
      throw new Error(`FAIL: Expected 0px border-radius, got search=${searchRadius}, category=${categoryRadius}, filter=${filterRadius}, sort=${sortRadius}`);
    }

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/products-toolbar-light.png"
    });
    console.log("Captured products-toolbar-light.png");

    console.log("\n--- TEST 2: Products Toolbar in Dark Mode (1440x900) ---");
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
    });
    await page.waitForTimeout(500);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/products-toolbar-dark.png"
    });
    console.log("Captured products-toolbar-dark.png");

    console.log("\nALL PRODUCTS TOOLBAR RADIUS TESTS PASSED!");
  } finally {
    if (browser) {
      await browser.close();
    }
    server.kill();
  }
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

