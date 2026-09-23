import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

  console.log('1. Loading Home page (/) ...');
  await page.goto('http://localhost:3000/');
  await page.waitForTimeout(2000);

  console.log('2. Moving mouse to center and scrolling wheel down ...');
  await page.mouse.move(720, 450);
  await page.mouse.wheel(0, 80);

  // Wait for transition to complete
  await page.waitForURL('**/explore', { timeout: 5000 });
  console.log('Successfully navigated to:', page.url());

  // Wait a moment on explore page and capture screenshot
  await page.waitForTimeout(600);
  await page.screenshot({
    path: 'test-artifacts/explore-transitioned.png',
    fullPage: false
  });

  const scrollY = await page.evaluate(() => window.scrollY);
  console.log('Window scrollY on /explore after transition:', scrollY);

  if (scrollY !== 0) {
    console.error('Expected scrollY to be 0 at top of explore page, but got:', scrollY);
    process.exit(1);
  }

  await browser.close();
  console.log('Transition verified successfully!');
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});

