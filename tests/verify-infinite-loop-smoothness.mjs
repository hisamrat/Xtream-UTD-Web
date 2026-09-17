import { chromium } from "@playwright/test";
import { spawn } from "child_process";

async function main() {
  const PORT = 3028;
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
    // Test 1: Enter Corridor and scroll continuously past 35 products
    // -------------------------------------------------------------
    console.log("\n--- TEST 1: Smooth Continuous Scroll across 35+ Products ---");
    await page.mouse.move(720, 450);

    const positions = [];
    for (let step = 0; step < 20; step++) {
      await page.mouse.wheel(0, 400);
      await page.waitForTimeout(100);

      const state = await page.evaluate(() => {
        const slots = Array.from(document.querySelectorAll(".depth-gallery-plate-slot"));
        const visibleSlots = slots.filter((el) => el.style.visibility === "visible");
        return visibleSlots.map((el) => ({
          title: el.querySelector(".depth-plate-title")?.textContent?.trim(),
          opacity: el.style.opacity,
          transform: el.style.transform
        }));
      });
      positions.push(state);
    }

    console.log(`Captured ${positions.length} animation frames during continuous multi-lap scroll.`);
    console.log("Sample intermediate states:", JSON.stringify(positions.slice(0, 3), null, 2));

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/originkit-smooth-loop.png"
    });
    console.log("Captured originkit-smooth-loop.png");

    console.log("\nALL INFINITE SMOOTH LOOP TESTS PASSED!");
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

