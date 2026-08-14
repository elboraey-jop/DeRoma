import prisma from "@/lib/prisma";

export interface TableExportConfig {
  key: string;
  model: string;
  tableName: string;
  labelAr: string;
  labelEn: string;
  category: "core" | "catalog" | "orders" | "inventory" | "financials" | "content";
}

export const BACKUP_TABLES: TableExportConfig[] = [
  // 1. Independent Core & Config Tables
  { key: "users", model: "user", tableName: "User", labelAr: "المستخدمين والمدراء", labelEn: "Users & Admins", category: "core" },
  { key: "suppliers", model: "supplier", tableName: "Supplier", labelAr: "الموردين", labelEn: "Suppliers", category: "inventory" },
  { key: "customers", model: "customer", tableName: "Customer", labelAr: "العملاء", labelEn: "Customers", category: "orders" },
  { key: "catalogOptions", model: "catalogOption", tableName: "CatalogOption", labelAr: "خيارات الكتالوج", labelEn: "Catalog Options", category: "catalog" },
  { key: "shippingZones", model: "shippingZone", tableName: "ShippingZone", labelAr: "مناطق الشحن", labelEn: "Shipping Zones", category: "core" },
  { key: "shippingZoneExceptions", model: "shippingZoneException", tableName: "ShippingZoneException", labelAr: "استثناءات الشحن", labelEn: "Shipping Zone Exceptions", category: "core" },
  { key: "shippingSettings", model: "shippingSettings", tableName: "ShippingSettings", labelAr: "إعدادات الشحن", labelEn: "Shipping Settings", category: "core" },
  { key: "promotions", model: "promotion", tableName: "Promotion", labelAr: "العروض والكوبونات", labelEn: "Promotions", category: "catalog" },
  { key: "announcementBars", model: "announcementBar", tableName: "AnnouncementBar", labelAr: "شريط الإعلانات", labelEn: "Announcement Bar", category: "content" },
  { key: "siteSettings", model: "siteSettings", tableName: "SiteSettings", labelAr: "إعدادات الموقع", labelEn: "Site Settings", category: "content" },
  { key: "contactMessages", model: "contactMessage", tableName: "ContactMessage", labelAr: "رسائل التواصل", labelEn: "Contact Messages", category: "content" },
  
  // 2. Accounting & Financials
  { key: "expenses", model: "expense", tableName: "Expense", labelAr: "المصروفات والإيرادات", labelEn: "Expenses & Income", category: "financials" },
  { key: "weeklySettlements", model: "weeklySettlement", tableName: "WeeklySettlement", labelAr: "التسويات الأسبوعية", labelEn: "Weekly Settlements", category: "financials" },
  { key: "accountTransfers", model: "accountTransfer", tableName: "AccountTransfer", labelAr: "تحويلات الخزينة", labelEn: "Account Transfers", category: "financials" },

  // 3. Products & Catalog (depends on Supplier)
  { key: "products", model: "product", tableName: "Product", labelAr: "المنتجات", labelEn: "Products", category: "catalog" },
  { key: "productRelations", model: "productRelation", tableName: "ProductRelation", labelAr: "علاقات المنتجات", labelEn: "Product Relations", category: "catalog" },
  { key: "productVariants", model: "productVariant", tableName: "ProductVariant", labelAr: "مقاسات وتفرعات المنتجات", labelEn: "Product Variants", category: "catalog" },

  // 4. Orders & Reviews (depends on User, Product, Variant)
  { key: "orders", model: "order", tableName: "Order", labelAr: "الطلبات", labelEn: "Orders", category: "orders" },
  { key: "orderItems", model: "orderItem", tableName: "OrderItem", labelAr: "تفاصيل المنتجات بالطلبات", labelEn: "Order Items", category: "orders" },
  { key: "reviews", model: "review", tableName: "Review", labelAr: "التقييمات", labelEn: "Reviews", category: "content" },

  // 5. Invoices & Inventory Tracking (depends on Supplier, Product, Variant)
  { key: "purchaseInvoices", model: "purchaseInvoice", tableName: "PurchaseInvoice", labelAr: "فواتير المشتريات", labelEn: "Purchase Invoices", category: "inventory" },
  { key: "purchaseInvoiceItems", model: "purchaseInvoiceItem", tableName: "PurchaseInvoiceItem", labelAr: "بنود فواتير المشتريات", labelEn: "Invoice Items", category: "inventory" },
  { key: "inventoryLots", model: "inventoryLot", tableName: "InventoryLot", labelAr: "دفعات المخزون والتكلفة", labelEn: "Inventory Lots", category: "inventory" },
  { key: "stockAudits", model: "stockAudit", tableName: "StockAudit", labelAr: "عمليات الجرد", labelEn: "Stock Audits", category: "inventory" },
  { key: "stockAuditItems", model: "stockAuditItem", tableName: "StockAuditItem", labelAr: "تفاصيل الجرد", labelEn: "Stock Audit Items", category: "inventory" },
];

export interface BackupMetadata {
  version: string;
  appName: string;
  exportedAt: string;
  environment: string;
  totalTables: number;
  totalRecords: number;
  tableCounts: Record<string, number>;
}

export interface BackupData {
  metadata: BackupMetadata;
  data: Record<string, any[]>;
}

export interface DatabaseStats {
  tableStats: {
    key: string;
    labelAr: string;
    labelEn: string;
    tableName: string;
    category: string;
    count: number;
  }[];
  totalRecords: number;
  totalTables: number;
  lastCheckedAt: string;
  connectionStatus: "connected" | "disconnected";
}

/**
 * Fetch live record counts and statistics for all database tables
 */
export async function getDatabaseStats(): Promise<DatabaseStats> {
  const tableStats = [];
  let totalRecords = 0;

  for (const table of BACKUP_TABLES) {
    try {
      const modelDelegate = (prisma as any)[table.model];
      const count = modelDelegate ? await modelDelegate.count() : 0;
      tableStats.push({
        key: table.key,
        labelAr: table.labelAr,
        labelEn: table.labelEn,
        tableName: table.tableName,
        category: table.category,
        count,
      });
      totalRecords += count;
    } catch (e) {
      console.error(`Error counting table ${table.model}:`, e);
      tableStats.push({
        key: table.key,
        labelAr: table.labelAr,
        labelEn: table.labelEn,
        tableName: table.tableName,
        category: table.category,
        count: 0,
      });
    }
  }

  return {
    tableStats,
    totalRecords,
    totalTables: BACKUP_TABLES.length,
    lastCheckedAt: new Date().toISOString(),
    connectionStatus: "connected",
  };
}

/**
 * Format a value to safe JSON-serializable representation
 */
function serializeValue(val: any): any {
  if (val === null || val === undefined) return null;
  if (typeof val === "bigint") return val.toString();
  if (val instanceof Date) return val.toISOString();
  if (typeof val === "object" && val !== null && "d" in val && "e" in val) {
    // Prisma Decimal object
    return val.toString();
  }
  if (Array.isArray(val)) {
    return val.map(serializeValue);
  }
  if (typeof val === "object") {
    const res: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      res[k] = serializeValue(v);
    }
    return res;
  }
  return val;
}

/**
 * Export full database or selected categories as structured JSON
 */
export async function exportDatabaseToJSON(categories?: string[]): Promise<BackupData> {
  const tablesToExport = categories && categories.length > 0
    ? BACKUP_TABLES.filter(t => categories.includes(t.category) || categories.includes(t.key))
    : BACKUP_TABLES;

  const data: Record<string, any[]> = {};
  const tableCounts: Record<string, number> = {};
  let totalRecords = 0;

  for (const table of tablesToExport) {
    try {
      const modelDelegate = (prisma as any)[table.model];
      if (!modelDelegate) continue;

      const rows = await modelDelegate.findMany();
      const serializedRows = rows.map((row: any) => serializeValue(row));
      
      data[table.key] = serializedRows;
      tableCounts[table.key] = serializedRows.length;
      totalRecords += serializedRows.length;
    } catch (err) {
      console.error(`Failed to export table ${table.model}:`, err);
      data[table.key] = [];
      tableCounts[table.key] = 0;
    }
  }

  const metadata: BackupMetadata = {
    version: "1.0.0",
    appName: "DeRoma Store",
    exportedAt: new Date().toISOString(),
    environment: process.env.NODE_ENV || "production",
    totalTables: tablesToExport.length,
    totalRecords,
    tableCounts,
  };

  return { metadata, data };
}

/**
 * Format a Javascript value to a clean PostgreSQL SQL literal
 */
function sqlFormatValue(val: any): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
  if (typeof val === "number") {
    if (isNaN(val)) return "NULL";
    return val.toString();
  }
  if (typeof val === "bigint") return val.toString();
  if (typeof val === "string") {
    // Escape single quotes for SQL: ' -> ''
    return `'${val.replace(/'/g, "''")}'`;
  }
  if (val instanceof Date) {
    return `'${val.toISOString()}'::timestamptz`;
  }
  if (Array.isArray(val)) {
    // Array in PostgreSQL
    if (val.length === 0) return "ARRAY[]::text[]";
    const formattedElements = val.map(el => `'${String(el).replace(/'/g, "''")}'`);
    return `ARRAY[${formattedElements.join(", ")}]::text[]`;
  }
  if (typeof val === "object") {
    // JSON or Decimal
    if ("d" in val && "e" in val) {
      return `'${val.toString()}'::numeric`;
    }
    const jsonStr = JSON.stringify(val);
    return `'${jsonStr.replace(/'/g, "''")}'::jsonb`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

/**
 * Export full database as a clean, self-contained, standard PostgreSQL SQL Dump
 */
export async function exportDatabaseToSQL(categories?: string[]): Promise<string> {
  const backup = await exportDatabaseToJSON(categories);
  const { metadata, data } = backup;

  const lines: string[] = [
    `-- ====================================================================`,
    `-- DeRoma Store - PostgreSQL Full Database Backup`,
    `-- Generated At: ${metadata.exportedAt}`,
    `-- App Name: ${metadata.appName}`,
    `-- Total Tables: ${metadata.totalTables} | Total Records: ${metadata.totalRecords}`,
    `-- ====================================================================`,
    ``,
    `SET statement_timeout = 0;`,
    `SET client_encoding = 'UTF8';`,
    `SET standard_conforming_strings = on;`,
    `SET check_function_bodies = false;`,
    `SET client_min_messages = warning;`,
    `SET row_security = off;`,
    ``,
    `BEGIN;`,
    ``,
  ];

  for (const table of BACKUP_TABLES) {
    const rows = data[table.key];
    if (!rows || rows.length === 0) continue;

    lines.push(`-- Table: "${table.tableName}" (${rows.length} rows) - ${table.labelAr}`);
    
    for (const row of rows) {
      const columns = Object.keys(row);
      const quotedCols = columns.map(col => `"${col}"`).join(", ");
      const values = columns.map(col => sqlFormatValue(row[col])).join(", ");

      lines.push(`INSERT INTO "${table.tableName}" (${quotedCols}) VALUES (${values}) ON CONFLICT DO NOTHING;`);
    }

    lines.push(``);
  }

  lines.push(`COMMIT;`);
  lines.push(`-- =================== Backup SQL Complete ===================`);

  return lines.join("\n");
}
