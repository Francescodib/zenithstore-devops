const request = require('supertest');
const app = require('../src/app');

describe('Products API', () => {
  describe('GET /api/products', () => {
    it('should return all products', async () => {
      const res = await request(app).get('/api/products');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should filter products by category', async () => {
      const res = await request(app).get('/api/products?category=Accessories');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.every(p => p.category === 'Accessories')).toBe(true);
    });

    it('should filter products by price range', async () => {
      const res = await request(app).get('/api/products?minPrice=100&maxPrice=300');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.every(p => p.price >= 100 && p.price <= 300)).toBe(true);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return a single product', async () => {
      const res = await request(app).get('/api/products/1');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id', 1);
      expect(res.body.data).toHaveProperty('name');
      expect(res.body.data).toHaveProperty('price');
    });

    it('should return 404 for non-existent product', async () => {
      const res = await request(app).get('/api/products/9999');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/products/categories', () => {
    it('should return all categories', async () => {
      const res = await request(app).get('/api/products/categories');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });
});
