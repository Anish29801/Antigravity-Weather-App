const taskService = require('../services/taskService');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
exports.getTasks = asyncHandler(async (req, res, next) => {
  const tasks = await taskService.getTasks(req.user._id);
  res.status(200).json({
    success: true,
    data: tasks
  });
});

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = asyncHandler(async (req, res, next) => {
  const { text, category } = req.body;
  const task = await taskService.createTask(req.user._id, text, category);
  res.status(201).json({
    success: true,
    data: task
  });
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = asyncHandler(async (req, res, next) => {
  const task = await taskService.updateTask(req.user._id, req.params.id, req.body);
  res.status(200).json({
    success: true,
    data: task
  });
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = asyncHandler(async (req, res, next) => {
  const result = await taskService.deleteTask(req.user._id, req.params.id);
  res.status(200).json({
    success: true,
    data: result
  });
});
