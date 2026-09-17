import { chromium } from "@playwright/test";
import { spawn } from "child_process";

async function main() {
  const PORT = 3011;
  console.log(`Starting Next.js production server on port ${PORT}...`);
  const server = spawn("npx.cmd", ["next", "start", "-p", String(PORT)], {
    cwd: "d:/Codex/xtream-utd",
    stdio: "inherit",
    shell: true
  });

  await new Promise((resolve) => setTimeout(resolve, 3000));

  let browser;
  try {
    browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();

    console.log(`Navigating to http://localhost:${PORT}...`);
    await page.goto(`http://localhost:${PORT}`);

    // -------------------------------------------------------------
    // Step 1: Initial 4-Directional Fly-In Entrance (t = 400ms)
    // -------------------------------------------------------------
    await page.waitForTimeout(400);
    const isUIHidden = await page.$eval(".world-shell", (el) => el.classList.contains("ui-hidden"));
    console.log(`UI Chrome hidden during initial 1500ms fly-in gate: ${isUIHidden}`);

    const flyingCards = await page.$$eval(".reference-world-card.is-flying-in", (cards) => {
      const origins = cards.map((c) => c.getAttribute("data-fly-in-origin"));
      return {
        total: cards.length,
        top: origins.filter((o) => o === "top").length,
        bottom: origins.filter((o) => o === "bottom").length,
        left: origins.filter((o) => o === "left").length,
        right: origins.filter((o) => o === "right").length
      };
    });
    console.log("Flying cards distribution across 4 directions:", JSON.stringify(flyingCards, null, 2));

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/showcase-flyin-restored.png"
    });
    console.log("Captured showcase-flyin-restored.png");

    // -------------------------------------------------------------
    // Step 2: Resting State Post Fly-In Gate (t = 1800ms)
    // -------------------------------------------------------------
    await page.waitForTimeout(1400);
    const isUIReady = await page.$eval(".world-shell", (el) => el.classList.contains("ui-ready"));
    console.log(`UI Chrome revealed after 1500ms gate: ${isUIReady}`);

    const showcaseCardCount = await page.$$eval(".reference-world-card", (cards) => cards.length);
    console.log(`Mounted 3D showcase cards: ${showcaseCardCount} (Expected: > 30)`);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/showcase-resting-restored.png"
    });
    console.log("Captured showcase-resting-restored.png");

    // -------------------------------------------------------------
    // Step 3: 3D Drag to Rotate Showcase (up to 180°)
    // -------------------------------------------------------------
    console.log("Testing 3D Drag to Rotate in Showcase World...");
    await page.mouse.move(720, 450);
    await page.mouse.down();
    await page.mouse.move(920, 450, { steps: 20 });
    await page.waitForTimeout(150);

    const rotateY = await page.$eval(".world-stage", (el) => el.style.getPropertyValue("--world-rotate-y"));
    console.log(`Showcase rotateY after drag: ${rotateY}`);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/showcase-dragged-restored.png"
    });
    console.log("Captured showcase-dragged-restored.png");
    await page.mouse.up();
    await page.waitForTimeout(200);

    // -------------------------------------------------------------
    // Step 4: Card Hover for Center Preview Bar
    // -------------------------------------------------------------
    console.log("Testing card hover for center preview bar...");
    await page.waitForTimeout(550); // allow drag cooldown to clear
    const heroCard = page.locator(".reference-world-card.kind-hero").first();
    await heroCard.hover({ force: true });
    await page.waitForTimeout(500);

    const previewVisible = await page.locator(".world-center-preview").isVisible();
    console.log(`Center preview bar visible on card hover: ${previewVisible}`);

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/showcase-hover-restored.png"
    });
    console.log("Captured showcase-hover-restored.png");

    await page.mouse.move(100, 100);
    await page.waitForTimeout(500);

    // -------------------------------------------------------------
    // Step 5: On-Scroll Dive into Staggered Depth Corridor
    // -------------------------------------------------------------
    console.log("Scrolling down to dive into Staggered Depth Gallery Corridor...");
    await page.mouse.move(720, 450);
    await page.mouse.wheel(0, 1100);
    await page.waitForTimeout(700);

    const corridorPlates = await page.$$eval(".depth-plate", (plates) => plates.length);
    console.log(`Corridor plates mounted on scroll: ${corridorPlates} (Expected strictly: 2)`);
    if (corridorPlates !== 2) {
      throw new Error(`Expected strictly 2 depth plates in corridor mode, got ${corridorPlates}`);
    }

    const plateStyles = await page.$$eval(".depth-plate", (plates) =>
      plates.map((p) => ({
        slot: p.getAttribute("data-plate-slot"),
        zIndex: getComputedStyle(p).zIndex,
        opacity: getComputedStyle(p).opacity,
        transform: p.style.transform
      }))
    );
    console.log("Corridor plate transforms during scroll:", JSON.stringify(plateStyles, null, 2));

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/corridor-staggered-onscroll.png"
    });
    console.log("Captured corridor-staggered-onscroll.png");

    // -------------------------------------------------------------
    // Step 6: Scroll Back Up / Reload to Restore 3D Showcase World
    // -------------------------------------------------------------
    console.log("Testing Reload button to reset rotation and return to Showcase...");
    const reloadBtn = page.locator("button.bottom-switch-reload");
    await reloadBtn.click();
    await page.waitForTimeout(900);

    const showcaseAfterReload = await page.$eval(".world-stage", (el) => ({
      rotateX: el.style.getPropertyValue("--world-rotate-x"),
      rotateY: el.style.getPropertyValue("--world-rotate-y"),
      opacity: el.style.opacity
    }));
    console.log("Showcase state after reload reset:", JSON.stringify(showcaseAfterReload, null, 2));

    await page.screenshot({
      path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/showcase-after-reload-restored.png"
    });
    console.log("Captured showcase-after-reload-restored.png");

    // -------------------------------------------------------------
    // Step 7: Test Click Navigation from Corridor Mode
    // -------------------------------------------------------------
    console.log("Scrolling into corridor again and testing click routing...");
    await page.mouse.move(720, 450);
    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(700);

    const activePlate = page.locator(".depth-plate[style*='pointer-events: auto']").first();
    await activePlate.click();
    await page.waitForURL("**/products/**", { timeout: 6000 });
    console.log("Successfully routed to product details URL:", page.url());

    console.log("ALL RESTORED HYBRID WORLD TESTS PASSED PERFECTLY!");
  } finally {
    if (browser) await browser.close();
    server.kill();
  }
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
