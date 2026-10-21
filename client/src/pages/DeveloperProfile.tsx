import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  BookMarked, 
  Star, 
  GitFork, 
  ExternalLink, 
  RefreshCw, 
  AlertTriangle, 
  MapPin, 
  Building2, 
  Link as LinkIcon, 
  Bookmark, 
  GitCompare, 
  Code, 
  Clock, 
  ArrowLeft,
  Search as SearchIcon,
  Database,
  Sparkles
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { apiRequest } from '../services/api.js';
import { Developer, Repo } from '../types/index.js';
import { ProfileSkeleton } from '../components/LoadingSkeleton.js';
import { PinModal } from '../components/PinModal.js';

const LANGUAGE_COLORS = [
  '#6366F1', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#8B5CF6', // Purple
  '#F43F5E', // Rose
  '#3B82F6', // Blue
  '#14B8A6', // Teal
  '#84CC16', // Lime
];

export const DeveloperProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [sortField, setSortField] = useState<'stars' | 'updated' | 'name'>('stars');
  const [repoSearch, setRepoSearch] = useState('');
  const [activePinRepo, setActivePinRepo] = useState<Repo | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch Developer Profile
  const { 
    data: profileData, 
    isLoading: isProfileLoading, 
    error: profileError,
    refetch: refetchProfile
  } = useQuery({
    queryKey: ['developer', username],
    queryFn: () => apiRequest<{
      developer: Developer;
      repoCount: number;
      stale: boolean;
      fromCache: boolean;
      rateLimitInfo?: any;
    }>(`/developers/${username}`),
    enabled: !!username,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch Developer Repositories
  const { 
    data: reposData, 
    isLoading: isReposLoading,
    refetch: refetchRepos
  } = useQuery({
    queryKey: ['developer_repos', username, sortField],
    queryFn: () => apiRequest<{
      username: string;
      total: number;
      repos: Repo[];
    }>(`/developers/${username}/repos?sort=${sortField}`),
    enabled: !!username,
    staleTime: 5 * 60 * 1000,
  });

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await apiRequest(`/developers/${username}?refresh=true`);
      await Promise.all([refetchProfile(), refetchRepos()]);
      queryClient.invalidateQueries({ queryKey: ['developer', username] });
      queryClient.invalidateQueries({ queryKey: ['developer_repos', username] });
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCompare = () => {
    if (!username) return;
    navigate(`/compare?users=${encodeURIComponent(username)}`);
  };

  if (isProfileLoading) {
    return <ProfileSkeleton />;
  }

  if (profileError || !profileData?.developer) {
    const errorMsg = (profileError as any)?.message || 'Failed to load developer profile';
    const isNotFound = (profileError as any)?.statusCode === 404;

    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">
            {isNotFound ? 'Developer Not Found' : 'Unable to Load Profile'}
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">{errorMsg}</p>
          <div className="pt-4 flex justify-center gap-3">
            <Link
              to="/"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors flex items-center gap-2 border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { developer, stale, fromCache } = profileData;

  // Prepare Language Chart Data
  const languageData = Object.entries(developer.language_breakdown || {})
    .map(([name, bytes]) => ({ name, value: Number(bytes) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 7);

  const totalBytes = languageData.reduce((acc, curr) => acc + curr.value, 0);

  // Prepare Commit Activity Data
  const commitTimeline = developer.commit_activity?.timeline || [];

  // Filter Repositories by search term
  const filteredRepos = (reposData?.repos || []).filter((repo) =>
    repo.name.toLowerCase().includes(repoSearch.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(repoSearch.toLowerCase())) ||
    (repo.primary_language && repo.primary_language.toLowerCase().includes(repoSearch.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Bar with back link and actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-all border border-slate-800 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-indigo-400" />
          <span>Search Developers</span>
        </Link>

        <div className="flex items-center gap-2.5">
          {stale && (
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold shadow-sm">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Stale Cache</span>
            </div>
          )}

          {fromCache && !stale && (
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-sm">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>DB Cached (0 API Calls)</span>
            </div>
          )}

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 transition-all disabled:opacity-50 shadow-sm"
            title="Force refresh data from GitHub API"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={handleCompare}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Compare</span>
          </button>
        </div>
      </div>

      {/* Developer Profile Header Card */}
      <div className="glass-panel-glow p-6 sm:p-10 rounded-3xl border border-slate-800 relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 relative z-10">
          {/* Avatar with illuminated gradient frame */}
          <div className="relative group shrink-0">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-3xl blur-sm opacity-70 group-hover:opacity-100 transition duration-300"></div>
            <img
              src={developer.avatar_url || 'https://github.com/identicons/user.png'}
              alt={developer.github_username}
              className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-2 border-slate-900 shadow-2xl"
            />
          </div>

          {/* Details */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {developer.name || developer.github_username}
                </h1>
                <a
                  href={`https://github.com/${developer.github_username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/90 text-indigo-400 text-xs font-mono font-bold hover:bg-slate-800 border border-slate-700/80 shadow-sm transition-all"
                >
                  <span>@{developer.github_username}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              {developer.bio && (
                <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed font-normal">
                  {developer.bio}
                </p>
              )}
            </div>

            {/* Metadata badges */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-400 pt-1">
              {developer.company && (
                <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  {developer.company}
                </span>
              )}
              {developer.location && (
                <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  {developer.location}
                </span>
              )}
              {developer.blog && (
                <a
                  href={developer.blog.startsWith('http') ? developer.blog : `https://${developer.blog}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-indigo-300 hover:text-indigo-200 transition-colors"
                >
                  <LinkIcon className="w-3.5 h-3.5 text-purple-400" />
                  Website
                </a>
              )}
              <span className="flex items-center gap-1.5 text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                Updated {new Date(developer.fetched_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Aggregate Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-card stat-card-gradient p-6 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Followers</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-4xl font-black text-white font-mono">
            {developer.followers.toLocaleString()}
          </div>
        </div>

        <div className="glass-card stat-card-gradient p-6 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Public Repos</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <BookMarked className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-4xl font-black text-white font-mono">
            {developer.public_repos.toLocaleString()}
          </div>
        </div>

        <div className="glass-card stat-card-gradient p-6 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Total Stars</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400 shadow-sm">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-4xl font-black text-amber-400 font-mono">
            {developer.total_stars.toLocaleString()}
          </div>
        </div>

        <div className="glass-card stat-card-gradient p-6 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Sampled Commits</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Code className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-4xl font-black text-white font-mono">
            {developer.commit_activity?.totalSampledCommits?.toLocaleString() || 0}
          </div>
        </div>
      </div>

      {/* Visual Analytics: Language Donut & Commit Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Language Breakdown Chart */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/90 flex flex-col shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-indigo-400" />
              <span>Top Languages Breakdown</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Share by Bytes</span>
          </div>

          {languageData.length > 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[280px]">
              <div className="w-full h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={languageData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {languageData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={LANGUAGE_COLORS[index % LANGUAGE_COLORS.length]}
                          stroke="rgba(7, 10, 18, 0.8)"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(val: number) => {
                        const pct = totalBytes > 0 ? ((val / totalBytes) * 100).toFixed(1) : '0';
                        return [`${pct}% (${(val / 1024).toFixed(1)} KB)`, 'Share'];
                      }}
                      contentStyle={{
                        backgroundColor: '#0D1322',
                        border: '1px solid #374151',
                        borderRadius: '1rem',
                        color: '#fff',
                        fontSize: '0.8rem',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Custom Legend */}
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {languageData.map((lang, idx) => {
                  const pct = totalBytes > 0 ? ((lang.value / totalBytes) * 100).toFixed(0) : '0';
                  return (
                    <div
                      key={lang.name}
                      className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 shadow-sm"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: LANGUAGE_COLORS[idx % LANGUAGE_COLORS.length] }}
                      ></span>
                      <span className="font-semibold text-slate-200">{lang.name}</span>
                      <span className="text-slate-400 text-[10px] font-mono">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm italic">
              No language statistics available
            </div>
          )}
        </div>

        {/* Commit Cadence & Timeline */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/90 flex flex-col shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Recent Commit Cadence</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Sampled Volume</span>
          </div>

          {commitTimeline.length > 0 ? (
            <div className="flex-1 flex flex-col justify-center min-h-[280px]">
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={commitTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="commitGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.85} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#252e42" opacity={0.6} />
                    <XAxis
                      dataKey="date"
                      stroke="#64748B"
                      fontSize={11}
                      tickFormatter={(val) => val.substring(5)} // Show MM-DD
                    />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#0D1322',
                        border: '1px solid #374151',
                        borderRadius: '1rem',
                        color: '#fff',
                        fontSize: '0.8rem',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                      }}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      name="Commits"
                      stroke="#818CF8"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#commitGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-slate-400 text-center mt-3 font-medium">
                Sampled from commits across top {developer.commit_activity?.analyzedTopReposCount || 10} starred repositories
              </p>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm italic">
              No recent commit activity found in top repositories
            </div>
          )}
        </div>
      </div>

      {/* Repositories Section */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <BookMarked className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Public Repositories</h2>
            <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 text-xs font-mono font-bold">
              {filteredRepos.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter input */}
            <div className="relative flex-1 sm:w-64">
              <SearchIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={repoSearch}
                onChange={(e) => setRepoSearch(e.target.value)}
                placeholder="Filter repositories..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-sm"
              />
            </div>

            {/* Sort selection */}
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-sm"
            >
              <option value="stars">⭐ Most Stars</option>
              <option value="updated">🕒 Recently Updated</option>
              <option value="name">🔤 Name</option>
            </select>
          </div>
        </div>

        {/* Repos Grid */}
        {isReposLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card p-6 rounded-2xl border border-slate-800 animate-pulse h-40"></div>
            ))}
          </div>
        ) : filteredRepos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredRepos.map((repo) => (
              <div
                key={repo.id}
                className="glass-card stat-card-gradient p-6 rounded-2xl border border-slate-800/90 flex flex-col justify-between hover:border-indigo-500/50 transition-all group shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-base font-bold text-white hover:text-indigo-400 transition-colors flex items-center gap-1.5 break-all group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>{repo.name}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 shrink-0" />
                    </a>

                    {/* Pin button */}
                    <button
                      onClick={() => setActivePinRepo(repo)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        repo.is_pinned
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80'
                      }`}
                      title={repo.is_pinned ? 'Edit Pin' : 'Pin Repository'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${repo.is_pinned ? 'fill-white text-white' : ''}`} />
                      <span>{repo.is_pinned ? 'Pinned' : 'Pin'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3 font-normal">
                    {repo.description || 'No description provided.'}
                  </p>

                  {/* Pin Note preview if present */}
                  {repo.pin_details?.note && (
                    <div className="mb-3 px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 italic flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span className="truncate">"{repo.pin_details.note}"</span>
                    </div>
                  )}

                  {/* Pin Tags */}
                  {repo.pin_details?.tags && repo.pin_details.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {repo.pin_details.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-semibold bg-slate-900 text-slate-300 border border-slate-800"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Repo Meta Footer */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80 mt-2">
                  <div className="flex items-center gap-3.5">
                    {repo.primary_language && (
                      <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                        <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                        {repo.primary_language}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-amber-400 font-mono font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {repo.stars.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 font-mono">
                      <GitFork className="w-3.5 h-3.5" />
                      {repo.forks.toLocaleString()}
                    </span>
                  </div>

                  {repo.pushed_at && (
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(repo.pushed_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center text-slate-400 text-sm">
            No repositories found matching your filter.
          </div>
        )}
      </div>

      {/* Pin Modal */}
      {activePinRepo && (
        <PinModal
          repo={activePinRepo}
          isOpen={!!activePinRepo}
          onClose={() => setActivePinRepo(null)}
          onSuccess={() => {
            refetchRepos();
          }}
        />
      )}
    </div>
  );
};
