import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "@playwright/test";

/**
 * Compares two screenshot sets captured by capture.spec.ts, e.g.
 *   SCREEN_BASE=before SCREEN_LABEL=after npx playwright test tests/visual/compare.spec.ts --project=desktop
 * Writes test-artifacts/screens/compare-<base>-<label>.json with the share of differing pixels per image.
 */
const base = process.env.SCREEN_BASE ?? "before";
const label = process.env.SCREEN_LABEL ?? "current";
const root = "test-artifacts/screens";

test("compare screenshot sets", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "runs once");
  test.setTimeout(300_000);
  const results: Record<string, number | string> = {};

  for (const viewport of readdirSync(join(root, base))) {
    for (const file of readdirSync(join(root, base, viewport))) {
      const name = `${viewport}/${file}`;
      let after: Buffer;
      try {
        after = readFileSync(join(root, label, viewport, file));
      } catch {
        results[name] = "missing";
        continue;
      }
      const before = readFileSync(join(root, base, viewport, file));
      results[name] = await page.evaluate(
        async ([a, b]) => {
          const load = (data: string) =>
            new Promise<HTMLImageElement>((resolve) => {
              const image = new Image();
              image.onload = () => resolve(image);
              image.src = `data:image/png;base64,${data}`;
            });
          const [first, second] = await Promise.all([load(a), load(b)]);
          const width = Math.max(first.width, second.width);
          const height = Math.max(first.height, second.height);
          const pixels = (image: HTMLImageElement) => {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext("2d");
            if (!context) throw new Error("no 2d context");
            context.drawImage(image, 0, 0);
            return context.getImageData(0, 0, width, height).data;
          };
          const p1 = pixels(first);
          const p2 = pixels(second);
          let different = 0;
          for (let index = 0; index < p1.length; index += 4) {
            const delta =
              Math.abs((p1[index] ?? 0) - (p2[index] ?? 0)) +
              Math.abs((p1[index + 1] ?? 0) - (p2[index + 1] ?? 0)) +
              Math.abs((p1[index + 2] ?? 0) - (p2[index + 2] ?? 0));
            if (delta > 48) different += 1;
          }
          return Math.round((different / (width * height)) * 10000) / 100;
        },
        [before.toString("base64"), after.toString("base64")] as const
      );
    }
  }

  writeFileSync(join(root, `compare-${base}-${label}.json`), JSON.stringify(results, null, 2));
});
