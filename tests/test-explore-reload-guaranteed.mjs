import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('1. Directly loading /explore (or on fresh reload) ...');
  await page.goto('http://localhost:3000/explore');
  await page.waitForTimeout(600);

  // Check that carousel is visible
  const carousel = page.locator('.explore-carousel-section');
  console.log('Carousel section count:', await carousel.count());

  // Check that extra features and footer are NOT rendered on initial load
  const extraSections = page.locator('.explore-extra-sections');
  const footer = page.locator('.site-footer');
  console.log('Extra sections on initial load (should be 0):', await extraSections.count());
  console.log('Footer on initial load (should be 0):', await footer.count());

  if (await extraSections.count() !== 0 || await footer.count() !== 0) {
    console.error('FAILED: Extra sections or footer were rendered before scroll on initial load!');
    process.exit(1);
  }

  await page.screenshot({
    path: 'test-artifacts/explore-only-first-section.png',
    fullPage: false
  });

  console.log('2. Scrolling down on /explore (user intends to view features & footer) ...');
  await page.mouse.wheel(0, 150);
  await page.waitForTimeout(600);

  console.log('Extra sections after scroll (should be 1):', await extraSections.count());
  console.log('Footer after scroll (should be 1):', await footer.count());

  if (await extraSections.count() !== 1 || await footer.count() !== 1) {
    console.error('FAILED: Extra sections or footer did not reveal on scroll!');
    process.exit(1);
  }

  console.log('3. Triggering browser reload (F5) ...');
  await page.reload();
  await page.waitForTimeout(600);

  console.log('Extra sections after reload (should be 0):', await extraSections.count());
  console.log('Footer after reload (should be 0):', await footer.count());

  if (await extraSections.count() !== 0 || await footer.count() !== 0) {
    console.error('FAILED: Extra sections or footer rendered on reload before scroll!');
    process.exit(1);
  }

  console.log('4. Testing Home page scroll redirection into /explore ...');
  await page.goto('http://localhost:3000/');
  await page.waitForTimeout(1600);

  await page.mouse.move(720, 450);
  await page.mouse.wheel(0, 100);
  await page.waitForURL('**/explore', { timeout: 5000 });
  await page.waitForTimeout(600);

  console.log('URL after home transition:', page.url());
  console.log('Extra sections after home transition (should be 1):', await page.locator('.explore-extra-sections').count());
  console.log('Footer after home transition (should be 1):', await page.locator('.site-footer').count());

  if (await page.locator('.explore-extra-sections').count() !== 1) {
    console.error('FAILED: Extra sections not ready after home transition');
    process.exit(1);
  }

  await browser.close();
  console.log('All guaranteed reload and transition tests PASSED perfectly!');
}

run().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});

