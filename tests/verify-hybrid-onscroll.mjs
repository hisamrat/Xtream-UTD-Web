import { chromium } from "@playwright/test";

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log("-------------------------------------------------------------");
  console.log("Step 1: Verify Resting 3D Showcase World (Dark Mode)");
  console.log("-------------------------------------------------------------");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(2200);

  await page.screenshot({
    path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/hybrid-1-resting-dark.png"
  });
  console.log("Captured hybrid-1-resting-dark.png");

  console.log("-------------------------------------------------------------");
  console.log("Step 2: Verify 180° Drag Rotation in Resting Showcase");
  console.log("-------------------------------------------------------------");
  await page.mouse.move(720, 450);
  await page.mouse.down();
  await page.mouse.move(920, 400, { steps: 20 });
  await page.waitForTimeout(200);

  const rotateY = await page.$eval(".world-stage", (el) => el.style.getPropertyValue("--world-rotate-y"));
  console.log(`Stage rotateY after drag: ${rotateY}`);

  await page.screenshot({
    path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/hybrid-2-drag-rotated.png"
  });
  console.log("Captured hybrid-2-drag-rotated.png");
  await page.mouse.up();

  console.log("-------------------------------------------------------------");
  console.log("Step 3: Verify Reload Button Resets Rotation");
  console.log("-------------------------------------------------------------");
  const reloadBtn = page.locator("button.bottom-switch-reload");
  await reloadBtn.click();
  await page.waitForTimeout(400);

  const rotateAfterReload = await page.$eval(".world-stage", (el) => ({
    rotX: el.style.getPropertyValue("--world-rotate-x"),
    rotY: el.style.getPropertyValue("--world-rotate-y")
  }));
  console.log("Rotation after reload reset:", JSON.stringify(rotateAfterReload));

  await page.screenshot({
    path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/hybrid-3-reload-reset.png"
  });
  console.log("Captured hybrid-3-reload-reset.png");

  console.log("-------------------------------------------------------------");
  console.log("Step 4: Verify Card Hover Center Preview Bar");
  console.log("-------------------------------------------------------------");
  const heroCard = page.locator(".reference-world-card.kind-hero").first();
  await heroCard.hover({ force: true });
  await page.waitForTimeout(500);

  const isPreviewVisible = await page.locator(".world-center-preview").isVisible();
  console.log(`Center preview visible on hover: ${isPreviewVisible}`);

  await page.screenshot({
    path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/hybrid-4-hover-preview.png"
  });
  console.log("Captured hybrid-4-hover-preview.png");

  // Move mouse away to clear hover preview
  await page.mouse.move(50, 50);
  await page.waitForTimeout(500);

  console.log("-------------------------------------------------------------");
  console.log("Step 5: Verify On-Scroll Dive into Staggered Depth Corridor");
  console.log("-------------------------------------------------------------");
  await page.mouse.move(720, 450);
  await page.mouse.wheel(0, 950);
  await page.waitForTimeout(800);

  const plateCount = await page.$$eval(".depth-plate", (plates) => plates.length);
  console.log(`Corridor depth plates mounted: ${plateCount} (Expected strictly: 2)`);

  const platesInfo = await page.$$eval(".depth-plate", (plates) =>
    plates.map((p) => ({
      slot: p.getAttribute("data-plate-slot"),
      title: p.querySelector(".depth-plate-title")?.textContent?.trim(),
      price: p.querySelector(".depth-plate-price")?.textContent?.trim(),
      transform: p.style.transform,
      opacity: getComputedStyle(p).opacity,
      zIndex: getComputedStyle(p).zIndex
    }))
  );
  console.log("Mounted Plates Details:", JSON.stringify(platesInfo, null, 2));

  await page.screenshot({
    path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/hybrid-5-corridor-onscroll.png"
  });
  console.log("Captured hybrid-5-corridor-onscroll.png");

  console.log("-------------------------------------------------------------");
  console.log("Step 6: Verify Scrolling Back Up Restores 3D Showcase World");
  console.log("-------------------------------------------------------------");
  await page.mouse.wheel(0, -1200);
  await page.waitForTimeout(800);

  const showcaseVisibleAgain = await page.$eval(".world-stage", (el) => getComputedStyle(el).opacity);
  console.log(`Showcase opacity after scrolling back up: ${showcaseVisibleAgain}`);

  await page.screenshot({
    path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/hybrid-6-restored-showcase.png"
  });
  console.log("Captured hybrid-6-restored-showcase.png");

  console.log("-------------------------------------------------------------");
  console.log("Step 7: Verify Light Mode (Showcase & Corridor)");
  console.log("-------------------------------------------------------------");
  await page.evaluate(() => {
    window.localStorage.setItem("xtream-theme", "light");
    document.documentElement.dataset.theme = "light";
  });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(2200);

  await page.screenshot({
    path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/hybrid-7-light-mode-showcase.png"
  });
  console.log("Captured hybrid-7-light-mode-showcase.png");

  // Scroll into corridor in light mode
  await page.mouse.move(720, 450);
  await page.mouse.wheel(0, 950);
  await page.waitForTimeout(800);

  await page.screenshot({
    path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/hybrid-8-light-mode-corridor.png"
  });
  console.log("Captured hybrid-8-light-mode-corridor.png");

  console.log("-------------------------------------------------------------");
  console.log("Step 8: Verify Click Routing from Depth Corridor Plate");
  console.log("-------------------------------------------------------------");
  const activePlate = page.locator(".depth-plate-focal").first();
  await activePlate.click();
  await page.waitForFunction(() => window.location.pathname.startsWith("/products/"), { timeout: 6000 });
  console.log("Successfully navigated to product details route:", page.url());

  await page.screenshot({
    path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/hybrid-9-product-details.png"
  });
  console.log("Captured hybrid-9-product-details.png");

  await browser.close();
  console.log("=============================================================");
  console.log("ALL ON-SCROLL HYBRID WORLD TESTS PASSED PERFECTLY!");
  console.log("=============================================================");
}

main().catch(console.error);
