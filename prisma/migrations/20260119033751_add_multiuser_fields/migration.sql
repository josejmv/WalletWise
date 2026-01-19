/*
  Warnings:

  - A unique constraint covering the columns `[userId,name]` on the table `inventory_categories` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "inventory_categories_name_key";

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "budget_contributions" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "budgets" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "incomes" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "inventory_categories" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "inventory_items" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "transfers" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "totpEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totpSecret" TEXT,
ADD COLUMN     "webauthnEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "authenticators" (
    "id" TEXT NOT NULL,
    "credentialID" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "credentialPublicKey" TEXT NOT NULL,
    "counter" BIGINT NOT NULL,
    "credentialDeviceType" TEXT NOT NULL,
    "credentialBackedUp" BOOLEAN NOT NULL,
    "transports" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "authenticators_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "authenticators_credentialID_key" ON "authenticators"("credentialID");

-- CreateIndex
CREATE INDEX "authenticators_userId_idx" ON "authenticators"("userId");

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE INDEX "budget_contributions_userId_idx" ON "budget_contributions"("userId");

-- CreateIndex
CREATE INDEX "budgets_userId_idx" ON "budgets"("userId");

-- CreateIndex
CREATE INDEX "categories_userId_idx" ON "categories"("userId");

-- CreateIndex
CREATE INDEX "expenses_userId_idx" ON "expenses"("userId");

-- CreateIndex
CREATE INDEX "incomes_userId_idx" ON "incomes"("userId");

-- CreateIndex
CREATE INDEX "inventory_categories_userId_idx" ON "inventory_categories"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_categories_userId_name_key" ON "inventory_categories"("userId", "name");

-- CreateIndex
CREATE INDEX "inventory_items_userId_idx" ON "inventory_items"("userId");

-- CreateIndex
CREATE INDEX "jobs_userId_idx" ON "jobs"("userId");

-- CreateIndex
CREATE INDEX "transfers_userId_idx" ON "transfers"("userId");

-- AddForeignKey
ALTER TABLE "authenticators" ADD CONSTRAINT "authenticators_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incomes" ADD CONSTRAINT "incomes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_contributions" ADD CONSTRAINT "budget_contributions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_categories" ADD CONSTRAINT "inventory_categories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
