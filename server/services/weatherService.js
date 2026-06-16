const axios = require('axios');
const Weather = require('../models/Weather');
const logger = require('../utils/logger');

// Hardcoded base mock data for our futuristic cities
const DEFAULT_CITIES = {
  'Neo-Tokyo': {
    temp: 18,
    status: 'Acid Storm',
    humidity: 89,
    wind: 28,
    coord: '35.6762° N, 139.6503° E',
    type: 'storm'
  },
  'Aether City': {
    temp: 22,
    status: 'Nebula Mist',
    humidity: 65,
    wind: 12,
    coord: '54.5260° N, 15.2551° W',
    type: 'mist'
  },
  'Orbital Terminal': {
    temp: -3,
    status: 'Solar Wind',
    humidity: 0,
    wind: 142,
    coord: 'GEO-SYNC LEO // NODE-7',
    type: 'orbit'
  }
};

const isFresh = (updatedAt) => {
  const ttl = parseInt(process.env.WEATHER_CACHE_TTL || '600', 10);
  const diffInSeconds = (new Date() - new Date(updatedAt)) / 1000;
  return diffInSeconds < ttl;
};

const generateSimulatedWeather = (city) => {
  const base = DEFAULT_CITIES[city] || DEFAULT_CITIES['Neo-Tokyo'];
  
  // Add organic variance (+/- 3 for temp, +/- 10% for wind/humidity)
  const tempVar = (Math.random() - 0.5) * 6;
  const windVar = (Math.random() - 0.5) * base.wind * 0.2;
  const humVar = (Math.random() - 0.5) * base.humidity * 0.1;

  const finalTemp = Math.round(base.temp + tempVar);
  const finalWind = Math.round(base.wind + windVar);
  let finalHum = Math.round(base.humidity + humVar);
  if (base.humidity === 0) finalHum = 0; // Space has no humidity
  
  // Clip values
  finalHum = Math.max(0, Math.min(100, finalHum));

  return {
    temp: `${finalTemp}°C`,
    status: base.status,
    humidity: `${finalHum}%`,
    wind: `${finalWind} km/h`,
    coord: base.coord,
    type: base.type
  };
};

const getCurrentWeather = async (city, userId) => {
  // 1. Check cache in Database
  const cached = await Weather.findOne({ city, userId });
  if (cached && isFresh(cached.updatedAt)) {
    logger.info(`Weather cache HIT for city: ${city}`);
    return cached.data;
  }

  logger.info(`Weather cache MISS/EXPIRED for city: ${city}. Fetching fresh telemetry...`);

  let weatherData;

  // 2. Fetch from external API if key is available and city is real (or maps to real)
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const isRealCity = city === 'Neo-Tokyo'; // We can map Neo-Tokyo to Tokyo for real weather data
  const isDummyKey = !apiKey || apiKey.includes('dummy_') || apiKey === 'your_api_key_here';

  if (isRealCity && !isDummyKey) {
    try {
      // Map Neo-Tokyo to Tokyo
      const queryCity = 'Tokyo';
      const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
        params: {
          q: queryCity,
          appid: apiKey,
          units: 'metric'
        },
        timeout: 5000 // 5 seconds timeout
      });

      const data = response.data;
      
      // Determine type and status
      let type = 'mist';
      let status = 'Overcast';
      const weatherId = data.weather[0].id;
      
      if (weatherId < 600) {
        type = 'storm';
        status = 'Acid Storm'; // Cyperpunk feel
      } else if (weatherId >= 600 && weatherId < 700) {
        type = 'mist';
        status = 'Silicon Snow';
      } else if (weatherId === 800) {
        type = 'orbit';
        status = 'Clear Solar';
      } else {
        type = 'mist';
        status = 'Smoggy Mist';
      }

      weatherData = {
        temp: `${Math.round(data.main.temp)}°C`,
        status: status,
        humidity: `${data.main.humidity}%`,
        wind: `${Math.round(data.wind.speed * 3.6)} km/h`, // convert m/s to km/h
        coord: '35.6762° N, 139.6503° E', // Keep Neo-Tokyo coord display
        type: type
      };
      
      logger.info(`Successfully fetched weather for ${city} (mapped to Tokyo) from OpenWeather`);
    } catch (error) {
      logger.warn(`OpenWeather API fetch failed for ${city}: ${error.message}. Falling back to simulation...`);
      weatherData = generateSimulatedWeather(city);
    }
  } else {
    // Fictional cities or no API key -> simulate weather
    weatherData = generateSimulatedWeather(city);
  }

  // 3. Cache the weather in MongoDB (Upsert)
  const updatedDoc = await Weather.findOneAndUpdate(
    { city, userId },
    { data: weatherData, updatedAt: new Date() },
    { upsert: true, new: true }
  );

  return updatedDoc.data;
};

const generateSimulatedCoordsWeather = (lat, lon) => {
  const finalTemp = Math.round(15 + Math.random() * 12);
  const finalWind = Math.round(8 + Math.random() * 15);
  const finalHum = Math.round(50 + Math.random() * 30);
  
  const formattedLat = Math.abs(lat).toFixed(4) + (lat >= 0 ? '° N' : '° S');
  const formattedLon = Math.abs(lon).toFixed(4) + (lon >= 0 ? '° E' : '° W');

  return {
    temp: `${finalTemp}°C`,
    status: 'Local Scan',
    humidity: `${finalHum}%`,
    wind: `${finalWind} km/h`,
    coord: `${formattedLat}, ${formattedLon}`,
    type: Math.random() > 0.5 ? 'orbit' : 'mist'
  };
};

const getWeatherByCoords = async (lat, lon, userId) => {
  const cacheKey = 'device_location';
  
  // 1. Check cache
  const cached = await Weather.findOne({ city: cacheKey, userId });
  if (cached && isFresh(cached.updatedAt)) {
    logger.info(`Weather cache HIT for coordinates: ${lat}, ${lon} (cached device location)`);
    return cached.data;
  }

  logger.info(`Weather cache MISS/EXPIRED for coordinates: ${lat}, ${lon}. Querying OpenWeather...`);

  let weatherData;
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const isDummyKey = !apiKey || apiKey.includes('dummy_') || apiKey === 'your_api_key_here';

  if (!isDummyKey) {
    try {
      const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
        params: {
          lat: lat,
          lon: lon,
          appid: apiKey,
          units: 'metric'
        },
        timeout: 5000
      });

      const data = response.data;
      
      let type = 'orbit';
      let status = data.weather[0].main;
      const weatherId = data.weather[0].id;
      
      if (weatherId < 700) {
        type = 'storm';
      } else if (weatherId >= 700 && weatherId < 800) {
        type = 'mist';
      } else if (weatherId > 800) {
        type = 'mist'; // Cloudy
      } else {
        type = 'orbit'; // Clear
      }

      const formattedLat = Math.abs(lat).toFixed(4) + (lat >= 0 ? '° N' : '° S');
      const formattedLon = Math.abs(lon).toFixed(4) + (lon >= 0 ? '° E' : '° W');

      weatherData = {
        temp: `${Math.round(data.main.temp)}°C`,
        status: `${status} (${data.name})`,
        humidity: `${data.main.humidity}%`,
        wind: `${Math.round(data.wind.speed * 3.6)} km/h`,
        coord: `${formattedLat}, ${formattedLon}`,
        type: type
      };

      logger.info(`Successfully fetched coordinates weather for ${lat}, ${lon} (${data.name}) from OpenWeather`);
    } catch (error) {
      logger.warn(`OpenWeather coordinates fetch failed: ${error.message}. Falling back to simulation...`);
      weatherData = generateSimulatedCoordsWeather(lat, lon);
    }
  } else {
    weatherData = generateSimulatedCoordsWeather(lat, lon);
  }

  // Cache in Database
  const updatedDoc = await Weather.findOneAndUpdate(
    { city: cacheKey, userId },
    { data: weatherData, updatedAt: new Date() },
    { upsert: true, new: true }
  );

  return updatedDoc.data;
};

module.exports = {
  getCurrentWeather,
  getWeatherByCoords
};
