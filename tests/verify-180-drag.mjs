import { chromium } from "@playwright/test";

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log("Navigating to http://localhost:3005 for 180-degree professional drag verification...");
  await page.goto("http://localhost:3005", { waitUntil: "networkidle" });

  // Wait for initial entrance to settle
  await page.waitForTimeout(2400);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/drag-0-deg.png" });
  console.log("Captured 0-degree baseline");

  // Drag to rotate +45 degrees (drag right by ~120px)
  await page.mouse.move(720, 450);
  await page.mouse.down();
  await page.mouse.move(840, 450, { steps: 15 });
  await page.waitForTimeout(100);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/drag-45-deg.png" });
  console.log("Captured +45-degree rotation");

  // Drag further to +90 degrees (drag right to 960)
  await page.mouse.move(960, 450, { steps: 15 });
  await page.waitForTimeout(100);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/drag-90-deg.png" });
  console.log("Captured +90-degree rotation");

  // Drag further to +135 degrees
  await page.mouse.move(1080, 450, { steps: 15 });
  await page.waitForTimeout(100);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/drag-135-deg.png" });
  console.log("Captured +135-degree rotation");

  // Drag further to +180 degrees (maximum rightward rotation)
  await page.mouse.move(1220, 450, { steps: 20 });
  await page.waitForTimeout(100);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/drag-180-deg.png" });
  console.log("Captured +180-degree rotation");

  await page.mouse.up();
  await page.waitForTimeout(100);

  // Now drag left to -90 degrees
  await page.mouse.move(720, 450);
  await page.mouse.down();
  await page.mouse.move(480, 450, { steps: 20 });
  await page.waitForTimeout(100);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/drag-neg-90-deg.png" });
  console.log("Captured -90-degree rotation");

  // Drag further left to -180 degrees (maximum leftward rotation)
  await page.mouse.move(240, 450, { steps: 25 });
  await page.waitForTimeout(100);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/drag-neg-180-deg.png" });
  console.log("Captured -180-degree rotation");

  // Also drag vertically to test vertical 3D tilt
  await page.mouse.move(240, 300, { steps: 15 });
  await page.waitForTimeout(100);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/drag-vertical-tilt.png" });
  console.log("Captured 3D vertical tilt");

  await page.mouse.up();

  await browser.close();
}

main().catch(console.error);
