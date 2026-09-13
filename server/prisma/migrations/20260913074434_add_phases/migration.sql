/*
  Warnings:

  - Added the required column `phaseId` to the `Week` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Week" ADD COLUMN     "phaseId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Phase" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "phaseNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Phase_programId_phaseNumber_key" ON "Phase"("programId", "phaseNumber");

-- CreateIndex
CREATE INDEX "Week_phaseId_idx" ON "Week"("phaseId");

-- AddForeignKey
ALTER TABLE "Phase" ADD CONSTRAINT "Phase_programId_fkey" FOREIGN KEY ("programId") REFERENCES "TrainingProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Week" ADD CONSTRAINT "Week_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
