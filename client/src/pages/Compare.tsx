import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  GitCompare, 
  Plus, 
  X, 
  Star, 
  Users, 
  BookMarked, 
  Code, 
  BookmarkCheck, 
  Sparkles, 
  AlertCircle, 
  Crown,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { apiRequest } from '../services/api.js';
import { CompareSkeleton } from '../components/LoadingSkeleton.js';

const DEVELOPER_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#06B6D4'];

export const Compare: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Selected usernames state
  const [usernames, setUsernames] = useState<string[]>(() => {
    const raw = searchParams.get('users');
    if (raw) {
      return raw.split(',').map((u) => u.trim()).filter(Boolean);
    }
    return ['torvalds', 'gaearon']; // Default comparison
  });

  const [inputUsername, setInputUsername] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [mobileViewMode, setMobileViewMode] = useState<'cards' | 'table'>('cards');

  // Save comparison modal state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [comparisonName, setComparisonName] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Sync state to URL
  useEffect(() => {
    if (usernames.length > 0) {
      setSearchParams({ users: usernames.join(',') }, { replace: true });
    }
  }, [usernames, setSearchParams]);

  // Fetch comparison data
  const { 
    data: compareData, 
    isLoading, 
    error: fetchError,
    refetch 
  } = useQuery({
    queryKey: ['compare', usernames.join(',')],
    queryFn: () => apiRequest(`/compare?users=${encodeURIComponent(usernames.join(','))}`),
    enabled: usernames.length >= 2,
    staleTime: 5 * 60 * 1000,
  });

  const handleAddDeveloper = (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);
    const trimmed = inputUsername.trim().toLowerCase();

    if (!trimmed) return;
    if (usernames.map((u) => u.toLowerCase()).includes(trimmed)) {
      setInputError('This developer is already in the comparison');
      return;
    }
    if (usernames.length >= 5) {
      setInputError('Maximum 5 developers can be compared at once');
      return;
    }

    setUsernames([...usernames, trimmed]);
    setInputUsername('');
  };

  const handleRemoveDeveloper = (usernameToRemove: string) => {
    if (usernames.length <= 2) {
      setInputError('At least 2 developers are required to compare');
      return;
    }
    setUsernames(usernames.filter((u) => u.toLowerCase() !== usernameToRemove.toLowerCase()));
  };

  const handleSaveComparison = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comparisonName.trim() || !compareData?.developers) return;

    setSaveLoading(true);
    setSaveMessage(null);

    try {
      const developerIds = compareData.developers.map((d: any) => d.id);
      await apiRequest('/comparisons', {
        method: 'POST',
        body: JSON.stringify({
          name: comparisonName.trim(),
          developer_ids: developerIds,
        }),
      });

      setSaveMessage({ text: 'Comparison saved successfully!', type: 'success' });
      setTimeout(() => {
        setIsSaveModalOpen(false);
        setComparisonName('');
        setSaveMessage(null);
        navigate('/comparisons');
      }, 1200);
    } catch (err: any) {
      setSaveMessage({ text: err.message || 'Failed to save comparison', type: 'error' });
    } finally {
      setSaveLoading(false);
    }
  };

  const developers = compareData?.developers || [];

  // Determine maximum values for highlights
  const maxStars = Math.max(...developers.map((d: any) => d.total_stars || 0), 0);
  const maxFollowers = Math.max(...developers.map((d: any) => d.followers || 0), 0);
  const maxRepos = Math.max(...developers.map((d: any) => d.public_repos || 0), 0);
  const maxCommits = Math.max(...developers.map((d: any) => d.commit_activity?.totalSampledCommits || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 overflow-hidden">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-1.5">
            <GitCompare className="w-3.5 h-3.5 text-indigo-400" />
            <span>Developer Benchmarks</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Compare Developers
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Side-by-side analysis of community traction, languages, and repositories
          </p>
        </div>

        {developers.length >= 2 && (
          <button
            onClick={() => setIsSaveModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all active:scale-95"
          >
            <BookmarkCheck className="w-4 h-4" />
            <span>Save Comparison</span>
          </button>
        )}
      </div>

      {/* Developer Selector Bar */}
      <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-slate-800 space-y-3.5">
        <form onSubmit={handleAddDeveloper} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputUsername}
              onChange={(e) => {
                setInputUsername(e.target.value);
                setInputError(null);
              }}
              placeholder="Add another GitHub username (e.g. shadcn)..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Developer</span>
          </button>
        </form>

        {inputError && (
          <p className="text-xs text-rose-400 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            {inputError}
          </p>
        )}

        {/* Selected Developer Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Comparing ({usernames.length}/5):
          </span>
          {usernames.map((u, idx) => {
            const devObj = developers.find((d: any) => d.github_username?.toLowerCase() === u.toLowerCase());
            const avatarUrl = devObj?.avatar_url || `https://github.com/${u}.png`;

            return (
              <div
                key={u}
                className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-semibold text-slate-200 shadow-sm transition-all hover:border-slate-600"
              >
                <img
                  src={avatarUrl}
                  alt={u}
                  className="w-5 h-5 rounded-full object-cover border border-slate-700 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: DEVELOPER_COLORS[idx % DEVELOPER_COLORS.length] }}
                />
                <span className="font-mono text-indigo-300 font-bold">@{u}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDeveloper(u)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title={`Remove @${u}`}
                  aria-label={`Remove @${u}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80 text-xs">
          <span className="text-slate-400 text-[11px]">Presets:</span>
          <button
            type="button"
            onClick={() => setUsernames(['torvalds', 'gaearon'])}
            className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-800 text-[11px] font-semibold transition-colors"
          >
            Linus vs Dan
          </button>
          <button
            type="button"
            onClick={() => setUsernames(['shadcn', 'sindresorhus', 'tj'])}
            className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-800 text-[11px] font-semibold transition-colors"
          >
            UI & Open Source Leads
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && <CompareSkeleton />}

      {/* Error State */}
      {fetchError && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-rose-500/30 bg-rose-500/10 text-center space-y-3 max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Comparison Failed</h3>
          <p className="text-xs text-rose-300 max-w-sm mx-auto">
            {(fetchError as any)?.message || 'Failed to compare developers.'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors border border-slate-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Friendly Empty State */}
      {!isLoading && !fetchError && developers.length < 2 && (
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <GitCompare className="w-6 h-6" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white">Compare at least 2 developers</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Add two or more GitHub usernames to benchmark stars, followers, and language ecosystems.
          </p>
          <div className="pt-2 flex justify-center">
            <button
              onClick={() => setUsernames(['torvalds', 'gaearon'])}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
            >
              Compare Linus vs Dan
            </button>
          </div>
        </div>
      )}

      {/* Main Comparison View */}
      {!isLoading && developers.length >= 2 && (
        <div className="space-y-6 sm:space-y-8">
          {/* Mobile View Toggle */}
          <div className="flex md:hidden items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Comparison Mode:
            </span>
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setMobileViewMode('cards')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold ${
                  mobileViewMode === 'cards'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
              <button
                onClick={() => setMobileViewMode('table')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold ${
                  mobileViewMode === 'table'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
            </div>
          </div>

          {/* Mobile Cards View (Only displayed on small screens when selected) */}
          {mobileViewMode === 'cards' && (
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {developers.map((dev: any, idx: number) => {
                const hasMostStars = dev.total_stars === maxStars && maxStars > 0;
                const hasMostFollowers = dev.followers === maxFollowers && maxFollowers > 0;
                const hasMostRepos = dev.public_repos === maxRepos && maxRepos > 0;

                return (
                  <div
                    key={dev.id}
                    className="glass-card stat-card-gradient p-5 rounded-2xl border border-slate-800 space-y-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={dev.avatar_url || 'https://github.com/identicons/user.png'}
                          alt={dev.github_username}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                        />
                        <div className="truncate">
                          <h4 className="font-extrabold text-white text-sm truncate">
                            {dev.name || dev.github_username}
                          </h4>
                          <span
                            className="text-[11px] font-mono font-bold"
                            style={{ color: DEVELOPER_COLORS[idx % DEVELOPER_COLORS.length] }}
                          >
                            @{dev.github_username}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/developer/${dev.github_username}`)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300"
                      >
                        Profile
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center pt-1">
                      <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Stars</span>
                        <span className={`text-xs sm:text-sm font-black font-mono block ${hasMostStars ? 'text-amber-400' : 'text-white'}`}>
                          {dev.total_stars.toLocaleString()}
                        </span>
                        {hasMostStars && <span className="text-[9px] text-amber-300 font-bold">Top</span>}
                      </div>

                      <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Followers</span>
                        <span className={`text-xs sm:text-sm font-black font-mono block ${hasMostFollowers ? 'text-indigo-400' : 'text-white'}`}>
                          {dev.followers.toLocaleString()}
                        </span>
                        {hasMostFollowers && <span className="text-[9px] text-indigo-300 font-bold">Top</span>}
                      </div>

                      <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Repos</span>
                        <span className={`text-xs sm:text-sm font-black font-mono block ${hasMostRepos ? 'text-cyan-400' : 'text-white'}`}>
                          {dev.public_repos.toLocaleString()}
                        </span>
                        {hasMostRepos && <span className="text-[9px] text-cyan-300 font-bold">Top</span>}
                      </div>
                    </div>

                    {dev.topLanguages && dev.topLanguages.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium text-[11px]">Top Stacks:</span>
                        <div className="flex flex-wrap gap-1">
                          {dev.topLanguages.map((l: string) => (
                            <span key={l} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-900 text-slate-300">
                              {l}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Comparison Table (Shown on desktop or when Table mode selected on mobile) */}
          <div className={`${mobileViewMode === 'cards' ? 'hidden md:block' : 'block'} glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl`}>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left border-collapse min-w-[620px]">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80">
                    <th className="py-4 px-5 text-xs font-bold uppercase tracking-wider text-slate-400 w-40">
                      Metric
                    </th>
                    {developers.map((dev: any, idx: number) => (
                      <th key={dev.id} className="py-4 px-5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={dev.avatar_url || 'https://github.com/identicons/user.png'}
                            alt={dev.github_username}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                          />
                          <div className="truncate">
                            <div className="font-extrabold text-white text-xs sm:text-sm truncate">
                              {dev.name || dev.github_username}
                            </div>
                            <span
                              className="text-[11px] font-mono font-bold"
                              style={{ color: DEVELOPER_COLORS[idx % DEVELOPER_COLORS.length] }}
                            >
                              @{dev.github_username}
                            </span>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
                  {/* Total Stars Row */}
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-300 flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      Total Stars
                    </td>
                    {developers.map((dev: any) => {
                      const isLeader = dev.total_stars === maxStars && maxStars > 0;
                      return (
                        <td key={dev.id} className={`py-3.5 px-5 transition-colors ${isLeader ? 'bg-amber-500/10' : ''}`}>
                          <div className="flex items-center gap-2 font-mono font-bold text-white">
                            <span className={isLeader ? 'text-amber-400' : ''}>
                              {dev.total_stars.toLocaleString()}
                            </span>
                            {isLeader && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                                <Crown className="w-2.5 h-2.5 fill-amber-300" /> Leader
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Followers Row */}
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-300 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      Followers
                    </td>
                    {developers.map((dev: any) => {
                      const isLeader = dev.followers === maxFollowers && maxFollowers > 0;
                      return (
                        <td key={dev.id} className={`py-3.5 px-5 transition-colors ${isLeader ? 'bg-indigo-500/10' : ''}`}>
                          <div className="flex items-center gap-2 font-mono font-bold text-white">
                            <span className={isLeader ? 'text-indigo-400' : ''}>
                              {dev.followers.toLocaleString()}
                            </span>
                            {isLeader && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-400/20 text-indigo-300 border border-indigo-400/30">
                                <Crown className="w-2.5 h-2.5 fill-indigo-300" /> Leader
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Public Repos Row */}
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-300 flex items-center gap-2">
                      <BookMarked className="w-3.5 h-3.5 text-cyan-400" />
                      Public Repos
                    </td>
                    {developers.map((dev: any) => {
                      const isLeader = dev.public_repos === maxRepos && maxRepos > 0;
                      return (
                        <td key={dev.id} className={`py-3.5 px-5 transition-colors ${isLeader ? 'bg-cyan-500/10' : ''}`}>
                          <div className="flex items-center gap-2 font-mono font-bold text-white">
                            <span className={isLeader ? 'text-cyan-400' : ''}>
                              {dev.public_repos.toLocaleString()}
                            </span>
                            {isLeader && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                                <Crown className="w-2.5 h-2.5 fill-cyan-300" /> Leader
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Sampled Commits Row */}
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-300 flex items-center gap-2">
                      <Code className="w-3.5 h-3.5 text-purple-400" />
                      Sampled Commits
                    </td>
                    {developers.map((dev: any) => {
                      const commits = dev.commit_activity?.totalSampledCommits || 0;
                      const isLeader = commits === maxCommits && maxCommits > 0;
                      return (
                        <td key={dev.id} className={`py-3.5 px-5 transition-colors ${isLeader ? 'bg-purple-500/10' : ''}`}>
                          <div className="flex items-center gap-2 font-mono font-bold text-white">
                            <span className={isLeader ? 'text-purple-400' : ''}>
                              {commits.toLocaleString()}
                            </span>
                            {isLeader && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-400/20 text-purple-300 border border-purple-400/30">
                                <Crown className="w-2.5 h-2.5 fill-purple-300" /> Leader
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Top Languages Row */}
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-300 flex items-center gap-2">
                      <Code className="w-3.5 h-3.5 text-indigo-400" />
                      Top Languages
                    </td>
                    {developers.map((dev: any) => (
                      <td key={dev.id} className="py-3.5 px-5">
                        <div className="flex flex-wrap gap-1">
                          {dev.topLanguages && dev.topLanguages.length > 0 ? (
                            dev.topLanguages.map((lang: string) => (
                              <span
                                key={lang}
                                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-900 border border-slate-800 text-slate-200"
                              >
                                {lang}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-500 text-xs">N/A</span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Profile Link Action Row */}
                  <tr className="bg-slate-900/50">
                    <td className="py-3.5 px-5 font-bold text-slate-400">Actions</td>
                    {developers.map((dev: any) => (
                      <td key={dev.id} className="py-3.5 px-5">
                        <button
                          onClick={() => navigate(`/developer/${dev.github_username}`)}
                          className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
                        >
                          Profile
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Visual Charts Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-7">
            {/* Stars & Followers Comparison Bar Chart */}
            <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-slate-800 min-w-0 overflow-hidden">
              <h2 className="text-sm sm:text-base font-bold text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Stars & Community Traction</span>
              </h2>
              <div className="h-60 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={compareData?.chartMetrics?.overview || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#252e42" opacity={0.6} />
                    <XAxis dataKey="username" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        border: '1px solid #334155',
                        borderRadius: '0.875rem',
                        color: '#F8FAFC',
                        fontSize: '0.75rem',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                        padding: '8px 12px',
                      }}
                      itemStyle={{ color: '#F8FAFC' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '8px' }} />
                    <Bar dataKey="stars" name="Total Stars" fill="#F59E0B" radius={[4, 4, 0, 0]}>
                      {(compareData?.chartMetrics?.overview || []).map((_: any, index: number) => (
                        <Cell key={`cell-stars-${index}`} fill={DEVELOPER_COLORS[index % DEVELOPER_COLORS.length]} />
                      ))}
                    </Bar>
                    <Bar dataKey="followers" name="Followers" fill="#6366F1" fillOpacity={0.65} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Languages Comparison Bar Chart */}
            <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-slate-800 min-w-0 overflow-hidden">
              <h2 className="text-sm sm:text-base font-bold text-white mb-3 flex items-center gap-2">
                <Code className="w-4 h-4 text-cyan-400" />
                <span>Language Share Comparison (KB)</span>
              </h2>
              <div className="h-60 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={compareData?.chartMetrics?.languages || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#252e42" opacity={0.6} />
                    <XAxis dataKey="language" stroke="#64748B" fontSize={10} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        border: '1px solid #334155',
                        borderRadius: '0.875rem',
                        color: '#F8FAFC',
                        fontSize: '0.75rem',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                        padding: '8px 12px',
                      }}
                      itemStyle={{ color: '#F8FAFC' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '8px' }} />
                    {developers.map((dev: any, idx: number) => (
                      <Bar
                        key={dev.github_username}
                        dataKey={dev.github_username}
                        name={`@${dev.github_username}`}
                        fill={DEVELOPER_COLORS[idx % DEVELOPER_COLORS.length]}
                        radius={[4, 4, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Comparison Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="glass-panel-glow w-full max-w-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-700 shadow-2xl relative my-auto flex flex-col max-h-[calc(100dvh-1.5rem)]">
            <button
              onClick={() => setIsSaveModalOpen(false)}
              aria-label="Close modal"
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base sm:text-xl font-black text-white mb-1 pr-6">Save Comparison</h3>
            <p className="text-xs text-slate-400 mb-3 sm:mb-4">
              Name this comparison to revisit and reopen it anytime.
            </p>

            {saveMessage && (
              <div
                className={`p-2.5 sm:p-3 rounded-xl text-xs mb-3 ${
                  saveMessage.type === 'success'
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                }`}
              >
                {saveMessage.text}
              </div>
            )}

            <form onSubmit={handleSaveComparison} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Comparison Name
                </label>
                <input
                  type="text"
                  required
                  value={comparisonName}
                  onChange={(e) => setComparisonName(e.target.value)}
                  placeholder="e.g. Linux Kernel vs React Architecture"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading || !comparisonName.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 disabled:opacity-50"
                >
                  {saveLoading ? 'Saving...' : 'Save Comparison'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Compare;
