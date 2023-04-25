/*
  Warnings:

  - The `state` column on the `ModelApp` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ModelAppStates" AS ENUM ('Stopped', 'Building', 'Running', 'RuntimeError', 'BuildError');

-- AlterTable
ALTER TABLE "ModelApp" DROP COLUMN "state",
ADD COLUMN     "state" "ModelAppStates" NOT NULL DEFAULT 'Stopped';

-- DropEnum
DROP TYPE "ModelAppStatus";
