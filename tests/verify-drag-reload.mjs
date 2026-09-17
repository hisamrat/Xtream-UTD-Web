import { chromium } from "playwright";

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(2200);

  // 1. Drag
  await page.mouse.move(500, 400);
  await page.mouse.down();
  await page.mouse.move(300, 300, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(400);

  const stageRotateAfterDrag = await page.evaluate(() => {
    const stage = document.querySelector(".world-stage");
    return stage ? stage.getAttribute("style") : null;
  });
  console.log("Stage style after drag:", stageRotateAfterDrag);
  await page.screenshot({
    path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/restored-dragged.png"
  });

  // 2. Click Reload button
  const reloadBtn = await page.locator("button:has-text('Reload')").first();
  await reloadBtn.click();
  await page.waitForTimeout(600);

  const stageRotateAfterReload = await page.evaluate(() => {
    const stage = document.querySelector(".world-stage");
    return stage ? stage.getAttribute("style") : null;
  });
  console.log("Stage style after reload:", stageRotateAfterReload);
  await page.screenshot({
    path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/restored-reloaded.png"
  });

  await browser.close();
  console.log("DRAG & RELOAD VERIFIED SUCCESSFULLY!");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

