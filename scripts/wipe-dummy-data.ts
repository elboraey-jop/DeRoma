import dotenv from "dotenv";
dotenv.config();

import prisma from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function wipeDummyData() {
  console.log("\n=======================================================");
  console.log("🧹 Starting Clean Database Wipe (Purging Dummy Data)");
  console.log("=======================================================\n");

  try {
    console.log("⏳ Deleting transactional & catalog demo records...");

    // 1. Reviews
    const reviews = await prisma.review.deleteMany({});
    console.log(`  ✓ Deleted Reviews: ${reviews.count}`);

    // 2. Orders & OrderItems
    const orderItems = await prisma.orderItem.deleteMany({});
    console.log(`  ✓ Deleted Order Items: ${orderItems.count}`);

    const orders = await prisma.order.deleteMany({});
    console.log(`  ✓ Deleted Orders: ${orders.count}`);

    // 3. Customers
    const customers = await prisma.customer.deleteMany({});
    console.log(`  ✓ Deleted Customers: ${customers.count}`);

    // 4. Inventory & Purchase Invoices
    const inventoryLots = await prisma.inventoryLot.deleteMany({});
    console.log(`  ✓ Deleted Inventory Lots: ${inventoryLots.count}`);

    const invoiceItems = await prisma.purchaseInvoiceItem.deleteMany({});
    console.log(`  ✓ Deleted Purchase Invoice Items: ${invoiceItems.count}`);

    const invoices = await prisma.purchaseInvoice.deleteMany({});
    console.log(`  ✓ Deleted Purchase Invoices: ${invoices.count}`);

    // 5. Stock Audits
    const auditItems = await prisma.stockAuditItem.deleteMany({});
    console.log(`  ✓ Deleted Stock Audit Items: ${auditItems.count}`);

    const stockAudits = await prisma.stockAudit.deleteMany({});
    console.log(`  ✓ Deleted Stock Audits: ${stockAudits.count}`);

    // 6. Products & Variants & Relations
    const productRelations = await prisma.productRelation.deleteMany({});
    console.log(`  ✓ Deleted Product Relations: ${productRelations.count}`);

    const productVariants = await prisma.productVariant.deleteMany({});
    console.log(`  ✓ Deleted Product Variants: ${productVariants.count}`);

    const products = await prisma.product.deleteMany({});
    console.log(`  ✓ Deleted Products: ${products.count}`);

    // 7. Suppliers
    const suppliers = await prisma.supplier.deleteMany({});
    console.log(`  ✓ Deleted Suppliers: ${suppliers.count}`);

    // 8. Accounting & Financials
    const expenses = await prisma.expense.deleteMany({});
    console.log(`  ✓ Deleted Expenses: ${expenses.count}`);

    const settlements = await prisma.weeklySettlement.deleteMany({});
    console.log(`  ✓ Deleted Weekly Settlements: ${settlements.count}`);

    const transfers = await prisma.accountTransfer.deleteMany({});
    console.log(`  ✓ Deleted Account Transfers: ${transfers.count}`);

    // 9. Contact Messages
    const contactMessages = await prisma.contactMessage.deleteMany({});
    console.log(`  ✓ Deleted Contact Messages: ${contactMessages.count}`);

    // 10. Clean SiteSettings (reset old product reference IDs)
    await prisma.siteSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        forYouProductIds: [],
        bestSellerProductIds: [],
        heroBanners: [],
        homeReviews: [],
      },
      update: {
        forYouProductIds: [],
        bestSellerProductIds: [],
        heroBanners: [],
        homeReviews: [],
      },
    });
    console.log("  ✓ Reset SiteSettings product links to clean state.");

    // 11. Ensure Admin User exists
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@deroma.com").trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123456";
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    await prisma.user.upsert({
      where: { email: adminEmail },
      create: {
        email: adminEmail,
        passwordHash,
        name: "Store Administrator",
        role: "admin",
      },
      update: {
        passwordHash,
        role: "admin",
        name: "Store Administrator",
      },
    });
    console.log(`  ✓ Verified Admin User: ${adminEmail}`);

    console.log("\n=======================================================");
    console.log("✨ Database successfully cleaned and prepared for production!");
    console.log("=======================================================\n");
  } catch (error) {
    console.error("❌ Database wipe failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

wipeDummyData();
