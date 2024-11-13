/*
  Warnings:

  - Added the required column `groundwater_available` to the `MonthlyStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `groundwater_level` to the `MonthlyStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `heat_index` to the `MonthlyStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rr` to the `MonthlyStats` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MonthlyStats" ADD COLUMN     "groundwater_available" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "groundwater_level" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "heat_index" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "rr" DOUBLE PRECISION NOT NULL;
