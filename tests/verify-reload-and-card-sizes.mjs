import { chromium } from "@playwright/test";

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log("Navigating to http://localhost:3005 for card size and reload rotation reset verification...");
  await page.goto("http://localhost:3005", { waitUntil: "networkidle" });
  await page.waitForTimeout(2400);

  // 1. Initial showcase with new larger/taller professional card sizes
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/showcase-larger-cards-default.png" });
  console.log("Captured default state with larger cards");

  // 2. Drag to rotate showcase to +50 degrees
  await page.mouse.move(720, 450);
  await page.mouse.down();
  await page.mouse.move(880, 450, { steps: 20 });
  await page.waitForTimeout(100);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/showcase-dragged-before-reload.png" });
  console.log("Captured rotated showcase (+50 deg) before clicking reload");
  await page.mouse.up();

  // 3. Click the Reload button in the bottom switch dock
  const reloadBtn = page.locator("button.bottom-switch-reload");
  await reloadBtn.click();
  await page.waitForTimeout(200);

  // 4. Capture screenshot immediately after reload to confirm rotation reset to default (0, 0)
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/showcase-after-reload-reset.png" });
  console.log("Captured state after clicking reload (rotation reset to default 0 deg)");

  // 5. Check computed rotateY and rotateX on the world-stage
  const stageTransform = await page.$eval(".world-stage", (el) => {
    return {
      cssVarRotateX: el.style.getPropertyValue("--world-rotate-x"),
      cssVarRotateY: el.style.getPropertyValue("--world-rotate-y")
    };
  });
  console.log("Stage Rotation after reload:", JSON.stringify(stageTransform, null, 2));

  // 6. Test on tablet / mobile viewport as well
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/showcase-mobile-larger-cards.png" });
  console.log("Captured mobile viewport with larger cards");

  await browser.close();
}

main().catch(console.error);

