import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";

export const runtime = "nodejs";

const uploadFolder = "deroma/products";

export async function POST() {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { role: true },
    });
    if (admin?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const cloudName =
      process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Cloudinary is not configured. Add the Cloudinary environment variables." },
        { status: 503 },
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { folder: uploadFolder, timestamp },
      apiSecret,
    );

    return NextResponse.json({
      apiKey,
      cloudName,
      folder: uploadFolder,
      signature,
      timestamp,
    });
  } catch (error) {
    console.error("Cloudinary upload signature error:", error);
    return NextResponse.json(
      { error: "Unable to prepare the image upload. Please try again." },
      { status: 500 },
    );
  }
}
