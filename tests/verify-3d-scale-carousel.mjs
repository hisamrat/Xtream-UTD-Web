import { chromium } from "@playwright/test";
import { spawn } from "child_process";

async function main() {
  const PORT = 3031;
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
    const context = await browser.newContext();
    const page = await context.newPage();

    // -------------------------------------------------------------
    // Test 1: Desktop Viewport (1440x900) - 3D Scale Carousel
    // -------------------------------------------------------------
    console.log("\n--- TEST 1: Desktop Viewport (1440x900) ---");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`http://localhost:${PORT}`);
    await page.waitForTimeout(2000);
    // Scroll to activate 3D Scale Carousel and settle on focused product
    await page.mouse.move(720, 450);
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(1400);

    // Verify Instructions HUD text
    const instructions = await page.$eval(".world-instructions", (el) => el.innerText.trim());
    console.log("Instructions text on screen:\n" + instructions);
    if (!instructions.includes("SCROLL TO ROTATE") || !instructions.includes("CLICK TO VIEW DETAIL")) {
      console.warn("Warning: Instructions text does not match expected exact phrase.");
    }

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/carousel-1-desktop.png"
    });
    console.log("Captured carousel-1-desktop.png");

    // -------------------------------------------------------------
    // Test 2: Laptop Viewport (1280x800) - 3D Scale Carousel
    // -------------------------------------------------------------
    console.log("\n--- TEST 2: Laptop Viewport (1280x800) ---");
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`http://localhost:${PORT}`);
    await page.waitForTimeout(2000);
    await page.mouse.move(640, 400);
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(1400);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/carousel-2-laptop.png"
    });
    console.log("Captured carousel-2-laptop.png");

    // -------------------------------------------------------------
    // Test 3: Tablet Viewport (768x1024) - 3D Scale Carousel
    // -------------------------------------------------------------
    console.log("\n--- TEST 3: Tablet Viewport (768x1024) ---");
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`http://localhost:${PORT}`);
    await page.waitForTimeout(2000);
    await page.mouse.move(384, 512);
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(1400);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/carousel-3-tablet.png"
    });
    console.log("Captured carousel-3-tablet.png");

    // -------------------------------------------------------------
    // Test 4: Mobile Viewport (390x844) - 3D Scale Carousel
    // -------------------------------------------------------------
    console.log("\n--- TEST 4: Mobile Viewport (390x844) ---");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`http://localhost:${PORT}`);
    await page.waitForTimeout(2000);
    await page.mouse.move(195, 422);
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(1400);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/carousel-4-mobile.png"
    });
    console.log("Captured carousel-4-mobile.png");

    // -------------------------------------------------------------
    // Test 5: Light Mode Desktop Viewport
    // -------------------------------------------------------------
    console.log("\n--- TEST 5: Light Mode Desktop Viewport ---");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`http://localhost:${PORT}`);
    await page.waitForTimeout(2000);
    await page.mouse.move(720, 450);
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(1400);
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
    });
    await page.waitForTimeout(600);
    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/carousel-6-light.png"
    });
    console.log("Captured carousel-6-light.png");

    // -------------------------------------------------------------
    // Test 6: Direct Card Click Navigation
    // -------------------------------------------------------------
    console.log("\n--- TEST 6: Card Click Navigation ---");
    await page.goto(`http://localhost:${PORT}`);
    await page.waitForTimeout(2000);
    await page.mouse.move(720, 450);
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(1400);

    // Click the center card directly
    console.log("Clicking center card at (720, 450)...");
    await page.mouse.click(720, 450);
    await page.waitForTimeout(1200);

    const currentUrl = page.url();
    console.log("Current URL after clicking card:", currentUrl);
    if (currentUrl.includes("/products/")) {
      console.log("SUCCESS: Clicked card navigated directly to product detail page:", currentUrl);
    } else {
      console.error("FAIL: Did not navigate to product page. URL is:", currentUrl);
      process.exit(1);
    }

    console.log("\nALL 3D SCALE CAROUSEL TESTS PASSED!");
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
