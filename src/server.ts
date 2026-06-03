import dotenv from 'dotenv';
import app from './app';
import { connectAndSyncDB } from './database';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);

const startServer = async () => {
  try {
    // Connect to database and sync schema
    // Set connectAndSyncDB(true) if you want to drop tables and recreate (force sync)
    const isForceSync = process.env.DB_FORCE_SYNC === 'true';
    await connectAndSyncDB(isForceSync);

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`========================================`);
      console.log(`  Kaybiz REST API is running!`);
      console.log(`  Slogan: "Gestión total – Simple y potente."`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Address: http://localhost:${PORT}`);
      console.log(`========================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
