const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    text: {
      type: String,
      required: [true, 'Please add task text'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: ['Code', 'Design', 'Work', 'Life'],
      default: 'Code'
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Task', TaskSchema);
