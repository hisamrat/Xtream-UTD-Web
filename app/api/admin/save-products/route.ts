import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { productsSchema } from "@/lib/product-schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { products } = body;

    if (!products || !Array.isArray(products)) {
      return NextResponse.json(
        { success: false, error: "Invalid payload: 'products' array is required." },
        { status: 400 }
      );
    }

    const parseResult = productsSchema.safeParse(products);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      const fieldPath = issue ? issue.path.join(".") : "unknown";
      const message = issue ? issue.message : "Validation failed";
      return NextResponse.json(
        {
          success: false,
          error: `Validation error at "${fieldPath}": ${message}`
        },
        { status: 422 }
      );
    }

    const filePath = path.join(process.cwd(), "design-reference", "data", "sample_products.json");
    const jsonString = JSON.stringify(parseResult.data, null, 2);

    await fs.writeFile(filePath, jsonString, "utf-8");

    return NextResponse.json({
      success: true,
      message: `Successfully saved ${parseResult.data.length} products to sample_products.json`
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
