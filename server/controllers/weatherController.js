const weatherService = require('../services/weatherService');
const asyncHandler = require('../middleware/asyncHandler');
const { BadRequestError } = require('../utils/errors');

// @desc    Get current weather for a city
// @route   GET /api/weather/current
// @access  Private
exports.getCurrentWeather = asyncHandler(async (req, res, next) => {
  const { city } = req.query;
  
  if (!city) {
    return next(new BadRequestError('Please provide a city name'));
  }

  // Supported cities verification
  const supportedCities = ['Neo-Tokyo', 'Aether City', 'Orbital Terminal'];
  if (!supportedCities.includes(city)) {
    return next(new BadRequestError(`Unsupported city: '${city}'. Telemetry only calibrates Neo-Tokyo, Aether City, and Orbital Terminal.`));
  }

  const weather = await weatherService.getCurrentWeather(city, req.user._id);

  res.status(200).json({
    success: true,
    data: weather
  });
});
