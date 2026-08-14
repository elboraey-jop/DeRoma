import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

// Load environment variables (.env)
dotenv.config();

import { exportDatabaseToJSON, exportDatabaseToSQL, BACKUP_TABLES } from "../src/lib/backup/db-export";
import prisma from "../src/lib/prisma";

async function runBackup() {
  console.log("\n=======================================================");
  console.log("📦 Starting DeRoma PostgreSQL Database Backup Engine");
  console.log("=======================================================\n");

  const startTime = Date.now();
  const backupDir = path.resolve(process.cwd(), "backups");

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log(`📁 Created backup directory: ${backupDir}`);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const jsonPath = path.join(backupDir, `deroma-backup-${timestamp}.json`);
  const sqlPath = path.join(backupDir, `deroma-backup-${timestamp}.sql`);

  try {
    console.log("⏳ Fetching and serializing all database tables...");
    const jsonData = await exportDatabaseToJSON();
    
    // Write JSON file
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), "utf8");
    const jsonSize = (fs.statSync(jsonPath).size / 1024).toFixed(2);
    console.log(`✅ Saved JSON Snapshot: ${jsonPath} (${jsonSize} KB)`);

    // Write SQL file
    const sqlData = await exportDatabaseToSQL();
    fs.writeFileSync(sqlPath, sqlData, "utf8");
    const sqlSize = (fs.statSync(sqlPath).size / 1024).toFixed(2);
    console.log(`✅ Saved Direct SQL Dump: ${sqlPath} (${sqlSize} KB)`);

    // Print summary
    console.log("\n📊 Backup Summary:");
    console.log(`- Total Active Tables: ${jsonData.metadata.totalTables}`);
    console.log(`- Total Records Saved: ${jsonData.metadata.totalRecords}`);
    console.log(`- Time Taken: ${Date.now() - startTime}ms`);
    console.log("\nRecords breakdown by table:");
    for (const [tableKey, count] of Object.entries(jsonData.metadata.tableCounts)) {
      if (count > 0) {
        const tableDef = BACKUP_TABLES.find(t => t.key === tableKey);
        console.log(`  • ${tableDef?.tableName || tableKey}: ${count} rows`);
      }
    }

    // Keep last 14 backups, delete older ones
    rotateBackups(backupDir, 14);

    console.log("\n🎉 Database Backup successfully completed and verified!\n");
  } catch (error) {
    console.error("❌ Backup failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

function rotateBackups(dir: string, keepCount: number) {
  try {
    const files = fs.readdirSync(dir)
      .filter(f => f.startsWith("deroma-backup-") && (f.endsWith(".json") || f.endsWith(".sql")))
      .map(f => ({
        name: f,
        path: path.join(dir, f),
        time: fs.statSync(path.join(dir, f)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length > keepCount * 2) {
      const toDelete = files.slice(keepCount * 2);
      for (const file of toDelete) {
        fs.unlinkSync(file.path);
        console.log(`🧹 Rotated old backup file: ${file.name}`);
      }
    }
  } catch (err) {
    console.warn("⚠️ Rotation warning:", err);
  }
}

runBackup();
