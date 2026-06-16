const User = require('../models/User');
const Setting = require('../models/Setting');
const Note = require('../models/Note');
const jwt = require('jsonwebtoken');
const { BadRequestError, UnauthorizedError } = require('../utils/errors');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const register = async (name, email, password) => {
  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new BadRequestError('User already exists with this email');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password
  });

  // Create default setting and note for this user
  await Setting.create({ user: user._id });
  await Note.create({ user: user._id, text: '' });

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    },
    token
  };
};

const login = async (email, password) => {
  // Check for user
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    },
    token
  };
};

module.exports = {
  register,
  login,
  generateToken
};
