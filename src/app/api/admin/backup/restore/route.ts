import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";
import { previewBackupData, executeRestore } from "@/lib/backup/db-restore";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await prisma.user.findUnique({ where: { id: session.sub }, select: { role: true } });
  if (admin?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const formData = await request.formData();
    const action = String(formData.get("action") || "preview");
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Backup file is required (.json)" }, { status: 400 });
    }

    const textContent = await file.text();
    let parsedJson: any;

    try {
      parsedJson = JSON.parse(textContent);
    } catch {
      return NextResponse.json(
        { error: "Invalid file format. The file is not a valid JSON document." },
        { status: 400 }
      );
    }

    if (action === "preview") {
      const preview = await previewBackupData(parsedJson);
      return NextResponse.json(preview);
    } else if (action === "restore") {
      const selectedTablesStr = formData.get("selectedTables");
      const selectedTables = selectedTablesStr
        ? String(selectedTablesStr).split(",").map(s => s.trim()).filter(Boolean)
        : undefined;

      const result = await executeRestore(parsedJson, selectedTables);
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: "Unknown action specified" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Backup restore error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process backup file" },
      { status: 500 }
    );
  }
}
