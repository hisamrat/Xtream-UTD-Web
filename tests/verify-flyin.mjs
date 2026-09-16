import { chromium } from "@playwright/test";

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  page.on("console", (msg) => console.log("BROWSER LOG:", msg.text()));
  page.on("pageerror", (err) => console.log("BROWSER ERROR:", err));

  console.log("Navigating to http://localhost:3000...");
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  console.log("Page title:", await page.title(), "URL:", page.url());

  // Capture early in animation (80ms)
  await page.waitForTimeout(80);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/home-flyin-early.png" });
  console.log("Captured early frame (80ms)");

  // Capture mid flight (250ms)
  await page.waitForTimeout(170);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/home-flyin-mid.png" });
  console.log("Captured mid frame (250ms)");

  // Capture landing flight (550ms)
  await page.waitForTimeout(300);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/home-flyin-landing.png" });
  console.log("Captured landing frame (550ms)");

  // Capture settled state (1500ms)
  await page.waitForTimeout(950);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/home-flyin-settled.png" });
  console.log("Captured settled state (1500ms)");

  // Inspect cards' data-fly-in-origin distribution
  const distribution = await page.$$eval(".reference-world-card", (cards) => {
    const counts = { top: 0, bottom: 0, left: 0, right: 0, other: 0 };
    for (const card of cards) {
      const origin = card.getAttribute("data-fly-in-origin");
      if (origin && origin in counts) {
        counts[origin]++;
      } else {
        counts.other++;
      }
    }
    return { total: cards.length, counts };
  });
  console.log("Fly-in origin distribution:", JSON.stringify(distribution, null, 2));

  await browser.close();
}

main().catch(console.error);
