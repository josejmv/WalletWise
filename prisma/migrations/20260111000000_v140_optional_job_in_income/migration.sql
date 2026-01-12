-- v1.4.0: Make jobId optional in incomes table
-- This allows creating "Ingreso Extra" (income without associated job)

-- AlterTable
ALTER TABLE "incomes" ALTER COLUMN "jobId" DROP NOT NULL;
