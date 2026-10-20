import { Request, Response, NextFunction } from 'express';
import { GitHubService } from '../services/github.service.js';
import { prisma } from '../db/prisma.js';
import { usernameParamSchema, reposQuerySchema } from '../validations/developer.validation.js';

export class DeveloperController {
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { username } = usernameParamSchema.parse(req.params);
      const forceRefresh = req.query.refresh === 'true';

      const result = await GitHubService.getDeveloper(username, forceRefresh);

      return res.status(200).json({
        developer: result.developer,
        repoCount: result.repos.length,
        stale: result.stale,
        fromCache: result.fromCache,
        rateLimitInfo: result.rateLimitInfo,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRepos(req: Request, res: Response, next: NextFunction) {
    try {
      const { username } = usernameParamSchema.parse(req.params);
      const { sort, order } = reposQuerySchema.parse(req.query);
      const userId = req.user?.id;

      // Ensure developer and repos are loaded/cached
      const result = await GitHubService.getDeveloper(username);

      // Determine orderBy clause
      let orderBy: any = { stars: order };
      if (sort === 'updated') {
        orderBy = { pushed_at: order };
      } else if (sort === 'name') {
        orderBy = { name: order };
      }

      // Fetch repos from DB with pin status for current user
      const repos = await prisma.repo.findMany({
        where: { developer_id: result.developer.id },
        orderBy,
        include: {
          pins: userId
            ? {
                where: { user_id: userId },
                select: { id: true, note: true, tags: true },
              }
            : false,
        },
      });

      const formattedRepos = repos.map((repo) => ({
        id: repo.id,
        github_repo_id: repo.github_repo_id,
        name: repo.name,
        stars: repo.stars,
        forks: repo.forks,
        primary_language: repo.primary_language,
        pushed_at: repo.pushed_at,
        html_url: repo.html_url,
        description: repo.description,
        languages: repo.languages,
        is_pinned: repo.pins && repo.pins.length > 0,
        pin_details: repo.pins && repo.pins.length > 0 ? repo.pins[0] : null,
      }));

      return res.status(200).json({
        username: result.developer.github_username,
        total: formattedRepos.length,
        stale: result.stale,
        fromCache: result.fromCache,
        repos: formattedRepos,
      });
    } catch (error) {
      next(error);
    }
  }
}
