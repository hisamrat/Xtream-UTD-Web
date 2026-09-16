import { chromium } from "@playwright/test";

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log("Navigating to http://localhost:3005 for clean directional 3D drag verification...");
  await page.goto("http://localhost:3005", { waitUntil: "networkidle" });
  await page.waitForTimeout(2400);

  // 1. Baseline 0 degrees
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/showcase-0-deg-baseline.png" });
  console.log("Captured 0-deg baseline");

  // 2. Drag Right (+50 degrees)
  await page.mouse.move(720, 450);
  await page.mouse.down();
  await page.mouse.move(880, 450, { steps: 20 });
  await page.waitForTimeout(100);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/showcase-right-50deg.png" });
  console.log("Captured +50-deg right rotation");
  await page.mouse.up();

  // Reset to center by reloading
  await page.goto("http://localhost:3005", { waitUntil: "networkidle" });
  await page.waitForTimeout(2200);

  // 3. Drag Left (-50 degrees)
  await page.mouse.move(720, 450);
  await page.mouse.down();
  await page.mouse.move(560, 450, { steps: 20 });
  await page.waitForTimeout(100);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/showcase-left-50deg.png" });
  console.log("Captured -50-deg left rotation");
  await page.mouse.up();

  // Reset to center by reloading
  await page.goto("http://localhost:3005", { waitUntil: "networkidle" });
  await page.waitForTimeout(2200);

  // 4. Drag Up (Vertical Pitch Up +30 degrees)
  await page.mouse.move(720, 450);
  await page.mouse.down();
  await page.mouse.move(720, 320, { steps: 20 });
  await page.waitForTimeout(100);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/showcase-pitch-up-30deg.png" });
  console.log("Captured +30-deg vertical pitch up");
  await page.mouse.up();

  // Reset to center by reloading
  await page.goto("http://localhost:3005", { waitUntil: "networkidle" });
  await page.waitForTimeout(2200);

  // 5. Drag Down (Vertical Pitch Down -30 degrees)
  await page.mouse.move(720, 450);
  await page.mouse.down();
  await page.mouse.move(720, 580, { steps: 20 });
  await page.waitForTimeout(100);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/showcase-pitch-down-30deg.png" });
  console.log("Captured -30-deg vertical pitch down");
  await page.mouse.up();

  // Reset to center by reloading
  await page.goto("http://localhost:3005", { waitUntil: "networkidle" });
  await page.waitForTimeout(2200);

  // 6. Diagonal Dynamic Tilt (+45 deg rotY, -25 deg rotX)
  await page.mouse.move(720, 450);
  await page.mouse.down();
  await page.mouse.move(860, 550, { steps: 25 });
  await page.waitForTimeout(100);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/showcase-diagonal-45deg.png" });
  console.log("Captured dynamic diagonal 3D tilt");
  await page.mouse.up();

  await browser.close();
}

main().catch(console.error);

