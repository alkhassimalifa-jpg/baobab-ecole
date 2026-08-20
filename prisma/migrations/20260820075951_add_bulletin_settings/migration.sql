-- CreateTable
CREATE TABLE "bulletin_settings" (
    "id" TEXT NOT NULL,
    "showRank" BOOLEAN NOT NULL DEFAULT false,
    "showAppreciation" BOOLEAN NOT NULL DEFAULT false,
    "showSignatures" BOOLEAN NOT NULL DEFAULT true,
    "footerText" TEXT,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bulletin_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bulletin_settings_schoolId_key" ON "bulletin_settings"("schoolId");

-- AddForeignKey
ALTER TABLE "bulletin_settings" ADD CONSTRAINT "bulletin_settings_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
