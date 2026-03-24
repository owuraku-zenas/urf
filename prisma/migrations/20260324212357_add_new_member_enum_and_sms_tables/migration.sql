-- AlterEnum
ALTER TYPE "CommitmentStatus" ADD VALUE 'NEW_MEMBER';

-- AlterTable
ALTER TABLE "SmsLog" ADD COLUMN     "batchId" TEXT,
ADD COLUMN     "cost" DOUBLE PRECISION,
ADD COLUMN     "semesterId" TEXT;

-- CreateTable
CREATE TABLE "SmsTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmsTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SmsTemplate_type_key" ON "SmsTemplate"("type");

-- CreateIndex
CREATE INDEX "SmsLog_batchId_idx" ON "SmsLog"("batchId");

-- CreateIndex
CREATE INDEX "SmsLog_semesterId_idx" ON "SmsLog"("semesterId");

-- AddForeignKey
ALTER TABLE "SmsLog" ADD CONSTRAINT "SmsLog_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE SET NULL ON UPDATE CASCADE;
