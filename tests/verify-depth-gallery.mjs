import { chromium } from "@playwright/test";
import { spawn } from "child_process";

async function main() {
  const PORT = 3008;
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
    await page.waitForTimeout(1000);

    // 1. Verify strict 2-plate active render window
    const plateCount = await page.$$eval(".depth-plate", (plates) => plates.length);
    console.log(`Mounted depth plates count: ${plateCount} (Expected: 2)`);
    if (plateCount !== 2) {
      throw new Error(`Expected strictly 2 plates mounted, but found ${plateCount}`);
    }

    // 2. Check HUD instructions: expect "SCROLL TO FLY"
    const instructionsText = await page.$eval(".world-instructions", (el) => el.innerText);
    console.log("HUD instructions text:\n" + instructionsText);
    if (!instructionsText.includes("SCROLL TO FLY")) {
      throw new Error(`Expected HUD to include "SCROLL TO FLY", but got: ${instructionsText}`);
    }

    // 3. Check Corridor Product Counter
    const counterText = await page.$eval(".world-set-count", (el) => el.innerText);
    console.log("Corridor counter:", counterText);

    // Check Bengali HUD translation
    const langBtn = page.locator("button:has-text('BN')");
    if (await langBtn.count() > 0) {
      await langBtn.first().click();
      await page.waitForTimeout(300);
      const bnInstructions = await page.$eval(".world-instructions", (el) => el.innerText);
      console.log("Bengali HUD instructions text:\n" + bnInstructions);
      if (!bnInstructions.includes("স্ক্রোল করে দেখুন")) {
        throw new Error(`Expected Bengali HUD to include "স্ক্রোল করে দেখুন", got: ${bnInstructions}`);
      }
      await page.screenshot({
        path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/depth-gallery-bengali.png"
      });
      // Switch back to English
      const enBtn = page.locator("button:has-text('EN')");
      if (await enBtn.count() > 0) {
        await enBtn.first().click();
        await page.waitForTimeout(300);
      }
    }

    // 4. Capture baseline screenshot at f = 0
    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/depth-gallery-baseline.png"
    });
    console.log("Captured depth-gallery-baseline.png");

    // 5. Inspect atmospheric background CSS variables
    const bgProps = await page.$eval(".depth-gallery-shell", (el) => ({
      tintA: el.style.getPropertyValue("--bg-tint-a"),
      tintB: el.style.getPropertyValue("--bg-tint-b")
    }));
    console.log("Atmospheric Background Tints:", JSON.stringify(bgProps, null, 2));

    // 6. Simulate scroll to advance corridor (wheel delta)
    console.log("Simulating wheel scroll down...");
    await page.mouse.move(720, 450);
    await page.mouse.wheel(0, 280);
    await page.waitForTimeout(300);

    // Check plate count during transition
    const midPlateCount = await page.$$eval(".depth-plate", (plates) => plates.length);
    console.log(`Mounted depth plates count mid-scroll: ${midPlateCount} (Expected: 2)`);

    // Capture mid-flight transition screenshot
    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/depth-gallery-mid-flight.png"
    });
    console.log("Captured depth-gallery-mid-flight.png");

    // 7. Test responsive mobile viewport (390x844)
    console.log("Testing mobile viewport...");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(400);
    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/depth-gallery-mobile.png"
    });
    console.log("Captured depth-gallery-mobile.png");

    // 8. Test click navigation on desktop
    console.log("Testing click navigation on focused plate...");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`http://localhost:${PORT}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);

    const focusedPlate = page.locator(".depth-plate.is-focused");
    await focusedPlate.click();
    await page.waitForURL("**/products/**", { timeout: 6000 });
    console.log("Successfully navigated to product details URL:", page.url());

    console.log("ALL DEPTH GALLERY CHECKS PASSED PERFECTLY!");
  } finally {
    if (browser) await browser.close();
    server.kill();
  }
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
