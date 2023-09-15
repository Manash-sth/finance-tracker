-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "del_profile_info" JSONB,
ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false;
