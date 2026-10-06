import { NextResponse } from "next/server";
import { orderRecordSchema } from "@/domain/commerce/order-record";
import { saveOrder } from "@/server/orders/save-order";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parseResult = orderRecordSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid order payload.",
          details: parseResult.error.flatten()
        },
        { status: 400 }
      );
    }

    const result = await saveOrder(parseResult.data);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    console.error("[POST /api/orders] Unhandled error:", message);
    return NextResponse.json(
      {
        success: false,
        error: "Unable to process order."
      },
      { status: 500 }
    );
  }
}
