import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';

describe('Integration Tests - Critical Endpoints', () => {
  const app = createApp();

  it('GET /api/health debe responder 200 OK y estado saludable', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('GET /api/categories debe retornar listado de categorías', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/products debe retornar productos con metadata de precios y promociones calculadas', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    if (res.body.data.length > 0) {
      const firstProduct = res.body.data[0];
      expect(firstProduct).toHaveProperty('pricing');
      expect(firstProduct.pricing).toHaveProperty('originalPrice');
      expect(firstProduct.pricing).toHaveProperty('finalPrice');
      expect(firstProduct.pricing).toHaveProperty('hasDiscount');
    }
  });

  it('POST /api/auth/login con credenciales inválidas debe responder 401', async () => {
    const res = await request(app).post('/api/auth/login').send({
      username: 'admin',
      password: 'WrongPassword999!'
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login con credenciales correctas debe retornar JWT token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      username: 'admin',
      password: 'AdminPassword123!'
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.username).toBe('admin');
  });
});
