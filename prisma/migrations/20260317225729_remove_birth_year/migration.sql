/*
  Warnings:

  - You are about to drop the column `dateOfBirth` on the `Member` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Member" DROP COLUMN "dateOfBirth",
ADD COLUMN     "birthDay" INTEGER,
ADD COLUMN     "birthMonth" INTEGER;
