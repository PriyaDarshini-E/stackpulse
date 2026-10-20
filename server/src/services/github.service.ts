import pLimit from 'p-limit';
import { prisma } from '../db/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';

export interface DeveloperResult {
  developer: any;
  repos: any[];
  stale: boolean;
  fromCache: boolean;
  rateLimitInfo?: {
    remaining: number | null;
    reset: number | null;
    resetInMinutes: number | null;
  };
}

export class GitHubService {
  private static readonly BASE_URL = 'https://api.github.com';
  private static inFlightRequests = new Map<string, Promise<DeveloperResult>>();
  private static rateLimitRemaining: number | null = null;
  private static rateLimitReset: number | null = null; // unix timestamp in seconds

  private static getHeaders(etag?: string | null): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'StackPulse-Developer-Analytics',
    };

    if (env.GITHUB_TOKEN && env.GITHUB_TOKEN.trim().length > 0) {
      headers['Authorization'] = `Bearer ${env.GITHUB_TOKEN.trim()}`;
    }

    if (etag) {
      headers['If-None-Match'] = etag;
    }

    return headers;
  }

  private static updateRateLimit(headers: Headers) {
    const remaining = headers.get('x-ratelimit-remaining');
    const reset = headers.get('x-ratelimit-reset');

    if (remaining !== null) {
      this.rateLimitRemaining = parseInt(remaining, 10);
    }
    if (reset !== null) {
      this.rateLimitReset = parseInt(reset, 10);
    }

    if (this.rateLimitRemaining !== null && this.rateLimitRemaining <= 5) {
      console.warn(
        `⚠️ GitHub API Rate Limit Alert: ${this.rateLimitRemaining} requests remaining. Resets at ${
          this.rateLimitReset ? new Date(this.rateLimitReset * 1000).toLocaleTimeString() : 'unknown'
        }`
      );
    }
  }

  public static getRateLimitInfo() {
    const now = Math.floor(Date.now() / 1000);
    const resetInSeconds = this.rateLimitReset ? Math.max(0, this.rateLimitReset - now) : null;
    const resetInMinutes = resetInSeconds !== null ? Math.ceil(resetInSeconds / 60) : null;

    return {
      remaining: this.rateLimitRemaining,
      reset: this.rateLimitReset,
      resetInMinutes,
    };
  }

  /**
   * Main entry point to get developer profile + repos with caching, ETag, dedup & stale fallback
   */
  public static async getDeveloper(username: string, forceRefresh = false): Promise<DeveloperResult> {
    const normalizedUsername = username.trim().toLowerCase();

    // In-flight deduplication
    if (this.inFlightRequests.has(normalizedUsername)) {
      return this.inFlightRequests.get(normalizedUsername)!;
    }

    const fetchPromise = this.executeFetch(normalizedUsername, forceRefresh);
    this.inFlightRequests.set(normalizedUsername, fetchPromise);

    try {
      const result = await fetchPromise;
      return result;
    } finally {
      this.inFlightRequests.delete(normalizedUsername);
    }
  }

  private static async executeFetch(username: string, forceRefresh: boolean): Promise<DeveloperResult> {
    // 1. Check database cache
    const cachedDev = await prisma.developer.findUnique({
      where: { github_username: username },
      include: {
        repos: {
          orderBy: { stars: 'desc' },
        },
      },
    });

    const now = new Date().getTime();
    const ttlMs = env.CACHE_TTL_MINUTES * 60 * 1000;
    const isFresh = cachedDev && now - new Date(cachedDev.fetched_at).getTime() < ttlMs;

    if (isFresh && !forceRefresh) {
      return {
        developer: cachedDev,
        repos: cachedDev.repos,
        stale: false,
        fromCache: true,
        rateLimitInfo: this.getRateLimitInfo(),
      };
    }

    // Check if we already hit rate limit remaining = 0
    if (this.rateLimitRemaining !== null && this.rateLimitRemaining <= 0) {
      const rateInfo = this.getRateLimitInfo();
      if (cachedDev) {
        return {
          developer: cachedDev,
          repos: cachedDev.repos,
          stale: true,
          fromCache: true,
          rateLimitInfo: rateInfo,
        };
      }
      throw new AppError(
        `GitHub rate limit reached (0 remaining). Reset in ${rateInfo.resetInMinutes || 'few'} minutes.`,
        429,
        rateInfo
      );
    }

    // 2. Fetch from GitHub with conditional ETag
    try {
      const etag = !forceRefresh && cachedDev?.etag ? cachedDev.etag : null;
      const userRes = await fetch(`${this.BASE_URL}/users/${username}`, {
        headers: this.getHeaders(etag),
      });

      this.updateRateLimit(userRes.headers);

      // 304 Not Modified -> Cache Hit
      if (userRes.status === 304 && cachedDev) {
        const updatedDev = await prisma.developer.update({
          where: { id: cachedDev.id },
          data: { fetched_at: new Date() },
          include: {
            repos: {
              orderBy: { stars: 'desc' },
            },
          },
        });

        return {
          developer: updatedDev,
          repos: updatedDev.repos,
          stale: false,
          fromCache: true,
          rateLimitInfo: this.getRateLimitInfo(),
        };
      }

      // 404 Not Found
      if (userRes.status === 404) {
        throw new AppError(`GitHub developer "${username}" not found`, 404);
      }

      // 403 / 429 Rate Limit
      if (userRes.status === 403 || userRes.status === 429) {
        if (cachedDev) {
          return {
            developer: cachedDev,
            repos: cachedDev.repos,
            stale: true,
            fromCache: true,
            rateLimitInfo: this.getRateLimitInfo(),
          };
        }
        const rateInfo = this.getRateLimitInfo();
        throw new AppError(
          `GitHub API rate limit exceeded. Reset in ${rateInfo.resetInMinutes || 'few'} minutes.`,
          429,
          rateInfo
        );
      }

      if (!userRes.ok) {
        throw new AppError(`GitHub API error: ${userRes.statusText}`, userRes.status);
      }

      const userData = (await userRes.json()) as any;
      const responseEtag = userRes.headers.get('etag');

      // 3. Fetch all repositories using Link header pagination (per_page=100)
      const rawRepos = await this.fetchAllUserRepos(username);

      // Aggregate total stars & preliminary language breakdown from repository list (0 extra calls)
      let totalStars = 0;
      const languageBytesMap: Record<string, number> = {};

      for (const repo of rawRepos) {
        totalStars += repo.stargazers_count || 0;
        if (repo.language) {
          languageBytesMap[repo.language] = (languageBytesMap[repo.language] || 0) + (repo.size || 1);
        }
      }

      // Sort top N repos by stars for deep fetching (default 10)
      const sortedByStars = [...rawRepos].sort(
        (a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0)
      );
      const topNRepos = sortedByStars.slice(0, 10);

      // 4. Parallel lazy deep fetch with p-limit (concurrency = 5)
      const limit = pLimit(5);
      const repoDetailsMap = new Map<number, { languages: any; commits: any[] }>();

      const deepFetchPromises = topNRepos.map((repo) =>
        limit(async () => {
          try {
            const [langRes, commitRes] = await Promise.all([
              fetch(`${this.BASE_URL}/repos/${repo.owner.login}/${repo.name}/languages`, {
                headers: this.getHeaders(),
              }),
              fetch(`${this.BASE_URL}/repos/${repo.owner.login}/${repo.name}/commits?per_page=15`, {
                headers: this.getHeaders(),
              }),
            ]);

            this.updateRateLimit(langRes.headers);
            this.updateRateLimit(commitRes.headers);

            const languages = langRes.ok ? await langRes.json() : null;
            const commits = commitRes.ok ? await commitRes.json() : [];

            repoDetailsMap.set(repo.id, {
              languages,
              commits: Array.isArray(commits) ? commits : [],
            });
          } catch {
            // Non-blocking error for lazy top-n fetch
            repoDetailsMap.set(repo.id, { languages: null, commits: [] });
          }
        })
      );

      await Promise.all(deepFetchPromises);

      // Build consolidated language breakdown & commit activity
      const detailedLangBreakdown: Record<string, number> = { ...languageBytesMap };
      let allRecentCommitsCount = 0;
      const commitTimestamps: { date: string; count: number }[] = [];
      const commitDateMap: Record<string, number> = {};

      for (const [, details] of repoDetailsMap.entries()) {
        if (details.languages) {
          for (const [lang, bytes] of Object.entries(details.languages)) {
            detailedLangBreakdown[lang] = (detailedLangBreakdown[lang] || 0) + Number(bytes);
          }
        }

        if (details.commits && details.commits.length > 0) {
          allRecentCommitsCount += details.commits.length;
          for (const c of details.commits) {
            const commitDate = c.commit?.author?.date || c.commit?.committer?.date;
            if (commitDate) {
              const dayStr = commitDate.substring(0, 10); // YYYY-MM-DD
              commitDateMap[dayStr] = (commitDateMap[dayStr] || 0) + 1;
            }
          }
        }
      }

      // Convert commitDateMap into sorted array for charts
      for (const [date, count] of Object.entries(commitDateMap)) {
        commitTimestamps.push({ date, count });
      }
      commitTimestamps.sort((a, b) => a.date.localeCompare(b.date));

      const commitActivity = {
        totalSampledCommits: allRecentCommitsCount,
        timeline: commitTimestamps,
        analyzedTopReposCount: topNRepos.length,
      };

      // 5. Store/Update in PostgreSQL
      const developer = await prisma.developer.upsert({
        where: { github_username: username },
        update: {
          avatar_url: userData.avatar_url,
          name: userData.name || null,
          bio: userData.bio || null,
          company: userData.company || null,
          location: userData.location || null,
          blog: userData.blog || null,
          followers: userData.followers || 0,
          public_repos: userData.public_repos || 0,
          total_stars: totalStars,
          language_breakdown: detailedLangBreakdown,
          commit_activity: commitActivity,
          etag: responseEtag,
          fetched_at: new Date(),
        },
        create: {
          github_username: username,
          avatar_url: userData.avatar_url,
          name: userData.name || null,
          bio: userData.bio || null,
          company: userData.company || null,
          location: userData.location || null,
          blog: userData.blog || null,
          followers: userData.followers || 0,
          public_repos: userData.public_repos || 0,
          total_stars: totalStars,
          language_breakdown: detailedLangBreakdown,
          commit_activity: commitActivity,
          etag: responseEtag,
          fetched_at: new Date(),
        },
      });

      // Upsert repos in database
      const upsertRepoPromises = rawRepos.map((repo) => {
        const details = repoDetailsMap.get(repo.id);
        return prisma.repo.upsert({
          where: {
            developer_id_name: {
              developer_id: developer.id,
              name: repo.name,
            },
          },
          update: {
            stars: repo.stargazers_count || 0,
            forks: repo.forks_count || 0,
            primary_language: repo.language || null,
            pushed_at: repo.pushed_at ? new Date(repo.pushed_at) : null,
            html_url: repo.html_url,
            description: repo.description || null,
            ...(details?.languages ? { languages: details.languages } : {}),
            commits_fetched_at: details ? new Date() : undefined,
          },
          create: {
            developer_id: developer.id,
            github_repo_id: String(repo.id),
            name: repo.name,
            stars: repo.stargazers_count || 0,
            forks: repo.forks_count || 0,
            primary_language: repo.language || null,
            pushed_at: repo.pushed_at ? new Date(repo.pushed_at) : null,
            html_url: repo.html_url,
            description: repo.description || null,
            languages: details?.languages || null,
            commits_fetched_at: details ? new Date() : null,
          },
        });
      });

      await prisma.$transaction(upsertRepoPromises);

      const savedRepos = await prisma.repo.findMany({
        where: { developer_id: developer.id },
        orderBy: { stars: 'desc' },
      });

      return {
        developer,
        repos: savedRepos,
        stale: false,
        fromCache: false,
        rateLimitInfo: this.getRateLimitInfo(),
      };
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }

      // Network or GitHub failure: fallback to cached data if present
      if (cachedDev) {
        console.warn(`Fallback to stale cached data for "${username}" due to error:`, error.message);
        return {
          developer: cachedDev,
          repos: cachedDev.repos,
          stale: true,
          fromCache: true,
          rateLimitInfo: this.getRateLimitInfo(),
        };
      }

      throw new AppError(`Failed to fetch GitHub data: ${error.message || 'Unknown error'}`, 502);
    }
  }

  /**
   * Follows Link header pagination for GET /users/{username}/repos?per_page=100
   */
  private static async fetchAllUserRepos(username: string): Promise<any[]> {
    let nextUrl: string | null = `${this.BASE_URL}/users/${username}/repos?per_page=100&sort=pushed`;
    const allRepos: any[] = [];
    let pageCount = 0;
    const MAX_PAGES = 10; // Safety cap to avoid infinite pagination on 1000+ repos

    while (nextUrl && pageCount < MAX_PAGES) {
      pageCount++;
      const res = await fetch(nextUrl, { headers: this.getHeaders() });
      this.updateRateLimit(res.headers);

      if (!res.ok) {
        break;
      }

      const repos = (await res.json()) as any[];
      if (!Array.isArray(repos) || repos.length === 0) {
        break;
      }

      allRepos.push(...repos);

      // Parse Link header
      const linkHeader = res.headers.get('link');
      nextUrl = this.extractNextPageUrl(linkHeader);
    }

    return allRepos;
  }

  private static extractNextPageUrl(linkHeader: string | null): string | null {
    if (!linkHeader) return null;
    const links = linkHeader.split(',');
    for (const link of links) {
      const match = link.match(/<([^>]+)>;\s*rel="([^"]+)"/);
      if (match && match[2] === 'next') {
        return match[1];
      }
    }
    return null;
  }
}
