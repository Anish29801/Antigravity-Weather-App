const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from root directory .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const requiredEnv = ['JWT_SECRET', 'MONGO_URI'];

requiredEnv.forEach((name) => {
  if (!process.env[name]) {
    throw new Error(`CRITICAL CONFIG FAILURE: Environment variable ${name} is not set.`);
  }
});

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY,
  weatherCacheTtl: parseInt(process.env.WEATHER_CACHE_TTL || '600', 10)
};
