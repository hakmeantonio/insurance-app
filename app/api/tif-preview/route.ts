import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) return new NextResponse("Missing url", { status: 400 });

  try {
    const res = await fetch(url);
    if (!res.ok) return new NextResponse("Failed to fetch file", { status: 502 });

    const buffer = Buffer.from(await res.arrayBuffer());
    const jpeg = await sharp(buffer).jpeg({ quality: 85 }).toBuffer();

    return new NextResponse(jpeg, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Conversion failed", { status: 500 });
  }
}
