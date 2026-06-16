const mongoose = require('mongoose');

const WeatherSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    city: {
      type: String,
      required: true,
      index: true
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  {
    timestamps: true // This will automatically maintain `updatedAt` which we use for TTL checks
  }
);

module.exports = mongoose.model('Weather', WeatherSchema);
