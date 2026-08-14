import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";
import { exportDatabaseToJSON, exportDatabaseToSQL } from "@/lib/backup/db-export";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await prisma.user.findUnique({ where: { id: session.sub }, select: { role: true } });
  if (admin?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const searchParams = request.nextUrl.searchParams;
  const format = (searchParams.get("format") || "json").toLowerCase();
  const categoriesParam = searchParams.get("categories");
  const categories = categoriesParam ? categoriesParam.split(",").map(c => c.trim()).filter(Boolean) : undefined;

  const now = new Date();
  const dateStr = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);

  try {
    if (format === "sql") {
      const sqlContent = await exportDatabaseToSQL(categories);
      const filename = `deroma-backup-${dateStr}.sql`;

      return new NextResponse(sqlContent, {
        status: 200,
        headers: {
          "Content-Type": "application/sql; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-store, max-age=0",
        },
      });
    } else {
      const jsonData = await exportDatabaseToJSON(categories);
      const jsonContent = JSON.stringify(jsonData, null, 2);
      const filename = `deroma-backup-${dateStr}.json`;

      return new NextResponse(jsonContent, {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-store, max-age=0",
        },
      });
    }
  } catch (error: any) {
    console.error("Backup export error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate backup export" },
      { status: 500 }
    );
  }
}
