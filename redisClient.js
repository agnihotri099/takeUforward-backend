// const redis = require('redis');

// const redisClient = redis.createClient({
//   url: 'redis://localhost:6379' // Adjust based on your Redis server configuration
// });

// redisClient.on('error', (err) => console.log('Redis Client Error', err));

// (async () => {
//   await redisClient.connect();
// })();

// module.exports = redisClient;


const redis = require('redis');
require('dotenv').config();


// Use the REDIS_URL environment variable to connect to your Redis instance
const redisClient = redis.createClient({
  url: process.env.REDIS_URL // This should match the key you set in your .env file or environment variables
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

(async () => {
  await redisClient.connect();
  console.log('Connected to Redis successfully');
})();

module.exports = redisClient;

