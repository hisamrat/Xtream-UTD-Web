import { chromium } from "@playwright/test";
import { spawn } from "child_process";

async function main() {
  const PORT = 3025;
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
    // Test 1: Start on Page 1 -> Scroll into corridor -> Page 1 products only
    // -------------------------------------------------------------
    console.log("\n--- TEST 1: Page 1 Scroll Corridor ---");
    const initialPageCounter = await page.$eval(".world-set-count", (el) => el.innerText);
    console.log("Initial Page Counter:", initialPageCounter);

    await page.mouse.move(720, 450);
    await page.mouse.wheel(0, 300); // enter corridor
    await page.waitForTimeout(600);

    const isInCorridorP1 = await page.$eval(".world-shell", (el) => el.classList.contains("is-in-corridor"));
    console.log("Is in corridor on Page 1:", isInCorridorP1);

    // Check title of active plate on Page 1 via page.evaluate
    const p1Titles = await page.evaluate(() => {
      const slots = Array.from(document.querySelectorAll(".depth-gallery-plate-slot"));
      return slots
        .filter((el) => el.style.visibility === "visible" && parseFloat(el.style.opacity) > 0.2)
        .map((el) => el.querySelector(".depth-plate-title")?.textContent?.trim());
    });
    console.log("Page 1 Active Plates:", p1Titles);

    // -------------------------------------------------------------
    // Test 2: Click Reload while in Page 1 corridor -> Returns to Page 1 Showcase
    // -------------------------------------------------------------
    console.log("\n--- TEST 2: Click Reload from Page 1 Corridor ---");
    await page.evaluate(() => window.dispatchEvent(new CustomEvent("xtream-utd:world-reload")));
    await page.waitForTimeout(600);

    const backInShowcaseP1 = await page.$eval(".world-shell", (el) => el.classList.contains("is-in-showcase"));
    const pageCounterAfterReload = await page.$eval(".world-set-count", (el) => el.innerText);
    console.log("Back in Showcase:", backInShowcaseP1);
    console.log("Page Counter after Reload:", pageCounterAfterReload);
    if (!pageCounterAfterReload.startsWith("01")) {
      throw new Error(`Expected Page 1 counter ("01 / ..."), but got: ${pageCounterAfterReload}`);
    }

    // -------------------------------------------------------------
    // Test 3: Click Reload while in Showcase -> Advances to Page 2
    // -------------------------------------------------------------
    console.log("\n--- TEST 3: Click Reload in Showcase (Advance to Page 2) ---");
    await page.evaluate(() => window.dispatchEvent(new CustomEvent("xtream-utd:world-reload")));
    await page.waitForTimeout(600);

    const page2Counter = await page.$eval(".world-set-count", (el) => el.innerText);
    console.log("Page Counter on Page 2:", page2Counter);
    if (!page2Counter.startsWith("02")) {
      throw new Error(`Expected Page 2 counter ("02 / ..."), but got: ${page2Counter}`);
    }

    // -------------------------------------------------------------
    // Test 4: Scroll in Page 2 -> Only Page 2 products in corridor
    // -------------------------------------------------------------
    console.log("\n--- TEST 4: Page 2 Scroll Corridor ---");
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(600);

    const isInCorridorP2 = await page.$eval(".world-shell", (el) => el.classList.contains("is-in-corridor"));
    console.log("Is in corridor on Page 2:", isInCorridorP2);

    const p2Titles = await page.evaluate(() => {
      const slots = Array.from(document.querySelectorAll(".depth-gallery-plate-slot"));
      return slots
        .filter((el) => el.style.visibility === "visible" && parseFloat(el.style.opacity) > 0.2)
        .map((el) => el.querySelector(".depth-plate-title")?.textContent?.trim());
    });
    console.log("Page 2 Active Plates:", p2Titles);

    // -------------------------------------------------------------
    // Test 5: Click Reload while in Page 2 corridor -> Returns to Page 2 Showcase
    // -------------------------------------------------------------
    console.log("\n--- TEST 5: Click Reload from Page 2 Corridor ---");
    await page.evaluate(() => window.dispatchEvent(new CustomEvent("xtream-utd:world-reload")));
    await page.waitForTimeout(600);

    const backInShowcaseP2 = await page.$eval(".world-shell", (el) => el.classList.contains("is-in-showcase"));
    const pageCounterAfterP2Reload = await page.$eval(".world-set-count", (el) => el.innerText);
    console.log("Back in Showcase for Page 2:", backInShowcaseP2);
    console.log("Page Counter (should remain 02):", pageCounterAfterP2Reload);
    if (!pageCounterAfterP2Reload.startsWith("02")) {
      throw new Error(`Expected Page 2 counter ("02 / ..."), but got: ${pageCounterAfterP2Reload}`);
    }

    console.log("\nALL PAGE-SCOPED CORRIDOR & RELOAD TESTS PASSED PERFECTLY!");
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

