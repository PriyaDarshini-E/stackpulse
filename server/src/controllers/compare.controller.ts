import { Request, Response, NextFunction } from 'express';
import { GitHubService } from '../services/github.service.js';
import { compareQuerySchema } from '../validations/compare.validation.js';
import { AppError } from '../middleware/errorHandler.js';

export class CompareController {
  static async compareDevelopers(req: Request, res: Response, next: NextFunction) {
    try {
      const { users } = compareQuerySchema.parse(req.query);

      // Fetch all developers concurrently via cache & GitHub service
      const fetchResults = await Promise.all(
        users.map(async (username) => {
          try {
            return await GitHubService.getDeveloper(username);
          } catch (error: any) {
            throw new AppError(
              `Error fetching developer "${username}": ${error.message || 'Not found'}`,
              error.statusCode || 400
            );
          }
        })
      );

      const isAnyStale = fetchResults.some((r) => r.stale);
      const isAllCached = fetchResults.every((r) => r.fromCache);

      // Extract and sort top languages for each developer
      const developers = fetchResults.map(({ developer }) => {
        const langEntries = Object.entries(
          (developer.language_breakdown as Record<string, number>) || {}
        ).sort((a, b) => b[1] - a[1]);

        const topLanguages = langEntries.slice(0, 3).map(([name]) => name);

        return {
          id: developer.id,
          github_username: developer.github_username,
          avatar_url: developer.avatar_url,
          name: developer.name,
          bio: developer.bio,
          followers: developer.followers,
          public_repos: developer.public_repos,
          total_stars: developer.total_stars,
          topLanguages,
          languageBreakdown: developer.language_breakdown,
          sampledCommits:
            (developer.commit_activity as any)?.totalSampledCommits || 0,
        };
      });

      // Format comparison metrics for charts
      const chartMetrics = {
        overview: developers.map((dev) => ({
          username: dev.github_username,
          stars: dev.total_stars,
          followers: dev.followers,
          repos: dev.public_repos,
          commits: dev.sampledCommits,
        })),
        languages: CompareController.buildComparativeLanguageData(developers),
      };

      return res.status(200).json({
        developers,
        chartMetrics,
        stale: isAnyStale,
        fromCache: isAllCached,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  private static buildComparativeLanguageData(developers: any[]) {
    // Gather all unique top languages across the compared developers
    const languageSet = new Set<string>();
    for (const dev of developers) {
      if (dev.languageBreakdown) {
        for (const lang of Object.keys(dev.languageBreakdown)) {
          languageSet.add(lang);
        }
      }
    }

    const topLanguages = Array.from(languageSet).slice(0, 6);

    return topLanguages.map((lang) => {
      const row: Record<string, any> = { language: lang };
      for (const dev of developers) {
        const bytes = dev.languageBreakdown?.[lang] || 0;
        row[dev.github_username] = Math.round(bytes / 1024); // in KB
      }
      return row;
    });
  }
}
