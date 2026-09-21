import { chromium } from 'playwright';

async function verify() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  // Test Product Details in Dark Mode
  await page.goto('http://localhost:3000/products/portable-folding-laptop-stand');
  await page.waitForTimeout(1500);

  // Take screenshot of product details (Dark Mode)
  await page.screenshot({
    path: 'test-artifacts/product-details-variant-qty-dark.png',
    fullPage: false
  });

  // Switch to Light Mode
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('xtream_theme', 'light');
  });
  await page.waitForTimeout(1000);

  // Take screenshot of product details (Light Mode)
  await page.screenshot({
    path: 'test-artifacts/product-details-variant-qty-light.png',
    fullPage: false
  });

  // Mobile Viewport (Light Mode)
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: 'test-artifacts/product-details-variant-qty-mobile-light.png',
    fullPage: false
  });

  // Mobile Viewport (Dark Mode)
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('xtream_theme', 'dark');
  });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: 'test-artifacts/product-details-variant-qty-mobile-dark.png',
    fullPage: false
  });

  await browser.close();
  console.log('Screenshots taken successfully!');
}

verify().catch((err) => {
  console.error(err);
  process.exit(1);
});

