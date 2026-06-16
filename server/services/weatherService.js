const axios = require('axios');
const Weather = require('../models/Weather');
const logger = require('../utils/logger');

// List of real world cities as local fallbacks and default database
const REAL_CITIES = [
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503, temp: 18, status: 'Rainy', type: 'storm', wind: 15, humidity: 80 },
  { name: 'London', lat: 51.5074, lon: -0.1278, temp: 14, status: 'Overcast Fog', type: 'mist', wind: 12, humidity: 75 },
  { name: 'New York', lat: 40.7128, lon: -74.0060, temp: 21, status: 'Clear Sky', type: 'orbit', wind: 10, humidity: 55 },
  { name: 'Paris', lat: 48.8566, lon: 2.3522, temp: 17, status: 'Foggy Mist', type: 'mist', wind: 8, humidity: 70 },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093, temp: 19, status: 'Sunny Clear', type: 'orbit', wind: 18, humidity: 60 },
  { name: 'Cairo', lat: 30.0444, lon: 31.2357, temp: 32, status: 'Dry Heat', type: 'orbit', wind: 14, humidity: 30 },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777, temp: 28, status: 'Showers', type: 'storm', wind: 22, humidity: 85 },
  { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729, temp: 25, status: 'Heavy Rain', type: 'storm', wind: 9, humidity: 82 },
  { name: 'Cape Town', lat: -33.9249, lon: 18.4241, temp: 16, status: 'Windy Clear', type: 'orbit', wind: 35, humidity: 50 },
  { name: 'Moscow', lat: 55.7558, lon: 37.6173, temp: 8, status: 'Foggy Cold', type: 'mist', wind: 11, humidity: 78 }
];

const findClosestRealCity = (lat, lon) => {
  let closest = REAL_CITIES[0];
  let minDist = Infinity;
  for (const c of REAL_CITIES) {
    const dist = Math.sqrt(Math.pow(c.lat - lat, 2) + Math.pow(c.lon - lon, 2));
    if (dist < minDist) {
      minDist = dist;
      closest = c;
    }
  }
  return closest;
};

const getBaseWeatherForCity = (city) => {
  const match = REAL_CITIES.find(c => c.name.toLowerCase() === city.toLowerCase());
  if (match) return match;
  
  // Return a randomized but reasonable base for unknown cities
  const types = ['storm', 'mist', 'orbit'];
  const type = types[Math.floor(Math.random() * types.length)];
  let temp = 20;
  let status = 'Clear Sky';
  if (type === 'storm') {
    temp = 15;
    status = 'Heavy Rain';
  } else if (type === 'mist') {
    temp = 12;
    status = 'Overcast Fog';
  }
  
  return {
    name: city,
    temp,
    status,
    humidity: 60 + Math.floor(Math.random() * 20),
    wind: 10 + Math.floor(Math.random() * 15),
    coord: '0.0000° N, 0.0000° E',
    type
  };
};

const isFresh = (updatedAt) => {
  const ttl = parseInt(process.env.WEATHER_CACHE_TTL || '600', 10);
  const diffInSeconds = (new Date() - new Date(updatedAt)) / 1000;
  return diffInSeconds < ttl;
};

const generateSimulatedWeather = (city) => {
  const base = getBaseWeatherForCity(city);
  
  const tempVar = (Math.random() - 0.5) * 6;
  const windVar = (Math.random() - 0.5) * base.wind * 0.2;
  const humVar = (Math.random() - 0.5) * base.humidity * 0.1;

  const finalTemp = Math.round(base.temp + tempVar);
  const finalWind = Math.round(base.wind + windVar);
  let finalHum = Math.round(base.humidity + humVar);
  
  finalHum = Math.max(0, Math.min(100, finalHum));

  return {
    cityName: base.name,
    temp: `${finalTemp}°C`,
    status: base.status,
    humidity: `${finalHum}%`,
    wind: `${finalWind} km/h`,
    coord: base.coord,
    type: base.type
  };
};

const reverseGeocode = async (lat, lon) => {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
      headers: {
        'User-Agent': 'Aether-Dashboard/2.0.0 (contact: info@aetheros.io)'
      },
      timeout: 3000
    });
    if (response.data && response.data.address) {
      const addr = response.data.address;
      const name = addr.city || addr.town || addr.village || addr.suburb || addr.state || addr.county || addr.country;
      if (name) return name;
    }
  } catch (err) {
    logger.warn(`Nominatim reverse geocoding failed: ${err.message}`);
  }
  return null;
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

  const apiKey = process.env.OPENWEATHER_API_KEY;
  const isDummyKey = !apiKey || apiKey.includes('dummy_') || apiKey === 'your_api_key_here';

  if (!isDummyKey) {
    try {
      const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
        params: {
          q: city,
          appid: apiKey,
          units: 'metric'
        },
        timeout: 5000
      });

      const data = response.data;
      
      let type = 'mist';
      let status = data.weather[0].main;
      const weatherId = data.weather[0].id;
      
      if (weatherId < 600) {
        type = 'storm';
      } else if (weatherId >= 600 && weatherId < 800) {
        type = 'mist';
      } else if (weatherId === 800) {
        type = 'orbit';
      } else {
        type = 'mist';
      }

      const formattedLat = Math.abs(data.coord.lat).toFixed(4) + (data.coord.lat >= 0 ? '° N' : '° S');
      const formattedLon = Math.abs(data.coord.lon).toFixed(4) + (data.coord.lon >= 0 ? '° E' : '° W');

      weatherData = {
        cityName: data.name,
        temp: `${Math.round(data.main.temp)}°C`,
        status: status,
        humidity: `${data.main.humidity}%`,
        wind: `${Math.round(data.wind.speed * 3.6)} km/h`,
        coord: `${formattedLat}, ${formattedLon}`,
        type: type
      };
      
      logger.info(`Successfully fetched weather for ${city} from OpenWeather`);
    } catch (error) {
      logger.warn(`OpenWeather API fetch failed for ${city}: ${error.message}. Falling back to simulation...`);
      weatherData = generateSimulatedWeather(city);
    }
  } else {
    weatherData = generateSimulatedWeather(city);
  }

  // Cache the weather in MongoDB (Upsert)
  await Weather.findOneAndUpdate(
    { city, userId },
    { data: weatherData, updatedAt: new Date() },
    { upsert: true }
  );

  return weatherData;
};

const generateSimulatedCoordsWeather = async (lat, lon) => {
  let cityName = await reverseGeocode(lat, lon);
  if (!cityName) {
    const closestCity = findClosestRealCity(lat, lon);
    cityName = closestCity.name;
  }
  
  const base = getBaseWeatherForCity(cityName);
  
  const tempVar = (Math.random() - 0.5) * 6;
  const windVar = (Math.random() - 0.5) * base.wind * 0.2;
  const humVar = (Math.random() - 0.5) * base.humidity * 0.1;

  const finalTemp = Math.round(base.temp + tempVar);
  const finalWind = Math.round(base.wind + windVar);
  let finalHum = Math.round(base.humidity + humVar);
  finalHum = Math.max(0, Math.min(100, finalHum));
  
  const formattedLat = Math.abs(lat).toFixed(4) + (lat >= 0 ? '° N' : '° S');
  const formattedLon = Math.abs(lon).toFixed(4) + (lon >= 0 ? '° E' : '° W');

  return {
    cityName: cityName,
    temp: `${finalTemp}°C`,
    status: base.status,
    humidity: `${finalHum}%`,
    wind: `${finalWind} km/h`,
    coord: `${formattedLat}, ${formattedLon}`,
    type: base.type
  };
};

const getWeatherByCoords = async (lat, lon, userId) => {
  const cacheKey = `coords_${lat.toFixed(2)}_${lon.toFixed(2)}`;
  
  // Check cache
  const cached = await Weather.findOne({ city: cacheKey, userId });
  if (cached && isFresh(cached.updatedAt)) {
    logger.info(`Weather cache HIT for coordinates: ${lat}, ${lon}`);
    return cached.data;
  }

  logger.info(`Weather cache MISS/EXPIRED for coordinates: ${lat}, ${lon}. Fetching fresh telemetry...`);

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
        type = 'mist';
      } else {
        type = 'orbit';
      }

      const formattedLat = Math.abs(lat).toFixed(4) + (lat >= 0 ? '° N' : '° S');
      const formattedLon = Math.abs(lon).toFixed(4) + (lon >= 0 ? '° E' : '° W');

      weatherData = {
        cityName: data.name,
        temp: `${Math.round(data.main.temp)}°C`,
        status: status,
        humidity: `${data.main.humidity}%`,
        wind: `${Math.round(data.wind.speed * 3.6)} km/h`,
        coord: `${formattedLat}, ${formattedLon}`,
        type: type
      };

      logger.info(`Successfully fetched coordinates weather for ${lat}, ${lon} (${data.name}) from OpenWeather`);
    } catch (error) {
      logger.warn(`OpenWeather coordinates fetch failed: ${error.message}. Falling back to simulation...`);
      weatherData = await generateSimulatedCoordsWeather(lat, lon);
    }
  } else {
    weatherData = await generateSimulatedCoordsWeather(lat, lon);
  }

  // Cache in Database
  await Weather.findOneAndUpdate(
    { city: cacheKey, userId },
    { data: weatherData, updatedAt: new Date() },
    { upsert: true }
  );

  return weatherData;
};

module.exports = {
  getCurrentWeather,
  getWeatherByCoords
};
