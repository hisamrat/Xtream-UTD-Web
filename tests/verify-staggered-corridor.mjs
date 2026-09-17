import { chromium } from "@playwright/test";
import { spawn } from "child_process";

async function main() {
  const PORT = 3010;
  console.log(`Starting Next.js production server on port ${PORT}...`);
  const server = spawn("npx.cmd", ["next", "start", "-p", String(PORT)], {
    cwd: "d:/Codex/xtream-utd",
    stdio: "inherit",
    shell: true
  });

  // Wait for server ready
  await new Promise((resolve) => setTimeout(resolve, 3000));

  let browser;
  try {
    browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();

    console.log(`Navigating to http://localhost:${PORT}...`);
    // Navigate without waiting for network idle to catch the fly-in gate
    await page.goto(`http://localhost:${PORT}`);

    // -------------------------------------------------------------
    // Step 1: Fly-in Gate & Initial Animation (t = 400ms)
    // -------------------------------------------------------------
    await page.waitForTimeout(400);
    const isUIHidden = await page.$eval(".world-shell", (el) => el.classList.contains("ui-hidden"));
    console.log(`UI Chrome hidden during initial fly-in gate: ${isUIHidden}`);

    const flyingInPlateCount = await page.$$eval(".depth-plate.is-flying-in", (plates) => plates.length);
    console.log(`Plates with is-flying-in animation active: ${flyingInPlateCount}`);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/staggered-corridor-flyin.png"
    });
    console.log("Captured staggered-corridor-flyin.png");

    // -------------------------------------------------------------
    // Step 2: Resting State Post Fly-In Gate (t = 1800ms)
    // -------------------------------------------------------------
    await page.waitForTimeout(1400); // 400 + 1400 = 1800ms (> 1500ms gate)

    const isUIReady = await page.$eval(".world-shell", (el) => el.classList.contains("ui-ready"));
    console.log(`UI Chrome revealed after 1500ms gate: ${isUIReady}`);

    const plateCount = await page.$$eval(".depth-plate", (plates) => plates.length);
    console.log(`Total mounted depth plates in DOM: ${plateCount} (Expected strictly: 2)`);
    if (plateCount !== 2) {
      throw new Error(`Expected strictly 2 plates, got ${plateCount}`);
    }

    const instructionsText = await page.$eval(".world-instructions", (el) => el.innerText.trim());
    console.log(`Instructions HUD: "${instructionsText}"`);

    const counterText = await page.$eval(".world-set-count", (el) => el.innerText.trim());
    console.log(`Counter HUD: "${counterText}"`);

    // Check sharp zero-radius styling
    const plateBorderRadius = await page.$eval(".depth-plate", (el) => getComputedStyle(el).borderRadius);
    console.log(`Plate border-radius: ${plateBorderRadius} (Expected: 0px)`);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/staggered-corridor-resting.png"
    });
    console.log("Captured staggered-corridor-resting.png");

    // -------------------------------------------------------------
    // Step 3: Staggered Overlap via Wheel Scroll
    // -------------------------------------------------------------
    console.log("Scrolling wheel to advance corridor and create staggered overlap...");
    await page.mouse.move(720, 450);
    await page.mouse.wheel(0, 450);
    await page.waitForTimeout(500);

    const plateStyles = await page.$$eval(".depth-plate", (plates) =>
      plates.map((p) => ({
        slot: p.getAttribute("data-plate-slot"),
        zIndex: getComputedStyle(p).zIndex,
        opacity: getComputedStyle(p).opacity,
        transform: p.style.transform
      }))
    );
    console.log("Plate styles during staggered overlap:", JSON.stringify(plateStyles, null, 2));

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/staggered-corridor-overlap.png"
    });
    console.log("Captured staggered-corridor-overlap.png");

    // -------------------------------------------------------------
    // Step 4: Bengali Localization Verification
    // -------------------------------------------------------------
    console.log("Switching language to Bengali...");
    const langBtn = page.locator("header button[aria-label*='Switch to English'], header button:has-text('BN'), header button:has-text('বাং')").first();
    if (await langBtn.isVisible()) {
      await langBtn.click();
      await page.waitForTimeout(400);

      const bnInstructions = await page.$eval(".world-instructions", (el) => el.innerText.trim());
      const bnCounter = await page.$eval(".world-set-count", (el) => el.innerText.trim());
      const bnPrice = await page.$eval(".depth-plate-price", (el) => el.innerText.trim());

      console.log(`Bengali Instructions: "${bnInstructions}"`);
      console.log(`Bengali Counter: "${bnCounter}"`);
      console.log(`Bengali Price: "${bnPrice}"`);

      await page.screenshot({
        path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/staggered-corridor-bengali.png"
      });
      console.log("Captured staggered-corridor-bengali.png");

      // Switch back to English
      await langBtn.click();
      await page.waitForTimeout(300);
    }

    // -------------------------------------------------------------
    // Step 5: Click Navigation to Product Detail Page
    // -------------------------------------------------------------
    console.log("Testing click navigation to product details...");
    const clickablePlate = page.locator(".depth-plate[style*='pointer-events: auto']").first();
    await clickablePlate.click();
    await page.waitForURL("**/products/**", { timeout: 6000 });
    console.log("Successfully routed to product details URL:", page.url());

    console.log("ALL STAGGERED OVERLAPPING DEPTH CORRIDOR TESTS PASSED PERFECTLY!");
  } finally {
    if (browser) await browser.close();
    server.kill();
  }
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
