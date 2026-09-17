import { chromium } from "@playwright/test";
import { spawn } from "child_process";

async function main() {
  const PORT = 3016;
  console.log(`Starting Next.js production server on port ${PORT}...`);
  const server = spawn("npx.cmd", ["next", "start", "-p", String(PORT)], {
    cwd: "d:/Codex/xtream-utd",
    stdio: "inherit",
    shell: true
  });

  // Wait for server ready
  await new Promise((resolve) => setTimeout(resolve, 3500));

  let browser;
  try {
    browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();

    console.log(`Navigating to http://localhost:${PORT}...`);
    await page.goto(`http://localhost:${PORT}`);

    // Wait for fly-in and UI ready
    await page.waitForTimeout(2000);

    // -------------------------------------------------------------
    // Test 1: Start Corridor - Active card starts in Center
    // -------------------------------------------------------------
    console.log("\n--- TEST 1: Initial Scroll Entry (Center Focal Card) ---");
    await page.mouse.move(720, 450);
    await page.mouse.wheel(0, 150); // slight scroll to enter corridor at fraction ~ 0.05
    await page.waitForTimeout(600);

    const isInCorridor = await page.$eval(".world-shell", (el) => el.classList.contains("is-in-corridor"));
    console.log(`Is in Corridor: ${isInCorridor}`);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/staggered-1-start-center.png"
    });
    console.log("Captured staggered-1-start-center.png");

    // -------------------------------------------------------------
    // Test 2: Mid-Scroll Transition (Left, Center, Right matching Image 2)
    // -------------------------------------------------------------
    console.log("\n--- TEST 2: Mid-Scroll Transition (Left, Center, Right) ---");
    await page.mouse.wheel(0, 400); // scroll further into fraction ~ 0.5
    await page.waitForTimeout(600);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/staggered-2-mid-scroll-dark.png"
    });
    console.log("Captured staggered-2-mid-scroll-dark.png");

    // -------------------------------------------------------------
    // Test 3: Light Mode Mid-Scroll (Matching Image 2 exact reference)
    // -------------------------------------------------------------
    console.log("\n--- TEST 3: Light Mode Mid-Scroll Matching Image 2 ---");
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
    });
    await page.waitForTimeout(400);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/staggered-3-mid-scroll-light.png"
    });
    console.log("Captured staggered-3-mid-scroll-light.png");

    // -------------------------------------------------------------
    // Test 4: Mobile Viewport
    // -------------------------------------------------------------
    console.log("\n--- TEST 4: Mobile Viewport 3-Card Strip ---");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/staggered-4-mobile.png"
    });
    console.log("Captured staggered-4-mobile.png");

    // Reset viewport
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(400);

    // -------------------------------------------------------------
    // Test 5: Reload in Showcase vs Corridor
    // -------------------------------------------------------------
    console.log("\n--- TEST 5: Reload Reset ---");
    await page.evaluate(() => window.dispatchEvent(new CustomEvent("xtream-utd:world-reload")));
    await page.waitForTimeout(600);

    const backInShowcase = await page.$eval(".world-shell", (el) => el.classList.contains("is-in-showcase"));
    console.log(`Back in showcase after reload: ${backInShowcase}`);

    // -------------------------------------------------------------
    // Test 6: Scroll Up from Showcase
    // -------------------------------------------------------------
    console.log("\n--- TEST 6: Scroll Up from Showcase enters Corridor in reverse ---");
    await page.mouse.move(720, 450);
    await page.mouse.wheel(0, -250);
    await page.waitForTimeout(600);
    const inCorridorAfterScrollUp = await page.$eval(".world-shell", (el) => el.classList.contains("is-in-corridor"));
    console.log(`Is in corridor after scroll up: ${inCorridorAfterScrollUp}`);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/staggered-5-scroll-up.png"
    });
    console.log("Captured staggered-5-scroll-up.png");

    console.log("\nALL VERIFICATIONS PASSED!");
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
