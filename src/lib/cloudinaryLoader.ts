import type { ImageLoaderProps } from "next/image";

/**
 * Let Cloudinary perform the format/quality/width transformation directly.
 * This avoids sending an already-CDN-hosted image through Vercel's image
 * optimizer, which otherwise creates a second cache and origin-transfer hop.
 */
export default function cloudinaryLoader({ src, width }: ImageLoaderProps) {
  if (!src.startsWith("https://res.cloudinary.com/") || !src.includes("/image/upload/")) {
    return src;
  }

  const transformation = `f_auto,q_auto,c_limit,w_${width}`;
  return src.replace("/image/upload/", `/image/upload/${transformation}/`);
}
