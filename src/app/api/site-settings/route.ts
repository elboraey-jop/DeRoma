import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/siteSettings";

export const revalidate = 86400;

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json(settings, {
    headers: {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
