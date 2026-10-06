import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { CATALOG_CACHE_TAG } from "@/server/catalog/get-catalog";

/**
 * On-demand revalidation webhook (e.g. from a Google Sheets Apps Script).
 * Requires REVALIDATION_SECRET and the matching `x-revalidate-token` header.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATION_SECRET;
  if (!secret) {
    return NextResponse.json(
      { success: false, error: "Revalidation is not configured." },
      { status: 503 }
    );
  }

  const providedToken = request.headers.get("x-revalidate-token") ?? "";
  if (!tokensMatch(providedToken, secret)) {
    return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  }

  revalidateTag(CATALOG_CACHE_TAG, { expire: 0 });
  revalidatePath("/", "layout");

  return NextResponse.json({ success: true, revalidated: true, now: Date.now() });
}

function tokensMatch(provided: string, expected: string): boolean {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer);
}
