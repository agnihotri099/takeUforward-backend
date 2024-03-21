
// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const submissionsRouter = require('./submissionsRouter'); // Import the router
// const app = express();
// const PORT = process.env.PORT || 3001;
// app.use(cors());
// require('dotenv').config();


// // Middleware
// app.use(bodyParser.json());

// // Routes
// app.use('/api', submissionsRouter); // Use your router for routes starting with /api

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const submissionsRouter = require('./submissionsRouter');
const app = express();
const PORT = process.env.PORT || 3001;
require('dotenv').config();

// Import the Redis client
const redisClient = require('./redisClient');

app.use(cors());
app.use(bodyParser.json());
app.use('/api', submissionsRouter);

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

function gracefulShutdown(signal) {
  console.log(`Received ${signal}. Shutting down gracefully...`);

  server.close(async () => {
    console.log('HTTP server closed.');

    // Close the Redis connection
    try {
      await redisClient.quit();
      console.log('Redis client disconnected.');
    } catch (error) {
      console.error('Error disconnecting Redis client:', error);
    }

    console.log('Shutdown complete.');
    process.exit(0);
  });
}

// Handle termination signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

