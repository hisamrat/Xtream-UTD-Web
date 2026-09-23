import { chromium } from "playwright";

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log("1. Visiting /explore ...");
  await page.goto("http://localhost:3013/explore", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  // Scroll to the new Top Selling section
  console.log("2. Scrolling to Top Selling Products section...");
  await page.locator(".explore-top-selling-section").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/explore-top-selling-dark.png" });

  // Scroll to Reviews section
  console.log("3. Scrolling to Customer Reviews section...");
  await page.locator(".explore-reviews-section").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/explore-reviews-dark.png" });

  // Light mode screenshots
  console.log("4. Capturing Light Mode...");
  await page.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
  await page.waitForTimeout(200);

  await page.locator(".explore-top-selling-section").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/explore-top-selling-light.png" });

  await page.locator(".explore-reviews-section").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/explore-reviews-light.png" });

  // Mobile viewport screenshot
  console.log("5. Capturing Mobile Viewport...");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
  await page.waitForTimeout(300);

  await page.locator(".explore-top-selling-section").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/explore-top-selling-mobile.png" });

  await browser.close();
  console.log("Screenshots captured successfully!");
}

run().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});

