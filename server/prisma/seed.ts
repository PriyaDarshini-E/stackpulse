import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@stackpulse.dev';
  const password = 'Password123!';

  console.log(`🌱 Preparing fresh demo account for ${email}...`);

  // Ensure any existing demo account is cleaned up
  await prisma.user.deleteMany({
    where: { email },
  });

  const password_hash = await bcrypt.hash(password, 10);

  const demoUser = await prisma.user.create({
    data: {
      email,
      password_hash,
    },
    select: {
      id: true,
      email: true,
      created_at: true,
    },
  });

  console.log('✅ Fresh demo account created successfully:');
  console.log(`   Email:    ${demoUser.email}`);
  console.log(`   Password: ${password}`);
}

main()
  .catch((e) => {
    console.error('❌ Failed to seed demo user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
