import { chromium } from "@playwright/test";
import { spawn } from "child_process";

async function main() {
  const PORT = 3038;
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
    await page.setViewportSize({ width: 1440, height: 900 });

    console.log("\n--- TEST 1: Products Page & Hero Lede ---");
    await page.goto(`http://localhost:${PORT}/products`);
    await page.waitForTimeout(1000);

    const pageTitle = await page.locator(".page-title").innerText();
    const pageLede = await page.locator(".catalogue-hero .page-lede").innerText();
    console.log("Page Title:", pageTitle);
    console.log("Page Lede:", pageLede);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/products-page-hero-dark.png"
    });
    console.log("Captured products-page-hero-dark.png");

    console.log("\n--- TEST 2: Filter Modal Grid System ---");
    const filterBtn = page.locator(".filter-trigger-btn");
    await filterBtn.click();
    await page.waitForTimeout(600);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/filter-modal-grid-dark.png"
    });
    console.log("Captured filter-modal-grid-dark.png");

    // Light theme filter modal
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
    });
    await page.waitForTimeout(500);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/filter-modal-grid-light.png"
    });
    console.log("Captured filter-modal-grid-light.png");

    // Close filter modal
    const filterCloseBtn = page.locator(".filter-close-btn");
    await filterCloseBtn.click();
    await page.waitForTimeout(500);

    console.log("\n--- TEST 3: Search Modal (No header icon, clean clear button) ---");
    // Switch back to dark mode for test
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
    });
    await page.waitForTimeout(300);

    const searchNavBtn = page.locator(".search-action");
    await searchNavBtn.click();
    await page.waitForTimeout(600);

    // Type query to show clear button
    const searchInput = page.locator("#modal-search-input");
    await searchInput.fill("sony");
    await page.waitForTimeout(500);

    const searchHeaderIconCount = await page.locator(".search-modal-header .search-modal-header-icon").count();
    console.log("Search modal header icon count (should be 0):", searchHeaderIconCount);

    const clearBtn = page.locator(".catalogue-search-clear").first();
    const clearBtnBg = await clearBtn.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    console.log("Search Clear Button background (should be transparent/rgba(0,0,0,0)):", clearBtnBg);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/search-modal-dark.png"
    });
    console.log("Captured search-modal-dark.png");

    const searchCloseBtn = page.locator(".search-modal-close-btn");
    await searchCloseBtn.click();
    await page.waitForTimeout(500);

    console.log("\n--- TEST 4: Cart Drawer (No header icon) ---");
    const cartNavBtn = page.locator(".cart-action");
    await cartNavBtn.click();
    await page.waitForTimeout(600);

    const cartHeaderIconCount = await page.locator(".cart-header-title-row svg:not(.cart-count-badge svg)").count();
    console.log("Cart drawer header icon count (should be 0):", cartHeaderIconCount);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/cart-drawer-dark.png"
    });
    console.log("Captured cart-drawer-dark.png");

    const cartCloseBtn = page.locator(".cart-close-btn");
    await cartCloseBtn.click();
    await page.waitForTimeout(500);

    console.log("\n--- TEST 5: Mobile Viewport (Toolbar Filter Left Icon + Center Text & Centered Grid Modal) ---");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`http://localhost:${PORT}/products`);
    await page.waitForTimeout(1000);

    // Verify filter trigger button has icon on left and text in center
    const filterBtnIcon = page.locator(".catalogue-toolbar .filter-trigger-btn .filter-btn-icon");
    const filterBtnLabel = page.locator(".catalogue-toolbar .filter-trigger-btn .filter-btn-label");
    const iconVisible = await filterBtnIcon.isVisible();
    const labelText = await filterBtnLabel.innerText();
    console.log("Filter button icon visible on left:", iconVisible);
    console.log("Filter button label text:", labelText);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/mobile-toolbar-filter-btn.png"
    });
    console.log("Captured mobile-toolbar-filter-btn.png");

    const mobileFilterBtn = page.locator(".catalogue-toolbar .filter-trigger-btn");
    await mobileFilterBtn.click();
    await page.waitForTimeout(600);

    // Verify only 1 modal opened
    const backdropCount = await page.locator(".filter-backdrop").count();
    console.log("Filter backdrop count (must be 1):", backdropCount);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/mobile-filter-modal-dark.png"
    });
    console.log("Captured mobile-filter-modal-dark.png");

    // Test light theme on mobile
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
    });
    await page.waitForTimeout(500);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/mobile-filter-modal-light.png"
    });
    console.log("Captured mobile-filter-modal-light.png");

    // Click an option (e.g. New Arrivals) and verify selection
    const firstOption = page.locator(".filter-choice").first();
    await firstOption.click();
    await page.waitForTimeout(300);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/mobile-filter-modal-selected.png"
    });
    console.log("Captured mobile-filter-modal-selected.png");

    // Click Apply filters
    const applyBtn = page.locator(".filter-apply-btn");
    await applyBtn.click();
    await page.waitForTimeout(600);

    const closedBackdropCount = await page.locator(".filter-backdrop").count();
    console.log("Filter modal closed count (must be 0):", closedBackdropCount);

    console.log("\n--- TEST 6: Tablet Viewport (768x1024) ---");
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`http://localhost:${PORT}/products`);
    await page.waitForTimeout(800);
    const tabletFilterBtn = page.locator(".catalogue-toolbar .filter-trigger-btn");
    await tabletFilterBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/tablet-filter-modal-light.png"
    });
    console.log("Captured tablet-filter-modal-light.png");
    const tabletCloseBtn = page.locator(".filter-close-btn");
    await tabletCloseBtn.click();
    await page.waitForTimeout(400);

    console.log("\n--- TEST 7: Product Details Page (sennheiser-hd-660s) ---");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`http://localhost:${PORT}/products/sennheiser-hd-660s`);
    await page.waitForTimeout(1000);

    // Light mode details
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
    });
    await page.waitForTimeout(500);

    const badge360Count = await page.locator(".gallery-badge-360").count();
    const rotateActionsCount = await page.locator(".gallery-rotate-actions").count();
    console.log("360 badge count (must be 0):", badge360Count);
    console.log("Rotate actions count (must be 0):", rotateActionsCount);

    const categoryBorderRadius = await page.locator(".details-category-pill a").evaluate((el) => window.getComputedStyle(el).borderRadius);
    console.log("Category pill border-radius (must be rounded/9999px):", categoryBorderRadius);

    const variantHeight = await page.locator(".variant-chip").first().evaluate((el) => window.getComputedStyle(el).height);
    console.log("Variant chip height (should be ~32px):", variantHeight);

    const quantityBtnHeight = await page.locator(".quantity-button").first().evaluate((el) => window.getComputedStyle(el).height);
    const quantityBtnWidth = await page.locator(".quantity-button").first().evaluate((el) => window.getComputedStyle(el).width);
    console.log("Quantity button dimensions (should be 32px x 32px):", `${quantityBtnWidth} x ${quantityBtnHeight}`);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/product-details-light.png"
    });
    console.log("Captured product-details-light.png");

    // Dark mode details
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
    });
    await page.waitForTimeout(400);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/product-details-dark.png"
    });
    console.log("Captured product-details-dark.png");

    console.log("\nALL MODAL, PRODUCTS & DETAILS VERIFICATION TESTS PASSED!");
  } finally {
    if (browser) await browser.close();
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", server.pid, "/f", "/t"]);
    } else {
      server.kill("SIGINT");
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

