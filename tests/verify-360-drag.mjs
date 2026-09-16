import { chromium } from "@playwright/test";

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log("Navigating to http://localhost:3000 for 360-degree drag verification...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

  // Wait for initial entrance to settle
  await page.waitForTimeout(2400);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/drag-0-degrees.png" });
  console.log("Captured 0-degree baseline");

  // Drag to rotate +45 degrees (drag right by ~130px)
  await page.mouse.move(720, 450);
  await page.mouse.down();
  await page.mouse.move(850, 450, { steps: 15 });
  await page.waitForTimeout(100);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/drag-45-degrees.png" });
  console.log("Captured 45-degree rotation");

  // Drag further to +90 degrees (drag right by another ~130px -> 980)
  await page.mouse.move(980, 450, { steps: 15 });
  await page.waitForTimeout(100);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/drag-90-degrees.png" });
  console.log("Captured 90-degree rotation");

  // Drag further to +180 degrees (drag right to 1240)
  await page.mouse.move(1240, 450, { steps: 25 });
  await page.waitForTimeout(100);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/drag-180-degrees.png" });
  console.log("Captured 180-degree rotation");

  // Release and perform a continuous sweep for full 360-degree rotation
  await page.mouse.up();
  await page.mouse.move(200, 450);
  await page.mouse.down();
  await page.mouse.move(1230, 450, { steps: 35 });
  await page.waitForTimeout(100);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/drag-360-degrees.png" });
  console.log("Captured 360-degree rotation");
  await page.mouse.up();

  // Read current computed rotateY and rotateX on the world-stage
  const stageTransform = await page.$eval(".world-stage", (el) => {
    return {
      styleTransform: el.style.transform || window.getComputedStyle(el).transform,
      cssVarRotateX: el.style.getPropertyValue("--world-rotate-x"),
      cssVarRotateY: el.style.getPropertyValue("--world-rotate-y")
    };
  });
  console.log("Stage 3D Transform Telemetry:", JSON.stringify(stageTransform, null, 2));

  await browser.close();
}

main().catch(console.error);

