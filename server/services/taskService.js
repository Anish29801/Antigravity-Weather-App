const Task = require('../models/Task');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

const getTasks = async (userId) => {
  return await Task.find({ user: userId }).sort({ createdAt: -1 }).lean();
};

const createTask = async (userId, text, category) => {
  return await Task.create({
    user: userId,
    text,
    category,
    completed: false
  });
};

const updateTask = async (userId, taskId, updates) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new NotFoundError('Task not found');
  }

  // Ensure task belongs to user
  if (task.user.toString() !== userId.toString()) {
    throw new ForbiddenError('Not authorized to modify this task');
  }

  // Apply updates
  if (updates.text !== undefined) task.text = updates.text;
  if (updates.category !== undefined) task.category = updates.category;
  if (updates.completed !== undefined) task.completed = updates.completed;

  await task.save();
  return task;
};

const deleteTask = async (userId, taskId) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new NotFoundError('Task not found');
  }

  // Ensure task belongs to user
  if (task.user.toString() !== userId.toString()) {
    throw new ForbiddenError('Not authorized to delete this task');
  }

  await task.deleteOne();
  return { id: taskId };
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask
};
