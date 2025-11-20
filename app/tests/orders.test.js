const request = require('supertest');
const app = require('../src/app');

describe('Orders API', () => {
  const testUserId = 'test-user-orders-456';

  beforeEach(async () => {
    await request(app).delete(`/api/cart/${testUserId}/clear`);
  });

  describe('POST /api/orders/:userId', () => {
    it('should create order from cart', async () => {
      await request(app)
        .post(`/api/cart/${testUserId}/add`)
        .send({ productId: 1, quantity: 2 });

      const res = await request(app).post(`/api/orders/${testUserId}`);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('orderId');
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data.status).toBe('confirmed');
    });

    it('should reject order with empty cart', async () => {
      const res = await request(app).post(`/api/orders/${testUserId}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('empty');
    });

    it('should clear cart after order creation', async () => {
      await request(app)
        .post(`/api/cart/${testUserId}/add`)
        .send({ productId: 1, quantity: 1 });

      await request(app).post(`/api/orders/${testUserId}`);

      const cartRes = await request(app).get(`/api/cart/${testUserId}`);
      expect(cartRes.body.data.items.length).toBe(0);
    });
  });

  describe('GET /api/orders/:userId', () => {
    it('should return user orders', async () => {
      const res = await request(app).get(`/api/orders/${testUserId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/orders/:userId/:orderId', () => {
    it('should return specific order', async () => {
      await request(app)
        .post(`/api/cart/${testUserId}/add`)
        .send({ productId: 1, quantity: 1 });

      const orderRes = await request(app).post(`/api/orders/${testUserId}`);
      const orderId = orderRes.body.data.orderId;

      const res = await request(app).get(`/api/orders/${testUserId}/${orderId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orderId).toBe(orderId);
    });

    it('should return 404 for non-existent order', async () => {
      const res = await request(app).get(`/api/orders/${testUserId}/99999`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
