import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const subfolder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const cleanFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").toLowerCase();
    const targetDir = path.join(process.cwd(), "public", "products", subfolder);

    await fs.mkdir(targetDir, { recursive: true });
    const targetPath = path.join(targetDir, cleanFilename);
    await fs.writeFile(targetPath, buffer);

    const relativePath = `/products/${subfolder}/${cleanFilename}`;
    return NextResponse.json({
      success: true,
      url: relativePath,
      message: `File saved to ${relativePath}`
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Upload error";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
