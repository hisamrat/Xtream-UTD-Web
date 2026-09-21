import { chromium } from "@playwright/test";
import { spawn } from "child_process";

async function main() {
  const PORT = 3049;
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

    console.log("\n--- TEST: Home Page 3D World / Carousel ---");
    await page.goto(`http://localhost:${PORT}/`);
    await page.waitForTimeout(2500);

    // Press ArrowRight to trigger 3D Scale Carousel mode
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(1500);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/carousel-hud-dark.png"
    });
    console.log("Captured carousel-hud-dark.png");

    // Switch to light mode
    const themeBtn = page.locator("button.theme-toggle-btn, button[aria-label*='theme'], button[aria-label*='Theme']").first();
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/carousel-hud-light.png"
      });
      console.log("Captured carousel-hud-light.png");
    }

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
