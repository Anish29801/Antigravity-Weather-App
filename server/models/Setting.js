const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    theme: {
      type: String,
      default: 'theme-cyan'
    },
    particlesActive: {
      type: Boolean,
      default: true
    },
    audioActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Setting', SettingSchema);
