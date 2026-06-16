const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const Weather = require('../models/Weather');
const User = require('../models/User');

beforeAll(async () => {
  const mongoUri = 'mongodb://127.0.0.1:27017/aether_dashboard_test';
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  try {
    await Weather.deleteMany({});
    await User.deleteMany({});
  } catch (e) {}
  await mongoose.connection.close();
});

describe('Weather API Suite', () => {
  beforeEach(async () => {
    await Weather.deleteMany({});
    await User.deleteMany({});
  });

  it('should get weather for a supported city (Neo-Tokyo)', async () => {
    const res = await request(app)
      .get('/api/weather/current?city=Neo-Tokyo');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.temp).toBeDefined();
    expect(res.body.data.humidity).toBeDefined();
    expect(res.body.data.wind).toBeDefined();
  });

  it('should return error for an unsupported city', async () => {
    const res = await request(app)
      .get('/api/weather/current?city=London');

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain('Unsupported city');
  });

  it('should get weather for coordinates', async () => {
    const res = await request(app)
      .get('/api/weather/current?lat=35.6762&lon=139.6503');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.temp).toBeDefined();
    expect(res.body.data.coord).toContain('35.6762');
    expect(res.body.data.coord).toContain('139.6503');
    expect(res.body.data.status).toBeDefined();
  });

  it('should return error for invalid coordinates', async () => {
    const res = await request(app)
      .get('/api/weather/current?lat=abc&lon=139.6503');

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain('Latitude and Longitude must be numbers');
  });
});
