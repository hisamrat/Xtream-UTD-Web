import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('1. Navigating to /explore ...');
  await page.goto('http://localhost:3000/explore');
  await page.waitForTimeout(1000);

  console.log('2. Scrolling down to the bottom (features and footer) ...');
  await page.evaluate(() => window.scrollTo({ top: 1200, behavior: 'instant' }));
  await page.waitForTimeout(500);

  const scrolledY = await page.evaluate(() => window.scrollY);
  console.log('ScrollY before reload:', scrolledY);

  console.log('3. Triggering browser reload (F5) ...');
  await page.reload();
  await page.waitForTimeout(600);

  const scrollYAfterReload = await page.evaluate(() => window.scrollY);
  console.log('ScrollY immediately after reload:', scrollYAfterReload);

  await page.screenshot({
    path: 'test-artifacts/explore-reload-verified.png',
    fullPage: false
  });

  if (scrollYAfterReload !== 0) {
    console.error('FAILED: Page did not reset to top on reload, scrollY was:', scrollYAfterReload);
    process.exit(1);
  }

  // Verify carousel is visible and ready
  const isCarouselVisible = await page.locator('.explore-carousel-section.is-ready').isVisible();
  console.log('Is carousel visible and ready:', isCarouselVisible);

  if (!isCarouselVisible) {
    console.error('FAILED: Carousel was not in ready state');
    process.exit(1);
  }

  await browser.close();
  console.log('Reload test PASSED successfully!');
}

run().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});

