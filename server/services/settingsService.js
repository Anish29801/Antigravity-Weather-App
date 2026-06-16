const Setting = require('../models/Setting');

const getSettings = async (userId) => {
  let setting = await Setting.findOne({ user: userId });
  if (!setting) {
    setting = await Setting.create({ user: userId });
  }
  return setting;
};

const updateSettings = async (userId, updates) => {
  let setting = await Setting.findOne({ user: userId });
  if (!setting) {
    setting = new Setting({ user: userId });
  }

  if (updates.theme !== undefined) setting.theme = updates.theme;
  if (updates.particlesActive !== undefined) setting.particlesActive = updates.particlesActive;
  if (updates.audioActive !== undefined) setting.audioActive = updates.audioActive;

  await setting.save();
  return setting;
};

module.exports = {
  getSettings,
  updateSettings
};
