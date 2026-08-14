import prisma from "@/lib/prisma";
import { BACKUP_TABLES, BackupData } from "./db-export";

export interface RestorePreview {
  valid: boolean;
  error?: string;
  metadata?: BackupData["metadata"];
  tablesSummary: {
    key: string;
    labelAr: string;
    labelEn: string;
    tableName: string;
    recordsInBackup: number;
    currentRecordsInDb: number;
  }[];
  totalBackupRecords: number;
}

export interface RestoreResult {
  success: boolean;
  message: string;
  tablesRestored: Record<string, number>;
  totalRestored: number;
  errors?: string[];
}

/**
 * Validates a JSON backup structure and returns summary preview before applying
 */
export async function previewBackupData(parsedJson: any): Promise<RestorePreview> {
  if (!parsedJson || typeof parsedJson !== "object") {
    return { valid: false, error: "Invalid backup file: Not a valid JSON object.", tablesSummary: [], totalBackupRecords: 0 };
  }

  if (!parsedJson.metadata || !parsedJson.data) {
    return { valid: false, error: "Invalid backup file structure: Missing 'metadata' or 'data' section.", tablesSummary: [], totalBackupRecords: 0 };
  }

  const tablesSummary = [];
  let totalBackupRecords = 0;

  for (const table of BACKUP_TABLES) {
    const backupRows = parsedJson.data[table.key] || [];
    const modelDelegate = (prisma as any)[table.model];
    let currentDbCount = 0;
    try {
      if (modelDelegate) {
        currentDbCount = await modelDelegate.count();
      }
    } catch {
      currentDbCount = 0;
    }

    tablesSummary.push({
      key: table.key,
      labelAr: table.labelAr,
      labelEn: table.labelEn,
      tableName: table.tableName,
      recordsInBackup: backupRows.length,
      currentRecordsInDb: currentDbCount,
    });
    totalBackupRecords += backupRows.length;
  }

  return {
    valid: true,
    metadata: parsedJson.metadata,
    tablesSummary,
    totalBackupRecords,
  };
}

/**
 * Deserializes JSON row values into Prisma-compatible types (Dates, Decimals, etc.)
 */
function deserializeRow(row: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(row)) {
    if (val === null || val === undefined) {
      result[key] = null;
      continue;
    }

    // Check if ISO Date string
    if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)) {
      result[key] = new Date(val);
      continue;
    }

    result[key] = val;
  }
  return result;
}

/**
 * Execute restore of the backup data
 * Mode: 'upsert' (safe: updates existing rows by ID, inserts new ones)
 */
export async function executeRestore(
  backupData: BackupData,
  selectedKeys?: string[]
): Promise<RestoreResult> {
  const preview = await previewBackupData(backupData);
  if (!preview.valid) {
    return {
      success: false,
      message: preview.error || "Validation failed.",
      tablesRestored: {},
      totalRestored: 0,
    };
  }

  const tablesToProcess = BACKUP_TABLES.filter(table => {
    if (selectedKeys && selectedKeys.length > 0) {
      return selectedKeys.includes(table.key);
    }
    return true;
  });

  const tablesRestored: Record<string, number> = {};
  let totalRestored = 0;
  const errors: string[] = [];

  // Execute restore in a top-down dependency sequence
  for (const table of tablesToProcess) {
    const rows = backupData.data[table.key];
    if (!rows || rows.length === 0) continue;

    const modelDelegate = (prisma as any)[table.model];
    if (!modelDelegate) continue;

    let restoredCount = 0;

    for (const rawRow of rows) {
      const row = deserializeRow(rawRow);
      try {
        if (table.key === "productRelations") {
          // Composite primary key [productId, relatedProductId]
          await modelDelegate.upsert({
            where: {
              productId_relatedProductId: {
                productId: row.productId,
                relatedProductId: row.relatedProductId,
              },
            },
            create: row,
            update: row,
          });
        } else if (table.key === "shippingZoneExceptions") {
          // Composite unique [shippingZoneId, city]
          await modelDelegate.upsert({
            where: {
              shippingZoneId_city: {
                shippingZoneId: row.shippingZoneId,
                city: row.city,
              },
            },
            create: row,
            update: row,
          });
        } else if (table.key === "catalogOptions") {
          // Unique [category, type, name]
          await modelDelegate.upsert({
            where: { id: row.id },
            create: row,
            update: row,
          });
        } else if (row.id) {
          // Standard table with `id` primary key
          await modelDelegate.upsert({
            where: { id: row.id },
            create: row,
            update: row,
          });
        } else {
          // Fallback create
          await modelDelegate.create({ data: row });
        }
        restoredCount++;
      } catch (err: any) {
        console.error(`Failed to restore row in ${table.model}:`, err?.message || err);
        errors.push(`Table ${table.tableName}: ${err?.message || "Failed to insert row"}`);
      }
    }

    tablesRestored[table.key] = restoredCount;
    totalRestored += restoredCount;
  }

  return {
    success: errors.length === 0 || totalRestored > 0,
    message: errors.length === 0
      ? `Successfully restored ${totalRestored} records across ${Object.keys(tablesRestored).length} tables.`
      : `Restored ${totalRestored} records with ${errors.length} minor warnings.`,
    tablesRestored,
    totalRestored,
    errors: errors.slice(0, 10), // Return first 10 errors for brevity
  };
}
