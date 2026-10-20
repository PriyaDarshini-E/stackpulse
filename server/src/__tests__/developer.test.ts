import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../db/prisma.js';
import { generateToken } from '../utils/jwt.js';

describe('Developer Profile & Repos Endpoints', () => {
  const testDevUser = `dev_endpoint_${Date.now()}`;
  let token = '';

  beforeAll(async () => {
    // Create test user and auth token
    const user = await prisma.user.create({
      data: {
        email: `tester_${Date.now()}@example.com`,
        password_hash: 'hashedpassword',
      },
    });
    token = generateToken({ userId: user.id, email: user.email });

    // Seed dummy developer with repos
    await prisma.developer.create({
      data: {
        github_username: testDevUser,
        name: 'Endpoint Tester',
        followers: 150,
        public_repos: 12,
        total_stars: 450,
        fetched_at: new Date(),
        repos: {
          create: [
            {
              github_repo_id: '8881',
              name: 'alpha-repo',
              stars: 300,
              html_url: 'https://github.com/endpoint_tester/alpha-repo',
              primary_language: 'TypeScript',
              pushed_at: new Date('2026-01-01'),
            },
            {
              github_repo_id: '8882',
              name: 'beta-repo',
              stars: 150,
              html_url: 'https://github.com/endpoint_tester/beta-repo',
              primary_language: 'Python',
              pushed_at: new Date('2026-02-01'),
            },
          ],
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.developer.deleteMany({
      where: { github_username: { contains: 'dev_endpoint_' } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: 'tester_' } },
    });
    await prisma.$disconnect();
  });

  it('GET /api/developers/:username should require authentication', async () => {
    const res = await request(app).get(`/api/developers/${testDevUser}`);
    expect(res.status).toBe(401);
  });

  it('GET /api/developers/:username should return cached profile when authenticated', async () => {
    const res = await request(app)
      .get(`/api/developers/${testDevUser}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('developer');
    expect(res.body.developer.github_username).toBe(testDevUser);
    expect(res.body.developer.total_stars).toBe(450);
    expect(res.body.fromCache).toBe(true);
  });

  it('GET /api/developers/:username/repos should return sorted repos', async () => {
    const res = await request(app)
      .get(`/api/developers/${testDevUser}/repos?sort=stars&order=desc`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('repos');
    expect(res.body.repos.length).toBe(2);
    expect(res.body.repos[0].name).toBe('alpha-repo');
    expect(res.body.repos[0].stars).toBe(300);
    expect(res.body.repos[0]).toHaveProperty('is_pinned');
  });

  it('GET /api/developers/:username with invalid username should fail validation', async () => {
    const res = await request(app)
      .get('/api/developers/invalid%20username!@#')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
