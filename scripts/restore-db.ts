import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config();

import { previewBackupData, executeRestore } from "../src/lib/backup/db-restore";
import prisma from "../src/lib/prisma";

async function runRestore() {
  const args = process.argv.slice(2);
  let filePath = args[0];

  console.log("\n=======================================================");
  console.log("🔄 DeRoma Database Restore Engine");
  console.log("=======================================================\n");

  if (!filePath) {
    // Find the latest backup file in backups/
    const backupDir = path.resolve(process.cwd(), "backups");
    if (fs.existsSync(backupDir)) {
      const jsonFiles = fs.readdirSync(backupDir)
        .filter(f => f.startsWith("deroma-backup-") && f.endsWith(".json"))
        .map(f => ({
          name: f,
          path: path.join(backupDir, f),
          time: fs.statSync(path.join(backupDir, f)).mtime.getTime(),
        }))
        .sort((a, b) => b.time - a.time);

      if (jsonFiles.length > 0) {
        filePath = jsonFiles[0].path;
        console.log(`ℹ️ No file specified. Auto-selected latest backup: ${jsonFiles[0].name}`);
      }
    }
  }

  if (!filePath || !fs.existsSync(filePath)) {
    console.error(`❌ Backup file not found: ${filePath || "None provided"}`);
    console.log("Usage: npm run db:restore [path/to/deroma-backup.json]\n");
    process.exit(1);
  }

  try {
    console.log(`📖 Reading backup file: ${filePath}`);
    const rawContent = fs.readFileSync(filePath, "utf8");
    const parsedData = JSON.parse(rawContent);

    console.log("🔍 Inspecting backup integrity...");
    const preview = await previewBackupData(parsedData);

    if (!preview.valid) {
      console.error(`❌ Invalid backup file: ${preview.error}`);
      process.exit(1);
    }

    console.log(`\n📋 Backup Details:`);
    console.log(`- Created At: ${preview.metadata?.exportedAt}`);
    console.log(`- Total Records in Backup: ${preview.totalBackupRecords}`);
    console.log(`- App: ${preview.metadata?.appName}`);

    console.log("\n⏳ Restoring and synchronizing tables into PostgreSQL...");
    const startTime = Date.now();
    const result = await executeRestore(parsedData);

    if (!result.success) {
      console.error(`❌ Restore encountered issues: ${result.message}`);
      if (result.errors) {
        result.errors.forEach(e => console.error(`  - ${e}`));
      }
      process.exit(1);
    }

    console.log(`\n✅ Restore Finished in ${Date.now() - startTime}ms!`);
    console.log(`- Total Records Restored/Upserted: ${result.totalRestored}`);
    console.log("\nRestored breakdown by table:");
    for (const [key, count] of Object.entries(result.tablesRestored)) {
      if (count > 0) {
        console.log(`  • ${key}: ${count} rows`);
      }
    }

    console.log("\n🎉 Database restoration completed successfully!\n");
  } catch (error) {
    console.error("❌ Restore execution failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runRestore();
