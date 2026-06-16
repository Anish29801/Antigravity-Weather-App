const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Setting = require('../models/Setting');
const Note = require('../models/Note');

beforeAll(async () => {
  // Use a test database to prevent polluting dev database
  const mongoUri = 'mongodb://127.0.0.1:27017/aether_dashboard_test';
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  // Cleanup test collections and close connection
  try {
    await User.deleteMany({});
    await Setting.deleteMany({});
    await Note.deleteMany({});
  } catch (e) {}
  await mongoose.connection.close();
});

describe('Authentication API Suite', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Setting.deleteMany({});
    await Note.deleteMany({});
  });

  it('should successfully register a new user profile', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Commander',
        email: 'test@aether.com',
        password: 'password123'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('test@aether.com');
    expect(res.body.token).toBeDefined();
    
    // Assert cookie was set
    const cookies = res.headers['set-cookie'] || [];
    expect(cookies.some(cookie => cookie.includes('token='))).toBe(true);
  });

  it('should successfully login an existing user', async () => {
    // Manually register first
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Commander',
        email: 'test@aether.com',
        password: 'password123'
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@aether.com',
        password: 'password123'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it('should reject invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@aether.com',
        password: 'wrongpassword'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
