const noteService = require('../services/noteService');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get user note
// @route   GET /api/notes
// @access  Private
exports.getNote = asyncHandler(async (req, res, next) => {
  const note = await noteService.getNote(req.user._id);
  res.status(200).json({
    success: true,
    data: note
  });
});

// @desc    Save/Create user note
// @route   POST /api/notes
// @access  Private
exports.saveNote = asyncHandler(async (req, res, next) => {
  const { text } = req.body;
  const note = await noteService.saveNote(req.user._id, text || '');
  res.status(200).json({
    success: true,
    data: note
  });
});

// @desc    Update user note (alternative route for REST mappings)
// @route   PUT /api/notes/:id
// @access  Private
exports.updateNote = asyncHandler(async (req, res, next) => {
  const { text } = req.body;
  const note = await noteService.saveNote(req.user._id, text || '');
  res.status(200).json({
    success: true,
    data: note
  });
});
