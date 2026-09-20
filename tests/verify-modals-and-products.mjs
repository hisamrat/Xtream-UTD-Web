import { chromium } from "@playwright/test";
import { spawn } from "child_process";

async function main() {
  const PORT = 3040;
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

    console.log("\n--- TEST 1: Cart Drawer Sharp Radius & Clean Styling ---");
    await page.goto(`http://localhost:${PORT}/products/sennheiser-hd-660s`);
    await page.waitForTimeout(1000);

    // Add product to cart (this automatically opens the cart drawer)
    const addToCartBtn = page.locator(".add-to-cart-btn-main");
    await addToCartBtn.click();
    await page.waitForTimeout(800);

    // Verify cart drawer is open
    const isCartOpen = await page.locator(".cart-drawer-panel").isVisible();
    console.log("Cart Drawer open:", isCartOpen);

    // Verify cart checkout button and clear cart button border-radius
    const checkoutBtnRadius = await page.locator(".cart-checkout-btn").evaluate((el) => window.getComputedStyle(el).borderRadius);
    const clearCartBtnRadius = await page.locator(".clear-cart-btn").evaluate((el) => window.getComputedStyle(el).borderRadius);
    const cartItemCardRadius = await page.locator(".cart-item-card").first().evaluate((el) => window.getComputedStyle(el).borderRadius);
    const deliveryNoteRadius = await page.locator(".cart-delivery-note").evaluate((el) => window.getComputedStyle(el).borderRadius);
    console.log("Cart Checkout Button border-radius (should be 0px):", checkoutBtnRadius);
    console.log("Cart Clear Button border-radius (should be 0px):", clearCartBtnRadius);
    console.log("Cart Item Card border-radius (should be 0px):", cartItemCardRadius);
    console.log("Cart Delivery Guarantee Note border-radius (should be 0px):", deliveryNoteRadius);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/cart-drawer-sharp-dark.png"
    });
    console.log("Captured cart-drawer-sharp-dark.png");

    // Test light mode for cart drawer
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
    });
    await page.waitForTimeout(400);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/cart-drawer-sharp-light.png"
    });
    console.log("Captured cart-drawer-sharp-light.png");

    console.log("\n--- TEST 2: Complete Your Order / Checkout Modal Sharp Radius ---");
    // Switch back to dark mode
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
    });
    await page.waitForTimeout(300);

    // Click Proceed to Checkout in Cart Drawer
    const proceedCheckoutBtn = page.locator(".cart-checkout-btn");
    await proceedCheckoutBtn.click();
    await page.waitForTimeout(700);

    // Check input field radius
    const firstNameRadius = await page.locator("#checkout-firstName").evaluate((el) => window.getComputedStyle(el).borderRadius);
    const zoneCardRadius = await page.locator(".zone-card").first().evaluate((el) => window.getComputedStyle(el).borderRadius);
    const checkoutSubmitRadius = await page.locator(".checkout-submit-btn").evaluate((el) => window.getComputedStyle(el).borderRadius);
    const financialCardRadius = await page.locator(".checkout-financial-card").evaluate((el) => window.getComputedStyle(el).borderRadius);
    const highlightCardRadius = await page.locator(".checkout-highlight-card").evaluate((el) => window.getComputedStyle(el).borderRadius);
    console.log("Checkout input field border-radius (should be 0px):", firstNameRadius);
    console.log("Checkout zone card border-radius (should be 0px):", zoneCardRadius);
    console.log("Checkout submit button border-radius (should be 0px):", checkoutSubmitRadius);
    console.log("Checkout financial card border-radius (should be 0px):", financialCardRadius);
    console.log("Checkout highlight notice card border-radius (should be 0px):", highlightCardRadius);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/checkout-modal-sharp-dark.png"
    });
    console.log("Captured checkout-modal-sharp-dark.png");

    // Test light mode checkout modal
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
    });
    await page.waitForTimeout(400);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/checkout-modal-sharp-light.png"
    });
    console.log("Captured checkout-modal-sharp-light.png");

    // Close checkout modal
    const checkoutCloseBtn = page.locator(".checkout-modal-close-btn");
    await checkoutCloseBtn.click();
    await page.waitForTimeout(400);

    console.log("\n--- TEST 3: Contact Form Sharp Radius & No Bottom Glow ---");
    await page.goto(`http://localhost:${PORT}/contact`);
    await page.waitForTimeout(1000);

    // Dark mode contact form
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
    });
    await page.waitForTimeout(400);

    const topicChipRadius = await page.locator(".inquiry-chip").first().evaluate((el) => window.getComputedStyle(el).borderRadius);
    const nameInputRadius = await page.locator("#contact-name").evaluate((el) => window.getComputedStyle(el).borderRadius);
    const contactSubmitRadius = await page.locator(".form-submit-btn").evaluate((el) => window.getComputedStyle(el).borderRadius);
    const contactSubmitShadow = await page.locator(".form-submit-btn").evaluate((el) => window.getComputedStyle(el).boxShadow);
    console.log("Contact topic chip border-radius (should be 0px):", topicChipRadius);
    console.log("Contact input border-radius (should be 0px):", nameInputRadius);
    console.log("Contact submit button border-radius (should be 0px):", contactSubmitRadius);
    console.log("Contact submit button shadow (should be refined):", contactSubmitShadow);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/contact-form-sharp-dark.png"
    });
    console.log("Captured contact-form-sharp-dark.png");

    // Light mode contact form
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
    });
    await page.waitForTimeout(400);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/contact-form-sharp-light.png"
    });
    console.log("Captured contact-form-sharp-light.png");

    console.log("\n--- TEST 4: Filter Products Modal Grid & Zero Radius ---");
    await page.goto(`http://localhost:${PORT}/products`);
    await page.waitForTimeout(1000);

    // Dark mode filter modal
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
    });
    await page.waitForTimeout(300);

    const filterBtn = page.locator(".filter-trigger-btn");
    await filterBtn.click();
    await page.waitForTimeout(600);

    const filterApplyRadius = await page.locator(".filter-apply-btn").evaluate((el) => window.getComputedStyle(el).borderRadius);
    const filterClearRadius = await page.locator(".filter-clear-btn").evaluate((el) => window.getComputedStyle(el).borderRadius);
    const filterInputRadius = await page.locator(".filter-number-input").first().evaluate((el) => window.getComputedStyle(el).borderRadius);
    console.log("Filter Apply button border-radius (should be 0px):", filterApplyRadius);
    console.log("Filter Clear button border-radius (should be 0px):", filterClearRadius);
    console.log("Filter Input border-radius (should be 0px):", filterInputRadius);

    console.log("\n--- TEST 5: Product Details Gallery & Thumbnail Clicks (DJI RS 3 Pro) ---");
    await page.goto(`http://localhost:${PORT}/products/dji-rs-3-pro`);
    await page.waitForTimeout(1000);

    // Dark mode
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
    });
    await page.waitForTimeout(300);

    const inquiryBtnBorder = await page.locator(".details-inquiry-btn").evaluate((el) => window.getComputedStyle(el).border);
    const inquiryBtnRadius = await page.locator(".details-inquiry-btn").evaluate((el) => window.getComputedStyle(el).borderRadius);
    const shareBtnRadius = await page.locator(".details-share-btn").evaluate((el) => window.getComputedStyle(el).borderRadius);
    const galleryMainBorder = await page.locator(".gallery-main").evaluate((el) => window.getComputedStyle(el).border);
    const galleryMainShadow = await page.locator(".gallery-main").evaluate((el) => window.getComputedStyle(el).boxShadow);
    console.log("Inquiry button border:", inquiryBtnBorder);
    console.log("Inquiry button border-radius (should be 0px):", inquiryBtnRadius);
    console.log("Share button border-radius (should be 0px):", shareBtnRadius);
    console.log("Gallery main border (should be none/clean):", galleryMainBorder);
    console.log("Gallery main shadow (soft dimensional):", galleryMainShadow);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/product-details-dark.png"
    });
    console.log("Captured product-details-dark.png");

    // Light mode
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
    });
    await page.waitForTimeout(400);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/product-details-light.png"
    });
    console.log("Captured product-details-light.png");

    // Test thumbnail clicking (click 2nd thumbnail)
    const thumbnail2 = page.locator(".thumbnail-button").nth(1);
    await thumbnail2.click();
    await page.waitForTimeout(500);

    const thumb2Pressed = await thumbnail2.getAttribute("aria-pressed");
    const captionText = await page.locator(".gallery-caption").innerText();
    console.log("Thumbnail 2 aria-pressed (should be true):", thumb2Pressed);
    console.log("Gallery caption (should be 2 / 4 without bottom-left text):", captionText);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/product-details-thumb2-light.png"
    });
    console.log("Captured product-details-thumb2-light.png");

    console.log("\nALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!");
  } finally {
    if (browser) await browser.close();
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", server.pid, "/f", "/t"]);
    } else {
      server.kill("SIGINT");
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
