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
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16 text-center">
        <div className="glass-panel p-6 sm:p-12 rounded-3xl border border-slate-800 space-y-4 shadow-2xl">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
            <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {isNotFound ? 'Developer Not Found' : 'Unable to Load Profile'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">{errorMsg}</p>
          <div className="pt-3 flex justify-center gap-3">
            <Link
              to="/"
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors flex items-center gap-2 border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Search</span>
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
    .slice(0, 6);

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
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 overflow-hidden">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-all border border-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>Search Developers</span>
        </Link>

        {/* Status badges & Action buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {stale && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
              <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Stale Cache</span>
            </div>
          )}

          {fromCache && !stale && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
              <Database className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>DB Cached</span>
            </div>
          )}

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 transition-all disabled:opacity-50"
            title="Force refresh data from GitHub API"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={handleCompare}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all active:scale-95"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Compare</span>
          </button>
        </div>
      </div>

      {/* Developer Profile Header Card */}
      <div className="glass-panel-glow p-5 sm:p-8 rounded-3xl border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 sm:gap-7 relative z-10">
          {/* Avatar with illuminated gradient frame */}
          <div className="relative group shrink-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-3xl blur-sm opacity-70 group-hover:opacity-100 transition duration-300"></div>
            <img
              src={developer.avatar_url || 'https://github.com/identicons/user.png'}
              alt={developer.github_username}
              className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-slate-900 shadow-xl"
            />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight break-words">
                  {developer.name || developer.github_username}
                </h1>
                <a
                  href={`https://github.com/${developer.github_username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl bg-slate-900 text-indigo-400 text-xs font-mono font-bold border border-slate-800 hover:border-indigo-500/40"
                >
                  <span>@{developer.github_username}</span>
                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                </a>
              </div>
              {developer.bio && (
                <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed font-normal">
                  {developer.bio}
                </p>
              )}
            </div>

            {/* Metadata badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-400 pt-1">
              {developer.company && (
                <span className="flex items-center gap-1 bg-slate-900/90 px-2.5 py-1 rounded-xl border border-slate-800 text-[11px] text-slate-300 truncate max-w-[200px]">
                  <Building2 className="w-3 h-3 text-indigo-400 shrink-0" />
                  <span className="truncate">{developer.company}</span>
                </span>
              )}
              {developer.location && (
                <span className="flex items-center gap-1 bg-slate-900/90 px-2.5 py-1 rounded-xl border border-slate-800 text-[11px] text-slate-300 truncate max-w-[180px]">
                  <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">{developer.location}</span>
                </span>
              )}
              {developer.blog && (
                <a
                  href={developer.blog.startsWith('http') ? developer.blog : `https://${developer.blog}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 bg-slate-900/90 px-2.5 py-1 rounded-xl border border-slate-800 text-[11px] text-indigo-300 hover:underline"
                >
                  <LinkIcon className="w-3 h-3 text-purple-400 shrink-0" />
                  <span>Website</span>
                </a>
              )}
              <span className="flex items-center gap-1 text-[11px] text-slate-500">
                <Clock className="w-3 h-3 shrink-0" />
                <span>Updated {new Date(developer.fetched_at).toLocaleDateString()}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Aggregate Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="glass-card stat-card-gradient p-4 sm:p-5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Followers</span>
            <Users className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl sm:text-3xl font-black text-white font-mono truncate">
            {developer.followers.toLocaleString()}
          </div>
        </div>

        <div className="glass-card stat-card-gradient p-4 sm:p-5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Public Repos</span>
            <BookMarked className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-3xl font-black text-white font-mono truncate">
            {developer.public_repos.toLocaleString()}
          </div>
        </div>

        <div className="glass-card stat-card-gradient p-4 sm:p-5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-300">Total Stars</span>
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          </div>
          <div className="text-xl sm:text-3xl font-black text-amber-400 font-mono truncate">
            {developer.total_stars.toLocaleString()}
          </div>
        </div>

        <div className="glass-card stat-card-gradient p-4 sm:p-5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Commits</span>
            <Code className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl sm:text-3xl font-black text-white font-mono truncate">
            {developer.commit_activity?.totalSampledCommits?.toLocaleString() || 0}
          </div>
        </div>
      </div>

      {/* Visual Analytics: Language Donut & Commit Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-7">
        {/* Language Breakdown Chart */}
        <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-slate-800 flex flex-col min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-indigo-400" />
              <span>Languages Breakdown</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">Top Languages</span>
          </div>

          {languageData.length > 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[240px]">
              <div className="w-full h-52 sm:h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={languageData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
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
                        borderRadius: '0.75rem',
                        color: '#fff',
                        fontSize: '0.75rem',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Custom Legend */}
              <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                {languageData.map((lang, idx) => {
                  const pct = totalBytes > 0 ? ((lang.value / totalBytes) * 100).toFixed(0) : '0';
                  return (
                    <div
                      key={lang.name}
                      className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300"
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: LANGUAGE_COLORS[idx % LANGUAGE_COLORS.length] }}
                      ></span>
                      <span className="font-medium text-slate-200">{lang.name}</span>
                      <span className="text-slate-500 font-mono text-[10px]">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-xs italic py-8">
              No language statistics available
            </div>
          )}
        </div>

        {/* Commit Cadence & Timeline */}
        <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-slate-800 flex flex-col min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Recent Commit Cadence</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">Sampled Top 10</span>
          </div>

          {commitTimeline.length > 0 ? (
            <div className="flex-1 flex flex-col justify-center min-h-[240px]">
              <div className="w-full h-52 sm:h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={commitTimeline} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
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
                      fontSize={10}
                      tickFormatter={(val) => val.substring(5)} // MM-DD
                    />
                    <YAxis stroke="#64748B" fontSize={10} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#0D1322',
                        border: '1px solid #374151',
                        borderRadius: '0.75rem',
                        color: '#fff',
                        fontSize: '0.75rem',
                      }}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      name="Commits"
                      stroke="#818CF8"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#commitGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-slate-400 text-center mt-2">
                Sampled from commits across top {developer.commit_activity?.analyzedTopReposCount || 10} starred repositories
              </p>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-xs italic py-8">
              No recent commit activity found in top repositories
            </div>
          )}
        </div>
      </div>

      {/* Repositories Section */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <BookMarked className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">Repositories</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 text-xs font-mono font-bold">
              {filteredRepos.length}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Filter input */}
            <div className="relative flex-1 sm:w-60">
              <SearchIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={repoSearch}
                onChange={(e) => setRepoSearch(e.target.value)}
                placeholder="Filter repositories..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Sort selection */}
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
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
              <div key={i} className="glass-card p-5 rounded-2xl border border-slate-800 animate-pulse h-36"></div>
            ))}
          </div>
        ) : filteredRepos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRepos.map((repo) => (
              <div
                key={repo.id}
                className="glass-card stat-card-gradient p-4 sm:p-5 rounded-2xl border border-slate-800/90 flex flex-col justify-between hover:border-indigo-500/50 transition-all space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm sm:text-base font-bold text-white hover:text-indigo-400 transition-colors flex items-center gap-1.5 break-all"
                    >
                      <span>{repo.name}</span>
                      <ExternalLink className="w-3 h-3 opacity-60 shrink-0" />
                    </a>

                    {/* Pin button */}
                    <button
                      onClick={() => setActivePinRepo(repo)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 ${
                        repo.is_pinned
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-sm shadow-indigo-600/30'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80'
                      }`}
                      title={repo.is_pinned ? 'Edit Pin' : 'Pin Repository'}
                    >
                      <Bookmark className={`w-3 h-3 ${repo.is_pinned ? 'fill-white text-white' : ''}`} />
                      <span>{repo.is_pinned ? 'Pinned' : 'Pin'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-2.5 font-normal">
                    {repo.description || 'No description provided.'}
                  </p>

                  {/* Pin Note preview if present */}
                  {repo.pin_details?.note && (
                    <div className="mb-2 px-2.5 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 italic flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span className="truncate">"{repo.pin_details.note}"</span>
                    </div>
                  )}

                  {/* Pin Tags */}
                  {repo.pin_details?.tags && repo.pin_details.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {repo.pin_details.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold bg-slate-900 text-slate-300 border border-slate-800"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Repo Meta Footer */}
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2.5 border-t border-slate-800/80 gap-2">
                  <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                    {repo.primary_language && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                        {repo.primary_language}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-amber-400 font-mono font-bold text-xs">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {repo.stars.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 font-mono text-xs">
                      <GitFork className="w-3 h-3" />
                      {repo.forks.toLocaleString()}
                    </span>
                  </div>

                  {repo.pushed_at && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(repo.pushed_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs sm:text-sm">
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
