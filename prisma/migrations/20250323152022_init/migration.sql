-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('Gerencia', 'Supervision', 'Operador');

-- CreateTable
CREATE TABLE "city" (
    "id" UUID NOT NULL,
    "id_visible" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "uploadUserID" UUID,
    "name" TEXT NOT NULL,

    CONSTRAINT "city_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "neighborhood" (
    "id" UUID NOT NULL,
    "id_visible" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "uploadUserID" UUID,
    "name" TEXT,
    "zoneID" UUID,
    "coordinates" TEXT[],
    "cityID" UUID,

    CONSTRAINT "neighborhood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claim" (
    "id" UUID NOT NULL,
    "id_visible" INTEGER,
    "closeAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "uploadUserID" UUID,
    "direction" TEXT,
    "clientLastName" TEXT,
    "clientName" TEXT,
    "clientCount" TEXT,
    "phone" TEXT,
    "description" TEXT,
    "claimTypeID" UUID,
    "neighborhoodID" UUID,
    "workerID" UUID,
    "tasks" TEXT,

    CONSTRAINT "claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL,
    "id_visible" INTEGER,
    "username" TEXT,
    "mail" TEXT,
    "password" TEXT,
    "name" TEXT,
    "last_name" TEXT,
    "old_password" TEXT,
    "otp" BOOLEAN NOT NULL DEFAULT true,
    "root" BOOLEAN NOT NULL DEFAULT false,
    "id_user" UUID,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedDate" TIMESTAMP(3),
    "rol" "Rol" NOT NULL DEFAULT 'Supervision',

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_city" (
    "userID" UUID NOT NULL,
    "cityID" UUID NOT NULL,

    CONSTRAINT "user_city_pkey" PRIMARY KEY ("userID","cityID")
);

-- CreateIndex
CREATE INDEX "city_active_idx" ON "city"("active");

-- CreateIndex
CREATE INDEX "city_deleted_idx" ON "city"("deleted");

-- CreateIndex
CREATE INDEX "neighborhood_deleted_idx" ON "neighborhood"("deleted");

-- CreateIndex
CREATE INDEX "neighborhood_active_idx" ON "neighborhood"("active");

-- CreateIndex
CREATE INDEX "claim_deleted_idx" ON "claim"("deleted");

-- CreateIndex
CREATE INDEX "claim_active_idx" ON "claim"("active");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_mail_key" ON "user"("mail");

-- CreateIndex
CREATE INDEX "user_deleted_idx" ON "user"("deleted");

-- CreateIndex
CREATE INDEX "user_active_idx" ON "user"("active");

-- AddForeignKey
ALTER TABLE "city" ADD CONSTRAINT "city_uploadUserID_fkey" FOREIGN KEY ("uploadUserID") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "neighborhood" ADD CONSTRAINT "neighborhood_uploadUserID_fkey" FOREIGN KEY ("uploadUserID") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "neighborhood" ADD CONSTRAINT "neighborhood_cityID_fkey" FOREIGN KEY ("cityID") REFERENCES "city"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim" ADD CONSTRAINT "claim_uploadUserID_fkey" FOREIGN KEY ("uploadUserID") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim" ADD CONSTRAINT "claim_neighborhoodID_fkey" FOREIGN KEY ("neighborhoodID") REFERENCES "neighborhood"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_city" ADD CONSTRAINT "user_city_userID_fkey" FOREIGN KEY ("userID") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_city" ADD CONSTRAINT "user_city_cityID_fkey" FOREIGN KEY ("cityID") REFERENCES "city"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
