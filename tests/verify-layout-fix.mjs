import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { name: "1440x900", width: 1440, height: 900, file: "layout-fixed-light-1440.png" },
    { name: "1920x1080", width: 1920, height: 1080, file: "layout-fixed-light-1920.png" },
    { name: "1366x768", width: 1366, height: 768, file: "layout-fixed-light-1366.png" },
    { name: "1536x864", width: 1536, height: 864, file: "layout-fixed-light-1536.png" }
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
    await page.evaluate(() => {
      window.localStorage.setItem("xtream-theme", "light");
      document.documentElement.dataset.theme = "light";
    });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(2200);

    const layoutMetrics = await page.evaluate(() => {
      const header = document.querySelector(".site-header");
      const dock = document.querySelector(".world-dock-wrap") || document.querySelector(".world-set-controls");
      const cards = Array.from(document.querySelectorAll(".reference-world-card"));

      const headerRect = header ? header.getBoundingClientRect() : null;
      const dockRect = dock ? dock.getBoundingClientRect() : null;

      const stage = document.querySelector(".world-stage");
      let highestCardTop = Infinity;
      let lowestCardBottom = -Infinity;
      let highestCard = null;
      let lowestCard = null;

      cards.forEach((c) => {
        const r = c.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          if (r.top < highestCardTop) {
            highestCardTop = r.top;
            highestCard = {
              title: c.querySelector(".world-card-title")?.textContent || c.className,
              rect: r,
              style: c.getAttribute("style")
            };
          }
          if (r.bottom > lowestCardBottom) {
            lowestCardBottom = r.bottom;
            lowestCard = {
              title: c.querySelector(".world-card-title")?.textContent || c.className,
              rect: r,
              style: c.getAttribute("style")
            };
          }
        }
      });

      return {
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        headerBottom: headerRect ? headerRect.bottom : 0,
        dockTop: dockRect ? dockRect.top : window.innerHeight,
        highestCard,
        lowestCard,
        stageStyle: stage ? stage.getAttribute("style") : null,
        stageComputedTransform: stage ? window.getComputedStyle(stage).transform : null,
        headerClearance: highestCardTop - (headerRect ? headerRect.bottom : 0),
        dockClearance: (dockRect ? dockRect.top : window.innerHeight) - lowestCardBottom
      };
    });

    console.log(`Viewport ${vp.name} Metrics:`, JSON.stringify(layoutMetrics, null, 2));

    await page.screenshot({
      path: `C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/${vp.file}`
    });
    console.log(`Captured ${vp.file}`);
    await context.close();
  }

  // Dark mode test
  const darkContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const darkPage = await darkContext.newPage();
  await darkPage.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await darkPage.evaluate(() => {
    window.localStorage.setItem("xtream-theme", "dark");
    document.documentElement.dataset.theme = "dark";
  });
  await darkPage.reload({ waitUntil: "networkidle" });
  await darkPage.waitForTimeout(2200);

  await darkPage.screenshot({
    path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/layout-fixed-dark-1440.png"
  });
  console.log("Captured layout-fixed-dark-1440.png");
  await darkContext.close();

  // Mobile test
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(2200);

  await mobilePage.screenshot({
    path: "C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/layout-fixed-mobile.png"
  });
  console.log("Captured layout-fixed-mobile.png");
  await mobileContext.close();

  await browser.close();
  console.log("Layout verification complete!");
}

main().catch(console.error);
