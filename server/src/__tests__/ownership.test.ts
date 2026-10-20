import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../db/prisma.js';
import { generateToken } from '../utils/jwt.js';

describe('Ownership Isolation for Pins and Comparisons', () => {
  let userAToken = '';
  let userBToken = '';
  let userAId = '';
  let userBId = '';

  let repoId = '';
  let dev1Id = '';
  let dev2Id = '';

  let userAPinId = '';
  let userAComparisonId = '';

  beforeAll(async () => {
    // Create User A
    const userA = await prisma.user.create({
      data: {
        email: `usera_${Date.now()}@example.com`,
        password_hash: 'hashA',
      },
    });
    userAId = userA.id;
    userAToken = generateToken({ userId: userA.id, email: userA.email });

    // Create User B
    const userB = await prisma.user.create({
      data: {
        email: `userb_${Date.now()}@example.com`,
        password_hash: 'hashB',
      },
    });
    userBId = userB.id;
    userBToken = generateToken({ userId: userB.id, email: userB.email });

    // Create developers and repo
    const dev1 = await prisma.developer.create({
      data: {
        github_username: `own-dev1-${Date.now()}`,
        total_stars: 50,
      },
    });
    dev1Id = dev1.id;

    const dev2 = await prisma.developer.create({
      data: {
        github_username: `own-dev2-${Date.now()}`,
        total_stars: 100,
      },
    });
    dev2Id = dev2.id;

    const repo = await prisma.repo.create({
      data: {
        developer_id: dev1.id,
        github_repo_id: '999901',
        name: 'ownership-repo',
        stars: 50,
        html_url: 'https://github.com/test/ownership-repo',
      },
    });
    repoId = repo.id;
  });

  afterAll(async () => {
    await prisma.pin.deleteMany({
      where: { user_id: { in: [userAId, userBId] } },
    });
    await prisma.comparison.deleteMany({
      where: { user_id: { in: [userAId, userBId] } },
    });
    await prisma.repo.deleteMany({
      where: { id: repoId },
    });
    await prisma.developer.deleteMany({
      where: { id: { in: [dev1Id, dev2Id] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [userAId, userBId] } },
    });
    await prisma.$disconnect();
  });

  // Pins isolation tests
  it('User A can create a pin', async () => {
    const res = await request(app)
      .post('/api/pins')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        repo_id: repoId,
        note: 'User A secret note',
        tags: ['architecture', 'auth'],
      });

    expect(res.status).toBe(201);
    expect(res.body.pin).toHaveProperty('id');
    expect(res.body.pin.note).toBe('User A secret note');
    userAPinId = res.body.pin.id;
  });

  it("User B cannot see User A's pin in list", async () => {
    const res = await request(app)
      .get('/api/pins')
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.status).toBe(200);
    expect(res.body.pins.length).toBe(0);
  });

  it("User B cannot update User A's pin (returns 404)", async () => {
    const res = await request(app)
      .patch(`/api/pins/${userAPinId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ note: 'Hacked by User B' });

    expect(res.status).toBe(404);
  });

  it("User B cannot delete User A's pin (returns 404)", async () => {
    const res = await request(app)
      .delete(`/api/pins/${userAPinId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.status).toBe(404);
  });

  // Comparisons isolation tests
  it('User A can save a comparison', async () => {
    const res = await request(app)
      .post('/api/comparisons')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        name: "User A's Custom Comparison",
        developer_ids: [dev1Id, dev2Id],
      });

    expect(res.status).toBe(201);
    expect(res.body.comparison).toHaveProperty('id');
    userAComparisonId = res.body.comparison.id;
  });

  it("User B cannot see User A's saved comparison in list", async () => {
    const res = await request(app)
      .get('/api/comparisons')
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.status).toBe(200);
    expect(res.body.comparisons.length).toBe(0);
  });

  it("User B cannot view User A's saved comparison by ID (returns 404)", async () => {
    const res = await request(app)
      .get(`/api/comparisons/${userAComparisonId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.status).toBe(404);
  });

  it("User B cannot update User A's saved comparison (returns 404)", async () => {
    const res = await request(app)
      .patch(`/api/comparisons/${userAComparisonId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ name: 'Hacked Name' });

    expect(res.status).toBe(404);
  });

  it("User B cannot delete User A's saved comparison (returns 404)", async () => {
    const res = await request(app)
      .delete(`/api/comparisons/${userAComparisonId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.status).toBe(404);
  });
});
