import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../db/prisma.js';

describe('Auth Endpoints', () => {
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  let authToken = '';

  beforeAll(async () => {
    // Ensure clean state for test email
    await prisma.user.deleteMany({
      where: { email: { contains: 'test_' } },
    });
  });

  afterAll(async () => {
    // Cleanup test users
    await prisma.user.deleteMany({
      where: { email: { contains: 'test_' } },
    });
    await prisma.$disconnect();
  });

  it('POST /api/auth/register should create a new user and return a JWT', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(testEmail.toLowerCase());
    expect(res.body.user).not.toHaveProperty('password_hash');
    expect(res.body.user).toHaveProperty('id');
  });

  it('POST /api/auth/register should return 409 for duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /api/auth/register should return 400 for invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'invalid-email', password: testPassword });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body).toHaveProperty('details');
  });

  it('POST /api/auth/login should authenticate user with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(testEmail.toLowerCase());
    authToken = res.body.token;
  });

  it('POST /api/auth/login should return 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'WrongPassword123' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('GET /api/auth/me should return 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('GET /api/auth/me should return user details with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(testEmail.toLowerCase());
    expect(res.body.user).not.toHaveProperty('password_hash');
  });
});
