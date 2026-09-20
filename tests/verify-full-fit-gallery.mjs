import { chromium } from "@playwright/test";
import { spawn } from "child_process";

async function main() {
  const PORT = 3046;
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
    page.on("console", (msg) => console.log(`[BROWSER]: ${msg.text()}`));
    page.on("pageerror", (err) => console.error(`[BROWSER ERROR]: ${err}`));
    page.on("requestfailed", (req) => console.log(`[FAILED REQ]: ${req.url()}`));

    console.log("\n--- TEST 1: Blackmagic Details Showcase Card ---");
    await page.goto(`http://localhost:${PORT}/products/blackmagic-pocket-cinema-6k`);
    await page.waitForTimeout(2000);

    const blackmagicGalleryBox = await page.locator(".gallery-main").boundingBox();
    const blackmagicThumbBox = await page.locator(".thumbnail-button").first().boundingBox();
    console.log("Blackmagic Gallery Box:", blackmagicGalleryBox);
    console.log("Blackmagic Thumbnail Box:", blackmagicThumbBox);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/blackmagic-details-restored.png"
    });
    console.log("Captured blackmagic-details-restored.png");

    console.log("\n--- TEST 2: Sony A7 IV Details Showcase Card ---");
    await page.goto(`http://localhost:${PORT}/products/sony-a7-iv`);
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/sony-details-restored.png"
    });
    console.log("Captured sony-details-restored.png");

    console.log("\n--- TEST 3: Products Catalogue Grid (main_image) ---");
    await page.goto(`http://localhost:${PORT}/products`);
    await page.waitForTimeout(1000);

    const productCardMediaBox = await page.locator(".product-media").first().boundingBox();
    console.log("Product Card Media Box:", productCardMediaBox);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/catalogue-cards-restored.png"
    });
    console.log("Captured catalogue-cards-restored.png");

    console.log("\n--- ALL TESTS COMPLETED SUCCESSFULLY ---");
  } catch (err) {
    console.error("Test failed with error:", err);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    server.kill("SIGTERM");
    setTimeout(() => {
      try {
        process.kill(server.pid);
      } catch {}
    }, 1000);
  }
}

main();
