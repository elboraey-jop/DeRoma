ALTER TABLE "Expense"
ADD COLUMN "type" TEXT NOT NULL DEFAULT 'expense';

DROP INDEX IF EXISTS "Expense_date_category_idx";

CREATE INDEX "Expense_date_category_type_idx"
ON "Expense"("date", "category", "type");
