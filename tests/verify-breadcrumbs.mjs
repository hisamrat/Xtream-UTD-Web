import { chromium } from "@playwright/test";
import { spawn } from "child_process";

async function main() {
  const PORT = 3035;
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

    const pagesToVerify = [
      { url: `http://localhost:${PORT}/products/sony-a7-iv`, name: "breadcrumb-details" },
      { url: `http://localhost:${PORT}/about`, name: "breadcrumb-about" },
      { url: `http://localhost:${PORT}/contact`, name: "breadcrumb-contact" },
      { url: `http://localhost:${PORT}/terms`, name: "breadcrumb-terms" }
    ];

    for (const p of pagesToVerify) {
      await page.goto(p.url);
      await page.waitForTimeout(600);
      await page.screenshot({
        path: `C:/Users/Samrat/.gemini/antigravity/brain/d5ea8804-7845-48c1-b286-2331514028f4/${p.name}.png`
      });
      console.log(`Captured ${p.name}.png`);
    }

    console.log("All breadcrumb pages verified!");
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

