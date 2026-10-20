import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from './db/prisma.js';

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL database');

    const server = app.listen(env.PORT, () => {
      console.log(`🚀 StackPulse server running on http://localhost:${env.PORT}`);
      console.log(`📡 Client URL: ${env.CLIENT_URL}`);
      console.log(`⏱️ GitHub Cache TTL: ${env.CACHE_TTL_MINUTES} minutes`);
    });

    const shutdown = async () => {
      console.log('\n🛑 Gracefully shutting down...');
      server.close(async () => {
        await prisma.$disconnect();
        console.log('👋 Database connection closed. Server terminated.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
