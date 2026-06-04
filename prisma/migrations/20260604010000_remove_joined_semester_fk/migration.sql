-- Drop joinedSemesterId FK and column from Member
ALTER TABLE "Member" DROP CONSTRAINT IF EXISTS "Member_joinedSemesterId_fkey";
ALTER TABLE "Member" DROP COLUMN IF EXISTS "joinedSemesterId";

-- Drop isOldMemberBucket column from Semester
ALTER TABLE "Semester" DROP COLUMN IF EXISTS "isOldMemberBucket";
