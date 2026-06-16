const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const validate = require('../middleware/validate');
const { createTaskSchema, updateTaskSchema } = require('../validators/taskValidator');
const { protect } = require('../middleware/auth');

router.use(protect); // Guard all task routes

router.route('/')
  .get(taskController.getTasks)
  .post(validate(createTaskSchema), taskController.createTask);

router.route('/:id')
  .put(validate(updateTaskSchema), taskController.updateTask)
  .delete(taskController.deleteTask);

module.exports = router;
