const request = require('supertest');
const app = require('../src/app');

describe('Health and System Endpoints', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/api/health');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'healthy');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('uptime');
    });
  });

  describe('GET /metrics', () => {
    it('should return prometheus metrics', async () => {
      const res = await request(app).get('/metrics');

      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('http_requests_total');
      expect(res.text).toContain('http_request_duration_seconds');
    });
  });

  describe('GET /', () => {
    it('should return API info', async () => {
      const res = await request(app).get('/');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('endpoints');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown endpoint', async () => {
      const res = await request(app).get('/api/nonexistent');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
