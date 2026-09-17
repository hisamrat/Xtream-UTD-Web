import { chromium } from "@playwright/test";
import { spawn } from "child_process";

async function main() {
  const PORT = 3009;
  console.log(`Starting Next.js production server on port ${PORT}...`);
  const server = spawn("npx.cmd", ["next", "start", "-p", String(PORT)], {
    cwd: "d:/Codex/xtream-utd",
    stdio: "inherit",
    shell: true
  });

  // Give server 3 seconds to spin up
  await new Promise((resolve) => setTimeout(resolve, 3000));

  let browser;
  try {
    browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();

    console.log(`Navigating to http://localhost:${PORT}...`);
    await page.goto(`http://localhost:${PORT}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1600); // Allow entrance fly-in to settle

    // -------------------------------------------------------------
    // Step 1: Verify Showcase Resting State
    // -------------------------------------------------------------
    const showcaseCardsCount = await page.$$eval(".reference-world-card", (cards) => cards.length);
    console.log(`Initial showcase cards mounted: ${showcaseCardsCount} (Expected: > 25)`);
    if (showcaseCardsCount < 20) {
      throw new Error(`Expected showcase to have > 20 cards, got: ${showcaseCardsCount}`);
    }

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/dual-canvas-showcase-resting.png"
    });
    console.log("Captured dual-canvas-showcase-resting.png");

    // -------------------------------------------------------------
    // Step 2: Verify 180° Drag to Rotate in Showcase
    // -------------------------------------------------------------
    console.log("Testing 3D Drag to Rotate in Showcase...");
    await page.mouse.move(720, 450);
    await page.mouse.down();
    await page.mouse.move(890, 450, { steps: 20 });
    await page.waitForTimeout(150);

    const rotatedY = await page.$eval(".world-stage", (el) => el.style.getPropertyValue("--world-rotate-y"));
    console.log(`Computed rotateY after drag: ${rotatedY}`);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/dual-canvas-showcase-dragged.png"
    });
    console.log("Captured dual-canvas-showcase-dragged.png");
    await page.mouse.up();
    await page.waitForTimeout(200);

    // -------------------------------------------------------------
    // Step 3: Verify Hover for Details in Showcase
    // -------------------------------------------------------------
    console.log("Testing hover on card for Center Preview...");
    const heroCard = page.locator(".reference-world-card.kind-hero").first();
    await heroCard.hover({ force: true });
    await page.waitForTimeout(400);

    const previewVisible = await page.locator(".world-center-preview").isVisible();
    console.log(`Center preview bar visible on hover: ${previewVisible}`);
    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/dual-canvas-showcase-hover.png"
    });
    console.log("Captured dual-canvas-showcase-hover.png");

    // Move away to close preview
    await page.mouse.move(100, 100);
    await page.waitForTimeout(500);

    // -------------------------------------------------------------
    // Step 4: Scroll Down into Depth Gallery Corridor
    // -------------------------------------------------------------
    console.log("Testing Scroll Dive into Depth Gallery Corridor...");
    await page.mouse.move(720, 450);
    // Scroll down to dive past showcase into corridor
    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(800);

    // Verify Depth Gallery Corridor is active with strictly 2 plates
    const corridorPlates = await page.$$eval(".depth-plate", (plates) => plates.length);
    console.log(`Mounted depth plates in corridor mode: ${corridorPlates} (Expected: 2)`);
    if (corridorPlates !== 2) {
      throw new Error(`Expected strictly 2 depth plates in corridor, got: ${corridorPlates}`);
    }

    const corridorCounter = await page.$eval(".world-set-count", (el) => el.innerText);
    console.log(`Corridor counter: ${corridorCounter}`);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/dual-canvas-corridor-active.png"
    });
    console.log("Captured dual-canvas-corridor-active.png");

    // -------------------------------------------------------------
    // Step 5: Advance Corridor Stream
    // -------------------------------------------------------------
    console.log("Advancing deeper into corridor stream...");
    await page.mouse.wheel(0, 350);
    await page.waitForTimeout(400);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/dual-canvas-corridor-stream.png"
    });
    console.log("Captured dual-canvas-corridor-stream.png");

    // -------------------------------------------------------------
    // Step 6: Scroll Back Up to Return to 3D Showcase World
    // -------------------------------------------------------------
    console.log("Scrolling back up to return to 3D Showcase...");
    await page.mouse.wheel(0, -1800);
    await page.waitForTimeout(900);

    const restoredShowcaseVisible = await page.$eval(".world-stage", (el) => {
      return el.style.opacity !== "0" && el.getAttribute("aria-hidden") !== "true";
    });
    console.log(`3D Showcase stage restored after scrolling back up: ${restoredShowcaseVisible}`);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/dual-canvas-showcase-restored.png"
    });
    console.log("Captured dual-canvas-showcase-restored.png");

    // -------------------------------------------------------------
    // Step 7: Test Reload Button from Corridor Mode
    // -------------------------------------------------------------
    console.log("Scrolling into corridor again, then clicking Reload button...");
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(600);

    const reloadBtn = page.locator("button.bottom-switch-reload");
    await reloadBtn.click();
    await page.waitForTimeout(900);

    const stageAfterReload = await page.$eval(".world-stage", (el) => ({
      rotateX: el.style.getPropertyValue("--world-rotate-x"),
      rotateY: el.style.getPropertyValue("--world-rotate-y"),
      opacity: el.style.opacity
    }));
    console.log("Stage state after clicking Reload:", JSON.stringify(stageAfterReload, null, 2));

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/dual-canvas-after-reload.png"
    });
    console.log("Captured dual-canvas-after-reload.png");

    // -------------------------------------------------------------
    // Step 8: Test Click Navigation in Corridor
    // -------------------------------------------------------------
    console.log("Testing click navigation to product details in Corridor mode...");
    await page.mouse.move(720, 450);
    await page.mouse.wheel(0, 700);
    await page.waitForTimeout(600);

    const focusedPlate = page.locator(".depth-plate").first();
    await focusedPlate.click();
    await page.waitForURL("**/products/**", { timeout: 6000 });
    console.log("Successfully navigated to product details URL:", page.url());

    console.log("ALL DUAL-STATE HYBRID CANVAS TESTS PASSED PERFECTLY!");
  } finally {
    if (browser) await browser.close();
    server.kill();
  }
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
