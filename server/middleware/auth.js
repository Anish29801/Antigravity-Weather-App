const User = require('../models/User');
const Setting = require('../models/Setting');
const Note = require('../models/Note');
const asyncHandler = require('./asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  // Find or create the default guest user to bypass authentication wall
  let user = await User.findOne({ email: 'guest@aether.com' });
  
  if (!user) {
    user = await User.create({
      name: 'Guest Commander',
      email: 'guest@aether.com',
      password: 'default_guest_password_123' // Default placeholder password
    });

    // Seed default settings and empty note for the guest user
    await Setting.create({ user: user._id });
    await Note.create({ user: user._id, text: '' });
  }

  req.user = user;
  next();
});

module.exports = { protect };
