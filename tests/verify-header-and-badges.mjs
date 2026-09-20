import { chromium } from "@playwright/test";
import { spawn } from "child_process";

async function main() {
  const PORT = 3042;
  console.log(`Starting Next.js server on port ${PORT}...`);
  const server = spawn("npx.cmd", ["next", "start", "-p", String(PORT)], {
    cwd: "d:/Codex/xtream-utd",
    stdio: "inherit",
    shell: true
  });

  await new Promise((resolve) => setTimeout(resolve, 3500));

  let browser;
  try {
    browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });

    console.log("\n--- TEST 1: Home Page Transparent Header ---");
    await page.goto(`http://localhost:${PORT}/`);
    await page.waitForTimeout(1500);

    const homeHeaderBg = await page.locator(".site-header").evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        background: style.backgroundColor,
        borderBottom: style.borderBottomWidth,
        boxShadow: style.boxShadow,
        hasIsHomeHeader: el.classList.contains("is-home-header"),
        hasIsSolidHeader: el.classList.contains("is-solid-header")
      };
    });
    console.log("Home Header (Dark) Computed:", homeHeaderBg);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/header-home-dark.png"
    });
    console.log("Captured header-home-dark.png");

    // Light mode Home
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
    });
    await page.waitForTimeout(400);

    const homeHeaderBgLight = await page.locator(".site-header").evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        background: style.backgroundColor,
        borderBottom: style.borderBottomWidth,
        boxShadow: style.boxShadow
      };
    });
    console.log("Home Header (Light) Computed:", homeHeaderBgLight);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/header-home-light.png"
    });
    console.log("Captured header-home-light.png");

    console.log("\n--- TEST 2: Products Page Solid Header ---");
    await page.goto(`http://localhost:${PORT}/products`);
    await page.waitForTimeout(1000);

    const productsHeaderBgDark = await page.locator(".site-header").evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        backgroundColor: style.backgroundColor,
        borderBottom: style.borderBottom,
        boxShadow: style.boxShadow,
        hasIsSolidHeader: el.classList.contains("is-solid-header")
      };
    });
    console.log("Products Header (Dark) Computed:", productsHeaderBgDark);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/header-products-dark.png"
    });
    console.log("Captured header-products-dark.png");

    // Light mode Products
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
    });
    await page.waitForTimeout(400);

    const productsHeaderBgLight = await page.locator(".site-header").evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        backgroundColor: style.backgroundColor,
        borderBottom: style.borderBottom,
        boxShadow: style.boxShadow
      };
    });
    console.log("Products Header (Light) Computed:", productsHeaderBgLight);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/header-products-light.png"
    });
    console.log("Captured header-products-light.png");

    console.log("\n--- TEST 3: Product Details Page Solid Header & Cart Badges ---");
    await page.goto(`http://localhost:${PORT}/products/sennheiser-hd-660s`);
    await page.waitForTimeout(1000);

    // Switch to dark mode
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
    });
    await page.waitForTimeout(400);

    // Click Add to Cart 3 times to get quantity 3
    const addToCartBtn = page.locator(".add-to-cart-btn-main");
    await addToCartBtn.click();
    await page.waitForTimeout(500);

    // Close drawer to add again or click '+' inside drawer
    const plusBtn = page.locator(".quantity-btn-sm").last();
    await plusBtn.click();
    await page.waitForTimeout(200);
    await plusBtn.click();
    await page.waitForTimeout(300);

    // Verify Cart Drawer Title Count Badge in Dark Mode
    const drawerBadgeRadiusDark = await page.locator(".cart-count-badge").evaluate((el) => window.getComputedStyle(el).borderRadius);
    console.log("Cart Drawer Count Badge Radius (Dark, should be 9999px):", drawerBadgeRadiusDark);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/cart-drawer-badge-dark.png"
    });
    console.log("Captured cart-drawer-badge-dark.png");

    // Close cart drawer to inspect Header Cart Badge in Dark Mode
    const closeDrawerBtn = page.locator(".cart-close-btn");
    await closeDrawerBtn.click();
    await page.waitForTimeout(400);

    const headerBadgeRadiusDark = await page.locator(".cart-badge-dot").evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        borderRadius: style.borderRadius,
        text: el.textContent,
        width: style.width,
        height: style.height
      };
    });
    console.log("Header Cart Badge (Dark):", headerBadgeRadiusDark);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/header-cart-badge-dark.png"
    });
    console.log("Captured header-cart-badge-dark.png");

    // Switch to light mode
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
    });
    await page.waitForTimeout(400);

    const headerBadgeRadiusLight = await page.locator(".cart-badge-dot").evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        borderRadius: style.borderRadius,
        text: el.textContent,
        width: style.width,
        height: style.height,
        backgroundColor: style.backgroundColor
      };
    });
    console.log("Header Cart Badge (Light, should be round):", headerBadgeRadiusLight);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/header-cart-badge-light.png"
    });
    console.log("Captured header-cart-badge-light.png");

    // Open cart drawer in light mode
    const cartActionBtn = page.locator(".cart-action");
    await cartActionBtn.click();
    await page.waitForTimeout(400);

    const drawerBadgeRadiusLight = await page.locator(".cart-count-badge").evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        borderRadius: style.borderRadius,
        text: el.textContent,
        backgroundColor: style.backgroundColor,
        color: style.color
      };
    });
    console.log("Cart Drawer Count Badge (Light, should be round):", drawerBadgeRadiusLight);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/cart-drawer-badge-light.png"
    });
    console.log("Captured cart-drawer-badge-light.png");

    console.log("\n--- ALL TESTS COMPLETED SUCCESSFULLY ---");
  } catch (err) {
    console.error("Test failed with error:", err);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    server.kill("SIGTERM");
    setTimeout(() => {
      try {
        process.kill(server.pid);
      } catch {}
    }, 1000);
  }
}

main();

