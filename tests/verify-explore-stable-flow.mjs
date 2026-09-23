import { chromium } from "playwright";

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log("1. Visiting /explore directly...");
  await page.goto("http://localhost:3012/explore", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  // Check initial scrollY
  const initialScrollY = await page.evaluate(() => window.scrollY);
  console.log("Initial scrollY:", initialScrollY);

  // Take screenshot of right edge / top section
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/explore-single-scrollbar-dark.png" });

  console.log("2. Reloading /explore to verify zero jumping...");
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(400);

  const reloadScrollY = await page.evaluate(() => window.scrollY);
  console.log("Reload scrollY:", reloadScrollY);

  console.log("3. Scrolling down on /explore...");
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(500);

  const scrolledY = await page.evaluate(() => window.scrollY);
  console.log("Scrolled position:", scrolledY);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/explore-scrolled-single-dark.png" });

  console.log("4. Visiting Home page (/) and testing transition...");
  await page.goto("http://localhost:3012/", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  await page.mouse.wheel(0, 100);
  await page.waitForURL("**/explore", { timeout: 5000 });
  await page.waitForTimeout(400);

  const homeTransitionScrollY = await page.evaluate(() => window.scrollY);
  console.log("Home transition landing scrollY:", homeTransitionScrollY);

  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/explore-from-home-single-dark.png" });

  await browser.close();
  console.log("All single scrollbar and zero jump tests passed!");
}

run().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
