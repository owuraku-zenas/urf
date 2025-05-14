/*
  Warnings:

  - You are about to drop the column `markedById` on the `Attendance` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_markedById_fkey";

-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "markedById";
