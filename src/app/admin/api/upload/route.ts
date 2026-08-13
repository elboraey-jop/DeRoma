import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";

export const runtime = "nodejs";

const maxFileSize = 10 * 1024 * 1024; // 10 MB
const supportedImageTypes: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const admin = await prisma.user.findUnique({ where: { id: session.sub }, select: { role: true } });
  if (admin?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "An image file is required." }, { status: 400 });
    if (!supportedImageTypes[file.type]) return NextResponse.json({ error: "Only JPG, PNG, and WebP images are allowed." }, { status: 400 });
    if (file.size > maxFileSize) return NextResponse.json({ error: "Image size cannot exceed 10 MB." }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Cloudinary is not configured. Add the Cloudinary environment variables." },
        { status: 503 },
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "deroma/products",
          resource_type: "image",
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, uploaded) => {
          if (error || !uploaded) reject(error || new Error("Cloudinary upload failed."));
          else resolve({ secure_url: uploaded.secure_url });
        },
      );
      stream.end(buffer);
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json({ error: "Image upload to Cloudinary failed. Please try again." }, { status: 502 });
  }
}
