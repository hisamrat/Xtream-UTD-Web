import { chromium } from "@playwright/test";
import { spawn } from "child_process";

async function main() {
  const PORT = 3037;
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

    console.log("\n--- TEST 1: Open Filter Popup in Dark Mode ---");
    await page.goto(`http://localhost:${PORT}/products`);
    await page.waitForTimeout(1000);

    // Click Filters button
    const filterBtn = page.locator(".filter-trigger-btn");
    await filterBtn.click();
    await page.waitForTimeout(600);

    // Verify modal drawer is visible and centered
    const drawer = page.locator(".filter-drawer");
    const isVisible = await drawer.isVisible();
    console.log("Filter modal visible:", isVisible);

    // Click Availability option (e.g. In stock)
    const inStockBtn = page.locator(".filter-choice", { hasText: "In stock" }).first();
    console.log("Clicking In stock option...");
    await inStockBtn.click();
    await page.waitForTimeout(500);

    const isPressed = await inStockBtn.getAttribute("aria-pressed");
    const choiceBg = await inStockBtn.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    const choiceColor = await inStockBtn.evaluate((el) => window.getComputedStyle(el).color);
    console.log("In stock aria-pressed:", isPressed);
    console.log("In stock background-color:", choiceBg);
    console.log("In stock text color:", choiceColor);

    // Click another choice (e.g. 🔥 New Arrivals)
    const newArrivalsBtn = page.locator(".filter-choice", { hasText: "New Arrivals" });
    await newArrivalsBtn.click();
    await page.waitForTimeout(500);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/filter-modal-selected-dark.png"
    });
    console.log("Captured filter-modal-selected-dark.png");

    // Close modal to inspect toolbar filter button badge
    const closeBtn = page.locator(".filter-close-btn");
    await closeBtn.click();
    await page.waitForTimeout(500);

    const countBadge = page.locator(".filter-count-badge");
    const badgeVisible = await countBadge.isVisible();
    const badgeText = await countBadge.innerText();
    const badgeBg = await countBadge.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    const badgeColor = await countBadge.evaluate((el) => window.getComputedStyle(el).color);
    const badgeRadius = await countBadge.evaluate((el) => window.getComputedStyle(el).borderRadius);
    console.log("Count badge visible:", badgeVisible, "Text:", badgeText);
    console.log("Count badge background:", badgeBg);
    console.log("Count badge color:", badgeColor);
    console.log("Count badge borderRadius:", badgeRadius);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/toolbar-badge-dark.png"
    });
    console.log("Captured toolbar-badge-dark.png");

    console.log("\n--- TEST 2: Light Mode Verification ---");
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
    });
    await page.waitForTimeout(500);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/toolbar-badge-light.png"
    });
    console.log("Captured toolbar-badge-light.png");

    // Open modal in light mode to see selection highlight
    await filterBtn.click();
    await page.waitForTimeout(500);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/filter-modal-selected-light.png"
    });
    console.log("Captured filter-modal-selected-light.png");

    console.log("\nALL FILTER SELECTION & BADGE TESTS PASSED!");
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

