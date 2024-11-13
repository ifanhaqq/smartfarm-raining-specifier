/*
  Warnings:

  - Added the required column `apwl` to the `MonthlyStats` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MonthlyStats" ADD COLUMN     "apwl" DOUBLE PRECISION NOT NULL;
