// Load environment variables before anything else
const config = require('./config/env');
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

// Uncaught Exception Handler
process.on('uncaughtException', (err) => {
  logger.error(`UNCAUGHT EXCEPTION: ${err.message}`);
  logger.error(err.stack);
  process.exit(1);
});

// Connect to Database
connectDB();

// Start server
const server = app.listen(config.port, () => {
  logger.info(`====================================================`);
  logger.info(`            AETHER OS - Express Backend            `);
  logger.info(`====================================================`);
  logger.info(`📡 Server running in [${config.env}] mode on port: ${config.port}`);
  logger.info(`🔗 API Gateway endpoint: http://localhost:${config.port}/api`);
  logger.info(`====================================================`);
});

// Unhandled Rejection Handler
process.on('unhandledRejection', (err) => {
  logger.error(`UNHANDLED REJECTION: ${err.message}`);
  logger.error(err.stack);
  // Gracefully close server & exit process
  server.close(() => {
    process.exit(1);
  });
});
