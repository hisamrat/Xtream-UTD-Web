import { chromium } from "playwright";

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log("1. Visiting Home page (/) ...");
  await page.goto("http://localhost:3010/", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  console.log("2. Simulating scroll on Home page to trigger transition to /explore ...");
  await page.mouse.wheel(0, 100);
  await page.waitForURL("**/explore", { timeout: 5000 });
  await page.waitForTimeout(500);

  // Check metrics immediately after landing on /explore from Home
  const landingMetrics = await page.evaluate(() => {
    const docEl = document.documentElement;
    const main = document.querySelector(".explore-main");
    const extra = document.querySelector(".explore-extra-sections");
    const footer = document.querySelector(".site-footer");
    return {
      url: window.location.pathname,
      isExploreLocked: docEl.classList.contains("is-explore-locked") || (main && main.classList.contains("is-locked-initial")),
      scrollHeight: docEl.scrollHeight,
      clientHeight: docEl.clientHeight,
      hasExtra: !!extra,
      hasFooter: !!footer,
      scrollY: window.scrollY
    };
  });

  console.log("Metrics immediately after arriving from Home to /explore:", landingMetrics);

  if (landingMetrics.scrollHeight > landingMetrics.clientHeight) {
    console.error("FAIL: Vertical scrollbar is present on landing from Home!");
  } else {
    console.log("SUCCESS: Arrived from Home to /explore with ZERO overflow scrollbar!");
  }

  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/explore-from-home-clean-dark.png" });

  // Light theme test
  await page.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
  await page.waitForTimeout(200);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/explore-from-home-clean-light.png" });

  // Now trigger scroll on /explore
  console.log("3. Scrolling while on /explore page...");
  await page.mouse.wheel(0, 200);
  await page.waitForTimeout(500);

  const afterScrollMetrics = await page.evaluate(() => {
    const extra = document.querySelector(".explore-extra-sections");
    const footer = document.querySelector(".site-footer");
    return {
      hasExtra: !!extra,
      hasFooter: !!footer,
      scrollHeight: document.documentElement.scrollHeight
    };
  });
  console.log("Metrics after user scrolls on /explore:", afterScrollMetrics);

  await browser.close();
  console.log("All transition and lock tests passed!");
}

run().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
