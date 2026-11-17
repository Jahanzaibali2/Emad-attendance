import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const employeeEmail = (
    process.env.SEED_EMPLOYEE_EMAIL ?? "emad@example.com"
  ).toLowerCase();
  const ownerEmail = (
    process.env.SEED_OWNER_EMAIL ?? "owner@example.com"
  ).toLowerCase();
  const employeePassword = process.env.SEED_EMPLOYEE_PASSWORD ?? "emad-change-me";
  const ownerPassword = process.env.SEED_OWNER_PASSWORD ?? "owner-change-me";

  const employeeHash = await bcrypt.hash(employeePassword, 10);
  const ownerHash = await bcrypt.hash(ownerPassword, 10);

  await prisma.user.upsert({
    where: { email: employeeEmail },
    update: { passwordHash: employeeHash, role: Role.EMPLOYEE },
    create: {
      email: employeeEmail,
      passwordHash: employeeHash,
      role: Role.EMPLOYEE,
    },
  });

  await prisma.user.upsert({
    where: { email: ownerEmail },
    update: { passwordHash: ownerHash, role: Role.OWNER },
    create: {
      email: ownerEmail,
      passwordHash: ownerHash,
      role: Role.OWNER,
    },
  });

  const existing = await prisma.employeeProfile.findFirst();
  if (!existing) {
    await prisma.employeeProfile.create({
      data: {
        displayName: "Emad Khan",
        expectedStart: "14:00",
        expectedEnd: "23:00",
        graceMinutes: 15,
        dailyTargetHours: 8,
        monthlySalaryPkr: 15000,
      },
    });
  }

  console.log("Seeded users:", employeeEmail, ownerEmail);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
