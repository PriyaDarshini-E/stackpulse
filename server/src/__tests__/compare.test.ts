import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../db/prisma.js';
import { generateToken } from '../utils/jwt.js';

describe('Compare Endpoint', () => {
  const dev1 = `cmp-dev1-${Date.now()}`;
  const dev2 = `cmp-dev2-${Date.now()}`;
  let token = '';

  beforeAll(async () => {
    // Create test user and token
    const user = await prisma.user.create({
      data: {
        email: `cmp_user_${Date.now()}@example.com`,
        password_hash: 'hash',
      },
    });
    token = generateToken({ userId: user.id, email: user.email });

    // Seed 2 developers with metrics
    await prisma.developer.createMany({
      data: [
        {
          github_username: dev1,
          name: 'Developer One',
          followers: 1200,
          public_repos: 45,
          total_stars: 3500,
          language_breakdown: { TypeScript: 80000, Go: 40000 },
          commit_activity: { totalSampledCommits: 50 },
          fetched_at: new Date(),
        },
        {
          github_username: dev2,
          name: 'Developer Two',
          followers: 850,
          public_repos: 30,
          total_stars: 4200,
          language_breakdown: { Rust: 90000, TypeScript: 20000 },
          commit_activity: { totalSampledCommits: 35 },
          fetched_at: new Date(),
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.developer.deleteMany({
      where: { github_username: { in: [dev1, dev2] } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: 'cmp_user_' } },
    });
    await prisma.$disconnect();
  });

  it('GET /api/compare should require authentication', async () => {
    const res = await request(app).get(`/api/compare?users=${dev1},${dev2}`);
    expect(res.status).toBe(401);
  });

  it('GET /api/compare should require at least 2 developers', async () => {
    const res = await request(app)
      .get(`/api/compare?users=${dev1}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('GET /api/compare should reject duplicate usernames', async () => {
    const res = await request(app)
      .get(`/api/compare?users=${dev1},${dev1}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('GET /api/compare should return comparative metrics for 2+ developers', async () => {
    const res = await request(app)
      .get(`/api/compare?users=${dev1},${dev2}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('developers');
    expect(res.body.developers.length).toBe(2);
    expect(res.body).toHaveProperty('chartMetrics');
    expect(res.body.chartMetrics).toHaveProperty('overview');
    expect(res.body.chartMetrics).toHaveProperty('languages');
  });
});
