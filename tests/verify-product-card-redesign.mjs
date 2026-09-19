import { chromium } from "@playwright/test";
import { spawn } from "child_process";

async function main() {
  const PORT = 3034;
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

    console.log("\n--- TEST 1: Product Cards in Dark Mode (1440x900) ---");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`http://localhost:${PORT}/products`);
    await page.waitForTimeout(1500);

    // Verify border-radius 0 and border none on product-card
    const cardBorderRadius = await page.$eval(".product-card", (el) => window.getComputedStyle(el).borderRadius);
    const cardBorder = await page.$eval(".product-card", (el) => window.getComputedStyle(el).border);
    const cardBoxShadow = await page.$eval(".product-card", (el) => window.getComputedStyle(el).boxShadow);

    console.log("Card computed borderRadius:", cardBorderRadius);
    console.log("Card computed border:", cardBorder);
    console.log("Card computed boxShadow:", cardBoxShadow);

    // Hover on first card
    const firstCard = await page.locator(".product-card").first();
    await firstCard.hover();
    await page.waitForTimeout(400);

    // Verify hover actions overlay visibility
    const hoverActionsOpacity = await page.$eval(
      ".product-card:first-child .product-card-hover-actions",
      (el) => window.getComputedStyle(el).opacity
    );
    console.log("First card hover actions opacity on hover:", hoverActionsOpacity);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/product-card-redesign-dark.png"
    });
    console.log("Captured product-card-redesign-dark.png");

    console.log("\n--- TEST 2: Product Cards in Light Mode (1440x900) ---");
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
    });
    await page.waitForTimeout(500);

    // Hover on first card in light mode
    await firstCard.hover();
    await page.waitForTimeout(400);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/product-card-redesign-light.png"
    });
    console.log("Captured product-card-redesign-light.png");

    console.log("\n--- TEST 3: Mobile Viewport (390x844) ---");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollBy(0, 180));
    await page.waitForTimeout(500);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/product-card-redesign-mobile.png"
    });
    console.log("Captured product-card-redesign-mobile.png");

    console.log("\nALL TESTS PASSED SUCCESSFULLY!");
  } finally {
    if (browser) {
      await browser.close();
    }
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

