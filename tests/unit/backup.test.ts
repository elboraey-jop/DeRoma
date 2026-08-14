import test from "node:test";
import assert from "node:assert/strict";
import { BACKUP_TABLES } from "../../src/lib/backup/db-export";
import { previewBackupData } from "../../src/lib/backup/db-restore";

test("backup configuration contains all expected tables and categories", () => {
  assert.ok(BACKUP_TABLES.length >= 20, "Should have all core models mapped");
  
  const categories = new Set(BACKUP_TABLES.map(t => t.category));
  assert.ok(categories.has("core"));
  assert.ok(categories.has("catalog"));
  assert.ok(categories.has("orders"));
  assert.ok(categories.has("inventory"));
  assert.ok(categories.has("financials"));
  assert.ok(categories.has("content"));
});

test("previewBackupData correctly identifies invalid formats", async () => {
  const invalidResult1 = await previewBackupData(null);
  assert.equal(invalidResult1.valid, false);

  const invalidResult2 = await previewBackupData({});
  assert.equal(invalidResult2.valid, false);

  const validStructure = {
    metadata: {
      version: "1.0.0",
      appName: "DeRoma Store",
      exportedAt: new Date().toISOString(),
      environment: "test",
      totalTables: 25,
      totalRecords: 10,
      tableCounts: { users: 1, products: 2 },
    },
    data: {
      users: [{ id: "user-1", email: "test@deroma.com", role: "admin" }],
      products: [{ id: "prod-1", name: "Test Shoe", price: "1500" }],
    },
  };

  const validResult = await previewBackupData(validStructure);
  assert.equal(validResult.valid, true);
  assert.equal(validResult.totalBackupRecords, 2);
});
