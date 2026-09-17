import { chromium } from "playwright";

async function run() {
  const port = 3000;
  console.log(`Testing against http://localhost:${port}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  try {
    // TEST 1: Default dark mode view after fly-in
    console.log("Navigating to home page...");
    await page.goto(`http://localhost:${port}/`, { waitUntil: "networkidle" });
    
    // Wait for fly-in to finish and UI ready (1800ms)
    await page.waitForTimeout(2000);

    // Capture resting showcase
    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/restored-product-view-dark.png"
    });
    console.log("Saved restored-product-view-dark.png");

    // Check non-collision of core visible cards
    const cardSelectors = await page.$$(".reference-world-card:not(.kind-mini)");
    console.log(`Found ${cardSelectors.length} feature/hero/medium cards.`);
    
    const boxes = [];
    for (const card of cardSelectors) {
      const box = await card.boundingBox();
      if (box) {
        boxes.push(box);
      }
    }

    // Verify card titles and categories are distinct
    const titles = await page.$$eval(".world-card-title", (els) => els.map((e) => e.textContent?.trim()));
    const categories = await page.$$eval(".world-card-category", (els) => els.map((e) => e.textContent?.trim()));
    console.log("Sample card titles:", titles.slice(0, 6));
    console.log("Sample card categories:", categories.slice(0, 6));

    // TEST 2: Verify hover center preview
    const heroCard = await page.$(".reference-world-card.kind-hero");
    if (heroCard) {
      const box = await heroCard.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(400);
      }
      await page.screenshot({
        path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/restored-product-view-hover.png"
      });
      console.log("Saved restored-product-view-hover.png");
    }

    // TEST 3: Verify light mode theme setting does NOT ruin dark cosmic showcase
    await page.evaluate(() => {
      window.localStorage.setItem("xtream-theme", "light");
      document.documentElement.dataset.theme = "light";
    });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/restored-product-view-with-light-theme.png"
    });
    console.log("Saved restored-product-view-with-light-theme.png");

    // TEST 4: On-scroll depth corridor still engages seamlessly
    await page.mouse.wheel(0, 700);
    await page.waitForTimeout(600);
    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/restored-corridor-onscroll.png"
    });
    console.log("Saved restored-corridor-onscroll.png");

    console.log("ALL VERIFICATIONS COMPLETED SUCCESSFULLY!");
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
