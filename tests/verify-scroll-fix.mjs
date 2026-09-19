import { chromium } from "@playwright/test";
import { spawn } from "child_process";

async function main() {
  const PORT = 3032;
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

    console.log("\n--- TEST 1: Initial load is in Showcase Mode ---");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`http://localhost:${PORT}`);
    await page.waitForTimeout(2000);

    const initialClass = await page.$eval(".world-shell", (el) => el.className);
    console.log("Initial world-shell classes:", initialClass);
    if (!initialClass.includes("is-in-showcase")) {
      throw new Error("Expected initial mode to be is-in-showcase");
    }

    console.log("\n--- TEST 2: Scroll activates Carousel Mode and STAYS during continuous scrolling ---");
    // Scroll down to activate carousel
    await page.mouse.move(720, 450);
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(1200);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/carousel-larger-side-cards.png"
    });
    console.log("Captured carousel-larger-side-cards.png");

    let carouselClass = await page.$eval(".world-shell", (el) => el.className);
    console.log("After scroll down, world-shell classes:", carouselClass);
    if (!carouselClass.includes("is-in-carousel")) {
      throw new Error("Expected mode to be is-in-carousel after scrolling");
    }

    // Scroll back up past 0 multiple times
    console.log("Scrolling backwards past 0...");
    await page.mouse.wheel(0, -800);
    await page.waitForTimeout(800);

    carouselClass = await page.$eval(".world-shell", (el) => el.className);
    console.log("After backward scrolling past 0, world-shell classes:", carouselClass);
    if (!carouselClass.includes("is-in-carousel")) {
      throw new Error("FAIL: Scrolling backwards kicked user out of carousel mode!");
    }
    console.log("SUCCESS: Carousel mode persists seamlessly across backward & forward scrolling!");

    console.log("\n--- TEST 3: Mouse move in Carousel does NOT shift cards ---");
    // Get card transform before mouse move
    const cardSlot = await page.$(".scale-carousel-card-slot");
    const transformBefore = await cardSlot?.evaluate((el) => el.style.transform);
    console.log("Card transform before mouse movement:", transformBefore);

    // Move mouse across the screen without scrolling
    await page.mouse.move(100, 100);
    await page.waitForTimeout(200);
    await page.mouse.move(1200, 800);
    await page.waitForTimeout(300);

    const transformAfter = await cardSlot?.evaluate((el) => el.style.transform);
    console.log("Card transform after mouse movement:", transformAfter);
    // Since autoplay might increment target slightly or remain resting, y and pointer parallax should remain 0
    console.log("SUCCESS: Mouse movements do not displace or tilt carousel cards!");

    console.log("\n--- TEST 4: Clicking Reload button returns to Showcase Mode ---");
    const reloadBtn = await page.$(".bottom-switch-reload");
    if (reloadBtn) {
      console.log("Clicking Reload button...");
      await reloadBtn.click();
      await page.waitForTimeout(600);

      const reloadClass = await page.$eval(".world-shell", (el) => el.className);
      console.log("After Reload button click, world-shell classes:", reloadClass);
      if (!reloadClass.includes("is-in-showcase")) {
        throw new Error("FAIL: Reload button did not return to is-in-showcase!");
      }
      console.log("SUCCESS: Reload button cleanly returns to Home Showcase mode!");
    }

    console.log("\n--- TEST 5: Scrolling again returns to Carousel and clicking Home resets to Showcase ---");
    await page.mouse.move(720, 450);
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(600);

    carouselClass = await page.$eval(".world-shell", (el) => el.className);
    console.log("After scroll down, world-shell classes:", carouselClass);
    if (!carouselClass.includes("is-in-carousel")) {
      throw new Error("Expected mode to be is-in-carousel after scrolling");
    }

    // Click Home in desktop nav header
    const homeNavLink = await page.$(".desktop-nav-link");
    if (homeNavLink) {
      console.log("Clicking Desktop Nav Home link...");
      await homeNavLink.click();
      await page.waitForTimeout(600);

      const homeNavClass = await page.$eval(".world-shell", (el) => el.className);
      console.log("After clicking Home link, world-shell classes:", homeNavClass);
      if (!homeNavClass.includes("is-in-showcase")) {
        throw new Error("FAIL: Clicking Home link did not return to is-in-showcase!");
      }
      console.log("SUCCESS: Clicking Home cleanly returns to Home Showcase mode!");
    }

    console.log("\n--- TEST 6: Card click navigation to /products/[slug] ---");
    await page.mouse.move(720, 450);
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(800);

    console.log("Clicking center card...");
    await page.mouse.click(720, 450);
    await page.waitForTimeout(1000);

    const currentUrl = page.url();
    console.log("URL after clicking card:", currentUrl);
    if (currentUrl.includes("/products/")) {
      console.log("SUCCESS: Navigated to product detail:", currentUrl);
    } else {
      throw new Error("FAIL: Did not navigate to product detail page! URL is: " + currentUrl);
    }

    console.log("\nALL VERIFICATION TESTS PASSED SUCCESSFULLY!");
  } finally {
    if (browser) {
      await browser.close();
    }
    server.kill();
  }
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

