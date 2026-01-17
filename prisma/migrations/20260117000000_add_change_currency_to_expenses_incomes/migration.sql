-- AlterTable: Add change system fields to expenses
ALTER TABLE "expenses" ADD COLUMN IF NOT EXISTS "hasChange" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "expenses" ADD COLUMN IF NOT EXISTS "changeAmount" DECIMAL(18,2);
ALTER TABLE "expenses" ADD COLUMN IF NOT EXISTS "changeCurrencyId" TEXT;
ALTER TABLE "expenses" ADD COLUMN IF NOT EXISTS "changeAccountId" TEXT;
ALTER TABLE "expenses" ADD COLUMN IF NOT EXISTS "changeTransferId" TEXT;

-- AlterTable: Add change system fields to incomes
ALTER TABLE "incomes" ADD COLUMN IF NOT EXISTS "hasChange" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "incomes" ADD COLUMN IF NOT EXISTS "changeAmount" DECIMAL(18,2);
ALTER TABLE "incomes" ADD COLUMN IF NOT EXISTS "changeCurrencyId" TEXT;
ALTER TABLE "incomes" ADD COLUMN IF NOT EXISTS "changeAccountId" TEXT;
ALTER TABLE "incomes" ADD COLUMN IF NOT EXISTS "changeTransferId" TEXT;

-- CreateIndex (unique constraint for changeTransferId)
CREATE UNIQUE INDEX IF NOT EXISTS "expenses_changeTransferId_key" ON "expenses"("changeTransferId");
CREATE UNIQUE INDEX IF NOT EXISTS "incomes_changeTransferId_key" ON "incomes"("changeTransferId");
