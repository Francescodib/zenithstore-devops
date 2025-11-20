require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

let server;

const startServer = () => {
  server = app.listen(PORT, HOST, () => {
    console.log(`
    ╔═══════════════════════════════════════╗
    ║   ZenithStore E-commerce API          ║
    ║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(20)}║
    ║   Server: http://${HOST}:${PORT.toString().padEnd(14)}║
    ║   Health: http://${HOST}:${PORT}/api/health ║
    ║   Metrics: http://${HOST}:${PORT}/metrics   ║
    ╚═══════════════════════════════════════╝
    `);
  });
};

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\nReceived ${signal}, shutting down gracefully...`);

  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();

module.exports = server;
