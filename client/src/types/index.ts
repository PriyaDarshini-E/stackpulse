export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Developer {
  id: string;
  github_username: string;
  avatar_url?: string;
  name?: string;
  bio?: string;
  company?: string;
  location?: string;
  blog?: string;
  followers: number;
  public_repos: number;
  total_stars: number;
  language_breakdown?: Record<string, number>;
  commit_activity?: {
    totalSampledCommits: number;
    timeline: { date: string; count: number }[];
    analyzedTopReposCount: number;
  };
  etag?: string;
  fetched_at: string;
}

export interface Repo {
  id: string;
  developer_id?: string;
  github_repo_id: string;
  name: string;
  stars: number;
  forks: number;
  primary_language?: string;
  pushed_at?: string;
  html_url: string;
  description?: string;
  languages?: Record<string, number>;
  is_pinned?: boolean;
  pin_details?: {
    id: string;
    note?: string;
    tags: string[];
  };
}

export interface Pin {
  id: string;
  user_id: string;
  repo_id: string;
  note?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  repo: Repo & {
    developer?: {
      github_username: string;
      avatar_url?: string;
    };
  };
}

export interface Comparison {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  comparison_devs: {
    comparison_id: string;
    developer_id: string;
    developer: Developer;
  }[];
}

export interface RateLimitInfo {
  remaining: number | null;
  reset: number | null;
  resetInMinutes: number | null;
}
