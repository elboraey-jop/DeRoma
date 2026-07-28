import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";

export const runtime = "nodejs";

const maxFileSize = 8 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const admin = await prisma.user.findUnique({ where: { id: session.sub }, select: { role: true } });
  if (admin?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return NextResponse.json({ error: "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET." }, { status: 503 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "An image file is required." }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
  if (file.size > maxFileSize) return NextResponse.json({ error: "Image size cannot exceed 8 MB." }, { status: 400 });

  cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET, secure: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: "deroma/products", resource_type: "image", transformation: [{ quality: "auto", fetch_format: "auto" }] }, (error, uploaded) => {
      if (error || !uploaded) reject(error || new Error("Upload failed."));
      else resolve({ secure_url: uploaded.secure_url });
    });
    stream.end(buffer);
  }).catch((error) => {
    console.error("Cloudinary upload failed", error);
    return null;
  });

  if (!result) return NextResponse.json({ error: "Image upload failed. Please try again." }, { status: 500 });
  return NextResponse.json({ url: result.secure_url });
}
