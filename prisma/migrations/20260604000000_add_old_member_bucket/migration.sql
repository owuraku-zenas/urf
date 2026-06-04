-- AlterTable: make startDate/endDate nullable and add isOldMemberBucket
ALTER TABLE "Semester" ALTER COLUMN "startDate" DROP NOT NULL;
ALTER TABLE "Semester" ALTER COLUMN "endDate" DROP NOT NULL;
ALTER TABLE "Semester" ADD COLUMN "isOldMemberBucket" BOOLEAN NOT NULL DEFAULT false;
