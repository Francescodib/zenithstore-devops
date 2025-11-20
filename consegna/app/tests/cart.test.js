const request = require('supertest');
const app = require('../src/app');

describe('Cart API', () => {
  const testUserId = 'test-user-123';

  beforeEach(async () => {
    await request(app).delete(`/api/cart/${testUserId}/clear`);
  });

  describe('POST /api/cart/:userId/add', () => {
    it('should add item to cart', async () => {
      const res = await request(app)
        .post(`/api/cart/${testUserId}/add`)
        .send({ productId: 1, quantity: 2 });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBe(1);
    });

    it('should reject invalid quantity', async () => {
      const res = await request(app)
        .post(`/api/cart/${testUserId}/add`)
        .send({ productId: 1, quantity: -1 });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject non-existent product', async () => {
      const res = await request(app)
        .post(`/api/cart/${testUserId}/add`)
        .send({ productId: 9999, quantity: 1 });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should reject quantity exceeding stock', async () => {
      const res = await request(app)
        .post(`/api/cart/${testUserId}/add`)
        .send({ productId: 1, quantity: 10000 });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('stock');
    });
  });

  describe('GET /api/cart/:userId', () => {
    it('should return empty cart for new user', async () => {
      const res = await request(app).get(`/api/cart/${testUserId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toBeInstanceOf(Array);
      expect(res.body.data.items.length).toBe(0);
    });

    it('should return cart with items', async () => {
      await request(app)
        .post(`/api/cart/${testUserId}/add`)
        .send({ productId: 1, quantity: 2 });

      const res = await request(app).get(`/api/cart/${testUserId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data).toHaveProperty('total');
    });
  });

  describe('DELETE /api/cart/:userId/clear', () => {
    it('should clear cart', async () => {
      await request(app)
        .post(`/api/cart/${testUserId}/add`)
        .send({ productId: 1, quantity: 2 });

      const res = await request(app).delete(`/api/cart/${testUserId}/clear`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
