const settingsService = require('../services/settingsService');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get user preferences
// @route   GET /api/settings
// @access  Private
exports.getSettings = asyncHandler(async (req, res, next) => {
  const settings = await settingsService.getSettings(req.user._id);
  res.status(200).json({
    success: true,
    data: settings
  });
});

// @desc    Update user preferences
// @route   PUT /api/settings
// @access  Private
exports.updateSettings = asyncHandler(async (req, res, next) => {
  const settings = await settingsService.updateSettings(req.user._id, req.body);
  res.status(200).json({
    success: true,
    data: settings
  });
});
