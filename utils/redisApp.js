const redis = require('redis');
const catchAsync = require('./catchAsync');

let redisClient;

const redisApp = async () => {
  // check if client already running
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  redisClient = redis.createClient({
    host: '127.0.0.1',
    port: 6379,
  });

  redisClient.on('connect', () => {
    console.log('Connected to Redis');
  });

  redisClient.on('ready', () => {
    console.log('Redis client ready');
  });

  redisClient.on('reconnecting', () => {
    console.log('Reconnecting to Redis');
  });

  redisClient.on('error', (err) => {
    console.error('Redis connection error:', err);
  });

  redisClient.on('end', () => {
    console.log('Redis connection closed');
  });

  try {
    //connect to redis server
    await redisClient.connect();
    console.log('Redis client connected');
  } catch (err) {
    console.error('Error connecting to Redis:', err);
    throw err;
  }

  return redisClient;
};

module.exports = redisApp;
