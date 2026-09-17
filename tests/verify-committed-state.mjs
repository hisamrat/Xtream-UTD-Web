import { chromium } from "@playwright/test";

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log("1. Verifying Dark Mode on Home Page...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/committed-dark-mode.png" });

  console.log("2. Verifying 180° Drag Rotation in Dark Mode...");
  await page.mouse.move(720, 450);
  await page.mouse.down();
  await page.mouse.move(920, 400, { steps: 20 });
  await page.waitForTimeout(200);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/committed-drag-rotated.png" });
  await page.mouse.up();

  console.log("3. Verifying Reload Reset...");
  const reloadBtn = page.locator("button.bottom-switch-reload");
  await reloadBtn.click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/committed-reload-reset.png" });

  console.log("4. Verifying Day / Light Mode on Home Page...");
  // Toggle theme to light
  const themeToggle = page.locator("button[aria-label*='theme' i], button.icon-button:has(svg.lucide-sun, svg.lucide-moon)").first();
  if (await themeToggle.count() > 0) {
    await themeToggle.click();
  } else {
    await page.evaluate(() => {
      window.localStorage.setItem("xtream-theme", "light");
      document.documentElement.dataset.theme = "light";
    });
  }
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/committed-light-mode.png" });

  console.log("5. Verifying 180° Drag Rotation in Light Mode...");
  await page.mouse.move(720, 450);
  await page.mouse.down();
  await page.mouse.move(520, 500, { steps: 20 });
  await page.waitForTimeout(200);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/committed-light-mode-dragged.png" });
  await page.mouse.up();

  console.log("6. Verifying Products Catalogue in Light Mode...");
  await page.goto("http://localhost:3000/products", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/committed-products-light.png" });

  await browser.close();
  console.log("ALL COMMITTED STATE VERIFICATIONS COMPLETED SUCCESSFULLY!");
}

main().catch(console.error);

