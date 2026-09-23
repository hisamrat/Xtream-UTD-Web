import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('1. Testing Home page (/) ...');
  await page.goto('http://localhost:3000/');
  await page.waitForTimeout(1500);

  // Wheel scroll on home page navigates to /explore
  console.log('2. Simulating mouse wheel scroll on Home page ...');
  await page.mouse.wheel(0, 100);
  await page.waitForTimeout(1200);
  console.log('Current URL after scroll:', page.url());

  console.log('3. Testing /explore page top (Transparent Nav + Bottom Dock Arrows) ...');
  await page.goto('http://localhost:3000/explore');
  await page.waitForTimeout(1500);

  await page.screenshot({
    path: 'test-artifacts/explore-top-transparent-dark.png',
    fullPage: false
  });

  // Click Right Arrow on Bottom Dock
  console.log('4. Clicking Next arrow on Bottom Dock ...');
  const nextBtn = page.locator('.bottom-dock-arrow-next');
  if (await nextBtn.count() > 0) {
    await nextBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({
      path: 'test-artifacts/explore-dock-stepped-dark.png',
      fullPage: false
    });
  }

  // Scroll down to test solid navbar transition, features, and footer
  console.log('5. Scrolling down on /explore (Nav turns solid, features + footer visible) ...');
  await page.evaluate(() => window.scrollTo({ top: 850, behavior: 'instant' }));
  await page.waitForTimeout(800);

  await page.screenshot({
    path: 'test-artifacts/explore-scrolled-solid-dark.png',
    fullPage: false
  });

  // Switch to Light Theme
  console.log('6. Testing /explore in Light Mode ...');
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('xtream_theme', 'light');
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.waitForTimeout(800);

  await page.screenshot({
    path: 'test-artifacts/explore-top-transparent-light.png',
    fullPage: false
  });

  await page.evaluate(() => window.scrollTo({ top: 850, behavior: 'instant' }));
  await page.waitForTimeout(800);

  await page.screenshot({
    path: 'test-artifacts/explore-scrolled-solid-light.png',
    fullPage: false
  });

  // Test Mobile view
  console.log('7. Testing Mobile Viewport ...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(500);

  await page.screenshot({
    path: 'test-artifacts/explore-mobile-dock-dark.png',
    fullPage: false
  });

  await browser.close();
  console.log('All tests completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
