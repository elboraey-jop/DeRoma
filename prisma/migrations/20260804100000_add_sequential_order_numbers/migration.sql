CREATE SEQUENCE "Order_orderSequence_seq";

ALTER TABLE "Order"
ADD COLUMN "orderSequence" INTEGER;

WITH numbered_orders AS (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt" ASC, "id" ASC)::INTEGER AS sequence
  FROM "Order"
)
UPDATE "Order" AS orders
SET "orderSequence" = numbered_orders.sequence
FROM numbered_orders
WHERE orders."id" = numbered_orders."id";

SELECT setval(
  '"Order_orderSequence_seq"',
  COALESCE((SELECT MAX("orderSequence") FROM "Order"), 0) + 1,
  false
);

ALTER TABLE "Order"
ALTER COLUMN "orderSequence" SET DEFAULT nextval('"Order_orderSequence_seq"'),
ALTER COLUMN "orderSequence" SET NOT NULL;

ALTER SEQUENCE "Order_orderSequence_seq" OWNED BY "Order"."orderSequence";

UPDATE "Order"
SET "orderNumber" = 'DR-MIGRATING-' || "id";

UPDATE "Order"
SET "orderNumber" = 'DR-' || LPAD("orderSequence"::TEXT, 4, '0');

CREATE UNIQUE INDEX "Order_orderSequence_key" ON "Order"("orderSequence");
