-- CreateTable
CREATE TABLE "DailySummary" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "workDate" DATE NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailySummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SummaryImage" (
    "id" TEXT NOT NULL,
    "summaryId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SummaryImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailySummary_employeeId_workDate_key" ON "DailySummary"("employeeId", "workDate");

-- CreateIndex
CREATE INDEX "SummaryImage_summaryId_idx" ON "SummaryImage"("summaryId");

-- AddForeignKey
ALTER TABLE "DailySummary" ADD CONSTRAINT "DailySummary_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "EmployeeProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SummaryImage" ADD CONSTRAINT "SummaryImage_summaryId_fkey" FOREIGN KEY ("summaryId") REFERENCES "DailySummary"("id") ON DELETE CASCADE ON UPDATE CASCADE;
