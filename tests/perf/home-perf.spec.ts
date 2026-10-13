import { writeFileSync } from "node:fs";
import { test } from "@playwright/test";
// Set PERF_GPU=1 to request hardware GPU acceleration explicitly.
test.use({ launchOptions: { args: process.env.PERF_GPU === "1" ? ["--ignore-gpu-blocklist", "--enable-gpu", "--use-angle=d3d11", "--enable-gpu-rasterization"] : [] } });

/**
 * Home-page performance probe (opt-in: runs only when PERF_LABEL is set). Writes
 * test-artifacts/perf-<PERF_LABEL>.json with image bytes and frame statistics for the intro, a
 * scripted drag and idle floating. PERF_CPU_RATE sets CPU throttling (default 4 = mid-range phone).
 * Run: PERF_LABEL=after PERF_CPU_RATE=1 npx playwright test tests/perf --project=desktop
 */
const label = process.env.PERF_LABEL ?? "current";

type FrameStats = { frames: number; avgFps: number; p95FrameMs: number; longFrames: number };

test("home page performance", async ({ page }, testInfo) => {
  test.skip(!process.env.PERF_LABEL, "opt-in: set PERF_LABEL to run the performance probe");
  test.skip(testInfo.project.name !== "desktop", "measured once, on desktop");
  test.setTimeout(120_000);

  const client = await page.context().newCDPSession(page);
  await client.send("Network.enable");
  await client.send("Network.setCacheDisabled", { cacheDisabled: true });
  await client.send("Emulation.setCPUThrottlingRate", { rate: Number(process.env.PERF_CPU_RATE ?? 4) });

  let imageBytes = 0;
  let imageCount = 0;
  const imageRequests = new Map<string, boolean>();
  client.on("Network.responseReceived", (event) => {
    if (event.type === "Image") imageRequests.set(event.requestId, true);
  });
  client.on("Network.loadingFinished", (event) => {
    if (imageRequests.has(event.requestId)) {
      imageBytes += event.encodedDataLength;
      imageCount += 1;
    }
  });

  await page.addInitScript(() => {
    const frames: number[] = [];
    let last = performance.now();
    const loop = (now: number) => {
      frames.push(now - last);
      last = now;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    (window as unknown as { __frames: number[] }).__frames = frames;
  });

  const takeFrames = async (): Promise<FrameStats> => {
    const frames = await page.evaluate(() => {
      const list = (window as unknown as { __frames: number[] }).__frames;
      return list.splice(0, list.length);
    });
    const sorted = [...frames].sort((a, b) => a - b);
    const total = frames.reduce((sum, value) => sum + value, 0);
    return {
      frames: frames.length,
      avgFps: Math.round((frames.length / (total / 1000)) * 10) / 10,
      p95FrameMs: Math.round((sorted[Math.floor(sorted.length * 0.95)] ?? 0) * 10) / 10,
      longFrames: frames.filter((value) => value > 34).length
    };
  };

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".world-shell.ui-ready", { timeout: 60_000 });
  const intro = await takeFrames();

  const hero = page.locator(".reference-world-card").first();
  const box = await hero.boundingBox();
  if (!box) throw new Error("no hero card");
  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  await takeFrames();
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  for (let step = 0; step < 60; step += 1) {
    const offset = Math.sin((step / 60) * Math.PI * 2) * 260;
    await page.mouse.move(startX + offset, startY + 4);
  }
  await page.mouse.up();
  const drag = await takeFrames();

  await page.mouse.move(5, 5);
  await page.waitForTimeout(3000);
  const idle = await takeFrames();

  await page.waitForLoadState("networkidle").catch(() => undefined);
  const result = { label, cpuRate: Number(process.env.PERF_CPU_RATE ?? 4), imageCount, imageKB: Math.round(imageBytes / 1024), intro, drag, idle };
  writeFileSync(`test-artifacts/perf-${label}.json`, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
});
