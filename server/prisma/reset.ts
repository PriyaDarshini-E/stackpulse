import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Wiping all data from StackPulse database...');
  await prisma.pin.deleteMany();
  await prisma.comparisonDev.deleteMany();
  await prisma.comparison.deleteMany();
  await prisma.user.deleteMany();
  await prisma.repo.deleteMany();
  await prisma.developer.deleteMany();

  const counts = {
    users: await prisma.user.count(),
    pins: await prisma.pin.count(),
    comparisons: await prisma.comparison.count(),
    developers: await prisma.developer.count(),
    repos: await prisma.repo.count(),
  };

  console.log('✅ Database reset complete. Current counts:', counts);
}

main()
  .catch((e) => {
    console.error('❌ Failed to reset database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
