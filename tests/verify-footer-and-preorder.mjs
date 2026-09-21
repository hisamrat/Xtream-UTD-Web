import { chromium } from "@playwright/test";
import { spawn } from "child_process";

async function main() {
  const PORT = 3050;
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

    console.log("\n--- TEST 1: Footer in Dark Mode ---");
    await page.goto(`http://localhost:${PORT}/products`);
    await page.waitForTimeout(1000);

    const footer = page.locator(".site-footer");
    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/footer-hub-dark.png"
    });
    console.log("Captured footer-hub-dark.png");

    console.log("\n--- TEST 2: Footer in Light Mode ---");
    const themeBtn = page.locator("button.theme-toggle-btn, button[aria-label*='theme'], button[aria-label*='Theme']").first();
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      await page.waitForTimeout(500);
      await footer.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/footer-hub-light.png"
      });
      console.log("Captured footer-hub-light.png");
    }

    console.log("\n--- TEST 3: Pre-Order Terms & Conditions Link Navigation ---");
    const preOrderLink = page.locator(".footer-nav-link", { hasText: "Pre Order Terms & Conditions" });
    await preOrderLink.click();
    await page.waitForTimeout(1500);

    console.log("Current URL after click:", page.url());
    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/terms-preorder-scrolled.png"
    });
    console.log("Captured terms-preorder-scrolled.png");

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

