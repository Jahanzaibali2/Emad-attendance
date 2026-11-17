-- CreateEnum
CREATE TYPE "Role" AS ENUM ('EMPLOYEE', 'OWNER');

-- CreateEnum
CREATE TYPE "EndReason" AS ENUM ('CLOCK_OUT', 'AUTO_CLOSED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeProfile" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "expectedStart" TEXT NOT NULL DEFAULT '14:00',
    "expectedEnd" TEXT NOT NULL DEFAULT '23:00',
    "graceMinutes" INTEGER NOT NULL DEFAULT 15,
    "dailyTargetHours" DOUBLE PRECISION NOT NULL DEFAULT 8,
    "monthlySalaryPkr" INTEGER NOT NULL DEFAULT 15000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeSession" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "workDate" DATE NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "endReason" "EndReason",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimeSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "TimeSession_employeeId_workDate_idx" ON "TimeSession"("employeeId", "workDate");

-- CreateIndex
CREATE INDEX "TimeSession_employeeId_endedAt_idx" ON "TimeSession"("employeeId", "endedAt");

-- CreateIndex: at most one open session per employee
CREATE UNIQUE INDEX "TimeSession_one_open_per_employee"
ON "TimeSession" ("employeeId")
WHERE "endedAt" IS NULL;

-- AddForeignKey
ALTER TABLE "TimeSession" ADD CONSTRAINT "TimeSession_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "EmployeeProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
