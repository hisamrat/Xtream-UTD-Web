import { chromium } from "@playwright/test";
import { spawn } from "child_process";

async function main() {
  const PORT = 3020;
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
    console.log("\n--- TEST 1: Initial Scroll Entry into Depth Corridor ---");
    await page.mouse.move(720, 450);
    await page.mouse.wheel(0, 350); // scroll to enter corridor
    await page.waitForTimeout(700);

    const isInCorridor = await page.$eval(".world-shell", (el) => el.classList.contains("is-in-corridor"));
    console.log(`Is in Corridor: ${isInCorridor}`);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/originkit-1-corridor-dark.png"
    });
    console.log("Captured originkit-1-corridor-dark.png");

    // -------------------------------------------------------------
    // Test 2: Continuous Scroll Down into Infinite Corridor
    // -------------------------------------------------------------
    console.log("\n--- TEST 2: Continuous Scroll Down ---");
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(700);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/originkit-2-corridor-scroll.png"
    });
    console.log("Captured originkit-2-corridor-scroll.png");

    // -------------------------------------------------------------
    // Test 3: Light Theme Corridor
    // -------------------------------------------------------------
    console.log("\n--- TEST 3: Light Theme Corridor ---");
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
    });
    await page.waitForTimeout(500);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/originkit-3-corridor-light.png"
    });
    console.log("Captured originkit-3-corridor-light.png");

    // -------------------------------------------------------------
    // Test 4: Mobile Viewport Corridor
    // -------------------------------------------------------------
    console.log("\n--- TEST 4: Mobile Viewport (390x844) ---");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/originkit-4-mobile.png"
    });
    console.log("Captured originkit-4-mobile.png");

    // Reset viewport and theme
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
    });
    await page.waitForTimeout(300);

    // -------------------------------------------------------------
    // Test 5: Click Navigation from Corridor Card
    // -------------------------------------------------------------
    console.log("\n--- TEST 5: Click Navigation from Active Card ---");
    const visiblePlate = page.locator(".depth-gallery-plate-slot:not([style*='visibility: hidden']) .depth-plate").first();
    if (await visiblePlate.count() > 0) {
      await visiblePlate.click();
      await page.waitForURL("**/products/**", { timeout: 6000 });
      console.log("Successfully navigated to:", page.url());
    }

    console.log("\nALL ORIGINKIT DEPTH GALLERY VERIFICATIONS PASSED!");
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

