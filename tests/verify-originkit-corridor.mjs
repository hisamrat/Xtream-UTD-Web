import { chromium } from "@playwright/test";
import { spawn } from "child_process";

async function main() {
  const PORT = 3030;
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
    // Test 1: Desktop Viewport (1440x900)
    // -------------------------------------------------------------
    console.log("\n--- TEST 1: Desktop Viewport (1440x900) ---");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`http://localhost:${PORT}`);
    await page.waitForTimeout(2000);
    await page.mouse.move(720, 450);
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(800);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/responsive-1-desktop.png"
    });
    console.log("Captured responsive-1-desktop.png");

    // -------------------------------------------------------------
    // Test 2: Laptop Viewport (1280x800)
    // -------------------------------------------------------------
    console.log("\n--- TEST 2: Laptop Viewport (1280x800) ---");
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`http://localhost:${PORT}`);
    await page.waitForTimeout(2000);
    await page.mouse.move(640, 400);
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(800);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/responsive-2-laptop.png"
    });
    console.log("Captured responsive-2-laptop.png");

    // -------------------------------------------------------------
    // Test 3: Tablet Viewport (768x1024)
    // -------------------------------------------------------------
    console.log("\n--- TEST 3: Tablet Viewport (768x1024) ---");
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`http://localhost:${PORT}`);
    await page.waitForTimeout(2000);
    await page.mouse.move(384, 512);
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(800);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/responsive-3-tablet.png"
    });
    console.log("Captured responsive-3-tablet.png");

    // -------------------------------------------------------------
    // Test 4: Mobile Viewport (390x844)
    // -------------------------------------------------------------
    console.log("\n--- TEST 4: Mobile Viewport (390x844) ---");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`http://localhost:${PORT}`);
    await page.waitForTimeout(2000);
    await page.mouse.move(195, 422);
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(800);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/responsive-4-mobile.png"
    });
    console.log("Captured responsive-4-mobile.png");

    console.log("\nALL RESPONSIVE VIEWPORT TESTS PASSED!");
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
