import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { revalidatePath, revalidateTag } from "next/cache";
import { type Product, productSchema } from "@/domain/product/product-schema";
import { CATALOG_CACHE_TAG, getProducts } from "@/server/catalog/get-catalog";
import { syncProductToSheet } from "@/server/catalog/sources/google-sheets/sync-product-sheet";

const PRODUCTS_FILE_PATH = path.join(process.cwd(), "data", "sample_products.json");

async function readProducts(): Promise<Product[]> {
  try {
    const content = await fs.readFile(PRODUCTS_FILE_PATH, "utf-8");
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => productSchema.parse(item));
  } catch (err) {
    console.error("[admin-products] Failed to read sample_products.json:", err);
    return [];
  }
}

async function writeProducts(products: Product[]): Promise<void> {
  await fs.mkdir(path.dirname(PRODUCTS_FILE_PATH), { recursive: true });
  await fs.writeFile(PRODUCTS_FILE_PATH, JSON.stringify(products, null, 2), "utf-8");
  try {
    revalidateTag(CATALOG_CACHE_TAG, { expire: 0 });
    revalidatePath("/", "layout");
    revalidatePath("/products");
    revalidatePath("/explore");
  } catch {
    // Non-fatal if cache revalidation is called outside request context
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceFresh = searchParams.get("fresh") === "true";

    if (forceFresh) {
      try {
        const liveProducts = await getProducts();
        if (liveProducts && liveProducts.length > 0) {
          await writeProducts(liveProducts);
          return NextResponse.json({ success: true, products: liveProducts, source: "google-sheet" });
        }
      } catch (err) {
        console.warn("[admin-products GET] Notice fetching live products:", err);
      }
    }

    const products = await readProducts();
    return NextResponse.json({ success: true, products });
  } catch (err) {
    const error = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let currentProducts = await readProducts();

    // Support legacy full array payload: { products: [...] } or direct array [...]
    if (Array.isArray(body)) {
      const validated = body.map((p) => productSchema.parse(p));
      await writeProducts(validated);
      const sheetSync = await syncProductToSheet("sync_all", { allProducts: validated });
      return NextResponse.json({
        success: true,
        message: `Successfully saved ${validated.length} products.`,
        products: validated,
        sheetSync
      });
    }

    if (body.action === "save_all" || (body.products && Array.isArray(body.products) && !body.action)) {
      const validated = body.products.map((p: unknown) => productSchema.parse(p));
      await writeProducts(validated);
      const sheetSync = await syncProductToSheet("sync_all", { allProducts: validated });
      return NextResponse.json({
        success: true,
        message: `Successfully saved ${validated.length} products.`,
        products: validated,
        sheetSync
      });
    }

    if (body.action === "create") {
      const rawProduct = body.product;
      if (!rawProduct || typeof rawProduct !== "object") {
        return NextResponse.json({ success: false, error: "Product payload missing" }, { status: 400 });
      }

      const validated = productSchema.parse(rawProduct);
      const requestedId = validated.id?.trim();
      const idExists = requestedId ? currentProducts.some((p) => p.id === requestedId) : false;
      const finalId = requestedId && !idExists ? requestedId : requestedId || `prd-${validated.slug || Date.now()}`;
      const finalProduct: Product = { ...validated, id: finalId };

      currentProducts.unshift(finalProduct);
      await writeProducts(currentProducts);

      const sheetSync = await syncProductToSheet("create", {
        product: finalProduct,
        productId: finalId,
        slug: finalProduct.slug
      });

      return NextResponse.json({
        success: true,
        message: `Product "${finalProduct.title}" created successfully.`,
        product: finalProduct,
        products: currentProducts,
        sheetSync
      });
    }

    if (body.action === "update") {
      const rawProduct = body.product;
      if (!rawProduct || typeof rawProduct !== "object") {
        return NextResponse.json({ success: false, error: "Product payload missing" }, { status: 400 });
      }

      const validated = productSchema.parse(rawProduct);
      const targetId = body.productId || validated.id;
      const index = currentProducts.findIndex(
        (p) => p.id === targetId || p.slug === validated.slug || (validated.id && p.id === validated.id)
      );

      if (index === -1) {
        return NextResponse.json(
          { success: false, error: `Product with ID/slug "${targetId}" not found.` },
          { status: 404 }
        );
      }

      currentProducts[index] = {
        ...currentProducts[index],
        ...validated,
        id: validated.id || currentProducts[index].id
      };
      await writeProducts(currentProducts);

      const sheetSync = await syncProductToSheet("update", {
        product: currentProducts[index],
        productId: currentProducts[index].id,
        slug: currentProducts[index].slug
      });

      return NextResponse.json({
        success: true,
        message: `Product "${validated.title}" updated successfully.`,
        product: currentProducts[index],
        products: currentProducts,
        sheetSync
      });
    }

    if (body.action === "delete") {
      const targetId = body.productId;
      if (!targetId || typeof targetId !== "string") {
        return NextResponse.json({ success: false, error: "productId is required for deletion." }, { status: 400 });
      }

      const initialLength = currentProducts.length;
      const deletedProduct = currentProducts.find((p) => p.id === targetId || p.slug === targetId);
      currentProducts = currentProducts.filter((p) => p.id !== targetId && p.slug !== targetId);

      if (currentProducts.length === initialLength) {
        return NextResponse.json({ success: false, error: `Product "${targetId}" not found.` }, { status: 404 });
      }

      await writeProducts(currentProducts);

      const sheetSync = await syncProductToSheet("delete", {
        productId: targetId,
        slug: deletedProduct?.slug || targetId
      });

      return NextResponse.json({
        success: true,
        message: "Product deleted successfully.",
        products: currentProducts,
        sheetSync
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action or payload." }, { status: 400 });
  } catch (err) {
    const error = err instanceof Error ? err.message : "Internal Server Error";
    console.error("[admin-products POST] Error:", err);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
