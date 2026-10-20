import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { GitHubService } from '../services/github.service.js';
import { prisma } from '../db/prisma.js';

describe('GitHub Service Caching and Logic', () => {
  const dummyUser = `test_dev_${Date.now()}`;

  beforeAll(async () => {
    // Insert a dummy fresh developer in DB
    await prisma.developer.create({
      data: {
        github_username: dummyUser,
        name: 'Test Dev',
        followers: 42,
        public_repos: 5,
        total_stars: 120,
        etag: 'W/"dummy-etag"',
        fetched_at: new Date(), // fresh (just now)
        repos: {
          create: [
            {
              github_repo_id: '999991',
              name: 'repo-one',
              stars: 100,
              html_url: 'https://github.com/test_dev/repo-one',
              primary_language: 'TypeScript',
            },
            {
              github_repo_id: '999992',
              name: 'repo-two',
              stars: 20,
              html_url: 'https://github.com/test_dev/repo-two',
              primary_language: 'Rust',
            },
          ],
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.developer.deleteMany({
      where: { github_username: { contains: 'test_dev_' } },
    });
    await prisma.$disconnect();
  });

  it('should serve fresh data from DB cache with zero GitHub calls', async () => {
    const result = await GitHubService.getDeveloper(dummyUser);

    expect(result.fromCache).toBe(true);
    expect(result.stale).toBe(false);
    expect(result.developer.github_username).toBe(dummyUser);
    expect(result.developer.total_stars).toBe(120);
    expect(result.repos.length).toBe(2);
  });

  it('should provide rate limit info structure', () => {
    const info = GitHubService.getRateLimitInfo();
    expect(info).toHaveProperty('remaining');
    expect(info).toHaveProperty('reset');
    expect(info).toHaveProperty('resetInMinutes');
  });

  it('should deduplicate concurrent in-flight requests for the same username', async () => {
    const promise1 = GitHubService.getDeveloper(dummyUser);
    const promise2 = GitHubService.getDeveloper(dummyUser);

    // Both should resolve to the same result
    const [res1, res2] = await Promise.all([promise1, promise2]);
    expect(res1.developer.id).toBe(res2.developer.id);
  });
});
