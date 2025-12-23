-- AlterTable
ALTER TABLE "RefreshToken" ALTER COLUMN "userAgent" DROP NOT NULL,
ALTER COLUMN "ipAddress" DROP NOT NULL;
