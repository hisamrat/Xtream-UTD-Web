import { expect, type Page, test } from "@playwright/test";

const PRODUCT_SLUG = "refillable-perfume-bottle-8ml";

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !/Failed to load resource/i.test(message.text())) errors.push(message.text());
  });
  return errors;
}

test.describe("home product world", () => {
  test("a click opens the product preview, a drag does not", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "pointer drag is exercised on desktop/tablet");
    const errors = collectErrors(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const hero = page.locator(".reference-world-card").first();
    await expect(hero).toBeVisible();
    await expect(page.locator(".world-shell")).toHaveClass(/ui-ready/);

    const box = await hero.boundingBox();
    if (!box) throw new Error("hero card has no box");
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    // Plain click: the preview opens and links to the product.
    await page.mouse.click(centerX, centerY);
    const preview = page.locator(".world-center-preview-card");
    await expect(preview).toBeVisible();
    await expect(preview).toHaveAttribute("href", /\/products\//);

    // A drag that starts on a card rotates the world and does not open a preview.
    await page.reload();
    await expect(page.locator(".world-shell")).toHaveClass(/ui-ready/);
    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    await page.mouse.move(centerX + 160, centerY + 10, { steps: 10 });
    await expect(page.locator(".world-shell")).toHaveClass(/is-dragging/);
    await page.mouse.up();
    await page.waitForTimeout(300);
    await expect(page.locator(".world-center-preview")).toHaveCount(0);

    expect(errors).toEqual([]);
  });

  test("server HTML lists product links for crawlers and no-JS visitors", async ({ request }) => {
    const html = await (await request.get("/")).text();
    expect(html).toContain(`href="/products/`);
  });
});

test.describe("catalogue", () => {
  test("filters sync to the URL and categories come from the data", async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto("/products");

    await page.getByRole("button", { name: "Category" }).click();
    const options = page.getByRole("option");
    await expect(options.first()).toHaveText(/All Categories/);
    await page.getByRole("option", { name: /^Mixers/ }).click();
    await expect(page).toHaveURL(/category=Mixers/);
    await expect(page.locator(".catalogue-results .product-card").first()).toBeVisible();

    await page.locator("#catalogue-search").fill("zzzz-no-match");
    await expect(page.getByRole("heading", { name: "No products match your search." })).toBeVisible();
    await expect(page).toHaveURL(/q=zzzz-no-match/);

    expect(errors).toEqual([]);
  });

  test("the header search suggests products and opens the full results", async ({ page }) => {
    await page.goto("/products");
    await page.getByRole("button", { name: "Search Products" }).first().click();
    const dialog = page.getByRole("dialog", { name: "Search products" });
    await expect(dialog).toBeVisible();
    await expect(page.locator("#modal-search-input")).toBeFocused();
    await page.keyboard.type("bottle");
    await expect(dialog.locator(".product-card").first()).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/products\?q=bottle/);
    await expect(dialog).toHaveCount(0);
  });
});

test.describe("product to checkout", () => {
  test("adds to cart, validates the checkout form, and prepares the Messenger message", async ({ page }) => {
    const errors = collectErrors(page);
    await page.addInitScript(() => {
      window.open = (url?: string | URL) => {
        (window as unknown as { __openedUrl?: string }).__openedUrl = String(url);
        return null;
      };
    });
    await page.goto(`/products/${PRODUCT_SLUG}`);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Refillable Perfume Bottle 8ml");
    await expect(page.locator(".spec-list")).toContainText("Sensor");
    await expect(page.locator(".feature-list")).not.toContainText("Suitable for desks");

    await page.locator(".add-to-cart-btn-main").click();
    const drawer = page.getByRole("dialog", { name: "Shopping Cart" });
    await expect(drawer).toBeVisible();
    await expect(drawer.locator(".cart-item-title")).toHaveText("Refillable Perfume Bottle 8ml");
    await drawer.getByRole("button", { name: "Proceed to Checkout" }).click();

    const checkout = page.getByRole("dialog", { name: "Checkout" });
    await expect(checkout).toBeVisible();
    await checkout.getByRole("button", { name: "Confirm Order", exact: true }).click();
    await expect(checkout.locator(".field-error")).toHaveCount(6);

    await checkout.locator("#checkout-firstName").fill("Rahim");
    await checkout.locator("#checkout-lastName").fill("Uddin");
    await checkout.locator("#checkout-phone").fill("0171234567");
    await checkout.locator("#checkout-address").fill("House 1, Road 2");
    await checkout.locator("#checkout-thana").fill("Mirpur");
    await checkout.locator("#checkout-district").fill("Dhaka");
    await checkout.getByRole("button", { name: "Confirm Order", exact: true }).click();
    await expect(checkout.locator(".field-error")).toHaveText("Please enter a valid 11-digit mobile number (e.g., 01712345678).");

    await checkout.locator("#checkout-phone").fill("01712345678");
    await checkout.getByText("OUTSIDE DHAKA").click();
    await expect(checkout.locator(".grand-total-val")).toHaveText("৳329");
    await checkout.getByRole("button", { name: "Order on Messenger", exact: true }).click();

    await expect(checkout.getByText("Thank you for your order!")).toBeVisible();
    const openedUrl = await page.evaluate(() => (window as unknown as { __openedUrl?: string }).__openedUrl ?? "");
    const message = decodeURIComponent(openedUrl.split("?text=")[1] ?? "");
    expect(openedUrl).toContain("https://m.me/");
    expect(message).toContain("Name: Rahim Uddin");
    expect(message).toContain("Refillable Perfume Bottle 8ml");
    expect(message).toContain("Grand Total: ৳329");
    await expect(checkout.locator(".checkout-success-note")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(checkout).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("dialogs trap focus and return it on close", async ({ page }) => {
    await page.goto(`/products/${PRODUCT_SLUG}`);
    const trigger = page.locator(".details-inquiry-btn");
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Order inquiry" });
    await expect(dialog).toBeVisible();
    for (let index = 0; index < 12; index += 1) {
      await page.keyboard.press("Tab");
      expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test("variant change and add to cart resets quantity to 1", async ({ page }) => {
    await page.goto(`/products/${PRODUCT_SLUG}`);

    // Increase quantity to 3
    const increaseBtn = page.getByRole("button", { name: "Increase quantity" });
    await increaseBtn.click();
    await increaseBtn.click();
    await expect(page.locator(".quantity-value")).toHaveText("3");

    // Switching variant resets quantity back to 1
    const silverChip = page.getByRole("button", { name: "Silver" });
    if (await silverChip.isVisible()) {
      await silverChip.click();
      await expect(page.locator(".quantity-value")).toHaveText("1");
    }

    // Increase quantity to 2 and add to cart
    await increaseBtn.click();
    await expect(page.locator(".quantity-value")).toHaveText("2");
    await page.locator(".add-to-cart-btn-main").click();

    // Drawer opens, and buy box quantity resets to 1
    const drawer = page.getByRole("dialog", { name: "Shopping Cart" });
    await expect(drawer).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(drawer).toHaveCount(0);
    await expect(page.locator(".quantity-value")).toHaveText("1");
  });

  test("product gallery shows zoom badge and hover magnifier", async ({ page }) => {
    await page.goto(`/products/${PRODUCT_SLUG}`);

    // Zoom badge is visible in bottom-right corner of large image
    const zoomBadge = page.locator(".gallery-zoom-badge");
    await expect(zoomBadge).toBeVisible();

    // Hovering over gallery-main activates hover zoom
    const galleryMain = page.locator(".gallery-main");
    await expect(galleryMain).toBeVisible();
    await galleryMain.hover();
    await expect(galleryMain).toHaveClass(/is-hover-zoomed/);
  });

  test("unknown products show the product 404", async ({ page }) => {
    const response = await page.goto("/products/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByText("This product could not be found.")).toBeVisible();
  });
});

test.describe("preferences", () => {
  test("language and theme persist across reloads", async ({ page }) => {
    await page.goto("/contact");
    const headerToggle = page.locator(".language-toggle");
    if (await headerToggle.isVisible()) {
      await headerToggle.click();
    } else {
      await page.getByRole("button", { name: "Open Navigation Menu" }).click();
      await page.getByRole("button", { name: "বাংলা ভাষায় দেখুন" }).click();
      await page.keyboard.press("Escape");
    }
    await expect(page.locator("html")).toHaveAttribute("lang", "bn");
    await expect(page.locator(".form-main-heading")).toHaveText("বার্তা বা জিজ্ঞাসা পাঠান");
    await expect(page.locator(".perk-desc").nth(1)).toHaveText("ঢাকা ৳৭০ ও সারাদেশে ৳১৩০");

    await page.evaluate(() => window.localStorage.setItem("xtream-theme", "light"));

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.locator(".form-main-heading")).toHaveText("বার্তা বা জিজ্ঞাসা পাঠান");
  });
});

test.describe("api", () => {
  test("revalidation is closed without a configured secret", async ({ request }) => {
    expect((await request.post("/api/revalidate")).status()).toBe(503);
    expect((await request.get("/api/revalidate")).status()).toBe(405);
  });

  test("the removed admin surface is gone", async ({ request }) => {
    expect((await request.get("/xadmin")).status()).toBe(404);
    expect((await request.post("/api/admin/upload-image")).status()).toBe(404);
  });
});
