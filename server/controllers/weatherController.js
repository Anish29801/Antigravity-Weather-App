const weatherService = require('../services/weatherService');
const asyncHandler = require('../middleware/asyncHandler');
const { BadRequestError } = require('../utils/errors');

// @desc    Get current weather for a city
// @route   GET /api/weather/current
// @access  Private
exports.getCurrentWeather = asyncHandler(async (req, res, next) => {
  const { city, lat, lon } = req.query;
  
  let weather;

  if (lat !== undefined && lon !== undefined) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return next(new BadRequestError('Latitude and Longitude must be numbers'));
    }

    weather = await weatherService.getWeatherByCoords(latitude, longitude, req.user._id);
  } else {
    if (!city) {
      return next(new BadRequestError('Please provide a city name or coordinates (lat, lon)'));
    }

    weather = await weatherService.getCurrentWeather(city, req.user._id);
  }

  res.status(200).json({
    success: true,
    data: weather
  });
});
