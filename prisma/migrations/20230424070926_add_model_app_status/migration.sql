-- CreateEnum
CREATE TYPE "ModelAppStatus" AS ENUM ('STOPPED', 'BUILDING', 'RUNNING', 'RUNTIME_ERROR', 'BUILD_ERROR');

-- AlterTable
ALTER TABLE "ModelApp" ADD COLUMN     "state" "ModelAppStatus" NOT NULL DEFAULT 'STOPPED';
