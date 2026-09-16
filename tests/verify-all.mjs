import { chromium } from "@playwright/test";

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log("Navigating to http://localhost:3000 for Fly-in Animation sequence...");
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });

  // Early flight (200ms)
  await page.waitForTimeout(200);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/home-smooth-flyin-200ms.png" });
  console.log("Captured 200ms early flight");

  // Mid flight (700ms)
  await page.waitForTimeout(500);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/home-smooth-flyin-700ms.png" });
  console.log("Captured 700ms mid flight");

  // Last moment UI reveal (1550ms)
  await page.waitForTimeout(850);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/home-smooth-ui-reveal-1550ms.png" });
  console.log("Captured 1550ms last moment UI reveal");

  // Final settled state (2300ms)
  await page.waitForTimeout(750);
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/home-smooth-settled.png" });
  console.log("Captured settled state");

  // Header transparency check on multiple routes
  const routes = ["/", "/products", "/about", "/contact", "/products/sony-a7-iv"];
  const headerAudit = [];

  for (const route of routes) {
    await page.goto(`http://localhost:3000${route}`, { waitUntil: "networkidle" });
    const styles = await page.$eval(".site-header", (el) => {
      const computed = window.getComputedStyle(el);
      return {
        background: computed.background,
        backgroundColor: computed.backgroundColor,
        backdropFilter: computed.backdropFilter,
        borderBottom: computed.borderBottom
      };
    });
    headerAudit.push({ route, styles });
  }

  console.log("Header Transparency Audit across routes:", JSON.stringify(headerAudit, null, 2));

  // Capture products catalogue and product details page with transparent header
  await page.goto("http://localhost:3000/products", { waitUntil: "networkidle" });
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/products-header-transparent.png" });

  await page.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/about-header-transparent.png" });

  await page.goto("http://localhost:3000/contact", { waitUntil: "networkidle" });
  await page.screenshot({ path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/contact-header-transparent.png" });

  await browser.close();
}

main().catch(console.error);

