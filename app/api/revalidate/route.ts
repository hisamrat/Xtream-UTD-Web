import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  try {
    const secret = process.env.REVALIDATION_SECRET;
    const headerToken = request.headers.get("x-revalidate-token");
    const { searchParams } = new URL(request.url);
    const queryToken = searchParams.get("token");

    const providedToken = headerToken || queryToken;

    if (secret && providedToken !== secret) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid revalidation token" },
        { status: 401 }
      );
    }

    revalidatePath("/", "layout");
    revalidatePath("/products");
    revalidatePath("/explore");
    revalidatePath("/contact");

    return NextResponse.json({
      success: true,
      revalidated: true,
      now: Date.now(),
      message: "Cache successfully revalidated across all product pages."
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return POST(request);
}
