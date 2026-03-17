-- CreateEnum
CREATE TYPE "CommitmentStatus" AS ENUM ('COMMITTED', 'UNCOMMITTED', 'AT_RISK');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "semesterId" TEXT;

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "admissionYear" TEXT,
ADD COLUMN     "currentAcademicLevel" TEXT,
ADD COLUMN     "joinedSemesterId" TEXT;

-- CreateTable
CREATE TABLE "SemesterCommitment" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,
    "status" "CommitmentStatus" NOT NULL DEFAULT 'UNCOMMITTED',
    "overrideReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SemesterCommitment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SemesterCommitment_memberId_idx" ON "SemesterCommitment"("memberId");

-- CreateIndex
CREATE INDEX "SemesterCommitment_semesterId_idx" ON "SemesterCommitment"("semesterId");

-- CreateIndex
CREATE UNIQUE INDEX "SemesterCommitment_memberId_semesterId_key" ON "SemesterCommitment"("memberId", "semesterId");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_joinedSemesterId_fkey" FOREIGN KEY ("joinedSemesterId") REFERENCES "Semester"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemesterCommitment" ADD CONSTRAINT "SemesterCommitment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemesterCommitment" ADD CONSTRAINT "SemesterCommitment_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE CASCADE ON UPDATE CASCADE;
