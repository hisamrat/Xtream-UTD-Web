import { NextResponse } from "next/server";
import { extractGoogleDriveFileId } from "@/lib/image-utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const rawUrl = searchParams.get("url");

    const fileId = id || (rawUrl ? extractGoogleDriveFileId(rawUrl) : null);

    if (!fileId) {
      return new NextResponse("Missing image id or valid Google Drive url", { status: 400 });
    }

    const candidateSources = [
      `https://drive.usercontent.google.com/download?id=${fileId}&export=view`,
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`,
      `https://lh3.googleusercontent.com/d/${fileId}`
    ];

    for (const sourceUrl of candidateSources) {
      try {
        const upstreamRes = await fetch(sourceUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
          }
        });

        if (upstreamRes.ok) {
          const contentType = upstreamRes.headers.get("content-type") || "image/png";
          // Ensure it is actually an image and not an HTML error/login page
          if (contentType.startsWith("image/")) {
            const buffer = await upstreamRes.arrayBuffer();
            return new NextResponse(buffer, {
              status: 200,
              headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
                "Access-Control-Allow-Origin": "*"
              }
            });
          }
        }
      } catch {
        // Try next candidate
      }
    }

    return new NextResponse("Image not accessible from Google Drive", { status: 404 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image proxy error";
    return new NextResponse(message, { status: 500 });
  }
}
